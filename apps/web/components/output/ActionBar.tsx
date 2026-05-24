'use client';

import { useState } from 'react';
import { Download, RefreshCw, Printer, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Props {
  assignmentId: string;
  assignmentTitle: string;
  generatedAt: string;
  onRegenerate: () => void;
}

export default function ActionBar({ assignmentId, assignmentTitle, generatedAt, onRegenerate }: Props) {
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await api.assignments.regenerate(assignmentId);
      toast.success('Regenerating your question paper…');
      onRegenerate();
    } catch (err) {
      toast.error((err as Error).message || 'Regeneration failed. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await api.assignments.downloadPdf(assignmentId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${assignmentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF download failed. Use the Print button to save as PDF via your browser.');
    } finally {
      setDownloading(false);
    }
  };

  const timeStr = new Date(generatedAt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="no-print mb-6 bg-white dark:bg-app-surface rounded-2xl shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] overflow-hidden">
      {/* AI context strip */}
      <div className="px-5 py-4 flex items-start gap-3 border-b border-app-border/50">
        <div className="w-7 h-7 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] text-app-text-secondary leading-relaxed">
            Your question paper for{' '}
            <span className="font-semibold text-app-text-primary">{assignmentTitle}</span>{' '}
            is ready. Generated {timeStr}.
          </p>
        </div>
      </div>

      {/* Actions row */}
      <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium text-app-text-secondary border border-app-border rounded-full hover:bg-app-surface-2 active:scale-[0.97] transition-[background-color,transform] duration-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium text-app-text-secondary border border-app-border rounded-full hover:bg-app-surface-2 active:scale-[0.97] transition-[background-color,transform] duration-100"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-white bg-[#111827] dark:bg-brand-dark rounded-full hover:opacity-90 active:scale-[0.97] transition-[opacity,transform] duration-100 disabled:opacity-60 ml-auto"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? 'Saving…' : 'Download as PDF'}
        </button>
      </div>
    </div>
  );
}
