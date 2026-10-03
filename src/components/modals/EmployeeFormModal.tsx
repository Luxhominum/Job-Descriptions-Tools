import React, { useState, useEffect, useRef } from 'react';
import { X, User, Trash2, Upload, Camera } from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { Employee } from '../../types/employee';
import { EmployeeAvatar } from '../common/EmployeeAvatar';

export const EmployeeFormModal: React.FC = () => {
  const {
    isNewEmployeeModalOpen,
    setIsNewEmployeeModalOpen,
    selectedEmployeeForModal,
    setSelectedEmployeeForModal,
    departments,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useAppStore();

  const isEditing = Boolean(selectedEmployeeForModal);

  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [jobTitleDisplay, setJobTitleDisplay] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(100);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedEmployeeForModal) {
      setCode(selectedEmployeeForModal.employeeCode);
      setFullName(selectedEmployeeForModal.fullName);
      setEmail(selectedEmployeeForModal.email);
      setDepartmentId(selectedEmployeeForModal.departmentId);
      setJobTitleDisplay(selectedEmployeeForModal.jobTitleDisplay || '');
      setAvatarUrl(selectedEmployeeForModal.avatarUrl || '');
      setMaxCapacity(selectedEmployeeForModal.maxCapacityPercent || 100);
      setLocation(selectedEmployeeForModal.location || '');
      setNotes(selectedEmployeeForModal.notes || '');
    } else {
      setCode(`EMP-${Math.floor(100 + Math.random() * 900)}`);
      setFullName('');
      setEmail('');
      setDepartmentId(departments[0]?.id || '');
      setJobTitleDisplay('');
      setAvatarUrl('');
      setMaxCapacity(100);
      setLocation('');
      setNotes('');
    }
  }, [selectedEmployeeForModal, isNewEmployeeModalOpen, departments]);

  if (!isNewEmployeeModalOpen && !selectedEmployeeForModal) return null;

  const handleClose = () => {
    setIsNewEmployeeModalOpen(false);
    setSelectedEmployeeForModal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    if (isEditing && selectedEmployeeForModal) {
      updateEmployee({
        ...selectedEmployeeForModal,
        employeeCode: code.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        departmentId,
        jobTitleDisplay: jobTitleDisplay.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        maxCapacityPercent: Number(maxCapacity) || 100,
        location: location.trim(),
        notes: notes.trim(),
      });
    } else {
      createEmployee({
        employeeCode: code.trim() || `EMP-${Date.now().toString().slice(-4)}`,
        fullName: fullName.trim(),
        email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        departmentId,
        jobTitleDisplay: jobTitleDisplay.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        mainJobId: null,
        secondaryJobIds: [],
        maxCapacityPercent: Number(maxCapacity) || 100,
        location: location.trim(),
        notes: notes.trim(),
      });
    }

    handleClose();
  };

  const handleDelete = () => {
    if (selectedEmployeeForModal && window.confirm(`Remove employee ${selectedEmployeeForModal.fullName}?`)) {
      deleteEmployee(selectedEmployeeForModal.id);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-obsidian-card w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-obsidian-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-obsidian-border flex items-center justify-between bg-slate-50/50 dark:bg-obsidian-elevated/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {isEditing ? 'Edit Employee Profile' : 'Add New Team Member'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isEditing ? 'Update profile and capacity parameters' : 'Create an employee card ready for role assignment'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-zinc-200 dark:hover:bg-obsidian-hover rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg font-mono text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 focus:border-zinc-400 dark:focus:border-zinc-500"
              />
            </div>
            <div className="col-span-2">
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Belfort"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 focus:border-zinc-400 dark:focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 focus:border-zinc-400 dark:focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 focus:border-zinc-400 dark:focus:border-zinc-500 cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id} className="dark:bg-obsidian-card">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Display Title / Tagline</label>
            <input
              type="text"
              value={jobTitleDisplay}
              onChange={(e) => setJobTitleDisplay(e.target.value)}
              placeholder="e.g. Lead Architect & Incident Commander"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-750">
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-2">Foto Profil Karyawan</label>
            <div className="flex items-center gap-4">
              <EmployeeAvatar
                avatarUrl={avatarUrl}
                fullName={fullName || 'Karyawan'}
                size="xl"
                shape="squircle"
                canUpload={true}
                onUpload={(base64) => setAvatarUrl(base64)}
                showUploadBadge={true}
                title="Klik untuk upload foto"
                className="shrink-0"
              />

              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const base64 = ev.target?.result as string;
                            if (base64) setAvatarUrl(base64);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Atau tempel URL gambar (https://...)"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Max Capacity (% FTE)</label>
              <input
                type="number"
                min={50}
                max={150}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 focus:border-zinc-400 dark:focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Location / Office</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote / New York"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 focus:border-zinc-400 dark:focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Internal Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Key skills, focus areas, or on-call rotation preferences..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-elevated border border-slate-200 dark:border-obsidian-border rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-obsidian-border">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Member</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-obsidian-hover dark:hover:text-zinc-200 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white dark:text-zinc-950 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                {isEditing ? 'Save Changes' : 'Create Employee'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
