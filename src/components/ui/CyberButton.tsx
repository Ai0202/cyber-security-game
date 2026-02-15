'use client';

import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'danger';

interface CyberButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<Variant, string> = {
  primary:
    'border-cyber-green text-cyber-green shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-cyber-green/10',
  secondary:
    'border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:bg-cyber-cyan/10',
  danger:
    'border-cyber-magenta text-cyber-magenta shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:bg-cyber-magenta/10',
};

export default function CyberButton({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: CyberButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded border px-6 py-3 font-mono text-sm font-bold tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
