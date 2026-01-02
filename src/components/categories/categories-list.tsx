'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/actions/categories';

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  isIncome: boolean;
}

interface CategoriesListProps {
  defaultCategories: Category[];
  customCategories: Category[];
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

export function CategoriesList({
  defaultCategories,
  customCategories,
}: CategoriesListProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isIncome, setIsIncome] = useState(false);

  const resetForm = () => {
    setName('');
    setColor(COLORS[0]);
    setIsIncome(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCategory({ name, color, isIncome });
      if (result.success) {
        toast.success('Category created');
        setIsAddOpen(false);
        resetForm();
      } else {
        toast.error(result.error || 'Failed to create category');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingCategory || !name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateCategory(editingCategory.id, { name, color });
      if (result.success) {
        toast.success('Category updated');
        setEditingCategory(null);
        resetForm();
      } else {
        toast.error(result.error || 'Failed to update category');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    setIsSubmitting(true);
    try {
      const result = await deleteCategory(deletingCategory.id);
      if (result.success) {
        toast.success('Category deleted');
        setDeletingCategory(null);
      } else {
        toast.error(result.error || 'Failed to delete category');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setName(category.name);
    setColor(category.color);
    setIsIncome(category.isIncome);
    setEditingCategory(category);
  };

  return (
    <div className="space-y-6">
      {/* Default Categories */}
      <div>
        <h2 className="mb-2 text-sm font-medium text-slate-500">
          DEFAULT CATEGORIES
        </h2>
        <p className="mb-3 text-xs text-slate-400">Cannot be deleted</p>
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {defaultCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="flex-1 text-sm font-medium text-slate-900">
                {category.name}
              </span>
              <span className="text-xs text-slate-400">
                {category.isIncome ? 'Income' : 'Expense'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Categories */}
      <div>
        <h2 className="mb-2 text-sm font-medium text-slate-500">
          CUSTOM CATEGORIES
        </h2>
        {customCategories.length > 0 ? (
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {customCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {category.name}
                </span>
                <span className="mr-2 text-xs text-slate-400">
                  {category.isIncome ? 'Income' : 'Expense'}
                </span>
                <button
                  onClick={() => openEditDialog(category)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeletingCategory(category)}
                  className="p-1 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-slate-400">
            No custom categories yet
          </p>
        )}
      </div>

      {/* Add Button */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" onClick={resetForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Category
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category for your transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Equipment"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      color === c
                        ? 'scale-110 ring-2 ring-slate-400 ring-offset-2'
                        : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <RadioGroup
                value={isIncome ? 'income' : 'expense'}
                onValueChange={(v) => setIsIncome(v === 'income')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">Expense</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">Income</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category name or color.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      color === c
                        ? 'scale-110 ring-2 ring-slate-400 ring-offset-2'
                        : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingCategory(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deletingCategory?.name}
              &rdquo;? Transactions using this category will become
              uncategorized.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCategory(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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
