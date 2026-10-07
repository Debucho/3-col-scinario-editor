import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Minus, Plus } from 'lucide-react';
import type { ScenarioRow as ScenarioRowType, ColumnIndex, CellPosition } from '../types/scenario';
import { CellEditor } from './CellEditor';

interface ScenarioRowProps {
  row: ScenarioRowType;
  rowIndex: number;
  totalRows: number;
  columnWidths: [number, number, number];
  selectedCell: CellPosition | null;
  isEditing: boolean;
  characters: string[];
  onUpdateCell: (rowIndex: number, colIndex: ColumnIndex, value: string) => void;
  onConfirmSpeaker: (speakerName: string) => void;
  onSetFocus: (rowIndex: number, colIndex: ColumnIndex, startEditing?: boolean) => void;
  onMoveFocus: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onShiftEnter: () => void;
  onTabMove: (isShift: boolean) => void;
  onSetEditing: (editing: boolean) => void;
  onInsertRowBelow: (rowIndex: number) => void;
  onDeleteRow: (rowIndex: number) => void;
}

export const ScenarioRowComponent: React.FC<ScenarioRowProps> = ({
  row,
  rowIndex,
  totalRows,
  columnWidths,
  selectedCell,
  isEditing,
  characters,
  onUpdateCell,
  onConfirmSpeaker,
  onSetFocus,
  onMoveFocus,
  onShiftEnter,
  onTabMove,
  onSetEditing,
  onInsertRowBelow,
  onDeleteRow,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-stretch border-b border-slate-800/80 transition-colors ${
        isDragging ? 'opacity-40 bg-blue-950/40 z-30' : 'bg-slate-900/40 hover:bg-slate-900/80'
      }`}
    >
      {/* Drag & Delete Control Margin */}
      <div className="flex items-center justify-center w-[60px] px-1 border-r border-slate-800 bg-slate-950/60 shrink-0 space-x-0.5">
        {/* D&D Handle */}
        <button
          {...attributes}
          {...listeners}
          title="行をドラッグして移動"
          className="p-1 text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing rounded transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Delete Row Button */}
        <button
          onClick={() => onDeleteRow(rowIndex)}
          disabled={totalRows <= 1}
          title="行を削除 (-)"
          className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-500 rounded transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Column 1: Speaker (話者) */}
      <div
        className="border-r border-slate-800 shrink-0"
        style={{ width: `${columnWidths[0]}px` }}
      >
        <CellEditor
          rowIndex={rowIndex}
          colIndex={0}
          value={row.speaker}
          isFocused={selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === 0}
          isEditing={isEditing && selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === 0}
          characters={characters}
          onUpdate={(val) => onUpdateCell(rowIndex, 0, val)}
          onConfirmSpeaker={onConfirmSpeaker}
          onSetFocus={onSetFocus}
          onMoveFocus={onMoveFocus}
          onShiftEnter={onShiftEnter}
          onTabMove={onTabMove}
          onSetEditing={onSetEditing}
        />
      </div>

      {/* Column 2: Dialogue (セリフ) */}
      <div
        className="border-r border-slate-800 flex-1 min-w-[200px]"
        style={{ width: `${columnWidths[1]}px` }}
      >
        <CellEditor
          rowIndex={rowIndex}
          colIndex={1}
          value={row.dialogue}
          isFocused={selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === 1}
          isEditing={isEditing && selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === 1}
          characters={characters}
          onUpdate={(val) => onUpdateCell(rowIndex, 1, val)}
          onConfirmSpeaker={onConfirmSpeaker}
          onSetFocus={onSetFocus}
          onMoveFocus={onMoveFocus}
          onShiftEnter={onShiftEnter}
          onTabMove={onTabMove}
          onSetEditing={onSetEditing}
        />
      </div>

      {/* Column 3: Note / Direction (ト書き・補足) */}
      <div
        className="border-r border-slate-800 shrink-0"
        style={{ width: `${columnWidths[2]}px` }}
      >
        <CellEditor
          rowIndex={rowIndex}
          colIndex={2}
          value={row.note}
          isFocused={selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === 2}
          isEditing={isEditing && selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === 2}
          characters={characters}
          onUpdate={(val) => onUpdateCell(rowIndex, 2, val)}
          onConfirmSpeaker={onConfirmSpeaker}
          onSetFocus={onSetFocus}
          onMoveFocus={onMoveFocus}
          onShiftEnter={onShiftEnter}
          onTabMove={onTabMove}
          onSetEditing={onSetEditing}
        />
      </div>

      {/* Insert Row Button Right of Column 3 */}
      <div className="flex items-center justify-center w-[40px] px-1.5 bg-slate-950/40 shrink-0">
        <button
          onClick={() => onInsertRowBelow(rowIndex)}
          title="下に新しい行を挿入 (+)"
          className="p-1 text-slate-500 hover:text-emerald-400 hover:bg-slate-800/80 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
