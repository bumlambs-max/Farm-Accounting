
import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { suggestCategory } from '../services/geminiService';

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  fixedType?: TransactionType;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ categories, onSubmit, onCancel, fixedType }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(fixedType || TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Sync categoryId with type changes or initial load
  useEffect(() => {
    const filtered = categories.filter(c => c.type === type);
    if (filtered.length > 0) {
      setCategoryId(filtered[0].id);
    }
  }, [type, categories]);

  const handleAiCategorize = async () => {
    if (!description) return;
    setIsSuggesting(true);
    try {
      const suggestedName = await suggestCategory(description, categories);
      const matched = categories.find(c => c.name.toLowerCase() === suggestedName?.toLowerCase());
      if (matched) {
        // Only set if the matched category matches our current fixed type (if any)
        if (!fixedType || matched.type === fixedType) {
          setCategoryId(matched.id);
          setType(matched.type);
        }
      }
    } catch (error) {
      console.error("AI categorization failed", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !categoryId) return;
    onSubmit({
      description,
      amount: parseFloat(amount),
      type,
      categoryId,
      date
    });
    // Reset form
    setDescription('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <div className="relative">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={fixedType === TransactionType.INCOME ? "e.g. Project Payment" : "e.g. Office Supplies"}
              required
            />
            <button
              type="button"
              onClick={handleAiCategorize}
              disabled={isSuggesting}
              className="absolute right-2 top-1.5 px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded hover:bg-blue-100 transition-colors"
            >
              {isSuggesting ? 'Thinking...' : 'AI Categorize'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!fixedType && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={TransactionType.EXPENSE}>Expense</option>
              <option value={TransactionType.INCOME}>Income</option>
            </select>
          </div>
        )}
        <div className={fixedType ? "md:col-span-2" : ""}>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {categories.filter(c => c.type === type).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className={fixedType ? "md:col-span-1" : ""}>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Add {fixedType ? fixedType.toLowerCase() : 'Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
