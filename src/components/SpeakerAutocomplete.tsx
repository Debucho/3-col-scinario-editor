import React, { useEffect, useRef } from 'react';
import { Tag } from 'lucide-react';

interface SpeakerAutocompleteProps {
  options: string[];
  filterText: string;
  selectedIndex: number;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const SpeakerAutocomplete: React.FC<SpeakerAutocompleteProps> = ({
  options,
  filterText,
  selectedIndex,
  onSelect,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter options based on filterText (case-insensitive)
  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden max-h-48 overflow-y-auto backdrop-blur-md"
    >
      <div className="py-1">
        {filtered.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={item}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
              className={`px-3 py-1.5 text-xs font-medium cursor-pointer flex items-center space-x-2 transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-200 hover:bg-slate-700/80'
              }`}
            >
              <Tag className={`w-3 h-3 ${isSelected ? 'text-blue-200' : 'text-blue-400'}`} />
              <span>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
