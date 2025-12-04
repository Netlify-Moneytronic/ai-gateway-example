import { GoogleGenAI } from '@google/genai';

interface Message {
    role: 'assistant' | 'user' | 'system'
    content: string
}

export default defineEventHandler(async (event) => {
    // Netlify AI Gateway automatically provides GEMINI_API_KEY and GOOGLE_GEMINI_BASE_URL
    const genAI = new GoogleGenAI({});

    let messages: Message[] = [];
    const previousMessages = await readBody(event);
    messages = JSON.parse(previousMessages);

    // Convert messages to Gemini format - Gemini uses 'contents' array
    const contents = messages.map(msg => {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        return {
            role,
            parts: [{ text: msg.content }]
        };
    }).filter(msg => msg.parts[0].text); // Remove empty messages

    // Call Gemini using the new SDK format
    const result = await genAI.models.generateContent({
        model: 'gemini-2.5-pro',
        contents
    });

    // Extract the text from the response
    const text = result.text || '';

    return {
        message: text
    };
});
