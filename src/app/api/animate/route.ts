import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    try {
        const { svg, prompt } = await req.json();

        if (!svg || !prompt) {
            return NextResponse.json({ error: 'Missing svg or prompt' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Missing GEMINI_API_KEY environment variable. Have you set it in .env.local?' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemInstruction = `You are an expert SVG animator and front-end developer. 
Your task is to take an input SVG and a text prompt, and return ONLY a valid, animated SVG string that satisfies the prompt. 
You can use CSS animations (<style> tags inside the SVG) or SMIL animations (<animate>, <animateTransform>, etc.).
Preserve the original aesthetics, paths, and viewbox as much as possible, just add the requested animations.
Do not wrap your response in markdown code blocks. Return ONLY the raw <svg>...</svg> string.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                { role: 'user', parts: [{ text: `Original SVG:\n${svg}\n\nAnimation Prompt:\n${prompt}` }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
            }
        });

        const animatedSvg = response.text?.trim() || '';
        const cleanSvg = animatedSvg.replace(/^```(xml|html|svg)?\n?/i, '').replace(/\n?```$/i, '').trim();

        return NextResponse.json({ svg: cleanSvg });

    } catch (error) {
        console.error('Error in animate API:', error);
        return NextResponse.json({ error: 'Failed to generate animated SVG' }, { status: 500 });
    }
}
