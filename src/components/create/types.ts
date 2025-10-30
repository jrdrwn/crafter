export type Domain = { key: string; label: string };
export type Factor = { name: string; title: string; description: string };
export type Language = { key: string; label: string };
export type LLMModel = { key: string; label: string };

export interface CreateFormValues {
  domain: Domain;
  internal: Factor[];
  external: Factor[];
  contentLength: number;
  llmModel: LLMModel;
  language: Language;
  useRAG: boolean;
  detail?: string;
}
