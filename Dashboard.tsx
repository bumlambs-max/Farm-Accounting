
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Transaction, Category, TransactionType } from '../types';
import { COLORS } from '../constants.tsx';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, categories }) => {
  const summary = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === TransactionType.INCOME) acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const categoryData = useMemo(() => {
    const data: { [key: string]: number } = {};
    transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || 'Other';
      data[cat] = (data[cat] || 0) + t.amount;
    });
    return Object.keys(data).map((name, index) => ({
      name,
      value: data[name],
      color: COLORS[index % COLORS.length]
    }));
  }, [transactions, categories]);

  const monthlyData = useMemo(() => {
    const data: { [key: string]: { month: string, income: number, expense: number } } = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const label = date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
      if (!data[key]) data[key] = { month: label, income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) data[key].income += t.amount;
      else data[key].expense += t.amount;
    });
    return Object.values(data).sort((a, b) => {
        // Simple sort logic for chart display
        return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">${summary.income.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase">Total Expenses</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">${summary.expense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase">Net Income</p>
          <p className={`text-2xl font-bold mt-1 ${summary.income - summary.expense >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
            ${(summary.income - summary.expense).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Income vs Expenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Expense Breakdown</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
