import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { ScenarioRow as ScenarioRowType, ColumnIndex, CellPosition } from '../types/scenario';
import { ScenarioRowComponent } from './ScenarioRow';
import { Plus, MessageSquare, Volume2, AlignLeft } from 'lucide-react';
import { useColumnResize } from '../hooks/useColumnResize';

interface ScenarioTableProps {
  rows: ScenarioRowType[];
  characters: string[];
  selectedCell: CellPosition | null;
  isEditing: boolean;
  onUpdateCell: (rowIndex: number, colIndex: ColumnIndex, value: string) => void;
  onConfirmSpeaker: (speakerName: string) => void;
  onSetFocus: (rowIndex: number, colIndex: ColumnIndex, startEditing?: boolean) => void;
  onMoveFocus: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onShiftEnter: () => void;
  onTabMove: (isShift: boolean) => void;
  onSetEditing: (editing: boolean) => void;
  onInsertRowBelow: (rowIndex: number) => void;
  onDeleteRow: (rowIndex: number) => void;
  onReorderRows: (oldIndex: number, newIndex: number) => void;
}

export const ScenarioTable: React.FC<ScenarioTableProps> = ({
  rows,
  characters,
  selectedCell,
  isEditing,
  onUpdateCell,
  onConfirmSpeaker,
  onSetFocus,
  onMoveFocus,
  onShiftEnter,
  onTabMove,
  onSetEditing,
  onInsertRowBelow,
  onDeleteRow,
  onReorderRows,
}) => {
  const { columnWidths, startResizing } = useColumnResize([180, 480, 240]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = rows.findIndex((r) => r.id === active.id);
      const newIndex = rows.findIndex((r) => r.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderRows(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Table Header */}
      <div className="flex items-center bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">
        {/* Margin header for control buttons */}
        <div className="w-[60px] px-2 py-3 text-center border-r border-slate-800 shrink-0">
          操作
        </div>

        {/* Col 1 Header: Speaker */}
        <div
          className="relative px-3 py-3 border-r border-slate-800 flex items-center space-x-2 shrink-0"
          style={{ width: `${columnWidths[0]}px` }}
        >
          <Volume2 className="w-4 h-4 text-blue-400" />
          <span>1. 話者 (Speaker)</span>
          <div
            onMouseDown={(e) => startResizing(0, e)}
            className="resize-handle hover:bg-blue-500"
            title="ドラッグで列幅調整"
          />
        </div>

        {/* Col 2 Header: Dialogue */}
        <div
          className="relative px-3 py-3 border-r border-slate-800 flex items-center space-x-2 flex-1 min-w-[200px]"
          style={{ width: `${columnWidths[1]}px` }}
        >
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>2. セリフ (Dialogue)</span>
          <div
            onMouseDown={(e) => startResizing(1, e)}
            className="resize-handle hover:bg-blue-500"
            title="ドラッグで列幅調整"
          />
        </div>

        {/* Col 3 Header: Note / Direction */}
        <div
          className="relative px-3 py-3 border-r border-slate-800 flex items-center space-x-2 shrink-0"
          style={{ width: `${columnWidths[2]}px` }}
        >
          <AlignLeft className="w-4 h-4 text-emerald-400" />
          <span>3. ト書き・補足 (Direction)</span>
          <div
            onMouseDown={(e) => startResizing(2, e)}
            className="resize-handle hover:bg-blue-500"
            title="ドラッグで列幅調整"
          />
        </div>

        {/* Insert header margin */}
        <div className="w-[40px] px-2 py-3 shrink-0" />
      </div>

      {/* Rows Container */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-slate-800/60">
            {rows.map((row, index) => (
              <ScenarioRowComponent
                key={row.id}
                row={row}
                rowIndex={index}
                totalRows={rows.length}
                columnWidths={columnWidths}
                selectedCell={selectedCell}
                isEditing={isEditing}
                characters={characters}
                onUpdateCell={onUpdateCell}
                onConfirmSpeaker={onConfirmSpeaker}
                onSetFocus={(rIdx, cIdx, startEditing) => {
                  onSetFocus(rIdx, cIdx, startEditing);
                }}
                onMoveFocus={onMoveFocus}
                onShiftEnter={onShiftEnter}
                onTabMove={onTabMove}
                onSetEditing={onSetEditing}
                onInsertRowBelow={onInsertRowBelow}
                onDeleteRow={onDeleteRow}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Table Footer / Quick Add Row */}
      <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => onInsertRowBelow(rows.length - 1)}
          className="flex items-center space-x-2 text-xs font-medium text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>末尾に新しい行を追加</span>
        </button>

        <div className="text-xs text-slate-500">
          全 {rows.length} 行 | ダブルクリックで編集開始 | ESCで確定
        </div>
      </div>
    </div>
  );
};
