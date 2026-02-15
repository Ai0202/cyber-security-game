'use client';

import { motion } from 'framer-motion';
import NeonBadge from '@/components/ui/NeonBadge';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  importance: 'high' | 'medium' | 'low';
  selected: boolean;
  encrypted: boolean;
}

interface FileGridProps {
  files: FileItem[];
  onToggle: (id: string) => void;
  disabled?: boolean;
}

const typeIcons: Record<string, string> = {
  patient: '\uD83C\uDFE5',
  financial: '\uD83D\uDCB0',
  system: '\u2699\uFE0F',
  backup: '\uD83D\uDCBE',
  log: '\uD83D\uDCDD',
  document: '\uD83D\uDCC4',
  database: '\uD83D\uDDC4\uFE0F',
};

const importanceColors: Record<string, 'red' | 'yellow' | 'green'> = {
  high: 'red',
  medium: 'yellow',
  low: 'green',
};

export default function FileGrid({
  files,
  onToggle,
  disabled = false,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {files.map((file) => {
        const icon = typeIcons[file.type] ?? '\uD83D\uDCC4';
        const badgeColor = importanceColors[file.importance] ?? 'green';

        return (
          <motion.button
            key={file.id}
            onClick={() => onToggle(file.id)}
            disabled={disabled || file.encrypted}
            whileTap={disabled || file.encrypted ? {} : { scale: 0.95 }}
            className={`relative rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed ${
              file.encrypted
                ? 'border-gray-700 bg-gray-900/50 opacity-60'
                : file.selected
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-white/10 bg-cyber-card hover:border-white/20'
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-lg">
                {file.encrypted ? '\uD83D\uDD12' : icon}
              </span>
              <NeonBadge color={badgeColor} className="text-[9px]">
                {file.importance.toUpperCase()}
              </NeonBadge>
            </div>
            <p
              className={`truncate font-mono text-xs ${
                file.encrypted
                  ? 'text-gray-600 line-through'
                  : 'text-gray-300'
              }`}
            >
              {file.name}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-gray-600">
              {file.size}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
