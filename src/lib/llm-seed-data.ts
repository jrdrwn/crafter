import { Prisma } from '@prisma/client';

export const DEFAULT_LLM_MODELS: Prisma.llmCreateManyInput[] = [
  {
    key: 'gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash Lite',
    category: 'gemini',
    description: 'fast, cost-efficient model suited for short-form persona sketches and quick iterations.',
  },
  {
    key: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    category: 'gemini',
    description: 'balanced model offering good quality and low latency for most persona generation tasks.',
  },
  {
    key: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    category: 'gemini',
    description: 'higher-capability model for nuanced, detailed persona outputs and complex prompt reasoning.',
  },
  {
    key: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash Lite',
    category: 'gemini',
    description: 'improved generation quality with low latency; ideal for concise persona profiles and fast sampling.',
  },
  {
    key: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    category: 'gemini',
    description: 'stronger semantic understanding and consistency for richer persona construction while retaining responsiveness.',
  },
  {
    key: 'gpt-5.4-mini',
    label: 'GPT-5.4 Mini',
    category: 'openai',
    description: 'high-efficiency OpenAI model suitable for chat-driven persona brainstorming and multi-turn refinement.',
  },
  {
    key: 'gpt-5.4',
    label: 'GPT-5.4',
    category: 'openai',
    description: 'high-capability OpenAI model for producing detailed, coherent, and professional persona outputs.',
  },
];

export default DEFAULT_LLM_MODELS;
