'use client';

import { useState } from 'react';
import { Plus, Users, BookOpen, Trash2, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useGroupStore, type Group } from '@/store/groupStore';

const GRADE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SUBJECT_OPTIONS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'History', 'Geography', 'Civics',
  'Computer Science', 'Economics', 'Accountancy', 'Business Studies',
];

interface GroupFormData {
  name: string;
  subject: string;
  grade: string;
  studentCount: number;
}

const EMPTY_FORM: GroupFormData = { name: '', subject: 'Mathematics', grade: '8', studentCount: 30 };

function GroupCard({
  group,
  onEdit,
  onDelete,
}: {
  group: Group;
  onEdit: (g: Group) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="bg-white dark:bg-app-surface rounded-2xl p-5 flex flex-col gap-4 shadow-card hover:shadow-card-hover hover:-translate-y-px dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.32),0_16px_40px_rgba(0,0,0,0.44)] transition-[box-shadow,transform] duration-200 animate-fade-in overflow-hidden"
      style={{ borderTop: `3px solid ${group.color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${group.color}18`, color: group.color }}
        >
          <Users className="w-5 h-5" />
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onEdit(group)}
            className="p-2 rounded-lg text-app-text-muted hover:text-app-text-primary hover:bg-app-surface-2 active:scale-90 transition-[background-color,color,transform] duration-100"
            aria-label="Edit group"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onDelete(group.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-semibold hover:bg-red-600 transition-colors"
                aria-label="Confirm delete"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-2 rounded-lg text-app-text-muted hover:bg-app-surface-2 transition-colors"
                aria-label="Cancel delete"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-lg text-app-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
              aria-label="Delete group"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-semibold text-app-text-primary leading-tight">{group.name}</h3>
        <p className="text-[12px] text-app-text-muted mt-0.5">
          Grade {group.grade} · {group.subject}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-app-border/70">
        <div className="flex items-center gap-1.5 text-[12px] text-app-text-secondary">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{group.studentCount} students</span>
        </div>
        <span className="text-[11px] text-app-text-muted">
          {new Date(group.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

function GroupModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Group | null;
  onClose: () => void;
  onSave: (data: GroupFormData) => void;
}) {
  const [form, setForm] = useState<GroupFormData>(
    initial
      ? { name: initial.name, subject: initial.subject, grade: initial.grade, studentCount: initial.studentCount }
      : EMPTY_FORM,
  );
  const [nameError, setNameError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setNameError('Group name is required'); return; }
    setNameError('');
    onSave(form);
  }

  const inputClass = 'w-full h-10 px-3 rounded-lg border border-app-border text-[13px] text-app-text-primary placeholder:text-app-text-muted bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors';
  const selectClass = 'w-full h-10 px-3 rounded-lg border border-app-border text-[13px] text-app-text-primary bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-app-surface/95 backdrop-blur-xl rounded-2xl shadow-dropdown dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_8px_32px_rgba(0,0,0,0.5),0_24px_64px_rgba(0,0,0,0.4)] w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-bold text-app-text-primary">
            {initial ? 'Edit Group' : 'Create Group'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-app-text-muted hover:bg-app-surface-2 active:scale-90 transition-[background-color,transform] duration-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-app-text-secondary mb-1.5">Group Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setNameError(''); }}
              placeholder="e.g. Class 8A, Morning Batch"
              className={inputClass}
              autoFocus
            />
            {nameError && <p className="text-[11px] text-red-500 mt-1">{nameError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-app-text-secondary mb-1.5">Subject</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={selectClass}>
                {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-app-text-secondary mb-1.5">Grade</label>
              <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className={selectClass}>
                {GRADE_OPTIONS.map((g) => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-app-text-secondary mb-1.5">Number of Students</label>
            <input
              type="number"
              min={1}
              max={500}
              value={form.studentCount}
              onChange={(e) => setForm({ ...form, studentCount: Number(e.target.value) })}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-full border border-app-border text-[13px] font-medium text-app-text-secondary hover:bg-app-surface-2 active:scale-[0.97] transition-[background-color,transform] duration-100">
              Cancel
            </button>
            <button type="submit" className="flex-1 h-10 rounded-full bg-brand-dark text-white text-[13px] font-semibold hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-[opacity,transform] duration-150">
              {initial ? 'Save Changes' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const { groups, addGroup, updateGroup, deleteGroup } = useGroupStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Group | null>(null);

  function handleSave(data: GroupFormData) {
    if (editTarget) {
      updateGroup(editTarget.id, data);
      toast.success('Group updated');
    } else {
      addGroup(data);
      toast.success('Group created');
    }
    setModalOpen(false);
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    deleteGroup(id);
    toast.success('Group deleted');
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-app-text-primary">My Groups</h1>
          <p className="text-[13px] text-app-text-secondary mt-0.5">
            {groups.length === 0
              ? 'Create groups to organise your classes and assign papers to them.'
              : `${groups.length} class ${groups.length === 1 ? 'group' : 'groups'}`}
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 bg-brand-dark text-white text-[13px] font-semibold px-4 py-2.5 rounded-full hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-[opacity,transform] duration-150"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white dark:bg-app-surface rounded-2xl px-6 py-16 flex flex-col items-center text-center shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)]">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-purple-500" />
          </div>
          <h3 className="text-[15px] font-semibold text-app-text-primary mb-1.5">No groups yet</h3>
          <p className="text-[13px] text-app-text-secondary mb-6 max-w-sm leading-relaxed">
            Groups let you organise students into classes, so you can assign question papers directly to a group when creating assignments.
          </p>
          <button
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="inline-flex items-center gap-2 bg-brand-dark text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-[opacity,transform] duration-150"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Create your first group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-grid">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={(g) => { setEditTarget(g); setModalOpen(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <GroupModal
          initial={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
