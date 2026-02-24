import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
export async function POST(req: Request) {
    try {
        const { svg, svgBefore, svgAfter, prompt, isMorphMode, apiKey } = await req.json();

        if (isMorphMode) {
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

        const systemInstruction = `You are an expert SVG animator and front-end developer. 
Your task is to take the provided SVG content and a text prompt, and return ONLY a valid, animated SVG string that satisfies the prompt. 
You can use CSS animations (<style> tags inside the SVG) or SMIL animations (<animate>, <animateTransform>, etc.).
Preserve the original aesthetics, paths, and viewbox as much as possible, just add the requested animations.
Do not wrap your response in markdown code blocks. Return ONLY the raw <svg>...</svg> string.`;

        let promptText = '';
        if (isMorphMode) {
            promptText = `You are in MORPH MODE. You have been provided with two SVGs: a BEFORE state and an AFTER state.
Your goal is to create a SINGLE animated SVG that seamlessly morphs and transitions from the 'Before' state into the 'After' state, following the user's animation prompt.
You must interpolate paths, colors, and transforms.

BEFORE SVG:
${svgBefore}

AFTER SVG:
${svgAfter}

Animation Prompt/Instructions:
${prompt}`;
        } else {
            promptText = `Original SVG:\n${svg}\n\nAnimation Prompt:\n${prompt}`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                { role: 'user', parts: [{ text: promptText }] }
            ],
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
