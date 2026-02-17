import React from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from "../constants";
import { Moon, Sun, Globe, Download, Database } from "lucide-react";
import { generateFullReport } from "../services/pdfService";
import Card from "../components/Card";

const Settings: React.FC = () => {
  const { theme, toggleTheme, language, setLanguage, clients, transactions } =
    useApp();
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">{t.settings}</h2>

      <Card title="Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${theme === "dark" ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-600"}`}
              >
                {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="font-medium">{t.darkMode}</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors relative ${theme === "dark" ? "bg-indigo-600" : "bg-gray-300"}`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${theme === "dark" ? "left-7" : "left-1"}`}
              />
            </button>
          </div>

          <div className="h-px bg-gray-100 dark:bg-slate-700" />

          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Globe size={20} />
              </div>
              <span className="font-medium">{t.language}</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="Data Management">
        <div className="space-y-4">
          <button
            onClick={() => generateFullReport(clients, transactions, language)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Download size={20} />
              </div>
              <div className="text-left">
                <span className="block font-medium">Export All Data</span>
                <span className="text-xs text-gray-500">
                  Download comprehensive PDF report
                </span>
              </div>
            </div>
          </button>

          
        </div>
      </Card>

      <div className="text-center text-xs text-gray-400 mt-8">
        VyaparFlow v1.0.0
      </div>
    </div>
  );
};

export default Settings;
