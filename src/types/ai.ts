import type { ScenarioRow } from './scenario';

export type AiProvider = 'simulation' | 'openai' | 'gemini' | 'custom';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  contextRowCount: number;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  generatedRows?: ScenarioRow[];
}

export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: 'simulation',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  systemPrompt:
    'あなたは優秀なシナリオライターおよび劇作家です。ユーザーの要望に応じて、フォーマットに従って自然で魅力的なシナリオ（話者、台詞、ト書き/備考）を作成してください。',
  contextRowCount: 10,
};
