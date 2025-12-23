import OpenAI from 'openai';
import { ExtractedInsights } from './types';

// OpenAI-compatible client - works with any API that follows OpenAI standards
const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
});

export const systemPrompt = `You are an expert at extracting structured data from German car sales call transcripts.
Analyze the conversation and extract key information about the seller's intent and the vehicle.
Always respond with valid JSON only, no markdown or explanation.`;

export const userPromptTemplate = `Extract the following fields from this transcript. Return ONLY valid JSON, no markdown code blocks.

Required JSON format:
{
  "asking_price": number | null,
  "willingness_to_negotiate": "high" | "medium" | "low" | "unclear",
  "handover_date": "immediate" | "1-2 weeks" | "2-4 weeks" | "flexible" | "unclear",
  "car_condition": "excellent" | "good" | "fair" | "poor" | "unclear",
  "num_owners": number | null,
  "sentiment": "positive" | "neutral" | "negative",
  "call_outcome": "qualified" | "callback_requested" | "not_interested" | "voicemail" | "failed",
  "key_notes": string
}

Important extraction rules:
- asking_price: Extract the final price in EUR. Convert German number words to numbers (e.g., "fünfunddreißigtausend" = 35000)
- willingness_to_negotiate: "Ja" to negotiation questions = "high", explicit refusal = "low"
- handover_date: "Jederzeit"/"sofort"/"so bald wie möglich" = "immediate", "vierzehn Tagen" = "1-2 weeks", "drei Monaten" = "2-4 weeks"
- car_condition: "wie neu"/"hundert Prozent"/"sehr gut" = "excellent", "Gut" = "good"
- num_owners: "Nur mich"/"Erst- und Einzelbesitzer" = 1
- sentiment: Cooperative responses = "positive", neutral = "neutral", hostile/refusing = "negative"
- call_outcome: Full conversation with info = "qualified", wants human callback = "callback_requested", "Nein" to selling = "not_interested", voicemail messages = "voicemail", no response/busy = "failed"
- key_notes: Brief English summary (max 50 words)

If the transcript is empty, very short, or shows a voicemail/failed call, return appropriate defaults:
- For voicemail: all fields "unclear"/null except call_outcome="voicemail" and relevant key_notes
- For failed/no answer: all fields "unclear"/null except call_outcome="failed"

Transcript:
{transcript}`;

function buildUserPrompt(transcript: string): string {
  return userPromptTemplate.replace('{transcript}', transcript);
}

export async function extractInsights(transcript: string): Promise<ExtractedInsights> {
  // Handle empty or very short transcripts
  if (!transcript || transcript.trim().length < 20) {
    return {
      asking_price: null,
      willingness_to_negotiate: 'unclear',
      handover_date: 'unclear',
      car_condition: 'unclear',
      num_owners: null,
      sentiment: 'neutral',
      call_outcome: 'failed',
      key_notes: 'No transcript available or call failed',
    };
  }

  // Check for voicemail indicators
  const voicemailIndicators = ['voicemail', 'mobilbox', 'nachricht nach dem signalton', 'nicht entgegengenommen', 'nicht zu erreichen'];
  const isVoicemail = voicemailIndicators.some(indicator =>
    transcript.toLowerCase().includes(indicator)
  );

  if (isVoicemail) {
    return {
      asking_price: null,
      willingness_to_negotiate: 'unclear',
      handover_date: 'unclear',
      car_condition: 'unclear',
      num_owners: null,
      sentiment: 'neutral',
      call_outcome: 'voicemail',
      key_notes: 'Call went to voicemail - no conversation',
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildUserPrompt(transcript) },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '';

    // Clean the response - remove thinking tags, markdown code blocks
    let jsonStr = content.trim();

    // Remove <think>...</think> tags (some models use chain-of-thought)
    jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }

    // Try to find JSON object in the response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr) as ExtractedInsights;

    // Validate and sanitize the response
    return {
      asking_price: typeof parsed.asking_price === 'number' ? parsed.asking_price : null,
      willingness_to_negotiate: ['high', 'medium', 'low', 'unclear'].includes(parsed.willingness_to_negotiate)
        ? parsed.willingness_to_negotiate : 'unclear',
      handover_date: ['immediate', '1-2 weeks', '2-4 weeks', 'flexible', 'unclear'].includes(parsed.handover_date)
        ? parsed.handover_date : 'unclear',
      car_condition: ['excellent', 'good', 'fair', 'poor', 'unclear'].includes(parsed.car_condition)
        ? parsed.car_condition : 'unclear',
      num_owners: typeof parsed.num_owners === 'number' ? parsed.num_owners : null,
      sentiment: ['positive', 'neutral', 'negative'].includes(parsed.sentiment)
        ? parsed.sentiment : 'neutral',
      call_outcome: ['qualified', 'callback_requested', 'not_interested', 'voicemail', 'failed'].includes(parsed.call_outcome)
        ? parsed.call_outcome : 'failed',
      key_notes: typeof parsed.key_notes === 'string' ? parsed.key_notes : 'Unable to extract notes',
    };
  } catch (error) {
    console.error('Error extracting insights:', error);
    return {
      asking_price: null,
      willingness_to_negotiate: 'unclear',
      handover_date: 'unclear',
      car_condition: 'unclear',
      num_owners: null,
      sentiment: 'neutral',
      call_outcome: 'failed',
      key_notes: 'Error during extraction',
    };
  }
}
