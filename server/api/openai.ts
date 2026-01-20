import OpenAI from 'openai';

interface Message {
    role: 'assistant' | 'user' | 'system'
    content: string
}

export default defineEventHandler(async (event) => {
    // Netlify AI Gateway automatically provides OPENAI_API_KEY and OPENAI_BASE_URL
    const openai = new OpenAI();

    let messages: Message[] = [];
    const previousMessages = await readBody(event);
    messages = JSON.parse(previousMessages);
    const response = await openai.responses.create({
        model: "gpt-5.2-pro",
        input: messages
    });

    return {
        message: response.output_text
    };

});
