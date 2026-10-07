import type { ScenarioProject, ScenarioRow } from '../types/scenario';
import type { AiConfig } from '../types/ai';

/**
 * Parses raw AI output into structured ScenarioRow array.
 */
export function parseScenarioFromAiResponse(text: string): ScenarioRow[] {
  const rows: ScenarioRow[] = [];

  // 1. Try to extract and parse JSON block
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (typeof item === 'object' && item !== null) {
            rows.push({
              id: `ai-row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              speaker: String(item.speaker || '').trim(),
              dialogue: String(item.dialogue || item.line || item.text || '').trim(),
              note: String(item.note || item.direction || '').trim(),
            });
          }
        });
        if (rows.length > 0) return rows;
      }
    } catch {
      // Fallback to regex parsing if JSON fails
    }
  }

  // 2. Line-by-line regex parsing
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  for (const line of lines) {
    // Skip Markdown titles or commentary
    if (line.startsWith('#') || line.startsWith('```') || line.startsWith('Here is') || line.startsWith('以下は')) {
      continue;
    }

    let speaker = '';
    let dialogue = '';
    let note = '';

    const bracketPattern = /^【([^】]*)】\s*(.*?)\s*(?:【([^】]+)】|[(（[［]([^)）\]］]+)[)）\]］])?$/;
    const colonPattern = /^([^:：\s「【]*)(?:[:：])\s*(.*?)\s*(?:【([^】]+)】|[(（[［]([^)）\]］]+)[)）\]］])?$/;
    const quotePattern = /^([^「\s]+)「([^」]+)」\s*(?:【([^】]+)】|[(（[［]([^)）\]］]+)[)）\]］])?$/;

    let match = line.match(bracketPattern);
    if (match && (match[1] || match[2] || match[3] || match[4])) {
      speaker = match[1] || '';
      dialogue = match[2] || '';
      note = match[3] || match[4] || '';
    } else if ((match = line.match(colonPattern)) && (match[1] || match[2] || match[3] || match[4])) {
      speaker = match[1] || '';
      dialogue = match[2] || '';
      note = match[3] || match[4] || '';
    } else if ((match = line.match(quotePattern))) {
      speaker = match[1] || '';
      dialogue = match[2] || '';
      note = match[3] || match[4] || '';
    } else {
      if (/^【.*】$/.test(line)) {
        note = line.replace(/^【|】$/g, '').trim();
      } else {
        dialogue = line.replace(/^「|」$/g, '').trim();
      }
    }

    if (dialogue.startsWith('「') && dialogue.endsWith('」')) {
      dialogue = dialogue.slice(1, -1);
    }

    if (speaker || dialogue || note) {
      rows.push({
        id: `ai-row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        speaker: speaker.trim(),
        dialogue: dialogue.trim(),
        note: note.trim(),
      });
    }
  }

  return rows;
}

/**
 * Formats existing project context into prompt string
 */
export function buildPromptContext(project: ScenarioProject, contextRowCount: number, userPrompt: string): string {
  const recentRows = project.rows.slice(-Math.max(1, contextRowCount));
  const charactersStr = project.characters.length > 0 ? project.characters.join(', ') : '未設定';

  const rowsStr = recentRows
    .map((r, i) => {
      const spk = r.speaker ? `【${r.speaker}】` : '【ト書き】';
      const dia = r.dialogue ? `「${r.dialogue}」` : '';
      const nt = r.note ? ` 【${r.note}】` : '';
      return `${i + 1}. ${spk}${dia}${nt}`;
    })
    .join('\n');

  return `[作品タイトル]: ${project.metadata.title || '無題'}
[登録登場人物]: ${charactersStr}

[直近のシナリオ文脈 (直近${recentRows.length}行)]:
${rowsStr || '(まだ行がありません)'}

[ユーザーからの指示]:
${userPrompt}

[出力指示]:
シナリオの続きや指定の会話を生成してください。
レスポンスは以下の形式（1行につき1セル要素）またはJSON配列フォーマットで出力してください:
話者名: 台詞 【備考・ト書き】
または
【話者名】台詞 【ト書き】
（※セリフ内の( )は心の声や独り言としてそのまま維持してください）`;
}

/**
 * Built-in Simulation AI generator for instant testing without API key
 */
async function generateSimulationCompletion(userPrompt: string, project: ScenarioProject): Promise<string> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const chars = project.characters.length > 0 ? project.characters : ['アリス', 'ボブ'];
  const char1 = chars[0] || 'アリス';
  const char2 = chars[1] || 'ボブ';

  const promptLower = userPrompt.toLowerCase();

  if (promptLower.includes('展開') || promptLower.includes('ドラマ') || promptLower.includes('急展開')) {
    return `【${char1}】「ちょっと待って……(今の音、聞こえた？)」 【足を止めて振り返る】
【${char2}】「え……？ (風の音じゃないのか？)」 【懐中電灯を暗闇へ向ける】
【】【遠くからかすかに足音が近づいてくる】
【${char1}】「違う、明らかに誰かがこっちに向かって歩いてきてる！」 【息をのむ】`;
  }

  if (promptLower.includes('ト書き') || promptLower.includes('ナレーション') || promptLower.includes('備考')) {
    return `【】【静まり返った室内。窓から差し込む月光がテーブルを照らしている】
【${char1}】「誰もいない……(のかな。)」 【部屋の隅を警戒しながら見回す】
【】【どこかで時計の針がチクタクと鳴り響く】`;
  }

  if (promptLower.includes('ギャグ') || promptLower.includes('面白い') || promptLower.includes('ツッコミ')) {
    return `【${char1}】「よし！(ここで秘密兵器の『スーパー特製おにぎり』の登場だ！)」 【胸を張ってポーズを決める】
【${char2}】「ただの梅干しおにぎりじゃないか！どこがスーパーなんだよ！」 【間髪入れずにツッコミを入れる】
【${char1}】「甘いな……(中にチョコが入っているのだ！)」 【ドヤ顔で言い放つ】`;
  }

  // Default continuation
  return `【${char1}】「そういえば、さっき言っていた件だけど……(本当に進めて大丈夫かな？)」 【少し不安そうに尋ねる】
【${char2}】「心配いらないよ。(僕たちが協力すれば、きっとうまくいくさ。)」 【力強くうなずく】
【${char1}】「ありがとう！そう言ってもらえると心強いよ。」 【表情が和らぎ笑みを浮かべる】
【】【二人は夕日に向かって歩き出す】`;
}

/**
 * Main completion entry point
 */
export async function fetchAiCompletion(
  userPrompt: string,
  config: AiConfig,
  project: ScenarioProject
): Promise<{ rawText: string; generatedRows: ScenarioRow[] }> {
  const fullPrompt = buildPromptContext(project, config.contextRowCount, userPrompt);
  let rawText = '';

  if (config.provider === 'simulation') {
    rawText = await generateSimulationCompletion(userPrompt, project);
  } else if (config.provider === 'openai' || config.provider === 'custom') {
    const endpoint = config.baseUrl.endsWith('/') ? `${config.baseUrl}chat/completions` : `${config.baseUrl}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const body = {
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: fullPrompt },
      ],
      temperature: 0.7,
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`APIエラー (${res.status}): ${errText}`);
    }

    const data = await res.json();
    rawText = data.choices?.[0]?.message?.content || '';
  } else if (config.provider === 'gemini') {
    if (!config.apiKey) {
      throw new Error('Gemini APIキーが設定されていません。設定画面から入力してください。');
    }

    const modelName = config.model || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${config.systemPrompt}\n\n${fullPrompt}` }],
        },
      ],
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini APIエラー (${res.status}): ${errText}`);
    }

    const data = await res.json();
    rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  const generatedRows = parseScenarioFromAiResponse(rawText);
  return { rawText, generatedRows };
}
