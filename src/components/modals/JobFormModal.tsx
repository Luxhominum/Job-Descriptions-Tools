import React, { useState } from 'react';
import { X, Plus, Trash2, Briefcase } from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { RoleSeniority } from '../../types/job';

export const JobFormModal: React.FC = () => {
  const {
    isNewJobModalOpen,
    setIsNewJobModalOpen,
    departments,
    createJob,
  } = useAppStore();

  const [code, setCode] = useState(`JD-${Math.floor(100 + Math.random() * 900)}`);
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [level, setLevel] = useState<RoleSeniority>('Senior');
  const [summary, setSummary] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [skillsInput, setSkillsInput] = useState('');
  const [mainWorkload, setMainWorkload] = useState(70);
  const [secondaryWorkload, setSecondaryWorkload] = useState(15);
  const [isCritical, setIsCritical] = useState(false);
  const [isShared, setIsShared] = useState(false);

  if (!isNewJobModalOpen) return null;

  const handleAddResp = () => {
    setResponsibilities([...responsibilities, '']);
  };

  const handleUpdateResp = (index: number, val: string) => {
    const updated = [...responsibilities];
    updated[index] = val;
    setResponsibilities(updated);
  };

  const handleRemoveResp = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const validResp = responsibilities.map((r) => r.trim()).filter(Boolean);

    createJob({
      code: code.trim() || `JD-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      departmentId,
      level,
      summary: summary.trim() || 'Role responsibilities and expectations.',
      keyResponsibilities: validResp.length > 0 ? validResp : ['Execute domain responsibilities'],
      requiredSkills: skills.length > 0 ? skills : ['Communication', 'Domain Expertise'],
      defaultMainWorkloadPercent: Number(mainWorkload) || 70,
      defaultSecondaryWorkloadPercent: Number(secondaryWorkload) || 15,
      isCritical,
      isShared,
    });

    setIsNewJobModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-obsidian-card w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-obsidian-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-obsidian-border flex items-center justify-between bg-slate-50/50 dark:bg-obsidian-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 dark:bg-orange-500/10 text-brand-600 dark:text-orange-400 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Create New Job Description</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Define role details, workload percentage, and competencies.</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewJobModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* Row 1: Code, Title, Dept */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Role Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg font-mono text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Security Specialist"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Dept & Seniority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id} className="dark:bg-obsidian-card">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Seniority Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as RoleSeniority)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Entry" className="dark:bg-obsidian-card">Entry</option>
                <option value="Mid" className="dark:bg-obsidian-card">Mid</option>
                <option value="Senior" className="dark:bg-obsidian-card">Senior</option>
                <option value="Lead" className="dark:bg-obsidian-card">Lead</option>
                <option value="Principal" className="dark:bg-obsidian-card">Principal</option>
                <option value="Executive" className="dark:bg-obsidian-card">Executive</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Summary / Purpose</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder="Brief description of what this role achieves..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Key Responsibilities */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Key Responsibilities</label>
              <button
                type="button"
                onClick={handleAddResp}
                className="text-brand-600 dark:text-orange-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Duty
              </button>
            </div>
            <div className="space-y-2">
              {responsibilities.map((resp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => handleUpdateResp(i, e.target.value)}
                    placeholder={`Responsibility #${i + 1}`}
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  {responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveResp(i)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Required Skills (Comma separated) */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. React, TypeScript, GraphQL, System Architecture"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Workload weights */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-obsidian-elevated/50 rounded-xl border border-slate-200 dark:border-obsidian-border">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Main Role Weight (% FTE)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={mainWorkload}
                onChange={(e) => setMainWorkload(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Secondary Role Weight (% FTE)
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={secondaryWorkload}
                onChange={(e) => setSecondaryWorkload(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
                className="rounded text-brand-600 dark:text-orange-500 focus:ring-orange-500 w-4 h-4 bg-slate-50 dark:bg-obsidian-elevated border-slate-300 dark:border-obsidian-border"
              />
              <span className="text-slate-700 dark:text-zinc-300 font-semibold">
                Critical Role (triggers vacancy alert if unassigned)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="rounded text-brand-600 dark:text-orange-500 focus:ring-orange-500 w-4 h-4 bg-slate-50 dark:bg-obsidian-elevated border-slate-300 dark:border-obsidian-border"
              />
              <span className="text-slate-700 dark:text-zinc-300 font-semibold">Multi-Owner Role (Shared)</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-obsidian-border">
            <button
              type="button"
              onClick={() => setIsNewJobModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-obsidian-elevated rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-700 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-lg shadow-sm transition-colors"
            >
              Create Job Description
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
