import React from 'react';
import {
  X,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Users,
  Edit2,
  Trash2,
  Layers,
  GraduationCap,
  Award,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const JobDetailModal: React.FC = () => {
  const {
    selectedJobForModal,
    setSelectedJobForModal,
    departmentsMap,
    employees,
    deleteJob,
  } = useAppStore();

  if (!selectedJobForModal) return null;

  const job = selectedJobForModal;
  const dept = departmentsMap.get(job.departmentId);

  // Find employees who hold this role
  const mainOwners = employees.filter((e) => e.mainJobId === job.id);
  const secondaryOwners = employees.filter((e) => e.secondaryJobIds?.includes(job.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-obsidian-card w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-obsidian-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-obsidian-border flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-obsidian-elevated/70">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 bg-brand-50 text-brand-600 dark:bg-orange-500/15 dark:text-orange-400 rounded-xl shrink-0 mt-0.5">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded">
                  {job.code}
                </span>
                {dept && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 dark:border dark:border-zinc-700">
                    {dept.name}
                  </span>
                )}
                <Badge variant="neutral" size="xs">
                  {job.level} Level
                </Badge>
                {job.isCritical && (
                  <Badge variant="danger" size="xs" icon={<AlertCircle className="w-3 h-3" />}>
                    Critical Role
                  </Badge>
                )}
                {job.isShared && (
                  <Badge variant="secondary" size="xs">
                    Multi-Owner Allowed
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{job.title}</h3>
            </div>
          </div>

          <button
            onClick={() => setSelectedJobForModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-obsidian-hover dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-sm">
          {/* Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
              Role Summary & Purpose
            </h4>
            <p className="text-slate-700 dark:text-zinc-200 leading-relaxed bg-slate-50 dark:bg-obsidian-elevated/70 p-3.5 rounded-xl border border-slate-200/60 dark:border-obsidian-border">
              {job.summary}
            </p>
          </div>

          {/* Key Responsibilities */}
          {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5">
                Key Responsibilities & Duties
              </h4>
              <ul className="space-y-2">
                {job.keyResponsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-slate-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comprehensive Job Requirements & Competencies */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-orange-400" />
              <span>Job Requirements & Qualifications</span>
            </h4>

            {/* Education & Experience Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-obsidian-elevated/70 rounded-xl border border-slate-200/80 dark:border-obsidian-border">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Pendidikan Minimal</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
                  {job.educationRequirement || 
                    (job.level === 'Lead' || job.level === 'Senior'
                      ? 'Min. D3 / S1 Manajemen / Bidang Terkait'
                      : 'Min. SMA / SMK Sederajat')}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-obsidian-elevated/70 rounded-xl border border-slate-200/80 dark:border-obsidian-border">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 mb-1">
                  <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Pengalaman Kerja</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
                  {job.experienceRequirement || 
                    (job.level === 'Lead'
                      ? 'Min. 3-5 tahun supervisi di industri sejenis'
                      : job.level === 'Senior'
                      ? 'Min. 2-3 tahun pengalaman spesialis'
                      : 'Min. 1-2 tahun pengalaman operasional')}
                </p>
              </div>
            </div>

            {/* Technical Skills & Tools */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1.5">
                Keahlian Teknis & Alat Kerja (Hard Skills)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(job.technicalRequirements && job.technicalRequirements.length > 0
                  ? job.technicalRequirements
                  : job.requiredSkills || []
                ).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-obsidian-elevated text-slate-800 dark:text-zinc-200 font-medium text-xs rounded-lg border border-slate-200 dark:border-obsidian-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            {(job.softSkills && job.softSkills.length > 0) && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1.5">
                  Kompetensi Karakter & Soft Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.softSkills.map((soft, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium rounded-md border border-emerald-200 dark:border-emerald-800/40"
                    >
                      ✓ {soft}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special Conditions */}
            {(job.specialRequirements) && (
              <div className="p-3 bg-slate-50 dark:bg-obsidian-elevated/50 rounded-xl border border-slate-200/80 dark:border-obsidian-border text-xs text-slate-600 dark:text-zinc-300 flex items-start gap-2">
                <FileText className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-0.5">
                    Persyaratan Khusus & Kondisi Kerja:
                  </span>
                  <p className="leading-relaxed">{job.specialRequirements}</p>
                </div>
              </div>
            )}
          </div>

          {/* Workload Weights */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-obsidian-elevated/70 rounded-xl border border-slate-200/80 dark:border-obsidian-border">
            <div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Default Main Role Workload</span>
              <p className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {job.defaultMainWorkloadPercent}% FTE
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Default Secondary Workload</span>
              <p className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {job.defaultSecondaryWorkloadPercent}% FTE
              </p>
            </div>
          </div>

          {/* Active Owners */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Current Role Owners</span>
            </h4>
            <div className="space-y-2">
              {mainOwners.length === 0 && secondaryOwners.length === 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs font-medium">
                  Currently Vacant — This job description is not assigned to any employee. Drag this card to an employee to assign it.
                </div>
              ) : (
                <>
                  {mainOwners.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-2.5 bg-blue-50/50 dark:bg-obsidian-elevated/60 border border-blue-200/60 dark:border-obsidian-border rounded-xl text-xs"
                    >
                      <span className="font-bold text-slate-900 dark:text-zinc-200">{emp.fullName}</span>
                      <span className="font-semibold text-brand-700 dark:text-orange-400 bg-blue-100/80 dark:bg-orange-500/15 border dark:border-orange-500/30 px-2 py-0.5 rounded">
                        Primary Owner (Main Job)
                      </span>
                    </div>
                  ))}
                  {secondaryOwners.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-2.5 bg-purple-50/50 dark:bg-obsidian-elevated/60 border border-purple-200/60 dark:border-obsidian-border rounded-xl text-xs"
                    >
                      <span className="font-bold text-slate-900 dark:text-zinc-200">{emp.fullName}</span>
                      <span className="font-semibold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-500/15 border dark:border-purple-500/30 px-2 py-0.5 rounded">
                        Secondary Duty
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-obsidian-border bg-slate-50 dark:bg-obsidian-elevated/70 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(`Delete job description "${job.title}"?`)) {
                deleteJob(job.id);
                setSelectedJobForModal(null);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Role</span>
          </button>

          <button
            onClick={() => setSelectedJobForModal(null)}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
