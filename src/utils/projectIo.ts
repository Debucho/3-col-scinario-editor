import type { ScenarioProject } from '../types/scenario';
import type { AiConfig } from '../types/ai';

export function saveProjectFile(project: ScenarioProject): void {
  const updatedProject: ScenarioProject = {
    ...project,
    metadata: {
      ...project.metadata,
      updatedAt: new Date().toISOString(),
    },
    // APIキーはファイルを共有したときに漏れないよう保存しない（キーは各PCのlocalStorageに保持）
    aiConfig: project.aiConfig ? { ...project.aiConfig, apiKey: '' } : undefined,
  };

  const jsonString = JSON.stringify(updatedProject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const filename = `${project.metadata.title || 'scenario'}.snrioprj`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseProjectJson(jsonContent: string): ScenarioProject {
  const data = JSON.parse(jsonContent);

  if (!data || typeof data !== 'object') {
    throw new Error('無効なJSONフォーマットです。');
  }

  let aiConfig: AiConfig | undefined = undefined;
  if (data.aiConfig && typeof data.aiConfig === 'object') {
    aiConfig = {
      provider: data.aiConfig.provider || 'simulation',
      apiKey: data.aiConfig.apiKey || '',
      baseUrl: data.aiConfig.baseUrl || 'https://api.openai.com/v1',
      model: data.aiConfig.model || 'gpt-4o-mini',
      systemPrompt: data.aiConfig.systemPrompt || '',
      contextRowCount: typeof data.aiConfig.contextRowCount === 'number' ? data.aiConfig.contextRowCount : 10,
    };
  }

  // Validate or set default structure
  const project: ScenarioProject = {
    version: data.version || '1.0.0',
    metadata: {
      title: data.metadata?.title || '無題のシナリオ',
      createdAt: data.metadata?.createdAt || new Date().toISOString(),
      updatedAt: data.metadata?.updatedAt || new Date().toISOString(),
    },
    characters: Array.isArray(data.characters) ? data.characters : [],
    rows: Array.isArray(data.rows)
      ? data.rows.map((row: Record<string, unknown>, idx: number) => ({
          id: (row.id as string) || `row-${Date.now()}-${idx}`,
          speaker: (row.speaker as string) || '',
          dialogue: (row.dialogue as string) || '',
          note: (row.note as string) || '',
        }))
      : [
          {
            id: `row-${Date.now()}-1`,
            speaker: '',
            dialogue: '',
            note: '',
          },
        ],
    aiConfig,
  };

  if (project.rows.length === 0) {
    project.rows.push({
      id: `row-${Date.now()}-1`,
      speaker: '',
      dialogue: '',
      note: '',
    });
  }

  return project;
}
