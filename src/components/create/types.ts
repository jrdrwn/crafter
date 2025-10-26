export type Domain = { key: string; label: string };
export type Factor = { name: string; title: string; description: string };
export type Language = { key: 'en' | 'id'; label: string };

export interface CreateFormValues {
  domain: Domain;
  internal: Factor[];
  external: Factor[];
  contentLength: number;
  llmModel: string;
  language: Language;
  amount: number;
  detail?: string;
}
