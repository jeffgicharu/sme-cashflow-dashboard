'use client';

import { useState } from 'react';
import { Check, X, Pencil, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<{ success: boolean; error?: string }>;
  type?: 'text' | 'number';
  prefix?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function EditableField({
  label,
  value,
  onSave,
  type = 'text',
  prefix,
  placeholder,
  icon,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await onSave(editValue);

    setIsLoading(false);

    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error || 'Failed to save');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          {prefix && <span className="text-sm text-slate-500">{prefix}</span>}
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-9 flex-1"
            autoFocus
            disabled={isLoading}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isLoading}
            className="h-9 w-9 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-9 w-9 p-0"
          >
            <X className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={handleEdit}
      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-900">
          {prefix}
          {value || 'Not set'}
        </span>
        <Pencil className="h-3.5 w-3.5 text-slate-400" />
      </div>
    </button>
  );
}
