import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { UserPreferences } from '../../../types';
import { Settings, Save, AlertCircle, Clock, Calendar, Brain } from 'lucide-react';

export const SchedulePreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await apiService.getSchedulePreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      await apiService.updateSchedulePreferences(preferences);
      setSavedMessage('Preferences saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setSavedMessage('Failed to save preferences');
      setTimeout(() => setSavedMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => prev ? { ...prev, [key]: value } : null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load preferences</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Schedule Preferences
          </h2>
          <p className="text-gray-600 mt-1">
            Customize how your intelligent schedule is generated
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>

      {savedMessage && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          savedMessage.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <AlertCircle className="w-5 h-5" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Work Schedule Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Work Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Work Start Time
            </label>
            <input
              type="time"
              value={preferences.preferredWorkStart}
              onChange={(e) => updatePreference('preferredWorkStart', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Work End Time
            </label>
            <input
              type="time"
              value={preferences.preferredWorkEnd}
              onChange={(e) => updatePreference('preferredWorkEnd', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={preferences.breakDuration}
              onChange={(e) => updatePreference('breakDuration', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Buffer Minutes
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={preferences.workBufferMinutes}
              onChange={(e) => updatePreference('workBufferMinutes', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Buffer time around tasks to prevent back-to-back scheduling
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.allowWeekendScheduling}
              onChange={(e) => updatePreference('allowWeekendScheduling', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Allow weekend scheduling</span>
          </label>
        </div>
      </div>

      {/* Task Management Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Task Management
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Task Duration (minutes)
              </label>
              <input
                type="number"
                min="30"
                max="480"
                step="30"
                value={preferences.maxTaskDuration}
                onChange={(e) => updatePreference('maxTaskDuration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tasks longer than this will be split into smaller segments
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Efficiency Curve
              </label>
              <select
                value={preferences.efficiencyCurve}
                onChange={(e) => updatePreference('efficiencyCurve', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal (Even distribution)</option>
                <option value="morning">Morning Person (Early priority)</option>
                <option value="afternoon">Afternoon Peak (Mid-day focus)</option>
                <option value="evening">Evening Person (Late priority)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Optimize task scheduling based on your productivity patterns
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.autoSplitLongTasks}
                onChange={(e) => updatePreference('autoSplitLongTasks', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Automatically split long tasks into manageable segments
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* AI Optimization Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          AI Optimization (Coming Soon)
        </h3>
        <div className="space-y-4 opacity-50">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                disabled
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Learn from task completion patterns
              </span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                disabled
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Optimize based on historical productivity data
              </span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                disabled
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Suggest optimal task sequences
              </span>
            </label>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Advanced AI features will be available in future updates to provide even smarter scheduling recommendations.
        </p>
      </div>

      {/* Preview Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Settings Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Work Hours:</span>
            <span className="text-blue-700 ml-2">
              {preferences.preferredWorkStart} - {preferences.preferredWorkEnd}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Max Task Duration:</span>
            <span className="text-blue-700 ml-2">{preferences.maxTaskDuration} minutes</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Break Duration:</span>
            <span className="text-blue-700 ml-2">{preferences.breakDuration} minutes</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Efficiency Curve:</span>
            <span className="text-blue-700 ml-2 capitalize">{preferences.efficiencyCurve}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Weekend Scheduling:</span>
            <span className="text-blue-700 ml-2">
              {preferences.allowWeekendScheduling ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Auto-split Tasks:</span>
            <span className="text-blue-700 ml-2">
              {preferences.autoSplitLongTasks ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePreferences;