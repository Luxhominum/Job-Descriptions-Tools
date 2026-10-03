import React from 'react';
import {
  LayoutGrid,
  Table,
  History,
  Download,
  Layers,
  RotateCcw,
  BookOpen,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { TEMPLATES } from '../../data/initialData';
import { NeumorphicThemeToggle } from '../common/NeumorphicThemeToggle';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    auditLogs,
    activeTemplateKey,
    loadTemplate,
    resetToDefault,
    setIsAuditModalOpen,
    setIsExportImportModalOpen,
    syncStatus,
    saveToDatabaseNow,
    theme,
    toggleTheme,
  } = useAppStore();

  return (
    <header className="h-16 bg-white dark:bg-obsidian-card border-b border-slate-200/70 dark:border-obsidian-border px-6 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors duration-200">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-zinc-800 dark:border dark:border-zinc-700 flex items-center justify-center text-white dark:text-zinc-100 font-bold text-sm shadow-xs transition-colors">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight transition-colors">
            RoleFlow
          </h1>
          <p className="text-[11px] text-slate-400 dark:text-zinc-400 font-medium">
            Dynamic Job Responsibility Matrix
          </p>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center bg-slate-100 dark:bg-obsidian-elevated p-1 rounded-xl transition-colors border border-transparent dark:border-obsidian-border">
        <button
          onClick={() => setViewMode('dashboard')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            viewMode === 'dashboard'
              ? 'bg-white dark:bg-zinc-100 text-slate-900 dark:text-zinc-950 font-bold shadow-xs'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Tampilan Dashboard (Profil Karyawan & Full JD)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setViewMode('board')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            viewMode === 'board'
              ? 'bg-white dark:bg-zinc-100 text-slate-900 dark:text-zinc-950 font-bold shadow-xs'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Board View (Drag & Drop Penugasan)"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Board</span>
        </button>
        <button
          onClick={() => setViewMode('matrix')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            viewMode === 'matrix'
              ? 'bg-white dark:bg-zinc-100 text-slate-900 dark:text-zinc-950 font-bold shadow-xs'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Tampilan Matriks Tanggung Jawab"
        >
          <Table className="w-3.5 h-3.5" />
          <span>Matrix</span>
        </button>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-2">
        {/* Neumorphic Dark/Light Switcher from Video */}
        <NeumorphicThemeToggle
          isDark={theme === 'dark'}
          onToggle={toggleTheme}
          className="mr-1"
        />

        <div className="h-5 w-px bg-slate-200 dark:bg-obsidian-border mx-1" />

        {/* Database Status Indicator */}
        <button
          type="button"
          onClick={() => saveToDatabaseNow()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
          title="Status database backend (Klik untuk simpan manual)"
        >
          <Database className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span className="hidden sm:inline">
            {syncStatus === 'synced' && 'Saved to DB'}
            {syncStatus === 'saving' && 'Saving...'}
            {syncStatus === 'offline' && 'Offline (Local)'}
            {syncStatus === 'error' && 'Sync Error'}
          </span>
          {syncStatus === 'saving' && <RefreshCw className="w-3 h-3 animate-spin ml-0.5 text-zinc-400" />}
          {syncStatus === 'synced' && (
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-400 shrink-0" />
          )}
        </button>

        {/* Template Picker */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200/80 dark:border-obsidian-border rounded-lg px-2.5 py-1 text-xs">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={activeTemplateKey}
            onChange={(e) => loadTemplate(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
            title="Load sample template"
          >
            {TEMPLATES.map((t) => (
              <option key={t.key} value={t.key} className="dark:bg-obsidian-card dark:text-zinc-200">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Audit Log / History */}
        <button
          onClick={() => setIsAuditModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-obsidian-hover rounded-lg transition-colors cursor-pointer"
          title="Role Transfer History"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Handoffs</span>
          {auditLogs.length > 0 && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-full">
              {auditLogs.length}
            </span>
          )}
        </button>

        {/* Export / Import */}
        <button
          onClick={() => setIsExportImportModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-obsidian-hover rounded-lg transition-colors cursor-pointer"
          title="Export or Import JSON/CSV Data"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Reset */}
        <button
          onClick={() => {
            if (window.confirm('Reset workspace to default template?')) {
              resetToDefault();
            }
          }}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-hover rounded-lg transition-colors cursor-pointer"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
