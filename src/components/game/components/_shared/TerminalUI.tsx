'use client';

import { useRef, useEffect } from 'react';

interface TerminalUIProps {
  lines: string[];
  headerText?: string;
  className?: string;
}

function colorForLine(line: string): string {
  if (line.includes('SUCCESS')) return 'text-cyber-green';
  if (line.includes('FAILED') || line.includes('ERROR')) return 'text-red-400';
  if (line.includes('WARNING')) return 'text-yellow-400';
  return 'text-gray-400';
}

export default function TerminalUI({
  lines,
  headerText,
  className = '',
}: TerminalUIProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      ref={containerRef}
      className={`h-64 overflow-y-auto rounded-lg border border-white/10 bg-black p-3 font-mono text-xs ${className}`}
    >
      {headerText && (
        <p className="mb-1 text-gray-500">{headerText}</p>
      )}
      {lines.map((line, i) => (
        <p key={i} className={colorForLine(line)}>
          {line}
        </p>
      ))}
    </div>
  );
}
