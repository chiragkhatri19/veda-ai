'use client';

import { useState } from 'react';
import { Download, RefreshCw, Printer } from 'lucide-react';
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
    <div className="no-print mb-6 bg-[#111827] rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3">
      {/* Left: title + timestamp */}
      <div className="min-w-0">
        <p className="text-white font-bold text-[15px] tracking-tight truncate">{assignmentTitle}</p>
        <p className="text-zinc-400 text-[12px] mt-0.5">Generated {timeStr}</p>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-white/80 border border-white/20 rounded-full hover:bg-white/10 active:scale-[0.97] transition-[background-color,transform] duration-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-white/80 border border-white/20 rounded-full hover:bg-white/10 active:scale-[0.97] transition-[background-color,transform] duration-100"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-[#111827] bg-white rounded-full hover:bg-zinc-100 active:scale-[0.97] transition-[background-color,transform] duration-100 disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? 'Saving…' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}
