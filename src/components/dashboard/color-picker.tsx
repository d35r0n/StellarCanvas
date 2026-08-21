'use client';

import { cn } from '@/lib/utils';
import { useCallback, useRef, useState } from 'react';
import { Pipette } from 'lucide-react';

const PALETTE = [
  '#ffffff',
  '#c0c0c0',
  '#808080',
  '#404040',
  '#ff6b6b',
  '#ff8787',
  '#ffa94d',
  '#ffd43b',
  '#a9e34b',
  '#69db7c',
  '#38d9a9',
  '#3bc9db',
  '#74c0fc',
  '#748ffc',
  '#9775fa',
  '#da77f2',
  '#f783ac',
  '#FF6B35',
  '#004E64',
  '#1A659E',
  '#0B2545',
  '#8C52FF',
  '#FF66C4',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState('#8C52FF');
  const [showCustom, setShowCustom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCustomApply = useCallback(() => {
    const hex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(inputValue)
      ? inputValue.length === 4
        ? `#${inputValue[1]}${inputValue[1]}${inputValue[2]}${inputValue[2]}${inputValue[3]}${inputValue[3]}`
        : inputValue
      : null;

    if (hex) {
      onChange(hex);
      setShowCustom(false);
    }
  }, [inputValue, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleCustomApply();
      if (e.key === 'Escape') {
        setShowCustom(false);
        setInputValue(value);
      }
    },
    [handleCustomApply, value],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap justify-center gap-1.5">
        {PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Select color ${color}`}
            aria-pressed={value === color}
            onClick={() => onChange(color)}
            className={cn(
              'focus-visible:ring-ring focus-visible:ring-offset-background h-7 w-7 rounded-md border-2 transition-all focus-visible:ring-2 focus-visible:ring-offset-2',
              value === color
                ? 'scale-110 border-white shadow-lg ring-2 shadow-white/20 ring-white/20'
                : 'border-white/10 hover:scale-105 hover:border-white/30 active:scale-95',
            )}
            style={{ backgroundColor: color }}
          />
        ))}

        <button
          type="button"
          aria-label="Custom color"
          aria-pressed={showCustom}
          onClick={() => {
            setShowCustom(!showCustom);
            setInputValue(value);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className={cn(
            'focus-visible:ring-ring focus-visible:ring-offset-background flex h-7 w-7 items-center justify-center rounded-md border-2 border-dashed transition-all focus-visible:ring-2 focus-visible:ring-offset-2',
            showCustom
              ? 'border-white bg-white/10'
              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 active:scale-95',
          )}
        >
          <Pipette className="text-muted-foreground h-3.5 w-3.5" />
        </button>
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="#8C52FF"
            maxLength={7}
            className="text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-8 w-24 rounded-md border border-white/10 bg-white/5 px-2 font-mono text-xs outline-none focus-visible:border-white/20 focus-visible:ring-2"
          />
          <div
            className="h-6 w-6 rounded border border-white/10"
            style={{ backgroundColor: inputValue }}
          />
        </div>
      )}
    </div>
  );
}
