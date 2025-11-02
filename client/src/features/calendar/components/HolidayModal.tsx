/**
 * Holiday Modal Component
 * Modal for adding holidays by country/religion
 */

import React from 'react';
import { X } from 'lucide-react';

interface HolidayModalProps {
  country: string;
  religion: string;
  onCountryChange: (country: string) => void;
  onReligionChange: (religion: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Modal for adding holidays to the calendar
 */
export const HolidayModal: React.FC<HolidayModalProps> = ({
  country,
  religion,
  onCountryChange,
  onReligionChange,
  onSave,
  onCancel,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Holidays</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            type="button"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., US, IL, UK"
            />
          </div>

          {/* Religion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Religion (Optional)
            </label>
            <input
              type="text"
              value={religion}
              onChange={(e) => onReligionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Christian, Jewish, Islamic"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Holidays
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HolidayModal;
