import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DropTargetType, DropTargetPayload } from '../../types/dnd';

interface DroppableSlotProps {
  id: string;
  targetType: DropTargetType;
  targetEmployeeId?: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  emptyPlaceholder?: React.ReactNode;
  isEmpty?: boolean;
}

export const DroppableSlot: React.FC<DroppableSlotProps> = ({
  id,
  targetType,
  targetEmployeeId,
  children,
  className = '',
  activeClassName = 'ring-2 ring-brand-500 ring-offset-1 bg-brand-50/70 border-brand-400',
  emptyPlaceholder,
  isEmpty = false,
}) => {
  const dropData: DropTargetPayload = {
    targetType,
    targetEmployeeId,
  };

  const { isOver, setNodeRef } = useDroppable({
    id,
    data: dropData,
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-150 ${className} ${isOver ? activeClassName : ''}`}
    >
      {isEmpty && emptyPlaceholder ? emptyPlaceholder : children}
    </div>
  );
};
