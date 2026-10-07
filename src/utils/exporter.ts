import type { ScenarioProject } from '../types/scenario';

/**
 * Sanitizes speaker name (Col 1):
 * - Removes `:` (colon)
 * - Removes `【` and `】`
 * - Replaces newlines with a single space
 */
export function sanitizeSpeaker(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/[:：]/g, '')
    .replace(/[【】]/g, '');
}

/**
 * Sanitizes dialogue (Col 2):
 * - Removes `:` (colon)
 * - Retains `()` and `（）` parentheses for inner monologue / thoughts
 * - Replaces newlines with a single space
 */
export function sanitizeDialogue(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/[:：]/g, '');
}

/**
 * Sanitizes direction / note (Col 3):
 * - Removes `:` (colon)
 * - Removes `【` and `】`
 * - Replaces newlines with a single space
 */
export function sanitizeNote(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/[:：]/g, '')
    .replace(/[【】]/g, '');
}

/**
 * Formats a single scenario row into the target text specification:
 * Syntax: `<Col1>:<Col2>【Col3】`
 * - Col 3 empty: omit `【】`
 * - Col 1 empty: `: <Col2>【Col3】`
 */
export function formatScenarioRow(speaker: string, dialogue: string, note: string): string {
  const s = sanitizeSpeaker(speaker);
  const d = sanitizeDialogue(dialogue);
  const n = sanitizeNote(note);

  const notePart = n ? `【${n}】` : '';

  if (!s) {
    // 1列目が空白の場合: `: <2列目>【3列目】` 形式
    const body = d ? `${d}${notePart}` : notePart;
    return `: ${body}`;
  }

  return `${s}:${d}${notePart}`;
}

/**
 * Converts a ScenarioProject into a UTF-8 BOM text string formatted with LF line endings.
 */
export function exportToTextContent(project: ScenarioProject): string {
  const lines = project.rows.map((row) => formatScenarioRow(row.speaker, row.dialogue, row.note));
  return lines.join('\n');
}

/**
 * Triggers a browser download of the exported text file with UTF-8 BOM.
 */
export function downloadTextFile(project: ScenarioProject): void {
  const textContent = exportToTextContent(project);
  // Add UTF-8 BOM (\uFEFF)
  const bom = '\uFEFF';
  const blob = new Blob([bom + textContent], { type: 'text/plain;charset=utf-8' });
  
  const filename = `${project.metadata.title || 'scenario'}.txt`;
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { parseTextToProject } from './importer';

