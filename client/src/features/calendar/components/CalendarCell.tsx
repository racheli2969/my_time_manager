/**
 * Calendar Cell Component
 * Individual day cell in the calendar grid
 */

import React, { useState } from 'react';
import { format } from 'date-fns';

export type EventWithDetails = {
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
  md: 'h-24 w-24 text-sm',
  lg: 'h-40 w-full min-h-[10rem] text-base p-2',
};

/**
 * Calendar cell displaying a single day with events
 */
export const CalendarCell: React.FC<CalendarCellProps> = ({ 
  day, 
  monthStart, 
  formattedDate, 
  events, 
  holidays, 
  onDateClick, 
  size = 'md' 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const isCurrentMonth = day.getMonth() === monthStart.getMonth();
  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const holiday = holidays?.find(h => h === format(day, 'yyyy-MM-dd'));
  
  return (
    <div
      className={`border rounded flex flex-col items-start justify-start cursor-pointer transition-all duration-200 hover:shadow-lg ${sizeMap[size]} ${
        isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
      } ${isToday ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'} shadow-sm relative`}
      onClick={() => onDateClick(day)}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
      style={{ position: 'relative' }}
    >
      <div className="w-full">
        <span className={`font-bold ${size === 'lg' ? 'text-lg' : ''} ${holiday ? 'text-red-500' : ''}`}>
          {formattedDate}
        </span>
        {isToday && size === 'lg' && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Today</span>
        )}
        {holiday && <span className="text-[10px] text-red-500 block">Holiday</span>}
      </div>
      {events.length > 0 && (
        <div className="mt-2 w-full flex flex-col gap-1">
          {events.map(ev => (
            <div
              key={ev.id} 
              className={`bg-blue-100 text-blue-700 rounded px-2 py-1 ${
                size === 'lg' ? 'text-sm' : 'text-[10px]'
              } truncate`}
            >
              <div className="font-medium">{ev.title}</div>
              {size === 'lg' && ev.time && (
                <div className="text-xs text-blue-600">{ev.time}</div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Event Details Tooltip */}
      {showDetails && events.length > 0 && (
        <div className="absolute left-1/2 top-full z-20 w-64 -translate-x-1/2 mt-2 bg-white border rounded shadow-lg p-3 text-xs text-gray-800">
          {events.map(ev => (
            <div key={ev.id} className="mb-2 last:mb-0">
              <div className="font-bold text-blue-700 mb-1">{ev.title}</div>
              <div><span className="font-semibold">Time:</span> {ev.time}</div>
              <div><span className="font-semibold">Duration:</span> {ev.duration}</div>
              {ev.description && (
                <div><span className="font-semibold">Description:</span> {ev.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarCell;
