import React from 'react';
import { CheckSquare, Calendar, Users, UserCircle, ChevronLeft, ChevronRight, Edit, CreditCard} from 'lucide-react';

import { ViewType } from '../App';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  toggleSidebar: () => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, toggleSidebar,
  isOpen}) => {
  const menuItems = [
    { id: 'tasks' as ViewType, label: 'Tasks', icon: CheckSquare },
    { id: 'schedule' as ViewType, label: 'Schedule', icon: Edit },
    { id: 'calendar' as ViewType, label: 'Calendar', icon: Calendar },
    { id: 'teams' as ViewType, label: 'Teams', icon: Users },
    { id: 'payments' as ViewType, label: 'Payments', icon: CreditCard },
    { id: 'profile' as ViewType, label: 'Profile', icon: UserCircle },
  ];

  return (
    <aside
      className={
        isOpen
          ? "fixed left-0 top-16 h-full w-64 bg-white shadow-sm border-r border-gray-200 transition-all duration-300 flex flex-col"
          : "fixed left-0 top-16 h-full w-12 bg-white shadow-sm border-r border-gray-200 transition-all duration-300 flex flex-col items-center"
      }
    >
      <nav className={isOpen ? "p-4 flex-1" : "p-2 flex-1 w-full flex flex-col items-center"}>
        <ul className={isOpen ? "space-y-2" : "space-y-3 w-full flex flex-col items-center"}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <li key={item.id} className={isOpen ? "w-full" : ""}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center ${isOpen ? "space-x-3 px-4 py-3 w-full" : "justify-center p-2"} rounded-lg text-left transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  title={isOpen ? '' : item.label}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  {isOpen && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={isOpen ? "p-4 border-t border-gray-200 w-full flex justify-center" : "p-2 border-t border-gray-200 w-full flex justify-center"}>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-200 transition"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? (
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          ) : (
            <ChevronRight className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>
    </aside>
  );
};