import React, { useState } from 'react';
import { format } from 'date-fns';

type EventWithDetails = {
  id: number;
  date: Date;
  title: string;
  time: string;
  duration: string;
  description: string;
};

interface CalendarCellProps {
  day: Date;
  monthStart: Date;
  formattedDate: string;
  events: EventWithDetails[];
  holidays?: string[];
  onDateClick: (day: Date) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-16 w-16 text-sm',
  lg: 'h-32 w-32 text-base',
};

export const CalendarCell: React.FC<CalendarCellProps> = ({ day, monthStart, formattedDate, events, holidays, onDateClick, size = 'md' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const isCurrentMonth = day.getMonth() === monthStart.getMonth();
  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const holiday = holidays?.find(h => h === format(day, 'yyyy-MM-dd'));
  return (
    <div
      className={`border rounded flex flex-col items-center justify-between cursor-pointer transition-all duration-200 ${sizeMap[size]} ${isCurrentMonth ? '' : 'bg-gray-50 text-gray-400'} ${isToday ? 'border-blue-500' : ''} shadow-sm relative`}
      onClick={() => onDateClick(day)}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
      style={{ position: 'relative' }}
    >
      <span className={`font-bold ${holiday ? 'text-red-500' : ''}`}>{formattedDate}</span>
      {holiday && <span className="text-[10px] text-red-500">Holiday</span>}
      {events.length > 0 && (
        <div className="mt-1 w-full flex flex-col gap-1">
          {events.map(ev => (
            <span key={ev.id} className="bg-blue-100 text-blue-700 rounded px-1 text-[10px] truncate">{ev.title}</span>
          ))}
        </div>
      )}
      {showDetails && events.length > 0 && (
        <div className="absolute left-1/2 top-full z-20 w-64 -translate-x-1/2 mt-2 bg-white border rounded shadow-lg p-3 text-xs text-gray-800">
          {events.map(ev => (
            <div key={ev.id} className="mb-2 last:mb-0">
              <div className="font-bold text-blue-700 mb-1">{ev.title}</div>
              <div><span className="font-semibold">Time:</span> {ev.time}</div>
              <div><span className="font-semibold">Duration:</span> {ev.duration}</div>
              {ev.description && <div><span className="font-semibold">Description:</span> {ev.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarCell;