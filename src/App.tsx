import { useState, useEffect } from 'react';
import { useScenarioStore } from './hooks/useScenarioStore';
import { HeaderBar } from './components/HeaderBar';
import { CharacterManager } from './components/CharacterManager';
import { ScenarioTable } from './components/ScenarioTable';
import { AiChatDrawer } from './components/AiChatDrawer';
import { AiSettingsModal } from './components/AiSettingsModal';
import { DEFAULT_AI_CONFIG, type AiConfig } from './types/ai';
import { Keyboard, Sparkles } from 'lucide-react';

const AI_CONFIG_STORAGE_KEY = 'snrioprj_ai_config';

export function App() {
  const {
    project,
    canUndo,
    canRedo,
    undo,
    redo,
    loadProject,
    setTitle,
    setAiConfig: setProjectAiConfig,
    addCharacter,
    removeCharacter,
    confirmSpeakerName,
    updateCell,
    insertRowBelow,
    appendRows,
    insertRowsBelow,
    insertTextToSelectedCell,
    deleteRow,
    reorderRows,
    selectedCell,
    setSelectedCell,
    isEditing,
    setIsEditing,
    moveFocus,
    handleShiftEnter,
    handleTabMove,
  } = useScenarioStore();

  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [localAiConfig, setLocalAiConfig] = useState<AiConfig>(() => {
    try {
      const saved = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore error
    }
    return DEFAULT_AI_CONFIG;
  });

  // Active AI config prioritized from loaded project, fallback to local storage / default
  const activeAiConfig = project.aiConfig || localAiConfig;

  const handleSaveAiConfig = (newConfig: AiConfig) => {
    setLocalAiConfig(newConfig);
    setProjectAiConfig(newConfig);
    try {
      localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  };

  // Keyboard shortcut Ctrl+Shift+A to toggle AI Assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAiOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Header Bar */}
      <HeaderBar
        project={project}
        setTitle={setTitle}
        loadProject={loadProject}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        isAiOpen={isAiOpen}
        onToggleAi={() => setIsAiOpen((prev) => !prev)}
      />

      {/* Main Workspace Layout (Editor + Optional AI Drawer) */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {/* Main Scenario Editor Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 overflow-y-auto">
          {/* Character Tag Management Bar */}
          <CharacterManager
            characters={project.characters}
            addCharacter={addCharacter}
            removeCharacter={removeCharacter}
          />

          {/* 3-Column Scenario Editor Table */}
          <ScenarioTable
            rows={project.rows}
            characters={project.characters}
            selectedCell={selectedCell}
            isEditing={isEditing}
            onUpdateCell={updateCell}
            onConfirmSpeaker={confirmSpeakerName}
            onSetFocus={(rowIndex, colIndex, startEditing = false) => {
              setSelectedCell({ rowIndex, colIndex });
              setIsEditing(startEditing);
            }}
            onMoveFocus={moveFocus}
            onShiftEnter={handleShiftEnter}
            onTabMove={handleTabMove}
            onSetEditing={setIsEditing}
            onInsertRowBelow={insertRowBelow}
            onDeleteRow={deleteRow}
            onReorderRows={reorderRows}
          />

          {/* Keybindings Reference Section */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 text-xs text-slate-400 mt-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 font-semibold text-slate-300 mb-2">
              <Keyboard className="w-4 h-4 text-indigo-400" />
              <span>キーボードショートカット一覧</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-slate-200">矢印キー (↑ / ↓ / ← / →)</span>
                <p className="text-slate-400 mt-0.5">セル間のフォーカス移動（選択モード）</p>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-slate-200">Enter / Shift + Enter</span>
                <p className="text-slate-400 mt-0.5">編集確定し直下のセルへ移動（末尾なら自動行追加）※改行不可</p>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-slate-200">Esc / ダブルクリック</span>
                <p className="text-slate-400 mt-0.5">編集確定・選択モード切り替え</p>
              </div>

              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-slate-200">Tab / Shift + Tab</span>
                <p className="text-slate-400 mt-0.5">右/左セル移動（1列目で補完候補決定）</p>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-slate-200">Ctrl + Z / Ctrl + Y</span>
                <p className="text-slate-400 mt-0.5">操作のやり直し (Undo / Redo)</p>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-indigo-900/50 bg-indigo-950/20">
                <span className="font-semibold text-indigo-300 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ctrl + Shift + A</span>
                </span>
                <p className="text-slate-400 mt-0.5">AIシナリオアシスタントの開閉切り替え</p>
              </div>
            </div>
          </div>
        </main>

        {/* AI Continuation & Generation Chat Side Drawer */}
        <AiChatDrawer
          isOpen={isAiOpen}
          onClose={() => setIsAiOpen(false)}
          project={project}
          selectedCell={selectedCell}
          config={activeAiConfig}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onAppendRows={appendRows}
          onInsertRowsBelow={insertRowsBelow}
          onInsertTextToCell={insertTextToSelectedCell}
        />
      </div>

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={activeAiConfig}
        onSave={handleSaveAiConfig}
      />
    </div>
  );
}

export default App;
