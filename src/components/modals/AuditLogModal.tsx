import React, { useState, useMemo } from 'react';
import { X, History, ArrowRight, User, Briefcase, Trash2, Filter, Search } from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { AuditActionType } from '../../types/audit';
import { SearchInput } from '../common/SearchInput';

export const AuditLogModal: React.FC = () => {
  const { isAuditModalOpen, setIsAuditModalOpen, auditLogs, clearAuditLogs } = useAppStore();
  const [filterAction, setFilterAction] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (filterAction !== 'all' && log.actionType !== filterAction) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchDetails = log.details.toLowerCase().includes(q);
        const matchFrom = (log.fromEmployeeName || '').toLowerCase().includes(q);
        const matchTo = (log.toEmployeeName || '').toLowerCase().includes(q);
        const matchJob = (log.jobTitle || '').toLowerCase().includes(q);
        if (!matchDetails && !matchFrom && !matchTo && !matchJob) return false;
      }
      return true;
    });
  }, [auditLogs, filterAction, search]);

  if (!isAuditModalOpen) return null;

  const getActionBadge = (type: AuditActionType) => {
    switch (type) {
      case 'TRANSFER_ROLE':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">TRANSFER</span>;
      case 'ASSIGN_MAIN':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">MAIN ASSIGN</span>;
      case 'ASSIGN_SECONDARY':
        return <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">SECONDARY</span>;
      case 'UNASSIGN':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">UNASSIGN</span>;
      case 'SWAP_ROLES':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">SWAP</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">SYSTEM</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-obsidian-card w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-obsidian-border overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-obsidian-border flex items-center justify-between bg-slate-50/50 dark:bg-obsidian-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 dark:bg-orange-500/10 text-brand-600 dark:text-orange-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Role Handoff History & Transfer Trail
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Chronological log of role transitions, assignments, and structural modifications.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-obsidian-border bg-white dark:bg-obsidian-card flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search history by person, role, or action..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all" className="dark:bg-obsidian-card">All Action Types</option>
              <option value="TRANSFER_ROLE" className="dark:bg-obsidian-card">Role Transfers</option>
              <option value="ASSIGN_MAIN" className="dark:bg-obsidian-card">Main Assignments</option>
              <option value="ASSIGN_SECONDARY" className="dark:bg-obsidian-card">Secondary Duties</option>
              <option value="UNASSIGN" className="dark:bg-obsidian-card">Unassignments</option>
              <option value="SWAP_ROLES" className="dark:bg-obsidian-card">Role Swaps</option>
            </select>

            <button
              onClick={() => {
                if (window.confirm('Clear all audit records?')) {
                  clearAuditLogs();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              title="Clear audit logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Log List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No audit trail events found.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const timeString = new Date(log.timestamp).toLocaleString();

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/70 dark:border-obsidian-border bg-slate-50/40 dark:bg-obsidian-elevated/40 hover:bg-slate-50 dark:hover:bg-obsidian-elevated/70 transition-colors"
                >
                  <div className="shrink-0 mt-0.5">{getActionBadge(log.actionType)}</div>

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">{log.details}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
                      <span>{timeString}</span>
                      {log.fromEmployeeName && log.toEmployeeName && (
                        <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-zinc-300">
                          <span>{log.fromEmployeeName}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                          <span>{log.toEmployeeName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-obsidian-border bg-slate-50 dark:bg-obsidian-elevated/40 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-zinc-400 font-medium">
            Showing {filteredLogs.length} of {auditLogs.length} entries
          </span>
          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="px-4 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-lg shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
