'use client';

import { useState } from 'react';
import CyberButton from '@/components/ui/CyberButton';

interface EmailTarget {
  name: string;
  email: string;
  position?: string;
  department?: string;
}

interface EmailFields {
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  linkUrl?: string;
}

interface EmailUIProps {
  target: EmailTarget;
  fields: EmailFields;
  onFieldChange: (field: string, value: string) => void;
  onSend: () => void;
  onBack?: () => void;
  showPreviewToggle?: boolean;
  showLinkField?: boolean;
  sendLabel?: string;
  disabled?: boolean;
  variant?: 'email' | 'sms';
}

const inputClass =
  'w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-cyan/50 focus:outline-none';

export default function EmailUI({
  target,
  fields,
  onFieldChange,
  onSend,
  onBack,
  showPreviewToggle = true,
  showLinkField = true,
  sendLabel = 'SEND EMAIL',
  disabled = false,
  variant = 'email',
}: EmailUIProps) {
  const [preview, setPreview] = useState(false);

  if (variant === 'sms') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4">
          <p className="mb-2 text-center font-mono text-xs text-gray-500">
            To: {target.name}
          </p>
          <div className="space-y-2">
            {fields.body && (
              <div className="ml-auto max-w-[75%] rounded-2xl bg-cyber-cyan/20 px-4 py-2 text-sm text-white">
                {fields.body}
              </div>
            )}
          </div>
        </div>
        <textarea
          value={fields.body}
          onChange={(e) => onFieldChange('body', e.target.value)}
          placeholder="SMS本文を入力..."
          rows={3}
          disabled={disabled}
          className={inputClass}
        />
        <div className="flex gap-2">
          {onBack && (
            <CyberButton variant="secondary" onClick={onBack} disabled={disabled}>
              BACK
            </CyberButton>
          )}
          <CyberButton onClick={onSend} disabled={disabled} className="flex-1">
            {sendLabel}
          </CyberButton>
        </div>
      </div>
    );
  }

  if (preview && showPreviewToggle) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-cyber-card p-4">
          <div className="mb-3 space-y-1 border-b border-white/5 pb-3 text-xs text-gray-400">
            <p>
              <span className="text-gray-500">From:</span> {fields.senderName}{' '}
              &lt;{fields.senderEmail}&gt;
            </p>
            <p>
              <span className="text-gray-500">To:</span> {target.name}{' '}
              &lt;{target.email}&gt;
            </p>
            <p>
              <span className="text-gray-500">Subject:</span>{' '}
              <span className="text-white">{fields.subject}</span>
            </p>
          </div>
          <div className="whitespace-pre-wrap text-sm text-gray-300">
            {fields.body}
          </div>
          {fields.linkUrl && (
            <p className="mt-3 text-xs text-cyber-cyan underline">
              {fields.linkUrl}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <CyberButton
            variant="secondary"
            onClick={() => setPreview(false)}
            disabled={disabled}
          >
            EDIT
          </CyberButton>
          <CyberButton onClick={onSend} disabled={disabled} className="flex-1">
            {sendLabel}
          </CyberButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/10 bg-cyber-card/50 p-3">
        <p className="text-xs text-gray-500">
          To: {target.name} &lt;{target.email}&gt;
          {target.position && ` / ${target.position}`}
          {target.department && ` - ${target.department}`}
        </p>
      </div>

      <input
        type="text"
        value={fields.senderName}
        onChange={(e) => onFieldChange('senderName', e.target.value)}
        placeholder="差出人名"
        disabled={disabled}
        className={inputClass}
      />
      <input
        type="email"
        value={fields.senderEmail}
        onChange={(e) => onFieldChange('senderEmail', e.target.value)}
        placeholder="差出人メールアドレス"
        disabled={disabled}
        className={inputClass}
      />
      <input
        type="text"
        value={fields.subject}
        onChange={(e) => onFieldChange('subject', e.target.value)}
        placeholder="件名"
        disabled={disabled}
        className={inputClass}
      />
      <textarea
        value={fields.body}
        onChange={(e) => onFieldChange('body', e.target.value)}
        placeholder="メール本文を入力..."
        rows={6}
        disabled={disabled}
        className={inputClass}
      />
      {showLinkField && (
        <input
          type="url"
          value={fields.linkUrl ?? ''}
          onChange={(e) => onFieldChange('linkUrl', e.target.value)}
          placeholder="フィッシングURL"
          disabled={disabled}
          className={inputClass}
        />
      )}

      <div className="flex gap-2">
        {onBack && (
          <CyberButton variant="secondary" onClick={onBack} disabled={disabled}>
            BACK
          </CyberButton>
        )}
        {showPreviewToggle && (
          <CyberButton
            variant="secondary"
            onClick={() => setPreview(true)}
            disabled={disabled}
          >
            PREVIEW
          </CyberButton>
        )}
        <CyberButton onClick={onSend} disabled={disabled} className="flex-1">
          {sendLabel}
        </CyberButton>
      </div>
    </div>
  );
}
