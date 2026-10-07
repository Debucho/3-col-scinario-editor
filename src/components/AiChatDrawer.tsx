import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Settings,
  X,
  Loader2,
  Bot,
  User,
  Check,
  FilePlus2,
  ListPlus,
} from 'lucide-react';
import type { ScenarioProject, ScenarioRow, CellPosition } from '../types/scenario';
import type { AiConfig, AiMessage } from '../types/ai';
import { fetchAiCompletion } from '../utils/aiService';

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ScenarioProject;
  selectedCell: CellPosition | null;
  config: AiConfig;
  onOpenSettings: () => void;
  onAppendRows: (rows: ScenarioRow[]) => void;
  onInsertRowsBelow: (targetRowIndex: number, rows: ScenarioRow[]) => void;
  onInsertTextToCell: (text: string) => void;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  project,
  selectedCell,
  config,
  onOpenSettings,
  onAppendRows,
  onInsertRowsBelow,
  onInsertTextToCell,
}) => {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'こんにちは！AIシナリオアシスタントです。プロンプトを入力するか、下記のプリセットボタンを押して続きのシナリオを生成してみましょう！',
      timestamp: Date.now(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastInsertedId, setLastInsertedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendPrompt = async (promptText?: string) => {
    const textToSend = (promptText || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const { rawText, generatedRows } = await fetchAiCompletion(textToSend, config, project);

      const assistantMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: rawText,
        timestamp: Date.now(),
        generatedRows: generatedRows.length > 0 ? generatedRows : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg: AiMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ エラーが発生しました: ${(err as Error).message || '生成処理に失敗しました。'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMessages = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: 'チャット履歴をリセットしました。何かお手伝いできることはありますか？',
        timestamp: Date.now(),
      },
    ]);
  };

  const handleAppendAll = (msgId: string, rows: ScenarioRow[]) => {
    onAppendRows(rows);
    setLastInsertedId(msgId);
    setTimeout(() => setLastInsertedId(null), 3000);
  };

  const handleInsertBelowSelected = (msgId: string, rows: ScenarioRow[]) => {
    const targetIdx = selectedCell ? selectedCell.rowIndex : project.rows.length - 1;
    onInsertRowsBelow(targetIdx, rows);
    setLastInsertedId(msgId);
    setTimeout(() => setLastInsertedId(null), 3000);
  };

  return (
    <aside className="w-full md:w-[420px] lg:w-[460px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl relative z-30 transition-all">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 text-sm flex items-center space-x-1.5">
              <span>AI シナリオアシスタント</span>
            </h2>
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="capitalize">
                {config.provider === 'simulation'
                  ? '✨ デモ・シミュレーション'
                  : `${config.provider} (${config.model})`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="AI設定"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearMessages}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="履歴削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Quick Prompts */}
      <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSendPrompt('現在のシナリオの文脈に合わせた自然な続きを3〜4行生成してください。')}
          disabled={isLoading}
          className="whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 border border-slate-700 hover:border-indigo-500 rounded-full text-[11px] font-medium transition-all flex items-center space-x-1 disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>続きを生成</span>
        </button>
        <button
          onClick={() => handleSendPrompt('ドラマチックな展開や思わぬハプニング、緊張感のある台詞を追加してください。')}
          disabled={isLoading}
          className="whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-purple-600/30 text-purple-300 border border-slate-700 hover:border-purple-500 rounded-full text-[11px] font-medium transition-all flex items-center space-x-1 disabled:opacity-50"
        >
          <span>🎭 展開を盛り上げる</span>
        </button>
        <button
          onClick={() => handleSendPrompt('場面描写や登場人物のアクションを説明するト書き（備考）を行に追加してください。')}
          disabled={isLoading}
          className="whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-teal-600/30 text-teal-300 border border-slate-700 hover:border-teal-500 rounded-full text-[11px] font-medium transition-all flex items-center space-x-1 disabled:opacity-50"
        >
          <span>📝 ト書きを補足</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Role Header */}
            <div className="flex items-center space-x-1 text-[11px] text-slate-500 mb-1 px-1">
              {msg.role === 'user' ? (
                <>
                  <span>あなた</span>
                  <User className="w-3 h-3 text-slate-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-indigo-400" />
                  <span>AI アシスタント</span>
                </>
              )}
            </div>

            {/* Bubble Content */}
            <div
              className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Parsed Scenario Rows Preview & Insertion Actions */}
              {msg.generatedRows && msg.generatedRows.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-indigo-300 font-semibold">
                    <span>✨ 生成されたシナリオ ({msg.generatedRows.length} 行)</span>
                    {lastInsertedId === msg.id && (
                      <span className="text-emerald-400 flex items-center space-x-1 font-normal">
                        <Check className="w-3 h-3" />
                        <span>エディタに追加しました</span>
                      </span>
                    )}
                  </div>

                  {/* Rows Cards */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {msg.generatedRows.map((r, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/50 flex flex-col gap-1 text-[11px]"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold px-1.5 py-0.5 rounded ${
                              r.speaker
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {r.speaker || 'ト書き'}
                          </span>
                          {r.dialogue && (
                            <button
                              onClick={() => onInsertTextToCell(r.dialogue)}
                              className="text-[10px] text-slate-400 hover:text-indigo-300 hover:underline"
                              title="選択中のセルに台詞を挿入"
                            >
                              セルに代入
                            </button>
                          )}
                        </div>
                        {r.dialogue && (
                          <p className="text-slate-100 font-medium pl-1">「{r.dialogue}」</p>
                        )}
                        {r.note && (
                          <p className="text-slate-400 italic text-[10px] pl-1">({r.note})</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Write-Back Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAppendAll(msg.id, msg.generatedRows!)}
                      className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] rounded-lg shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-1 active:scale-95"
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                      <span>末尾に追加</span>
                    </button>

                    <button
                      onClick={() => handleInsertBelowSelected(msg.id, msg.generatedRows!)}
                      className="flex-1 py-1.5 px-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-[11px] rounded-lg border border-slate-600 transition-all flex items-center justify-center space-x-1 active:scale-95"
                      title={
                        selectedCell
                          ? `選択中 (行 ${selectedCell.rowIndex + 1}) の下に挿入`
                          : '選択位置の下に挿入'
                      }
                    >
                      <FilePlus2 className="w-3.5 h-3.5 text-slate-300" />
                      <span>選択行の下に挿入</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-indigo-400 text-xs bg-slate-800/50 p-3 rounded-xl border border-slate-800 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>AIがシナリオを考案中...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <div className="relative flex items-center">
          <textarea
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
                e.preventDefault();
                handleSendPrompt();
              }
            }}
            placeholder="プロンプトを入力 (例: 次にアリスがボブに秘密を明かす台詞を追加)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={!inputPrompt.trim() || isLoading}
            className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-600 rounded-lg transition-all active:scale-95"
            title="送信 (Enter)"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
          <span>Enter で送信 / Shift+Enter で改行</span>
          <span className="text-indigo-400 font-mono text-[9px]">Ctrl+Shift+A で切替</span>
        </div>
      </div>
    </aside>
  );
};
