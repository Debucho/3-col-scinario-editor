import { useState, useCallback, useEffect } from 'react';
import type { ScenarioProject, ScenarioRow, CellPosition, ColumnIndex } from '../types/scenario';

const INITIAL_PROJECT: ScenarioProject = {
  version: '1.0.0',
  metadata: {
    title: '無題のシナリオ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  characters: ['アリス', 'ボブ', 'ナレーション'],
  rows: [
    {
      id: 'row-1',
      speaker: 'アリス',
      dialogue: 'こんにちは！今日の天気はとてもいいね。',
      note: '笑顔で手を振りながら登場',
    },
    {
      id: 'row-2',
      speaker: 'ボブ',
      dialogue: 'そうだね。絶好のお散歩日和だ。',
      note: 'ベンチから立ち上がる',
    },
    {
      id: 'row-3',
      speaker: '',
      dialogue: '',
      note: '暗転',
    },
  ],
};

const MAX_HISTORY = 50;

export function useScenarioStore() {
  const [history, setHistory] = useState<{
    past: ScenarioProject[];
    present: ScenarioProject;
    future: ScenarioProject[];
  }>({
    past: [],
    present: INITIAL_PROJECT,
    future: [],
  });

  const [selectedCell, setSelectedCell] = useState<CellPosition | null>({
    rowIndex: 0,
    colIndex: 0,
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [columnWidths, setColumnWidths] = useState<[number, number, number]>([180, 480, 240]);

  const project = history.present;

  // Helper to commit new project state to undo/redo history
  const updateProject = useCallback(
    (updater: (prev: ScenarioProject) => ScenarioProject, saveToHistory = true) => {
      setHistory((prev) => {
        const nextPresent = updater(prev.present);
        if (!saveToHistory) {
          return { ...prev, present: nextPresent };
        }
        const newPast = [...prev.past, prev.present];
        if (newPast.length > MAX_HISTORY) {
          newPast.shift();
        }
        return {
          past: newPast,
          present: {
            ...nextPresent,
            metadata: {
              ...nextPresent.metadata,
              updatedAt: new Date().toISOString(),
            },
          },
          future: [],
        };
      });
    },
    []
  );

  // Undo
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  // Redo
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Load imported project
  const loadProject = useCallback((newProject: ScenarioProject) => {
    setHistory({
      past: [],
      present: newProject,
      future: [],
    });
    setSelectedCell({ rowIndex: 0, colIndex: 0 });
    setIsEditing(false);
  }, []);

  // Project title edit
  const setTitle = useCallback(
    (title: string) => {
      updateProject((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, title },
      }));
    },
    [updateProject]
  );

  // AI Configuration update
  const setAiConfig = useCallback(
    (aiConfig: import('../types/ai').AiConfig) => {
      updateProject((prev) => ({
        ...prev,
        aiConfig,
      }));
    },
    [updateProject]
  );

  // Character management
  const addCharacter = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateProject((prev) => {
        if (prev.characters.includes(trimmed)) return prev;
        return {
          ...prev,
          characters: [...prev.characters, trimmed],
        };
      });
    },
    [updateProject]
  );

  const removeCharacter = useCallback(
    (name: string) => {
      updateProject((prev) => ({
        ...prev,
        characters: prev.characters.filter((c) => c !== name),
      }));
    },
    [updateProject]
  );

  // Auto-add character if speaker is committed
  const confirmSpeakerName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (trimmed) {
        addCharacter(trimmed);
      }
    },
    [addCharacter]
  );

  // Row update
  const updateCell = useCallback(
    (rowIndex: number, colIndex: ColumnIndex, value: string, saveHistory = true) => {
      updateProject((prev) => {
        const newRows = [...prev.rows];
        if (!newRows[rowIndex]) return prev;

        const updatedRow = { ...newRows[rowIndex] };
        if (colIndex === 0) updatedRow.speaker = value;
        if (colIndex === 1) updatedRow.dialogue = value;
        if (colIndex === 2) updatedRow.note = value;

        newRows[rowIndex] = updatedRow;

        return {
          ...prev,
          rows: newRows,
        };
      }, saveHistory);
    },
    [updateProject]
  );

  // Insert row below
  const insertRowBelow = useCallback(
    (rowIndex: number) => {
      const newRow: ScenarioRow = {
        id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        speaker: '',
        dialogue: '',
        note: '',
      };
      updateProject((prev) => {
        const newRows = [...prev.rows];
        newRows.splice(rowIndex + 1, 0, newRow);
        return { ...prev, rows: newRows };
      });
      setSelectedCell({ rowIndex: rowIndex + 1, colIndex: 0 });
      setIsEditing(true);
    },
    [updateProject]
  );

  // Append multiple rows at end of project
  const appendRows = useCallback(
    (newRows: ScenarioRow[]) => {
      if (newRows.length === 0) return;

      newRows.forEach((r) => {
        if (r.speaker && r.speaker.trim()) {
          confirmSpeakerName(r.speaker);
        }
      });

      updateProject((prev) => {
        const updatedRows = [...prev.rows, ...newRows];
        return { ...prev, rows: updatedRows };
      });

      setSelectedCell({
        rowIndex: project.rows.length + newRows.length - 1,
        colIndex: 1,
      });
    },
    [updateProject, confirmSpeakerName, project.rows.length]
  );

  // Insert multiple rows below a specific index
  const insertRowsBelow = useCallback(
    (targetRowIndex: number, newRows: ScenarioRow[]) => {
      if (newRows.length === 0) return;

      newRows.forEach((r) => {
        if (r.speaker && r.speaker.trim()) {
          confirmSpeakerName(r.speaker);
        }
      });

      updateProject((prev) => {
        const updatedRows = [...prev.rows];
        updatedRows.splice(targetRowIndex + 1, 0, ...newRows);
        return { ...prev, rows: updatedRows };
      });

      setSelectedCell({
        rowIndex: Math.min(targetRowIndex + 1, project.rows.length + newRows.length - 1),
        colIndex: 1,
      });
    },
    [updateProject, confirmSpeakerName, project.rows.length]
  );

  // Insert text into currently selected cell
  const insertTextToSelectedCell = useCallback(
    (text: string) => {
      if (!selectedCell) return;
      const { rowIndex, colIndex } = selectedCell;
      const currentRow = project.rows[rowIndex];
      if (!currentRow) return;

      let currentVal = '';
      if (colIndex === 0) currentVal = currentRow.speaker;
      if (colIndex === 1) currentVal = currentRow.dialogue;
      if (colIndex === 2) currentVal = currentRow.note;

      const newVal = currentVal ? `${currentVal}\n${text}` : text;
      updateCell(rowIndex, colIndex, newVal);
    },
    [selectedCell, project.rows, updateCell]
  );

  // Delete row
  const deleteRow = useCallback(
    (rowIndex: number) => {
      updateProject((prev) => {
        if (prev.rows.length <= 1) return prev; // Keep at least 1 row
        const newRows = prev.rows.filter((_, idx) => idx !== rowIndex);
        return { ...prev, rows: newRows };
      });
      setSelectedCell((prev) => {
        if (!prev) return null;
        const newRowIdx = Math.min(rowIndex, project.rows.length - 2);
        return { rowIndex: Math.max(0, newRowIdx), colIndex: prev.colIndex };
      });
    },
    [updateProject, project.rows.length]
  );

  // Reorder rows
  const reorderRows = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (oldIndex === newIndex) return;
      updateProject((prev) => {
        const newRows = [...prev.rows];
        const [moved] = newRows.splice(oldIndex, 1);
        newRows.splice(newIndex, 0, moved);
        return { ...prev, rows: newRows };
      });
      setSelectedCell({ rowIndex: newIndex, colIndex: selectedCell?.colIndex ?? 0 });
    },
    [updateProject, selectedCell]
  );

  // Cell Navigation
  const moveFocus = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (!selectedCell) return;
      const { rowIndex, colIndex } = selectedCell;

      let nextRow = rowIndex;
      let nextCol = colIndex;

      if (direction === 'up') {
        nextRow = Math.max(0, rowIndex - 1);
      } else if (direction === 'down') {
        nextRow = Math.min(project.rows.length - 1, rowIndex + 1);
      } else if (direction === 'left') {
        if (colIndex > 0) {
          nextCol = (colIndex - 1) as ColumnIndex;
        } else if (rowIndex > 0) {
          nextRow = rowIndex - 1;
          nextCol = 2;
        }
      } else if (direction === 'right') {
        if (colIndex < 2) {
          nextCol = (colIndex + 1) as ColumnIndex;
        } else if (rowIndex < project.rows.length - 1) {
          nextRow = rowIndex + 1;
          nextCol = 0;
        }
      }

      setSelectedCell({ rowIndex: nextRow, colIndex: nextCol });
    },
    [selectedCell, project.rows.length]
  );

  // Shift + Enter action
  const handleShiftEnter = useCallback(() => {
    if (!selectedCell) return;
    const { rowIndex, colIndex } = selectedCell;

    if (rowIndex >= project.rows.length - 1) {
      // Append row at bottom
      insertRowBelow(rowIndex);
    } else {
      setSelectedCell({ rowIndex: rowIndex + 1, colIndex });
      setIsEditing(false);
    }
  }, [selectedCell, project.rows.length, insertRowBelow]);

  // Tab / Shift+Tab action
  const handleTabMove = useCallback(
    (isShift: boolean) => {
      if (!selectedCell) return;
      const { rowIndex, colIndex } = selectedCell;

      if (isShift) {
        if (colIndex > 0) {
          setSelectedCell({ rowIndex, colIndex: (colIndex - 1) as ColumnIndex });
        } else if (rowIndex > 0) {
          setSelectedCell({ rowIndex: rowIndex - 1, colIndex: 2 });
        }
      } else {
        if (colIndex < 2) {
          setSelectedCell({ rowIndex, colIndex: (colIndex + 1) as ColumnIndex });
        } else {
          if (rowIndex < project.rows.length - 1) {
            setSelectedCell({ rowIndex: rowIndex + 1, colIndex: 0 });
          } else {
            // At the end of last column in last row -> insert new row
            insertRowBelow(rowIndex);
          }
        }
      }
    },
    [selectedCell, project.rows.length, insertRowBelow]
  );

  // Global Keyboard listener for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // If editing inside textarea, allow default undo/redo inside text unless ESC or specific hotkeys
        if (e.key === 'Escape') {
          setIsEditing(false);
          e.preventDefault();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        redo();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [undo, redo]);

  return {
    project,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo,
    redo,
    loadProject,
    setTitle,
    setAiConfig,
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
    columnWidths,
    setColumnWidths,
    moveFocus,
    handleShiftEnter,
    handleTabMove,
  };
}
