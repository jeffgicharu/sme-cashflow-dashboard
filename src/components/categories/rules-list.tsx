'use client';

import { useState } from 'react';
import { Trash2, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteCategoryRule } from '@/lib/actions/categories';

interface Rule {
  id: string;
  senderIdentifier: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  createdAt: Date;
}

interface RulesListProps {
  rules: Rule[];
}

export function RulesList({ rules }: RulesListProps) {
  const [deletingRule, setDeletingRule] = useState<Rule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingRule) return;

    setIsDeleting(true);
    try {
      const result = await deleteCategoryRule(deletingRule.id);
      if (result.success) {
        toast.success('Rule deleted');
        setDeletingRule(null);
      } else {
        toast.error(result.error || 'Failed to delete rule');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  };

  if (rules.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No category rules yet</p>
          <p className="mt-2 text-xs text-slate-400">
            Rules are created when you categorize a transaction and check
            &ldquo;Apply to all from this sender.&rdquo;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Auto-categorization rules applied to new transactions from these
        senders.
      </p>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">
                {rule.senderIdentifier}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <ArrowRight className="h-3 w-3" />
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: rule.category.color }}
                />
                <span>{rule.category.name}</span>
              </div>
            </div>
            <button
              onClick={() => setDeletingRule(rule)}
              className="p-1 text-slate-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        Rules are created when you categorize a transaction and check
        &ldquo;Apply to all from this sender.&rdquo;
      </p>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingRule}
        onOpenChange={(open) => !open && setDeletingRule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the rule for &ldquo;
              {deletingRule?.senderIdentifier}&rdquo;? Future transactions from
              this sender will no longer be auto-categorized.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingRule(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
