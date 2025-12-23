import { NextResponse } from 'next/server';
import { systemPrompt, userPromptTemplate } from '@/lib/llm';

export async function GET() {
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  // Extract provider name from base URL
  let provider = 'OpenAI';
  if (baseUrl.includes('cerebras')) {
    provider = 'Cerebras';
  } else if (baseUrl.includes('together')) {
    provider = 'Together AI';
  } else if (baseUrl.includes('azure')) {
    provider = 'Azure OpenAI';
  } else if (baseUrl.includes('anthropic')) {
    provider = 'Anthropic';
  } else if (baseUrl.includes('groq')) {
    provider = 'Groq';
  }

  return NextResponse.json({
    model: model.replace(/"/g, ''), // Remove quotes if present
    provider,
    baseUrl,
    temperature: 0.1,
    maxTokens: 500,
    prompts: {
      system: systemPrompt,
      user: userPromptTemplate,
    },
  });
}
