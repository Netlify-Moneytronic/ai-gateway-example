import { GoogleGenAI } from '@google/genai';

interface Message {
    role: 'assistant' | 'user' | 'system'
    content: string
}

export default defineEventHandler(async (event) => {
    // Netlify AI Gateway automatically provides GOOGLE_GENERATIVE_AI_API_KEY
    const genAI = new GoogleGenAI({});

    let messages: Message[] = [];
    const previousMessages = await readBody(event);
    messages = JSON.parse(previousMessages);

    // Get the Gemini model - using the latest Gemini 3 Pro Preview
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    // Convert messages to Gemini format
    // Gemini uses a different format, so we need to combine the conversation
    const conversationHistory = messages.map(msg => {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        return {
            role,
            parts: [{ text: msg.content }]
        };
    });

    // Start a chat session with history
    const chat = model.startChat({
        history: conversationHistory.slice(0, -1), // All messages except the last one
    });

    // Send the last message
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();

    return {
        message: text
    };
});


