import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getCycleStartDate } from '../db';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

interface DashboardProps {
  onAddItemClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddItemClick }) => {
  const [cycleStart, setCycleStart] = useState(getCycleStartDate());
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string; rate: number; provider?: string } | null>(null);
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [provider, setProvider] = useState('');

  // Listen for cycle reset events
  useEffect(() => {
    const handleReset = () => setCycleStart(getCycleStartDate());
    window.addEventListener('cycle-reset', handleReset);
    return () => window.removeEventListener('cycle-reset', handleReset);
  }, []);

  const items = useLiveQuery(() => db.items.filter(item => item.isRoutine === true).toArray());
  const logs = useLiveQuery(() => db.logs.where('timestamp').aboveOrEqual(cycleStart).toArray(), [cycleStart]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !qty) return;

    const quantity = parseFloat(qty);
    const cost = quantity * selectedItem.rate;
    const now = new Date();

    await db.logs.add({
      itemId: selectedItem.id,
      date: now.toISOString().split('T')[0],
      timestamp: now.getTime(),
      quantity,
      cost,
      provider: provider || selectedItem.provider,
      note
    });

    setSelectedItem(null);
    setQty('');
    setNote('');
    setProvider('');
  };

  const getItemStats = (itemId: number) => {
    if (!logs) return { totalQty: 0, totalCost: 0 };
    return logs
      .filter(l => l.itemId === itemId)
      .reduce((acc, log) => ({
        totalQty: acc.totalQty + log.quantity,
        totalCost: acc.totalCost + log.cost
      }), { totalQty: 0, totalCost: 0 });
  };

  if (!items) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Routine</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cycle started: {new Date(cycleStart).toLocaleDateString()}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No routine items</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 mb-6">Add items to your routine to start tracking.</p>
          <Button onClick={onAddItemClick}>Add Item</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => {
            const stats = getItemStats(item.id!);
            return (
              <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{item.name}</h3>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      {item.unit}
                    </span>
                  </div>
                  <div className="space-y-1 mb-4">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.totalQty} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{item.unit}s</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Cost: <span className="font-medium text-gray-900 dark:text-gray-200">${stats.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSelectedItem(item);
                    setProvider(item.provider || '');
                  }}
                  className="w-full"
                >
                  <Plus size={18} className="mr-2" />
                  Add Entry
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Entry Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={`Add Entry: ${selectedItem?.name}`}
      >
        <form onSubmit={handleAddEntry} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity ({selectedItem?.unit})
            </label>
            <input
              type="number"
              step="any"
              required
              autoFocus
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g. 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provider
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Optional provider name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Optional note"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};