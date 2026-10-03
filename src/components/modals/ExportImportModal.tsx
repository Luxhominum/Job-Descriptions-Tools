import React, { useState } from 'react';
import { X, Download, Upload, FileText, FileSpreadsheet, Check, Copy } from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { exportToJson, exportToCsv, downloadFile, ExportDataPayload } from '../../utils/exportHelpers';

export const ExportImportModal: React.FC = () => {
  const {
    isExportImportModalOpen,
    setIsExportImportModalOpen,
    departments,
    jobs,
    employees,
    auditLogs,
    jobsMap,
    departmentsMap,
    importJsonData,
  } = useAppStore();

  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isExportImportModalOpen) return null;

  const handleExportJson = () => {
    const jsonStr = exportToJson(departments, jobs, employees, auditLogs);
    downloadFile(`roleflow-backup-${new Date().toISOString().slice(0, 10)}.json`, jsonStr, 'application/json');
  };

  const handleExportCsv = () => {
    const csvStr = exportToCsv(employees, jobsMap, departmentsMap);
    downloadFile(`roleflow-matrix-${new Date().toISOString().slice(0, 10)}.csv`, csvStr, 'text/csv');
  };

  const handleCopyJson = () => {
    const jsonStr = exportToJson(departments, jobs, employees, auditLogs);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setImportJsonText(JSON.stringify(parsed, null, 2));
        setImportError(null);
      } catch (err: any) {
        setImportError('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    try {
      if (!importJsonText.trim()) {
        setImportError('Please provide JSON data to import.');
        return;
      }
      const parsed: ExportDataPayload = JSON.parse(importJsonText);
      if (!parsed.jobs || !parsed.employees) {
        setImportError('JSON data must contain at least "jobs" and "employees" arrays.');
        return;
      }
      importJsonData(parsed);
      setIsExportImportModalOpen(false);
    } catch (err: any) {
      setImportError(`Failed to parse JSON: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-obsidian-card w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-obsidian-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-obsidian-border flex items-center justify-between bg-slate-50/50 dark:bg-obsidian-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 dark:bg-orange-500/10 text-brand-600 dark:text-orange-400 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Data Export & Import Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Backup state, download spreadsheet reports, or restore from JSON.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportImportModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs">
          {/* Export Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
              Export Organization Data
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 dark:bg-obsidian-elevated/50 rounded-xl border border-slate-200 dark:border-obsidian-border flex flex-col justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded-lg shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Full System Backup</h5>
                    <p className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">
                      Export all JDs, employees, department configurations, and handoff audit logs as JSON.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleExportJson}
                    className="flex-1 px-3 py-2 bg-brand-600 hover:bg-brand-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-bold rounded-lg shadow-sm transition-colors text-center"
                  >
                    Download JSON
                  </button>
                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-2 bg-white dark:bg-obsidian-elevated hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-obsidian-border text-slate-700 dark:text-zinc-300 font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-obsidian-elevated/50 rounded-xl border border-slate-200 dark:border-obsidian-border flex flex-col justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Spreadsheet CSV Report</h5>
                    <p className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">
                      Export employee role coverage, primary & secondary responsibilities, and total FTE % to CSV.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleExportCsv}
                    className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm transition-colors text-center"
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-obsidian-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
              Import & Restore from JSON
            </h4>
            <p className="text-slate-500 dark:text-zinc-400 mb-3 text-[11px]">
              Upload a previously exported JSON backup file or paste its raw JSON content below to restore all records.
            </p>

            <div className="mb-3">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-obsidian-elevated hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg font-semibold cursor-pointer transition-colors border border-transparent dark:border-obsidian-border">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload JSON File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={importJsonText}
              onChange={(e) => {
                setImportJsonText(e.target.value);
                setImportError(null);
              }}
              rows={5}
              placeholder="Paste JSON backup payload here..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg font-mono text-[11px] text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />

            {importError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-lg font-medium mt-2">
                {importError}
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={handleApplyImport}
                disabled={!importJsonText.trim()}
                className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-orange-500 dark:hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
              >
                Apply & Restore Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
