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
      className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-sm border-r border-gray-200 
        transition-all duration-300 flex flex-col z-40
        ${isOpen ? "w-64" : "w-12"}
      `}
    >
      <nav className={isOpen ? "p-4 pt-6 flex-1 overflow-y-auto" : "p-2 pt-4 flex-1 w-full flex flex-col items-center overflow-y-auto"}>
        <ul className={isOpen ? "space-y-2" : "space-y-3 w-full flex flex-col items-center"}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <li key={item.id} className={isOpen ? "w-full" : ""}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center ${isOpen ? "space-x-3 px-4 py-3 w-full" : "justify-center p-2"} rounded-lg text-left transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  title={isOpen ? '' : item.label}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  {isOpen && <span className="font-medium truncate">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`${isOpen ? "p-4" : "p-2"} border-t border-gray-200 w-full flex justify-center bg-gray-50`}>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-white hover:bg-blue-50 hover:border-blue-300 border border-gray-300 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md cursor-pointer"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 text-gray-700 hover:text-blue-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-700 hover:text-blue-600" />
          )}
        </button>
      </div>
    </aside>
  );
};