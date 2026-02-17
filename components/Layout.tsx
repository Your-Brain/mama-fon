import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  PlusCircle,
  PieChart,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../constants";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { language, theme } = useApp();
  const t = TRANSLATIONS[language];

  const navItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: t.dashboard },
    { to: "/clients", icon: <Users size={20} />, label: t.clients },
    { to: "/settings", icon: <Settings size={20} />, label: t.settings },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-row h-full">
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col p-4">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              V
            </div>
            <h1 className="text-xl font-bold tracking-tight">VyaparFlow</h1>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6 md:p-8 relative">
          {children}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center px-4 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              VF
            </div>
            <h1 className="text-lg font-bold">VyaparFlow</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-24">{children}</main>

        <nav className="h-16 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex items-center justify-around fixed bottom-0 w-full z-50 pb-safe">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 transition-colors ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400"
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
