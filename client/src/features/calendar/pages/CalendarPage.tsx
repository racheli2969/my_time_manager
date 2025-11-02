/**
 * Calendar Page
 * Main calendar view with week, month, and year modes
 */

import React, { useState } from 'react';
import { CalendarCell, EventWithDetails } from '../components/CalendarCell';
import ViewSwitcher, { ViewMode } from '../components/ViewSwitcher';
import { EventModal } from '../components/EventModal';
import { HolidayModal } from '../components/HolidayModal';
import { LoginPrompt } from '../components/LoginPrompt';
import {
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
import { useNavigate } from 'react-router-dom';

const HOLIDAYS: string[] = [];

/**
 * Calendar page component with multiple view modes
 * Allows users to add events and holidays
 */
export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventDuration, setNewEventDuration] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Holiday modal state
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayCountry, setHolidayCountry] = useState('');
  const [holidayReligion, setHolidayReligion] = useState('');

  /**
   * Handle date cell click
   */
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    setShowEventModal(true);
  };

  /**
   * Add a new event to the calendar
   */
  const addEvent = () => {
    // Require login for adding events
    const currentUser = window.localStorage.getItem('currentUserId');
    if (!currentUser) {
      setShowLoginPrompt(true);
      setShowEventModal(false);
      return;
    }

    if (newEventTitle.trim()) {
      const newEvent: EventWithDetails = {
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
  };

  /**
   * Handle holiday addition
   */
  const handleAddHolidays = () => {
    // Placeholder for holiday API integration
    console.log('Adding holidays for:', { country: holidayCountry, religion: holidayReligion });
    setShowHolidayModal(false);
    setHolidayCountry('');
    setHolidayReligion('');
  };

  /**
   * Render calendar header with navigation
   */
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <button
          onClick={() => setCurrentDate(adjustDate(-1))}
          className="p-2 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
        <button
          onClick={() => setCurrentDate(adjustDate(1))}
          className="p-2 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors"
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
        <div key={i} className="text-center text-sm sm:text-base font-semibold py-2">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-4 border-b border-gray-200">{days}</div>;
  };

  /**
   * Render calendar cells based on view mode
   */
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
            />
          );
          day = addDays(day, 1);
        }
        rows.push(
          <div key={day.toISOString()} className="grid grid-cols-7 gap-2 mb-2">
            {days}
          </div>
        );
        days = [];
      }
      return <div>{rows}</div>;
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        const formattedDate = format(day, 'd');
        const dayEvents = events.filter(
          (event) => format(event.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        weekDays.push(
          <CalendarCell
            key={day.toISOString()}
            day={day}
            monthStart={startOfMonth(currentDate)}
            formattedDate={formattedDate}
            events={dayEvents}
            holidays={HOLIDAYS}
            onDateClick={onDateClick}
            size="lg"
          />
        );
      }
      return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">{weekDays}</div>;
    } else if (viewMode === 'year') {
      const yearStart = startOfYear(currentDate);
      const months = [];
      for (let m = 0; m < 12; m++) {
        const monthDate = addMonths(yearStart, m);
        const monthStart = startOfMonth(monthDate);
        const daysInMonth = getDaysInMonth(monthDate);
        const miniDays = [];
        for (let d = 0; d < daysInMonth; d++) {
          const day = addDays(monthStart, d);
          const formattedDate = format(day, 'd');
          const dayEvents = events.filter(
            (event) => format(event.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          );
          miniDays.push(
            <CalendarCell
              key={day.toISOString()}
              day={day}
              monthStart={monthStart}
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
    <div className="p-4 sm:p-6 bg-white rounded shadow w-full max-w-full overflow-hidden">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <ViewSwitcher mode={viewMode} onChange={setViewMode} options={['week', 'month', 'year']} />
        <button
          className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium transition-colors w-full sm:w-auto"
          onClick={() => setShowHolidayModal(true)}
        >
          Add Holidays
        </button>
      </div>

      {/* Calendar Navigation */}
      {renderHeader()}

      {/* Weekday Headers */}
      {renderDays()}

      {/* Calendar Grid */}
      {renderCells()}

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          selectedDate={selectedDate}
          eventTitle={newEventTitle}
          eventTime={newEventTime}
          eventDuration={newEventDuration}
          eventDescription={newEventDescription}
          onTitleChange={setNewEventTitle}
          onTimeChange={setNewEventTime}
          onDurationChange={setNewEventDuration}
          onDescriptionChange={setNewEventDescription}
          onSave={addEvent}
          onCancel={() => setShowEventModal(false)}
        />
      )}

      {/* Holiday Modal */}
      {showHolidayModal && (
        <HolidayModal
          country={holidayCountry}
          religion={holidayReligion}
          onCountryChange={setHolidayCountry}
          onReligionChange={setHolidayReligion}
          onSave={handleAddHolidays}
          onCancel={() => setShowHolidayModal(false)}
        />
      )}

      {/* Login Prompt */}
      {showLoginPrompt && (
        <LoginPrompt
          onClose={() => setShowLoginPrompt(false)}
          onLogin={() => navigate('/')}
        />
      )}
    </div>
  );
};

export default CalendarPage;
