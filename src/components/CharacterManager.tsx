import React, { useState } from 'react';
import { UserPlus, X, Users, Tag } from 'lucide-react';

interface CharacterManagerProps {
  characters: string[];
  addCharacter: (name: string) => void;
  removeCharacter: (name: string) => void;
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({
  characters,
  addCharacter,
  removeCharacter,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addCharacter(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-300 tracking-wide uppercase">
            登場人物マスター ({characters.length})
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">
            （1列目で補完候補として使用されます）
          </span>
        </div>

        {/* Add input form */}
        <form onSubmit={handleAdd} className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="登場人物を追加..."
            className="bg-slate-800 text-slate-200 text-sm px-3 py-1.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none w-full sm:w-48 placeholder-slate-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>追加</span>
          </button>
        </form>
      </div>

      {/* Character badges */}
      <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
        {characters.length === 0 ? (
          <p className="text-xs text-slate-500 italic">登録されている登場人物はありません。</p>
        ) : (
          characters.map((char) => (
            <span
              key={char}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-full text-xs font-medium text-slate-200 transition-all shadow-sm group"
            >
              <Tag className="w-3 h-3 text-blue-400" />
              <span>{char}</span>
              <button
                onClick={() => removeCharacter(char)}
                title={`${char} を削除`}
                className="text-slate-500 hover:text-rose-400 p-0.5 rounded-full hover:bg-slate-700/60 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
};
