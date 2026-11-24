'use client';

import { useState } from 'react';

export default function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked; the text is still on the page to select.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="text-sm font-ui font-medium text-neutral-800 hover:text-neutral-950 hover:underline underline-offset-4 transition-colors"
    >
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  );
}
