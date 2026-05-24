'use client';

import { useState, useEffect } from 'react';
import {
  User, School, MapPin, BookOpen, GraduationCap, Mail,
  CheckCircle2, AlertCircle, Sun, Moon,
} from 'lucide-react';
import { useUserStore, type UserProfile } from '@/store/userStore';
import { useTheme } from '@/store/themeStore';

const SUBJECT_OPTIONS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'History', 'Geography', 'Civics',
  'Computer Science', 'Economics', 'Accountancy', 'Business Studies',
];
const GRADE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

type FormState = Omit<UserProfile, 'avatarInitials'>;
type SaveStatus = 'idle' | 'saved' | 'error';

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3.5 border-b border-app-border/60 last:border-0">
      <div className="flex items-center gap-2.5 sm:w-44 shrink-0">
        <Icon className="w-3.5 h-3.5 text-app-text-muted shrink-0" />
        <label className="text-[12px] font-semibold text-app-text-secondary">{label}</label>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const user = useUserStore();
  const { updateProfile } = useUserStore();
  const { theme, toggle } = useTheme();

  const [form, setForm] = useState<FormState>({
    name: user.name,
    email: user.email,
    school: user.school,
    city: user.city,
    subjectSpecialty: user.subjectSpecialty,
    defaultGrade: user.defaultGrade,
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isDirty, setIsDirty] = useState(false);

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setIsDirty(true);
    setSaveStatus('idle');
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      updateProfile(form);
      setSaveStatus('saved');
      setIsDirty(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  }

  function handleDiscard() {
    setForm({
      name: user.name, email: user.email, school: user.school, city: user.city,
      subjectSpecialty: user.subjectSpecialty, defaultGrade: user.defaultGrade,
    });
    setIsDirty(false);
    setSaveStatus('idle');
  }

  const inputClass = 'w-full h-9 px-3 rounded-lg border border-app-border text-[13px] text-app-text-primary placeholder:text-app-text-muted bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-colors';
  const selectClass = 'w-full h-9 px-3 rounded-lg border border-app-border text-[13px] text-app-text-primary bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-colors';

  return (
    <div className="px-6 py-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-app-text-primary">Settings</h1>
        <p className="text-[13px] text-app-text-secondary mt-0.5">Manage your profile, appearance, and teaching preferences.</p>
      </div>

      {/* Avatar banner */}
      <div className="bg-white dark:bg-app-surface rounded-2xl p-5 flex items-center gap-4 shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-brand-orange flex items-center justify-center text-white text-[18px] font-bold shrink-0 ring-2 ring-brand-orange/20">
          {user.avatarInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-app-text-primary truncate">{user.name}</p>
          <p className="text-[12px] text-app-text-muted truncate">{user.email}</p>
          <p className="text-[11px] text-app-text-muted mt-0.5 truncate">{user.school} · {user.city}</p>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-app-surface rounded-2xl overflow-hidden shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)]">
        <div className="px-5 py-4 border-b border-app-border/60 bg-app-surface-2/80">
          <h2 className="text-[13px] font-bold text-app-text-primary">Appearance</h2>
          <p className="text-[11px] text-app-text-muted mt-0.5">Choose how VedaAI looks for you.</p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-app-text-primary">Theme</p>
            <p className="text-[11px] text-app-text-muted mt-0.5">
              Currently using <span className="font-medium text-app-text-secondary">{theme === 'dark' ? 'Dark' : 'Light'}</span> mode
            </p>
          </div>
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-app-border bg-app-surface-2 text-[12px] font-medium text-app-text-secondary hover:border-brand-orange/50 hover:text-app-text-primary transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-app-surface rounded-2xl overflow-hidden shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)]">
        <div className="px-5 py-4 border-b border-app-border/60 bg-app-surface-2/80">
          <h2 className="text-[13px] font-bold text-app-text-primary">Profile Information</h2>
          <p className="text-[11px] text-app-text-muted mt-0.5">Displayed in the sidebar and printed on generated papers.</p>
        </div>

        <div className="px-5">
          <Field label="Full Name" icon={User}>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" className={inputClass} />
          </Field>
          <Field label="Email Address" icon={Mail}>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@school.edu.in" className={inputClass} />
          </Field>
          <Field label="School" icon={School}>
            <input type="text" value={form.school} onChange={(e) => set('school', e.target.value)} placeholder="School or institution name" className={inputClass} />
            <p className="text-[10px] text-app-text-muted mt-1">This appears as the school name on every generated question paper.</p>
          </Field>
          <Field label="City" icon={MapPin}>
            <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Your city" className={inputClass} />
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-app-border/60 bg-app-surface-2/80 mt-2">
          <h3 className="text-[13px] font-bold text-app-text-primary">Teaching Preferences</h3>
          <p className="text-[11px] text-app-text-muted mt-0.5">Used as defaults when creating new assignments.</p>
        </div>

        <div className="px-5">
          <Field label="Subject Specialty" icon={BookOpen}>
            <select value={form.subjectSpecialty} onChange={(e) => set('subjectSpecialty', e.target.value)} className={selectClass}>
              {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Default Grade" icon={GraduationCap}>
            <select value={form.defaultGrade} onChange={(e) => set('defaultGrade', e.target.value)} className={selectClass}>
              {GRADE_OPTIONS.map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-app-border/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-h-[20px]">
            {saveStatus === 'saved' && (
              <p className="flex items-center gap-1.5 text-[12px] text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Changes saved
              </p>
            )}
            {saveStatus === 'error' && (
              <p className="flex items-center gap-1.5 text-[12px] text-red-600 dark:text-red-400 font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4" />
                Save failed. Please try again.
              </p>
            )}
            {isDirty && saveStatus === 'idle' && (
              <p className="text-[11px] text-app-text-muted animate-fade-in">Unsaved changes</p>
            )}
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!isDirty}
              className="h-9 px-4 rounded-lg border border-app-border text-[12px] font-medium text-app-text-secondary hover:bg-app-surface-2 active:scale-[0.97] transition-[background-color,transform] duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!isDirty}
              className="h-9 px-5 rounded-lg bg-brand-dark text-white text-[12px] font-semibold hover:opacity-90 active:scale-[0.97] transition-[opacity,transform] duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>

      <p className="text-center text-[11px] text-app-text-muted">VedaAI · v1.0.0</p>
    </div>
  );
}
