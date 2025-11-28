import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Package, Settings } from 'lucide-react';
import { Theme } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-3xl mx-auto">
          <NavItem to="/" icon={<LayoutDashboard size={22} />} label="Daily" />
          <NavItem to="/history" icon={<History size={22} />} label="History" />
          <NavItem to="/items" icon={<Package size={22} />} label="Items" />
          <NavItem to="/settings" icon={<Settings size={22} />} label="Settings" />
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
          isActive 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
        }`
      }
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
};