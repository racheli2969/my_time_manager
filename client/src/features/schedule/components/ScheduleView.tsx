import { useState, useEffect } from "react";
import { useTask } from "../../../core/contexts/TaskContext";
import { useUser } from "../../../core/contexts/UserContext";
import { useAuthRedirect } from "../../../hooks/useAuthRedirect";
import { AuthDialog } from "../../../components/AuthDialog";
import { 
  Calendar, 
  Clock, 
  Settings, 
  AlertTriangle, 
  RefreshCw, 
  Edit3,
  Lock,
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";

interface ScheduleGenerationOptions {
  startDate?: Date;
  endDate?: Date;
  respectPersonalEvents: boolean;
  allowManualOverride: boolean;
  prioritizeUrgentTasks: boolean;
  optimizeForEfficiency: boolean;
}

// Date utilities
const getWeekStart = (date: Date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

const getMonthStart = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateHeader = (date: Date, view: 'day' | 'week' | 'month') => {
  switch (view) {
    case 'day':
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'week':
      const weekEnd = addDays(date, 6);
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    case 'month':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    default:
      return date.toLocaleDateString();
  }
};

const generateTimeSlots = (startHour: string, endHour: string) => {
  const slots = [];
  const [startH, startM] = startHour.split(':').map(Number);
  const [endH, endM] = endHour.split(':').map(Number);
  
  for (let hour = startH; hour <= endH; hour++) {
    const startMinute = hour === startH ? startM : 0;
    const endMinute = hour === endH ? endM : 60;
    
    for (let minute = startMinute; minute < endMinute; minute += 30) {
      if (hour === endH && minute >= endM) break;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  
  return slots;
};

const isWorkingDay = (date: Date, workingDays: number[]) => {
  return workingDays.includes(date.getDay());
};

const isWithinWorkHours = (time: string, startHour: string, endHour: string) => {
  return time >= startHour && time <= endHour;
};

export const ScheduleView: React.FC = () => {
  const { requireAuth, dialog } = useAuthRedirect();
  const { 
    scheduleEntries, 
    conflicts, 
    scheduleStats, 
    generateSchedule, 
    updateScheduleEntry,
    loadSchedule,
    loadConflicts,
    resolveConflict,
    loadPersonalEvents
  } = useTask();
  
  const { currentUser } = useUser();
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [draggedEntry, setDraggedEntry] = useState<any>(null);
  
  const [generationOptions, setGenerationOptions] = useState<ScheduleGenerationOptions>({
    respectPersonalEvents: true,
    allowManualOverride: true,
    prioritizeUrgentTasks: true,
    optimizeForEfficiency: true
  });

  useEffect(() => {
    loadSchedule();
    loadConflicts();
    loadPersonalEvents();
  }, []);

  // Navigation handlers
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        direction === 'prev' ? newDate.setDate(newDate.getDate() - 1) : newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        direction === 'prev' ? newDate.setDate(newDate.getDate() - 7) : newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        direction === 'prev' ? newDate.setMonth(newDate.getMonth() - 1) : newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, entry: any) => {
    setDraggedEntry(entry);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', entry.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetTime: string, targetDate: Date) => {
    e.preventDefault();
    
    if (!draggedEntry) return;

    // Calculate new start and end times
    const [hours, minutes] = targetTime.split(':').map(Number);
    const newStart = new Date(targetDate);
    newStart.setHours(hours, minutes, 0, 0);
    
    const originalDuration = new Date(draggedEntry.end).getTime() - new Date(draggedEntry.start).getTime();
    const newEnd = new Date(newStart.getTime() + originalDuration);

    try {
      await handleUpdateEntry(draggedEntry.id, {
        start: newStart,
        end: newEnd,
        isLocked: draggedEntry.isLocked
      });
      setDraggedEntry(null);
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!requireAuth(() => {
      performGenerateSchedule();
    }, 'You need to be signed in to generate schedules. Would you like to login now?')) {
      return;
    }
  };

  const performGenerateSchedule = async () => {
    if (!currentUser) return;
    
    setIsGenerating(true);
    try {
      // Calculate date range based on current view
      let startDate = new Date(currentDate);
      let endDate = new Date(currentDate);
      
      switch (view) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          const weekStart = getWeekStart(currentDate);
          startDate = weekStart;
          endDate = addDays(weekStart, 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          const monthStart = getMonthStart(currentDate);
          startDate = monthStart;
          endDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
      }

      // Simplified options to avoid server errors
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        respectPersonalEvents: generationOptions.respectPersonalEvents,
        allowManualOverride: generationOptions.allowManualOverride,
        prioritizeUrgentTasks: generationOptions.prioritizeUrgentTasks,
        optimizeForEfficiency: generationOptions.optimizeForEfficiency
      };

      console.log('Generating schedule with options:', options);
      await generateSchedule(currentUser.id, options);
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      alert('Failed to generate schedule. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateEntry = async (entryId: string, updates: any) => {
    try {
      await updateScheduleEntry(entryId, updates);
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to update entry:', error);
    }
  };

  const handleResolveConflict = async (conflictId: string, action: string) => {
    try {
      await resolveConflict(conflictId, action);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function for date formatting (currently unused but kept for future use)
  // const formatDate = (date: Date | string) => {
  //   const dateObj = typeof date === 'string' ? new Date(date) : date;
  //   return dateObj.toLocaleDateString([], { 
  //     weekday: 'short', 
  //     month: 'short', 
  //     day: 'numeric' 
  //   });
  // };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 text-red-900';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-900';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-900';
      case 'low': return 'border-green-500 bg-green-50 text-green-900';
      default: return 'border-gray-500 bg-gray-50 text-gray-900';
    }
  };

  const getEntriesForDate = (date: Date) => {
    const filteredEntries = scheduleEntries.filter(entry => {
      const entryDate = new Date(entry.start);
      const isSameDate = entryDate.toDateString() === date.toDateString();
      
      // Debug logging for today's schedule
      if (date.toDateString() === new Date().toDateString()) {
        console.log('Checking entry for today:', {
          entryTitle: entry.title,
          entryStart: entry.start,
          entryDate: entryDate.toDateString(),
          targetDate: date.toDateString(),
          isSameDate
        });
      }
      
      return isSameDate;
    });
    
    return filteredEntries;
  };

  // Helper function for getting week entries (currently unused but kept for future use)
  // const getEntriesForWeek = (startDate: Date) => {
  //   const endDate = addDays(startDate, 6);
  //   return scheduleEntries.filter(entry => {
  //     const entryDate = new Date(entry.start);
  //     return entryDate >= startDate && entryDate <= endDate;
  //   });
  // };

  const renderDayView = () => {
    const workingHours = currentUser?.workingHours || { start: '09:00', end: '17:00', daysOfWeek: [1,2,3,4,5] };
    const timeSlots = generateTimeSlots(workingHours.start, workingHours.end);
    const todayEntries = getEntriesForDate(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();
    const isWorkDay = isWorkingDay(currentDate, workingHours.daysOfWeek);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {formatDateHeader(currentDate, 'day')}
                {isToday && <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Today</span>}
              </h3>
              {!isWorkDay && (
                <p className="text-sm text-gray-500 mt-1">Non-working day</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {timeSlots.map(time => {
              const entryAtTime = todayEntries.find(entry => {
                const entryTime = formatTime(entry.start);
                return entryTime === time;
              });

              return (
                <div key={time} className="flex items-center">
                  <div className="w-16 text-sm text-gray-500 font-medium">
                    {time}
                  </div>
                  <div className="flex-1 ml-4">
                    {entryAtTime ? (
                      <div 
                        className={`border-l-4 rounded-lg p-3 ${getPriorityColor(entryAtTime.priority)} transition-all hover:shadow-md cursor-move ${entryAtTime.isLocked ? 'opacity-75' : ''}`}
                        draggable={!entryAtTime.isLocked}
                        onDragStart={(e) => handleDragStart(e, entryAtTime)}
                        onClick={() => setEditingEntry(entryAtTime)}
                        title={entryAtTime.isLocked ? 'Locked entry - cannot be moved' : 'Drag to move this task'}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{entryAtTime.title}</h4>
                            <p className="text-sm opacity-75">
                              {formatTime(entryAtTime.start)} - {formatTime(entryAtTime.end)}
                              <span className="ml-2">
                                ({Math.round((new Date(entryAtTime.end).getTime() - new Date(entryAtTime.start).getTime()) / 60000)} min)
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {entryAtTime.isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                            <Edit3 className="w-4 h-4 text-blue-500" />
                          </div>
                        </div>
                      </div>
                    ) : isWorkDay && isWithinWorkHours(time, workingHours.start, workingHours.end) ? (
                      <div 
                        className="h-12 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, time, currentDate)}
                        title="Drop tasks here"
                      >
                        Available
                      </div>
                    ) : (
                      <div className="h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        {isWorkDay ? 'Outside work hours' : 'Non-working day'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const workingHours = currentUser?.workingHours || { start: '09:00', end: '17:00', daysOfWeek: [1,2,3,4,5] };
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {formatDateHeader(weekStart, 'week')}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
            {weekDays.map((day, index) => {
              const dayEntries = getEntriesForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isWorkDay = isWorkingDay(day, workingHours.daysOfWeek);

              return (
                <div key={index} className="min-h-[32rem] lg:min-h-[36rem] xl:min-h-[40rem]">
                  <div className="mb-3">
                    <h4 className={`text-sm sm:text-base font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      <span className="ml-1">{day.getDate()}</span>
                      {isToday && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Today</span>}
                    </h4>
                    {!isWorkDay && <p className="text-xs text-gray-500 mt-1">Non-working</p>}
                  </div>
                  <div className="space-y-2">
                    {dayEntries.length > 0 ? (
                      dayEntries.map(entry => (
                        <div
                          key={entry.id}
                          className={`p-3 rounded-lg cursor-move transition-all hover:shadow-md ${getPriorityColor(entry.priority)} ${entry.isLocked ? 'opacity-75' : ''}`}
                          draggable={!entry.isLocked}
                          onDragStart={(e) => handleDragStart(e, entry)}
                          onClick={() => setEditingEntry(entry)}
                          title={entry.isLocked ? 'Locked entry' : 'Drag to move this task'}
                        >
                          <h5 className="text-xs font-medium truncate">{entry.title}</h5>
                          <p className="text-xs opacity-75">
                            {formatTime(entry.start)} - {formatTime(entry.end)}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            {entry.isLocked && <Lock className="w-3 h-3" />}
                            <Edit3 className="w-3 h-3" />
                          </div>
                        </div>
                      ))
                    ) : isWorkDay ? (
                      <div className="h-24 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        No tasks scheduled
                      </div>
                    ) : (
                      <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        Non-working day
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = getMonthStart(currentDate);
    // const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const workingHours = currentUser?.workingHours || { start: '09:00', end: '17:00', daysOfWeek: [1,2,3,4,5] };

    // Create calendar grid (6 weeks x 7 days)
    const calendarStart = getWeekStart(monthStart);
    const calendarDays = Array.from({ length: 42 }, (_, i) => addDays(calendarStart, i));

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {formatDateHeader(currentDate, 'month')}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4">
            {calendarDays.map((day, index) => {
              const dayEntries = getEntriesForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isWorkDay = isWorkingDay(day, workingHours.daysOfWeek);

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors ${
                    isCurrentMonth ? 'border-gray-200 hover:border-gray-300' : 'border-gray-100 bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}`}
                  onClick={() => {
                    setCurrentDate(day);
                    setView('day');
                  }}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.getDate()}
                    {isToday && <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">Today</span>}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="space-y-1">
                      {!isWorkDay && (
                        <div className="text-xs text-gray-400">Non-working</div>
                      )}
                      {dayEntries.slice(0, 3).map(entry => (
                        <div
                          key={entry.id}
                          className={`text-xs p-1 rounded truncate ${getPriorityColor(entry.priority)}`}
                        >
                          {entry.title}
                        </div>
                      ))}
                      {dayEntries.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEntries.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ConflictItem = ({ conflict }: { conflict: any }) => (
    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="font-medium text-red-900 capitalize">
              {conflict.conflictType.replace('_', ' ')}
            </h4>
          </div>
          <p className="text-red-700 mt-1 text-sm">{conflict.conflictDetails}</p>
        </div>
        <button
          onClick={() => handleResolveConflict(conflict.id, 'User acknowledged')}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Auth Dialog */}
      {dialog && (
        <AuthDialog
          show={dialog.show}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
        />
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="w-full lg:w-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Intelligent Schedule</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">AI-optimized task scheduling within your work hours</p>
          {currentUser?.workingHours && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-2">
              <span className="flex items-center">
                <Clock className="w-4 h-4 inline mr-1" />
                Working Hours: {currentUser.workingHours.start} - {currentUser.workingHours.end}
              </span>
              <span className="flex items-center">
                <User className="w-4 h-4 inline mr-1" />
                Working Days: {currentUser.workingHours.daysOfWeek.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            {['day', 'week', 'month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as 'day' | 'week' | 'month')}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                  view === v ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            title="View Statistics"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          
          {conflicts && conflicts.length > 0 && (
            <button
              onClick={() => setShowConflicts(!showConflicts)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg relative"
              title="View Conflicts"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {conflicts.length}
              </span>
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            title="Schedule Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleGenerateSchedule}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Generate Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && scheduleStats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Statistics</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{scheduleStats.scheduledTasks}</div>
              <div className="text-sm text-gray-600">Scheduled Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{scheduleStats.totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(scheduleStats.totalDuration / 60)}h
              </div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(scheduleStats.averageTaskDuration)} min
              </div>
              <div className="text-sm text-gray-600">Avg Task Duration</div>
            </div>
          </div>
        </div>
      )}

      {/* Generation Settings */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Generation Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={generationOptions.respectPersonalEvents}
                onChange={(e) => setGenerationOptions(prev => ({
                  ...prev,
                  respectPersonalEvents: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Respect Personal Events</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={generationOptions.prioritizeUrgentTasks}
                onChange={(e) => setGenerationOptions(prev => ({
                  ...prev,
                  prioritizeUrgentTasks: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Prioritize Urgent Tasks</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={generationOptions.optimizeForEfficiency}
                onChange={(e) => setGenerationOptions(prev => ({
                  ...prev,
                  optimizeForEfficiency: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Optimize for Efficiency</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={generationOptions.allowManualOverride}
                onChange={(e) => setGenerationOptions(prev => ({
                  ...prev,
                  allowManualOverride: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Allow Manual Override</span>
            </label>
          </div>
        </div>
      )}

      {/* Conflicts Panel */}
      {showConflicts && conflicts && conflicts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Schedule Conflicts</h3>
          <div className="space-y-3">
            {conflicts.map((conflict: any) => (
              <ConflictItem key={conflict.id} conflict={conflict} />
            ))}
          </div>
        </div>
      )}

      {/* Main Schedule Content */}
      {(!scheduleEntries || scheduleEntries.length === 0) ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Schedule Generated</h3>
            <p className="text-gray-600 mb-6">
              Generate an intelligent schedule to see your tasks organized optimally within your work hours.
            </p>
            <button
              onClick={handleGenerateSchedule}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isGenerating ? 'Generating...' : 'Generate My Schedule'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </>
      )}

      {/* Entry Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Schedule Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  defaultValue={new Date(editingEntry.start).toISOString().slice(0, 16)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={(e) => setEditingEntry((prev: any) => ({
                    ...prev,
                    start: new Date(e.target.value)
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  defaultValue={new Date(editingEntry.end).toISOString().slice(0, 16)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={(e) => setEditingEntry((prev: any) => ({
                    ...prev,
                    end: new Date(e.target.value)
                  }))}
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingEntry.isLocked}
                    onChange={(e) => setEditingEntry((prev: any) => ({
                      ...prev,
                      isLocked: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Lock this entry</span>
                </label>
                <div className="text-sm text-gray-500">
                  💡 Tip: You can drag tasks to reorganize them in the schedule
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateEntry(editingEntry.id, {
                  start: editingEntry.start,
                  end: editingEntry.end,
                  isLocked: editingEntry.isLocked
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};