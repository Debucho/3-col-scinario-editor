import React, { useState, useEffect, useRef } from 'react';
import type { ColumnIndex } from '../types/scenario';
import { SpeakerAutocomplete } from './SpeakerAutocomplete';

interface CellEditorProps {
  rowIndex: number;
  colIndex: ColumnIndex;
  value: string;
  isFocused: boolean;
  isEditing: boolean;
  characters: string[];
  onUpdate: (value: string) => void;
  onConfirmSpeaker: (speakerName: string) => void;
  onSetFocus: (rowIndex: number, colIndex: ColumnIndex, startEditing?: boolean) => void;
  onMoveFocus: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onShiftEnter: () => void;
  onTabMove: (isShift: boolean) => void;
  onSetEditing: (editing: boolean) => void;
}

export const CellEditor: React.FC<CellEditorProps> = ({
  rowIndex,
  colIndex,
  value,
  isFocused,
  isEditing,
  characters,
  onUpdate,
  onConfirmSpeaker,
  onSetFocus,
  onMoveFocus,
  onShiftEnter,
  onTabMove,
  onSetEditing,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [autoCompleteIndex, setAutoCompleteIndex] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const cellRef = useRef<HTMLDivElement | null>(null);

  // Keep local value in sync with external value when not editing
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // Focus management: Ensure textarea is focused when cell is focused
  useEffect(() => {
    if (isFocused) {
      if (textareaRef.current) {
        textareaRef.current.focus();
        if (!isEditing) {
          // In navigation mode, select all text so typing replaces or appends smoothly
          textareaRef.current.select();
        }
      }
    }
  }, [isFocused, isEditing]);

  // Autocomplete matching for Speaker column
  const matchingCharacters =
    colIndex === 0 && isEditing
      ? characters.filter((c) => c.toLowerCase().includes(localValue.toLowerCase()))
      : [];

  useEffect(() => {
    if (colIndex === 0 && isEditing && localValue.trim().length > 0 && matchingCharacters.length > 0) {
      setShowAutocomplete(true);
      setAutoCompleteIndex(0);
    } else {
      setShowAutocomplete(false);
    }
  }, [localValue, colIndex, isEditing, matchingCharacters.length]);

  // Intermediate cell update (during typing) - DOES NOT add to character master list yet
  const handleIntermediateChange = (newValue: string) => {
    const sanitized = newValue.replace(/[\r\n]+/g, '');
    setLocalValue(sanitized);
    onUpdate(sanitized);
  };

  // Final commit (on blur, Enter, Tab, Esc, or autocomplete selection)
  // ONLY HERE is the completed speaker name registered to the character master list
  const handleFinalCommit = (finalValue: string) => {
    const sanitized = finalValue.replace(/[\r\n]+/g, '');
    onUpdate(sanitized);
    if (colIndex === 0 && sanitized.trim()) {
      onConfirmSpeaker(sanitized.trim());
    }
  };

  // Cell click handlers
  const handleClick = () => {
    if (!isFocused) {
      onSetFocus(rowIndex, colIndex, false);
    }
  };

  const handleDoubleClick = () => {
    onSetFocus(rowIndex, colIndex, true);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  };

  // Keyboard navigation & editing handler directly on the Textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isComposing =
      e.nativeEvent.isComposing ||
      (e.nativeEvent as unknown as { isComposing?: boolean }).isComposing ||
      e.keyCode === 229;

    // --- NAVIGATION MODE KEYBINDINGS ---
    if (!isEditing) {
      if (isComposing) {
        // IME composition started directly while in navigation mode!
        onSetEditing(true);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onMoveFocus('up');
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onMoveFocus('down');
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onMoveFocus('left');
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onMoveFocus('right');
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          onShiftEnter();
        } else {
          onSetEditing(true);
        }
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        onTabMove(e.shiftKey);
        return;
      }

      // If user presses any printable character in Navigation Mode:
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        onSetEditing(true);
        // Textarea is focused, so typing happens natively without losing IME or character
      }
      return;
    }

    // --- EDIT MODE KEYBINDINGS ---
    if (e.key === 'Escape') {
      e.preventDefault();
      handleFinalCommit(localValue);
      onSetEditing(false);
      return;
    }

    if (e.key === 'Enter') {
      // Allow Japanese IME to confirm Hiragana -> Kanji conversion without moving row
      if (isComposing) {
        return;
      }

      // Enter in edit mode confirms edit and moves to row below
      e.preventDefault();
      handleFinalCommit(localValue);
      onSetEditing(false);
      onShiftEnter();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (colIndex === 0 && showAutocomplete && matchingCharacters.length > 0) {
        // Confirm autocomplete selection
        const selected = matchingCharacters[autoCompleteIndex] || matchingCharacters[0];
        setLocalValue(selected);
        handleFinalCommit(selected);
        setShowAutocomplete(false);
      } else {
        // Move focus right/left
        handleFinalCommit(localValue);
        onSetEditing(false);
        onTabMove(e.shiftKey);
      }
      return;
    }

    // Autocomplete dropdown arrow controls
    if (colIndex === 0 && showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutoCompleteIndex((prev) => (prev + 1) % matchingCharacters.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutoCompleteIndex((prev) => (prev - 1 + matchingCharacters.length) % matchingCharacters.length);
        return;
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isEditing) {
      onSetEditing(true);
    }
    handleIntermediateChange(e.target.value);
  };

  const handleCompositionStart = () => {
    if (!isEditing) {
      onSetEditing(true);
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      handleFinalCommit(localValue);
      onSetEditing(false);
    }
  };

  const handleSelectAutocomplete = (selectedName: string) => {
    setLocalValue(selectedName);
    handleFinalCommit(selectedName);
    setShowAutocomplete(false);
  };

  return (
    <div
      ref={cellRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`relative min-h-[44px] p-2 flex items-center transition-colors select-none ${
        isEditing
          ? 'cell-editing bg-purple-950/20'
          : isFocused
          ? 'cell-focused bg-blue-950/30'
          : 'hover:bg-slate-800/40'
      }`}
    >
      {/* If focused or editing, render active Textarea for instant IME support */}
      {isFocused || isEditing ? (
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onBlur={handleBlur}
          rows={1}
          className="w-full bg-transparent text-slate-100 text-sm focus:outline-none resize-none overflow-hidden font-normal leading-relaxed"
          style={{ height: 'auto' }}
        />
      ) : (
        <div className="w-full text-sm text-slate-200 whitespace-pre-wrap break-words leading-relaxed min-h-[24px] flex items-center">
          {localValue ? (
            <span>{localValue}</span>
          ) : (
            <span className="text-slate-600 italic text-xs select-none">
              {colIndex === 0 ? '話者名...' : colIndex === 1 ? 'セリフ...' : 'ト書き・補足...'}
            </span>
          )}
        </div>
      )}

      {/* Autocomplete Dropdown for Column 1 */}
      {colIndex === 0 && showAutocomplete && (
        <SpeakerAutocomplete
          options={characters}
          filterText={localValue}
          selectedIndex={autoCompleteIndex}
          onSelect={handleSelectAutocomplete}
          onClose={() => setShowAutocomplete(false)}
        />
      )}
    </div>
  );
};
