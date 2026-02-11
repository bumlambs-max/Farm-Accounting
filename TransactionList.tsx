
import React from 'react';
import { Transaction, Category, TransactionType } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No transactions found. Add one to get started.
                </td>
              </tr>
            ) : (
              transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
                const category = categories.find(c => c.id === t.categoryId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {t.description}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${category?.color}15`, color: category?.color }}
                      >
                        {category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold text-right ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => onDelete(t.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
