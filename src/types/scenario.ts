import type { AiConfig } from './ai';

export interface ScenarioMetadata {
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioRow {
  id: string;
  speaker: string;
  dialogue: string;
  note: string;
}

export interface ScenarioProject {
  version: string;
  metadata: ScenarioMetadata;
  characters: string[];
  rows: ScenarioRow[];
  aiConfig?: AiConfig;
}

export type ColumnIndex = 0 | 1 | 2; // 0: speaker, 1: dialogue, 2: note

export interface CellPosition {
  rowIndex: number;
  colIndex: ColumnIndex;
}

export interface AutocompleteOption {
  name: string;
  matchedText: string;
}
