import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources/index.mjs';

export default defineEventHandler(async (event) => {
    // Netlify AI Gateway automatically provides ANTHROPIC_API_KEY and ANTHROPIC_BASE_URL
    const anthropic = new Anthropic();

    let messages: MessageParam[] = [];
    const previousMessages = await readBody(event);
    messages = JSON.parse(previousMessages);

    const msg = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1024,
        messages
    });

    const textBlock = msg.content.find(block => block.type === 'text');
    const messageText = textBlock && 'text' in textBlock ? textBlock.text : '';

    return {
        message: messageText
    };
});
