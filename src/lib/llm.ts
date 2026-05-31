import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export type ResponseMode = 'default' | 'thinking' | 'instant';

export function toResponseMode(raw?: string): ResponseMode {
  const value = raw?.trim().toLowerCase();
  if (value === 'thinking' || value === 'instant') return value;
  return 'default';
}

function toValidReasoningEffort(raw?: string): 'low' | 'medium' | 'high' | undefined {
  const value = raw?.trim().toLowerCase();
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  return undefined;
}

function resolveOpenAIReasoningEffort(mode: ResponseMode): 'low' | 'medium' | 'high' | undefined {
  const explicit = toValidReasoningEffort(process.env.OPENAI_REASONING_EFFORT);
  if (explicit) return explicit;

  if (mode === 'thinking') {
    return toValidReasoningEffort(process.env.OPENAI_REASONING_EFFORT_THINKING) ?? 'high';
  }
  if (mode === 'instant') {
    return toValidReasoningEffort(process.env.OPENAI_REASONING_EFFORT_INSTANT) ?? 'low';
  }
  return undefined;
}

function toInt(raw?: string): number | undefined {
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolveGeminiThinkingBudget(mode: ResponseMode): number | undefined {
  const explicit = toInt(process.env.GEMINI_THINKING_BUDGET);
  if (typeof explicit === 'number') return explicit;

  if (mode === 'thinking') {
    return toInt(process.env.GEMINI_THINKING_BUDGET_THINKING) ?? 1024;
  }
  if (mode === 'instant') {
    return toInt(process.env.GEMINI_THINKING_BUDGET_INSTANT) ?? 0;
  }
  return undefined;
}

// @ts-expect-error: no typings for this class since it's a custom override of the GoogleGenerativeAIEmbeddings
export class GeminiEmbeddings extends GoogleGenerativeAIEmbeddings {

  // @ts-expect-error: override private method for embedding hack
  _convertToContent(text) {
    const cleanedText = this.stripNewLines ? text.replace(/\n/g, ' ') : text;
    return {
      content: {
        role: 'user',
        parts: [{ text: cleanedText }],
      },
      taskType: this.taskType,
      title: this.title,
      outputDimensionality: 768,
    };
  }
}

export async function createChatClient(model: string, modeOverride?: ResponseMode) {
  const lowered = model?.toLowerCase?.() ?? '';
  const isOpenAI = lowered.startsWith('openai:') || lowered.startsWith('gpt') || lowered.includes('gpt-');
  const responseMode = modeOverride ?? toResponseMode(process.env.LLM_RESPONSE_MODE);

  if (isOpenAI) {
    // dynamic import to avoid static dependency
    const mod = await import('@langchain/openai');
    const ChatOpenAI = mod.ChatOpenAI;
    if (!ChatOpenAI) throw new Error('OpenAI Chat client not found in @langchain/openai');
    const modelName = lowered.startsWith('openai:') ? model.split(':')[1] : model;
    const options: Record<string, unknown> = {
      apiKey: process.env.OPENAI_API_KEY,
      modelName,
    };

    const reasoningEffort = resolveOpenAIReasoningEffort(responseMode);
    if (reasoningEffort) {
      options.reasoningEffort = reasoningEffort;
    }

    return new ChatOpenAI(options);
  }

  const geminiOptions: ConstructorParameters<typeof ChatGoogleGenerativeAI>[0] = {
    apiKey: process.env.GEMINI_API_KEY,
    model,
  };
  const thinkingBudget = resolveGeminiThinkingBudget(responseMode);
  if (typeof thinkingBudget === 'number') {
    ((geminiOptions as unknown) as Record<string, unknown>).modelKwargs = {
      thinkingConfig: {
        thinkingBudget,
      },
    };
  }

  return new ChatGoogleGenerativeAI(geminiOptions);
}

export async function createEmbeddingsClient(provider?: 'gemini' | 'openai') {
  const prefer = provider ?? 'gemini';
  if (prefer === 'openai') {
    const mod = await import('@langchain/openai');
    const OpenAIEmbeddings = mod.OpenAIEmbeddings;
    if (!OpenAIEmbeddings) throw new Error('OpenAI embeddings not found in @langchain/openai');
    return new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY, modelName: 'text-embedding-3-large' });
  }
  return new GeminiEmbeddings({ apiKey: process.env.GEMINI_API_KEY, modelName: 'gemini-embedding-2' });
}
