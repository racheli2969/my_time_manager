import React, { useState } from 'react';
import CalendarCell from './CalendarCell';
import ViewSwitcher, { ViewMode } from './ViewSwitcher';
import {
  subMonths,
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfYear,
  getDaysInMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface EventWithDetails {
  id: number;
  date: Date;
  title: string;
  time: string;
  duration: string;
  description: string;
}

type Event = EventWithDetails;

const HOLIDAYS: string[] = [];

/**
 * MyCalendar component displays a calendar with week, month, and year views.
 * - Users can add events with title, time, duration, and description.
 * - Events are shown in a tooltip on cell hover.
 * - Holidays can be added by country/religion.
 * - UI is aligned and responsive for week/month views.
 */
export const MyCalendar: React.FC = () => {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventDuration, setNewEventDuration] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayCountry, setHolidayCountry] = useState('');
  const [holidayReligion, setHolidayReligion] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    setShowEventModal(true);
  };

  /**
   * Add a new event to the calendar
   */
  const addEvent = () => {
    // Require login for adding events
    // You may want to use context for currentUser
    const currentUser = window.localStorage.getItem('currentUserId');
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    if (newEventTitle.trim()) {
      const newEvent: Event = {
        id: events.length + 1,
        date: selectedDate,
        title: newEventTitle,
        time: newEventTime,
        duration: newEventDuration,
        description: newEventDescription,
      };
      setEvents([...events, newEvent]);
      setNewEventTitle('');
      setNewEventTime('');
      setNewEventDuration('');
      setNewEventDescription('');
      setShowEventModal(false);
    }
  // ...existing code...
  return (
    <>
      {/* ...existing code... */}
      {showLoginPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="mb-4">You must be logged in to add events to your calendar.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => window.location.href = '/login'}>Login</button>
          </div>
        </div>
      )}
    </>
  );
  };

  const renderHeader = () => {
    let title = '';
    if (viewMode === 'month') title = format(currentDate, 'MMMM yyyy');
    else if (viewMode === 'week') {
      const start = format(startOfWeek(currentDate), 'MMM d');
      const end = format(endOfWeek(currentDate), 'MMM d, yyyy');
      title = `${start} - ${end}`;
    } else if (viewMode === 'year') title = format(currentDate, 'yyyy');

    const adjustDate = (amount: number) => {
      if (viewMode === 'month') return addMonths(currentDate, amount);
      if (viewMode === 'week') return addDays(currentDate, amount * 7);
      if (viewMode === 'year') return addMonths(currentDate, amount * 12);
      return currentDate;
    };

    return (
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setCurrentDate(adjustDate(-1))}
          className="p-2 bg-gray-200 rounded flex items-center justify-center"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={() => setCurrentDate(adjustDate(1))}
          className="p-2 bg-gray-200 rounded flex items-center justify-center"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  };

  /**
   * Render weekday headers for week/month views
   */
  const renderDays = () => {
    if (viewMode === 'year') return null;
    const days = [];
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-base font-semibold py-2">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2 border-b border-gray-200">{days}</div>;
  };

  const renderCells = () => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
      const rows = [];
      let days: JSX.Element[] = [];
      let day = startDate;

      while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
          const formattedDate = format(day, 'd');
          const dayEvents = events.filter(
            (event) => format(event.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          );
          days.push(
            <CalendarCell
              key={day.toISOString()}
              day={day}
              monthStart={monthStart}
              formattedDate={formattedDate}
              events={dayEvents}
              holidays={HOLIDAYS}
              onDateClick={onDateClick}
              size="lg"
            />
          );
          day = addDays(day, 1);
        }
        rows.push(
          <div key={day.toISOString()} className="grid grid-cols-7 gap-4">
            {days}
          </div>
        );
        days = [];
      }
      return <div>{rows}</div>;
    }

    if (viewMode === 'week') {
      const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = addDays(startDate, i);
        const formattedDate = format(day, 'd');
        const dayEvents = events.filter(
          (event) => format(event.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        days.push(
          <CalendarCell
            key={day.toISOString()}
            day={day}
            monthStart={currentDate}
            formattedDate={formattedDate}
            events={dayEvents}
            holidays={HOLIDAYS}
            onDateClick={onDateClick}
            size="lg"
          />
        );
      }
      return <div className="grid grid-cols-7 gap-6">{days}</div>;
    }

    if (viewMode === 'year') {
      const yearStart = startOfYear(currentDate);
      const months = [];
      for (let m = 0; m < 12; m++) {
        const monthDate = addMonths(yearStart, m);
        const daysInMonth = getDaysInMonth(monthDate);
        const miniDays = [];

        for (let d = 1; d <= daysInMonth; d++) {
          const day = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
          const formattedDate = format(day, 'd');
          const dayEvents = events.filter(
            (event) => format(event.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          );
          miniDays.push(
            <CalendarCell
              key={day.toISOString()}
              day={day}
              monthStart={monthDate}
              formattedDate={formattedDate}
              events={dayEvents}
              holidays={HOLIDAYS}
              onDateClick={onDateClick}
              size="sm"
            />
          );
        }

        months.push(
          <div key={m} className="border rounded p-2 mb-2">
            <div className="font-bold text-sm mb-1">{format(monthDate, 'MMMM')}</div>
            <div className="grid grid-cols-7 gap-1">{miniDays}</div>
          </div>
        );
      }
      return <div className="grid grid-cols-2 gap-2">{months}</div>;
    }

    return null;
  };

  return (
    <div className="p-4 bg-white rounded shadow w-full">
      <div className="flex justify-between items-center mb-2">
        <ViewSwitcher mode={viewMode} onChange={setViewMode} options={['week', 'month', 'year']} />
        <button
          className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
          onClick={() => setShowHolidayModal(true)}
        >
          Add Holidays
        </button>
      </div>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Add Event for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <form className="space-y-3" onSubmit={e => {e.preventDefault(); addEvent();}}>
              <input
                type="text"
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                placeholder="Title"
                className="border rounded px-3 py-2 w-full"
                required
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newEventTime}
                  onChange={e => setNewEventTime(e.target.value)}
                  className="border rounded px-3 py-2 w-1/2"
                  required
                />
                <input
                  type="text"
                  value={newEventDuration}
                  onChange={e => setNewEventDuration(e.target.value)}
                  placeholder="Duration (e.g. 1h)"
                  className="border rounded px-3 py-2 w-1/2"
                  required
                />
              </div>
              <textarea
                value={newEventDescription}
                onChange={e => setNewEventDescription(e.target.value)}
                placeholder="Description"
                className="border rounded px-3 py-2 w-full resize-none"
                rows={2}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-center">Add Holidays</h3>
            <form className="space-y-3" onSubmit={e => {e.preventDefault(); setShowHolidayModal(false);}}>
              <input
                type="text"
                value={holidayCountry}
                onChange={e => setHolidayCountry(e.target.value)}
                placeholder="Country (e.g. US, IL)"
                className="border rounded px-3 py-2 w-full"
              />
              <input
                type="text"
                value={holidayReligion}
                onChange={e => setHolidayReligion(e.target.value)}
                placeholder="Religion (optional)"
                className="border rounded px-3 py-2 w-full"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHolidayModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add Holidays
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
