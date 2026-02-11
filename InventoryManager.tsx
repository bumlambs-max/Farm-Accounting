
import React, { useState, useMemo } from 'react';
import { InventoryItem, InventoryMovement, MovementType } from '../types';

interface InventoryManagerProps {
  items: InventoryItem[];
  movements: InventoryMovement[];
  onAddItem: (item: Omit<InventoryItem, 'id' | 'quantity'>) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onRecordMovement: (movement: Omit<InventoryMovement, 'id'>) => void;
  onDeleteItem: (id: string) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  items, 
  movements, 
  onAddItem, 
  onUpdateItem, 
  onRecordMovement,
  onDeleteItem
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'history'>('status');
  const [showItemForm, setShowItemForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');

  // Form States
  const [newItem, setNewItem] = useState({ name: '', sku: '', description: '', unitCost: 0, minStockLevel: 5 });
  const [newMovement, setNewMovement] = useState({ itemId: '', type: MovementType.IN, quantity: 1, note: '', date: new Date().toISOString().split('T')[0] });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem(newItem);
    setNewItem({ name: '', sku: '', description: '', unitCost: 0, minStockLevel: 5 });
    setShowItemForm(false);
  };

  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(i => i.id === newMovement.itemId);
    if (!item) return;

    onRecordMovement({
      ...newMovement,
      unitCostAtTime: item.unitCost
    });
    setShowMovementForm(false);
    setNewMovement({ itemId: '', type: MovementType.IN, quantity: 1, note: '', date: new Date().toISOString().split('T')[0] });
  };

  const inventoryValue = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  }, [items]);

  const sortedHistory = useMemo(() => {
    return [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements]);

  return (
    <div className="space-y-6">
      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase">Total Inventory Value</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">${inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase">Total Items In Stock</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{items.reduce((sum, i) => sum + i.quantity, 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-rose-500 mt-1">{items.filter(i => i.quantity <= i.minStockLevel).length}</p>
        </div>
      </div>

      {/* Tabs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'status' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Current Status
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Movement History
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMovementForm(true)}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-semibold flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <span>Record Movement</span>
          </button>
          <button
            onClick={() => setShowItemForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center space-x-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showItemForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddItem} className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Add New Inventory Item</h3>
              <button type="button" onClick={() => setShowItemForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
                  <input type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Mechanical Keyboard" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SKU / Serial</label>
                  <input type="text" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="KB-001" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit Cost ($)</label>
                  <input type="number" step="0.01" required value={newItem.unitCost} onChange={e => setNewItem({...newItem, unitCost: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Low Stock Level</label>
                  <input type="number" required value={newItem.minStockLevel} onChange={e => setNewItem({...newItem, minStockLevel: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowItemForm(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm">Create Item</button>
            </div>
          </form>
        </div>
      )}

      {showMovementForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRecordMovement} className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Record Stock Movement</h3>
              <button type="button" onClick={() => setShowMovementForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Item</label>
                <select required value={newMovement.itemId} onChange={e => setNewMovement({...newMovement, itemId: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select a product...</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku}) - Stock: {i.quantity}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                  <select value={newMovement.type} onChange={e => setNewMovement({...newMovement, type: e.target.value as MovementType})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value={MovementType.IN}>Stock In (+)</option>
                    <option value={MovementType.OUT}>Stock Out (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                  <input type="number" required min="1" value={newMovement.quantity} onChange={e => setNewMovement({...newMovement, quantity: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input type="date" required value={newMovement.date} onChange={e => setNewMovement({...newMovement, date: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes / Reason</label>
                  <input type="text" value={newMovement.note} onChange={e => setNewMovement({...newMovement, note: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Supplier restock, Customer order #123" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowMovementForm(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm">Record Adjustment</button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content Areas */}
      {activeTab === 'status' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Stock Level</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Unit Cost</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Total Value</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No inventory items found. Add your first product to begin tracking.</td></tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.sku}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.quantity <= item.minStockLevel ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                            {item.quantity} units
                          </span>
                          {item.quantity <= item.minStockLevel && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Low Stock</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-right">${item.unitCost.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">${(item.quantity * item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => onDeleteItem(item.id)} className="text-slate-300 hover:text-rose-500 p-1 transition-colors">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Quantity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedHistory.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No movement history recorded yet.</td></tr>
                ) : (
                  sortedHistory.map(move => {
                    const item = items.find(i => i.id === move.itemId);
                    return (
                      <tr key={move.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(move.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{item?.name || 'Deleted Product'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase ${move.type === MovementType.IN ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {move.type === MovementType.IN ? 'Stock In' : 'Stock Out'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold text-right ${move.type === MovementType.IN ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {move.type === MovementType.IN ? '+' : '-'}{move.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 italic">{move.note || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
