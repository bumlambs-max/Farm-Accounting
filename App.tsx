
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Transaction, Category, TransactionType, AnimalSpecies, AnimalLog, PopulationChange, Asset, Liability } from './types';
import { INITIAL_CATEGORIES } from './constants.tsx';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Reports from './components/Reports';
import CategoryManager from './components/CategoryManager';
import AnimalManager from './components/AnimalManager';
import AssetManager from './components/AssetManager';
import LiabilityManager from './components/LiabilityManager';
import SignIn from './components/SignIn';
import { getFinancialAdvice } from './services/geminiService';

interface User {
  name: string;
  email: string;
}

const NavLink: React.FC<{ to: string, children: React.ReactNode, icon: React.ReactNode, onClick?: () => void }> = ({ to, children, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
        isActive 
          ? 'bg-emerald-600 text-white shadow-md' 
          : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode, user: User, onLogout: () => void }> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const getTitle = () => {
    switch(location.pathname) {
      case '/income': return 'Income Tracking';
      case '/expenses': return 'Expense Management';
      case '/reports': return 'Financial Reports';
      case '/categories': return 'Category Settings';
      case '/animals': return 'Animal Management';
      case '/assets': return 'Fixed Assets';
      case '/liabilities': return 'Liabilities';
      default: return 'Financial Overview';
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 p-6 flex flex-col z-50 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen print:hidden
      `}>
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-100">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="7" width="4" height="11" rx="2" fill="currentColor"/>
                <path d="M8 18C8 18 5 13 6 9C7 5 10 3 10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 18C16 18 19 13 18 9C17 5 14 3 14 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">Farm Accounts</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-slate-500 hover:text-slate-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
          <NavLink to="/" onClick={closeSidebar} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}>
            Dashboard
          </NavLink>
          <NavLink to="/income" onClick={closeSidebar} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
            Income
          </NavLink>
          <NavLink to="/expenses" onClick={closeSidebar} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
            Expenses
          </NavLink>
          <NavLink to="/animals" onClick={closeSidebar} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}>
            Animals
          </NavLink>
          <NavLink to="/assets" onClick={closeSidebar} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}>
            Assets
          </NavLink>
          <NavLink to="/liabilities" onClick={closeSidebar} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}>
            Liabilities
          </NavLink>
          <NavLink to="/reports" onClick={closeSidebar} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
            Reports
          </NavLink>
          <NavLink to="/categories" onClick={closeSidebar} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
            Settings
          </NavLink>

          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full mt-4 flex items-center space-x-3 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span className="font-bold">Install App</span>
            </button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
              title="Log out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl">
            <p className="text-xs text-emerald-700 font-bold uppercase mb-1 text-center lg:text-left tracking-wider">Field Insights</p>
            <p className="text-[10px] text-emerald-600 leading-snug text-center lg:text-left">Gemini 3 Flash Pro analyzer active.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 transition-all">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between lg:hidden print:hidden">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-lg font-bold text-slate-900">{getTitle()}</h1>
          <button 
            onClick={onLogout}
            className="p-2 -mr-2 text-slate-400 hover:text-rose-600 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex mb-8 justify-between items-center px-8 pt-8 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{getTitle()}</h1>
            <p className="text-slate-500 text-sm">Managing your farm's financial harvest.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-500">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <div className="p-4 lg:p-8 pt-4">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [animalSpecies, setAnimalSpecies] = useState<AnimalSpecies[]>(() => {
    const saved = localStorage.getItem('animal_species');
    return saved ? JSON.parse(saved) : [];
  });

  const [animalLogs, setAnimalLogs] = useState<AnimalLog[]>(() => {
    const saved = localStorage.getItem('animal_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('assets');
    return saved ? JSON.parse(saved) : [];
  });

  const [liabilities, setLiabilities] = useState<Liability[]>(() => {
    const saved = localStorage.getItem('liabilities');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isGettingAdvice, setIsGettingAdvice] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('animal_species', JSON.stringify(animalSpecies));
  }, [animalSpecies]);

  useEffect(() => {
    localStorage.setItem('animal_logs', JSON.stringify(animalLogs));
  }, [animalLogs]);

  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('liabilities', JSON.stringify(liabilities));
  }, [liabilities]);

  const handleSignIn = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      setUser(null);
    }
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [...prev, tx]);
    setShowAddForm(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const cat: Category = {
      ...newCat,
      id: crypto.randomUUID(),
    };
    setCategories(prev => [...prev, cat]);
  };

  const handleUpdateCategory = (updatedCat: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const handleDeleteCategory = (id: string) => {
    const isUsed = transactions.some(t => t.categoryId === id);
    if (isUsed && !window.confirm("This category is used in existing transactions. Deleting it will leave those transactions uncategorized. Continue?")) {
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Animal Handlers
  const handleAddSpecies = (species: Omit<AnimalSpecies, 'id' | 'count'>) => {
    const newSpecies: AnimalSpecies = {
      ...species,
      id: crypto.randomUUID(),
      count: 0
    };
    setAnimalSpecies(prev => [...prev, newSpecies]);
  };

  const handleRecordAnimalLog = (log: Omit<AnimalLog, 'id'>) => {
    const newLog: AnimalLog = {
      ...log,
      id: crypto.randomUUID()
    };
    setAnimalLogs(prev => [...prev, newLog]);
    
    // Update Species Count
    setAnimalSpecies(prev => prev.map(s => {
      if (s.id === log.speciesId) {
        let adjustment = 0;
        if (log.type === PopulationChange.BOUGHT || log.type === PopulationChange.BIRTH) {
          adjustment = log.quantity;
        } else if (log.type === PopulationChange.SOLD || log.type === PopulationChange.DEATH) {
          adjustment = -log.quantity;
        }
        return { ...s, count: Math.max(0, s.count + adjustment) };
      }
      return s;
    }));
  };

  const handleDeleteSpecies = (id: string) => {
    if (window.confirm("Delete this species and all its history?")) {
      setAnimalSpecies(prev => prev.filter(s => s.id !== id));
      setAnimalLogs(prev => prev.filter(l => l.speciesId !== id));
    }
  };

  // Asset Handlers
  const handleAddAsset = (asset: Omit<Asset, 'id'>) => {
    const newAsset: Asset = { ...asset, id: crypto.randomUUID() };
    setAssets(prev => [...prev, newAsset]);
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm("Delete this asset record?")) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  // Liability Handlers
  const handleAddLiability = (liability: Omit<Liability, 'id'>) => {
    const newLib: Liability = { ...liability, id: crypto.randomUUID() };
    setLiabilities(prev => [...prev, newLib]);
  };

  const handleDeleteLiability = (id: string) => {
    if (window.confirm("Delete this liability record?")) {
      setLiabilities(prev => prev.filter(l => l.id !== id));
    }
  };

  const fetchAdvice = async () => {
    if (transactions.length === 0) return;
    setIsGettingAdvice(true);
    
    const distinctMonths = new Set(transactions.map(t => t.date.substring(0, 7)));
    const monthCount = Math.max(1, distinctMonths.size);
    
    const averages: Record<string, number> = {};
    categories.forEach(cat => {
      const total = transactions
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      averages[cat.name] = total / monthCount;
    });

    const trendsData: { [key: string]: { month: string, income: number, expense: number } } = {};
    transactions.forEach(t => {
      const key = t.date.substring(0, 7);
      if (!trendsData[key]) trendsData[key] = { month: key, income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) trendsData[key].income += t.amount;
      else trendsData[key].expense += t.amount;
    });

    const trends = Object.values(trendsData).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);

    try {
      const advice = await getFinancialAdvice(transactions, categories, { averages, trends });
      setAiAdvice(advice || null);
    } catch (error) {
      console.error("Failed to get advice", error);
    } finally {
      setIsGettingAdvice(false);
    }
  };

  const TransactionPageView: React.FC<{ type: TransactionType }> = ({ type }) => {
    const filteredTransactions = useMemo(() => 
      transactions.filter(t => t.type === type),
      [type, transactions]
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-slate-800">
            {type === TransactionType.INCOME ? 'Revenue Streams' : 'Cost Tracking'}
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`${type === TransactionType.INCOME ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-sm w-full sm:w-auto justify-center`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add {type === TransactionType.INCOME ? 'Income' : 'Expense'}</span>
          </button>
        </div>

        {showAddForm && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <TransactionForm 
              categories={categories} 
              onSubmit={handleAddTransaction} 
              onCancel={() => setShowAddForm(false)} 
              fixedType={type}
            />
          </div>
        )}

        <TransactionList 
          transactions={filteredTransactions} 
          categories={categories} 
          onDelete={handleDeleteTransaction} 
        />
      </div>
    );
  };

  if (!user) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={
            <div className="space-y-8">
              <Dashboard transactions={transactions} categories={categories} />
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Field Strategy Analysis</h3>
                  </div>
                  <button 
                    onClick={fetchAdvice}
                    disabled={isGettingAdvice}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors disabled:text-slate-400"
                  >
                    {isGettingAdvice ? 'Consulting Gemini...' : 'Get Fresh Advice'}
                  </button>
                </div>
                {aiAdvice ? (
                  <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed">
                    {aiAdvice.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">{line}</p>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <p className="mb-2 text-sm">Consult our AI strategist for professional farm management insights.</p>
                  </div>
                )}
              </div>
            </div>
          } />
          
          <Route path="/income" element={<TransactionPageView type={TransactionType.INCOME} />} />
          <Route path="/expenses" element={<TransactionPageView type={TransactionType.EXPENSE} />} />
          <Route path="/animals" element={
            <AnimalManager 
              species={animalSpecies} 
              logs={animalLogs}
              onAddSpecies={handleAddSpecies}
              onRecordLog={handleRecordAnimalLog}
              onDeleteSpecies={handleDeleteSpecies}
              onUpdateSpecies={(s) => setAnimalSpecies(prev => prev.map(item => item.id === s.id ? s : item))}
            />
          } />
          <Route path="/assets" element={
            <AssetManager 
              assets={assets} 
              animalSpecies={animalSpecies}
              onAdd={handleAddAsset} 
              onDelete={handleDeleteAsset} 
            />
          } />
          <Route path="/liabilities" element={
            <LiabilityManager 
              liabilities={liabilities} 
              onAdd={handleAddLiability} 
              onDelete={handleDeleteLiability} 
            />
          } />
          <Route path="/categories" element={
            <CategoryManager 
              categories={categories} 
              onAdd={handleAddCategory} 
              onUpdate={handleUpdateCategory} 
              onDelete={handleDeleteCategory} 
            />
          } />

          <Route path="/reports" element={
            <Reports 
              transactions={transactions} 
              categories={categories} 
              animalSpecies={animalSpecies}
              assets={assets}
              liabilities={liabilities}
            />
          } />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
