import type { ScenarioProject, ScenarioRow } from '../types/scenario';

/**
 * Parses raw TXT content formatted as `<Speaker>:<Dialogue>【<Note>】` or `:<Dialogue>【<Note>】`
 * into a ScenarioProject.
 * Throws detailed error if any line fails format validation.
 */
export function parseTextToProject(textContent: string, filename?: string): ScenarioProject {
  // 1. Remove UTF-8 BOM (\uFEFF) if present
  let cleanText = textContent.replace(/^\uFEFF/, '');
  // Normalize CRLF / CR to LF
  cleanText = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split into lines
  const rawLines = cleanText.split('\n');

  // Remove trailing empty/whitespace lines at the end of the file
  while (rawLines.length > 0 && rawLines[rawLines.length - 1].trim() === '') {
    rawLines.pop();
  }

  if (rawLines.length === 0) {
    throw new Error('ファイルが空であるか、有効なシナリオデータが含まれていません。');
  }

  const rows: ScenarioRow[] = [];
  const characterSet = new Set<string>();

  for (let index = 0; index < rawLines.length; index++) {
    const lineNumber = index + 1;
    const line = rawLines[index];

    // Check for colon (half-width ':' or full-width '：')
    const colonIndex = line.search(/[:：]/);
    if (colonIndex === -1) {
      throw new Error(
        `${lineNumber}行目の形式が正しくありません。コロン (:) が含まれていません。\n該当行: "${line}"`
      );
    }

    const speakerPart = line.substring(0, colonIndex).trim();
    let bodyPart = line.substring(colonIndex + 1);

    // If speaker is empty, bodyPart may have a single leading space due to formatting `: ${body}`
    if (!speakerPart && bodyPart.startsWith(' ')) {
      bodyPart = bodyPart.substring(1);
    }

    // Check for unclosed parenthesis in bodyPart
    const openParenCount = (bodyPart.match(/[(（]/g) || []).length;
    const closeParenCount = (bodyPart.match(/[)）]/g) || []).length;

    if (openParenCount > closeParenCount) {
      throw new Error(
        `${lineNumber}行目の形式が正しくありません。カッコ () が閉じられていません。\n該当行: "${line}"`
      );
    }

    // Check for unclosed 【】 brackets in bodyPart
    const openBracketCount = (bodyPart.match(/【/g) || []).length;
    const closeBracketCount = (bodyPart.match(/】/g) || []).length;

    if (openBracketCount > closeBracketCount) {
      throw new Error(
        `${lineNumber}行目の形式が正しくありません。カッコ 【】 が閉じられていません。\n該当行: "${line}"`
      );
    }

    let dialogue = '';
    let note = '';

    // Match note in trailing brackets: 【Note】 at end of bodyPart
    const noteMatch = bodyPart.match(/^(.*?)【([^】]*)】\s*$/);

    if (noteMatch) {
      dialogue = noteMatch[1];
      note = noteMatch[2];
    } else {
      dialogue = bodyPart;
      note = '';
    }

    if (speakerPart) {
      characterSet.add(speakerPart);
    }

    rows.push({
      id: `row-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      speaker: speakerPart,
      dialogue: dialogue,
      note: note,
    });
  }

  // Derive title from filename if available
  let title = 'インポートシナリオ';
  if (filename) {
    const baseName = filename.replace(/\.[^/.]+$/, '').trim();
    if (baseName) {
      title = baseName;
    }
  }

  return {
    version: '1.0.0',
    metadata: {
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    characters: Array.from(characterSet),
    rows,
  };
}
