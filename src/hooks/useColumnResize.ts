import { useState, useCallback, useRef } from 'react';

export function useColumnResize(
  initialWidths: [number, number, number] = [180, 480, 240]
) {
  const [columnWidths, setColumnWidths] = useState<[number, number, number]>(initialWidths);
  const [resizingColIndex, setResizingColIndex] = useState<number | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const startResizing = useCallback(
    (colIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      setResizingColIndex(colIndex);
      startXRef.current = e.clientX;
      startWidthRef.current = columnWidths[colIndex];

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startXRef.current;
        const newWidth = Math.max(100, startWidthRef.current + deltaX);

        setColumnWidths((prev) => {
          const next = [...prev] as [number, number, number];
          next[colIndex] = newWidth;
          return next;
        });
      };

      const handleMouseUp = () => {
        setResizingColIndex(null);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [columnWidths]
  );

  return {
    columnWidths,
    setColumnWidths,
    startResizing,
    isResizing: resizingColIndex !== null,
  };
}
