import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
export async function POST(req: Request) {
    try {
        const { svg, svgBefore, svgAfter, prompt, isMorphMode, apiKey, mode, imageMimeType, imageBase64 } = await req.json();

        if (mode === 'image-to-svg') {
            if (!imageBase64 || !imageMimeType) {
                return NextResponse.json({ error: 'Missing image data for Image to SVG conversion' }, { status: 400 });
            }
        } else if (mode === 'generate-svg' || mode === 'icon-library') {
            if (!prompt) {
                return NextResponse.json({ error: `Missing prompt for ${mode} generation` }, { status: 400 });
            }
        } else if (isMorphMode) {
            if (!svgBefore || !svgAfter || !prompt) {
                return NextResponse.json({ error: 'Missing svgBefore, svgAfter, or prompt for morph mode' }, { status: 400 });
            }
        } else {
            if (!svg || !prompt) {
                return NextResponse.json({ error: 'Missing svg or prompt' }, { status: 400 });
            }
        }

        const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

        if (!activeApiKey) {
            return NextResponse.json({ error: 'Missing GEMINI_API_KEY. Please set it in Settings.' }, { status: 401 });
        }

        const ai = new GoogleGenAI({ apiKey: activeApiKey });

        let systemInstruction = '';
        let promptText = '';
        let contentParts: any[] = [];

        if (mode === 'image-to-svg') {
            systemInstruction = `You are an expert graphic designer and SVG vectorizer.
Your task is to analyze the provided image and accurately trace/vectorize it into a high-quality, clean, structural SVG.
Use modern aesthetic styles, well-organized paths, and try to match the colors of the source image.
Do NOT add CSS or SMIL animations. Do not wrap your response in markdown code blocks. Return ONLY the raw <svg>...</svg> string.`;
            contentParts = [
                { text: "Convert this image into a clean SVG:" },
                {
                    inlineData: {
                        mimeType: imageMimeType,
                        data: imageBase64
                    }
                }
            ];
        } else if (mode === 'icon-library') {
            systemInstruction = `You are an expert icon designer and UI developer.
Your task is to take the provided search query and return ONLY a valid, beautiful, strict 24x24 SVG layout icon representing that query in a minimalist, monochrome aesthetic (like Lucide or Phosphor icons).
Always use a viewBox="0 0 24 24", fill="none", stroke="currentColor", stroke-width="2", stroke-linecap="round", stroke-linejoin="round".
Do NOT add CSS or SMIL animations. Do not output anything except the <svg>...</svg> element.`;
            contentParts = [{ text: `Search Query:\n${prompt}` }];
        } else if (mode === 'generate-svg') {
            systemInstruction = `You are an expert graphic designer and SVG path creator.
Your task is to take the provided text prompt and return ONLY a valid, beautiful, well-structured structural SVG string representing that prompt.
Ensure the viewBox is reasonable (e.g., 0 0 100 100 or 0 0 512 512). Use clean paths, accessible colors, and modern aesthetic styles. 
Do NOT add CSS or SMIL animations unless explicitly requested in the prompt.
CRITICAL: If you do add CSS <style> tags, you MUST prefix ALL CSS selectors with a unique ID (e.g. #generated-svg) to prevent CSS leaking to the rest of the web page. You MUST also add this exact same ID to the root <svg> tag.
Do not wrap your response in markdown code blocks. Return ONLY the raw <svg>...</svg> string.`;
            contentParts = [{ text: `Prompt:\n${prompt}` }];
        } else {
            systemInstruction = `You are an expert SVG animator and front-end developer. 
Your task is to take the provided SVG content and a text prompt, and return ONLY a valid, animated SVG string that satisfies the prompt. 
You can use CSS animations (<style> tags inside the SVG) or SMIL animations (<animate>, <animateTransform>, etc.).
CRITICAL: If you use CSS <style> tags, you MUST prefix ALL CSS selectors with a unique ID (e.g. #animated-svg) to prevent CSS leaking to the rest of the web page. You MUST also add this exact same ID to the root <svg> tag. For example: '#animated-svg path { ... }'. NEVER use generic selectors like 'path' or 'circle' without the ID prefix.
Preserve the original aesthetics, paths, and viewbox as much as possible, just add the requested animations.
Do not wrap your response in markdown code blocks. Return ONLY the raw <svg>...</svg> string.`;

            if (isMorphMode) {
                contentParts = [{
                    text: `You are in MORPH MODE. You have been provided with two SVGs: a BEFORE state and an AFTER state.
Your goal is to create a SINGLE animated SVG that seamlessly morphs and transitions from the 'Before' state into the 'After' state, following the user's animation prompt.
You must interpolate paths, colors, and transforms.

BEFORE SVG:
${svgBefore}

AFTER SVG:
${svgAfter}

Animation Prompt/Instructions:
${prompt}`
                }];
            } else {
                contentParts = [{ text: `Original SVG:\n${svg}\n\nAnimation Prompt:\n${prompt}` }];
            }
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentParts,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.1, // Lower temperature for more stable XML
            }
        });

        const animatedSvg = response.text?.trim() || '';

        // Advanced cleaning: Strip markdown and handle common hallucinations
        let cleanSvg = animatedSvg
            .replace(/^```(xml|html|svg)?\n?/i, '')
            .replace(/\n?```$/i, '')
            .trim();

        // Basic validation: Check if it starts with <svg and ends with </svg>
        if (!cleanSvg.toLowerCase().includes('<svg') || !cleanSvg.toLowerCase().includes('</svg>')) {
            throw new Error("AI output does not contain a valid SVG tag.");
        }

        return NextResponse.json({ svg: cleanSvg });

    } catch (error: any) {
        console.error('Error in animate API:', error);
        return NextResponse.json({
            error: error.message || 'Failed to generate animated SVG'
        }, { status: 500 });
    }
}
