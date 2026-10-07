import React, { useState } from 'react';
import { X, Key, Settings2, Check, Eye, EyeOff, Bot } from 'lucide-react';
import type { AiConfig, AiProvider } from '../types/ai';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AiConfig;
  onSave: (newConfig: AiConfig) => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [provider, setProvider] = useState<AiProvider>(config.provider);
  const [apiKey, setApiKey] = useState<string>(config.apiKey);
  const [baseUrl, setBaseUrl] = useState<string>(config.baseUrl);
  const [model, setModel] = useState<string>(config.model);
  const [systemPrompt, setSystemPrompt] = useState<string>(config.systemPrompt);
  const [contextRowCount, setContextRowCount] = useState<number>(config.contextRowCount);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      provider,
      apiKey,
      baseUrl,
      model,
      systemPrompt,
      contextRowCount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-lg">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            <span>AI生成・プロバイダー設定</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              AI プロバイダー
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setProvider('simulation');
                  setModel('simulation-v1');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 ${
                  provider === 'simulation'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">✨ シミュレーション</span>
                  {provider === 'simulation' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <span className="text-[11px] text-slate-400">APIキー不要・即座にお試し</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setModel('gemini-2.5-flash');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 ${
                  provider === 'gemini'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Google Gemini</span>
                  {provider === 'gemini' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <span className="text-[11px] text-slate-400">Gemini 2.5 Flash / Pro</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('openai');
                  setBaseUrl('https://api.openai.com/v1');
                  setModel('gpt-4o-mini');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 ${
                  provider === 'openai'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">OpenAI</span>
                  {provider === 'openai' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <span className="text-[11px] text-slate-400">GPT-4o / GPT-4o-mini</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('custom');
                  if (!baseUrl) setBaseUrl('http://localhost:11434/v1');
                  setModel('llama3');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 ${
                  provider === 'custom'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">カスタム / ローカル</span>
                  {provider === 'custom' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <span className="text-[11px] text-slate-400">Ollama / LocalAI 等</span>
              </button>
            </div>
          </div>

          {/* API Key (if not simulation) */}
          {provider !== 'simulation' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>API Key</span>
                <span className="text-[10px] text-slate-500 font-normal">ローカル保存（外部送信なし）</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    provider === 'gemini'
                      ? 'AIzaSy...'
                      : provider === 'openai'
                      ? 'sk-...'
                      : 'APIキーを入力（必要な場合）'
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Base URL (if custom or openai) */}
          {(provider === 'custom' || provider === 'openai') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ベース URL (Endpoint)
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {/* Model Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              使用モデル (Model Name)
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini / gemini-2.5-flash / llama3"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Context Rows Limit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                参照する直近シナリオ行数
              </label>
              <span className="text-xs font-bold text-indigo-400">{contextRowCount} 行</span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              value={contextRowCount}
              onChange={(e) => setContextRowCount(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              AIが直前のアクションやセリフの文脈を把握するために参照する行数です。
            </p>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>システムプロンプト (AIへの標準指示)</span>
            </label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>設定を保存</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
