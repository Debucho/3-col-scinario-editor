import React, { useRef } from 'react';
import { Save, Upload, Download, Undo2, Redo2, FileText, Edit3, Sparkles } from 'lucide-react';
import type { ScenarioProject } from '../types/scenario';
import { saveProjectFile, parseProjectJson } from '../utils/projectIo';
import { downloadTextFile } from '../utils/exporter';
import { parseTextToProject } from '../utils/importer';

interface HeaderBarProps {
  project: ScenarioProject;
  setTitle: (title: string) => void;
  loadProject: (project: ScenarioProject) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isAiOpen: boolean;
  onToggleAi: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  project,
  setTitle,
  loadProject,
  undo,
  redo,
  canUndo,
  canRedo,
  isAiOpen,
  onToggleAi,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const txtFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveProject = () => {
    saveProjectFile(project);
  };

  const handleExportText = () => {
    downloadTextFile(project);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isExplicitTxt = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const isTxt = isExplicitTxt || file.name.toLowerCase().endsWith('.txt');

        if (isTxt) {
          const loadedProject = parseTextToProject(content, file.name);
          loadProject(loadedProject);
        } else if (file.name.toLowerCase().endsWith('.snrioprj') || file.name.toLowerCase().endsWith('.json')) {
          const loadedProject = parseProjectJson(content);
          loadProject(loadedProject);
        } else {
          // Unknown extension: try JSON first, fallback to TXT
          try {
            const loadedProject = parseProjectJson(content);
            loadProject(loadedProject);
          } catch {
            const loadedProject = parseTextToProject(content, file.name);
            loadProject(loadedProject);
          }
        }
      } catch (err: unknown) {
        alert(`ファイル読み込みエラー:\n${(err as Error).message || '無効なファイルです'}`);
      }
    };
    reader.readAsText(file, 'UTF-8');
    // Reset file input
    e.target.value = '';
  };


  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title Area */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-2 flex-1 md:flex-none">
            <input
              type="text"
              value={project.metadata.title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 text-slate-100 font-semibold text-lg px-3 py-1.5 rounded-lg border border-slate-700/60 focus:border-blue-500 focus:outline-none transition-all w-full md:w-64"
              placeholder="プロジェクトタイトル..."
            />
            <Edit3 className="w-4 h-4 text-slate-500 hidden md:block" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          {/* File Inputs Hidden */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e, false)}
            accept=".snrioprj,.json,.txt,application/json,text/plain,*/*"
            className="hidden"
          />
          <input
            type="file"
            ref={txtFileInputRef}
            onChange={(e) => handleFileChange(e, true)}
            accept=".txt"
            className="hidden"
          />

          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700/60 mr-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="元に戻す (Ctrl+Z)"
              className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-700/60 rounded transition-all disabled:hover:bg-transparent"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-700 mx-1" />
            <button
              onClick={redo}
              disabled={!canRedo}
              title="やり直し (Ctrl+Y)"
              className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-700/60 rounded transition-all disabled:hover:bg-transparent"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Load Project */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700/70 transition-all shadow-sm active:scale-95"
            title="プロジェクト読み込み (.snrioprj / .txt)"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>開く</span>
          </button>

          {/* Save Project */}
          <button
            onClick={handleSaveProject}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-md shadow-blue-500/20 transition-all active:scale-95"
            title="プロジェクト保存 (.snrioprj)"
          >
            <Save className="w-4 h-4" />
            <span>保存 (.snrioprj)</span>
          </button>

          {/* Import Text */}
          <button
            onClick={() => txtFileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-teal-200 text-sm font-medium rounded-lg border border-teal-500/30 hover:border-teal-400/50 transition-all shadow-sm active:scale-95"
            title="シナリオインポート (.txt)"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>インポート (.txt)</span>
          </button>

          {/* Export Text */}
          <button
            onClick={handleExportText}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium rounded-lg shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            title="シナリオ書き出し (.txt)"
          >
            <Download className="w-4 h-4" />
            <span>書き出し (.txt)</span>
          </button>


          {/* AI Assistant Toggle */}
          <button
            onClick={onToggleAi}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 font-semibold text-sm rounded-lg shadow-md transition-all active:scale-95 border ${
              isAiOpen
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-indigo-500/30 ring-2 ring-indigo-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-500/40 hover:border-indigo-400'
            }`}
            title="AIシナリオアシスタントを開く (Ctrl+Shift+A)"
          >
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
            <span>AIアシスタント</span>
          </button>
        </div>
      </div>
    </header>
  );
};
