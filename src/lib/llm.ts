import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

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

export async function createChatClient(model: string) {
  const lowered = model?.toLowerCase?.() ?? '';
  const isOpenAI = lowered.startsWith('openai:') || lowered.startsWith('gpt') || lowered.includes('gpt-');
  if (isOpenAI) {
    // dynamic import to avoid static dependency
    const mod = await import('@langchain/openai');
    const ChatOpenAI = mod.ChatOpenAI;
    if (!ChatOpenAI) throw new Error('OpenAI Chat client not found in @langchain/openai');
    const modelName = lowered.startsWith('openai:') ? model.split(':')[1] : model;
    return new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, modelName });
  }
  return new ChatGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY, model });
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
