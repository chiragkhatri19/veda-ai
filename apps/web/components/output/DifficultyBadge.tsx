interface Props {
  difficulty: 'easy' | 'moderate' | 'hard';
}

const CONFIG = {
  easy:     { label: 'Easy',     className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' },
  moderate: { label: 'Moderate', className: 'bg-amber-500/10  text-amber-700  dark:text-amber-400  border-amber-200  dark:border-amber-800/60'  },
  hard:     { label: 'Hard',     className: 'bg-red-500/10    text-red-700    dark:text-red-400    border-red-200    dark:border-red-800/60'    },
};

export default function DifficultyBadge({ difficulty }: Props) {
  const { label, className } = CONFIG[difficulty] ?? CONFIG.moderate;
  return (
    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}
