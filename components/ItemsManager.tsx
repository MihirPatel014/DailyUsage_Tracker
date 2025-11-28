import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Item } from '../types';
import { Trash2, Edit2, Plus, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

export const ItemsManager: React.FC = () => {
  const items = useLiveQuery(() => db.items.toArray());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [rate, setRate] = useState('');
  const [provider, setProvider] = useState('');
  const [isRoutine, setIsRoutine] = useState(true);

  const openAddModal = () => {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setName(item.name);
    setUnit(item.unit);
    setRate(item.rate.toString());
    setProvider(item.provider || '');
    setIsRoutine(item.isRoutine);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setName('');
    setUnit('');
    setRate('');
    setProvider('');
    setIsRoutine(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      name,
      unit,
      rate: parseFloat(rate),
      provider,
      isRoutine,
      createdAt: editingItem ? editingItem.createdAt : Date.now()
    };

    if (editingItem && editingItem.id) {
      await db.items.update(editingItem.id, itemData);
    } else {
      await db.items.add(itemData as Item);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item? Logs will remain but the item will be gone.')) {
      await db.items.delete(id);
    }
  };

  return (
    <div className="space-y-6 pb-20">
       <header className="flex items-center justify-between">
         <h1 className="text-2xl font-bold">My Items</h1>
         <Button size="sm" onClick={openAddModal}>
           <Plus size={18} className="mr-1" />
           New Item
         </Button>
      </header>

      <div className="grid gap-4">
        {items?.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
             <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-x-2">
                   <span>{item.unit}</span>
                   <span>•</span>
                   <span>${item.rate} / unit</span>
                   {item.isRoutine && (
                     <>
                        <span>•</span>
                        <span className="text-green-600 dark:text-green-400 text-xs font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Routine</span>
                     </>
                   )}
                </div>
                {item.provider && <div className="text-xs text-gray-400 mt-1">Default Provider: {item.provider}</div>}
             </div>
             <div className="flex space-x-2">
               <button 
                 onClick={() => openEditModal(item)}
                 className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
               >
                 <Edit2 size={18} />
               </button>
               <button 
                 onClick={() => item.id && handleDelete(item.id)}
                 className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
               >
                 <Trash2 size={18} />
               </button>
             </div>
          </div>
        ))}
        {items?.length === 0 && (
          <div className="text-center py-10 text-gray-500">No items found. Create one to get started.</div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Item" : "Create New Item"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Name</label>
            <input 
              type="text" required value={name} onChange={e => setName(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g. Milk"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input 
                type="text" required value={unit} onChange={e => setUnit(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g. Liter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rate (per unit)</label>
              <input 
                type="number" step="any" required value={rate} onChange={e => setRate(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
             <label className="block text-sm font-medium mb-1">Default Provider (Optional)</label>
             <input 
               type="text" value={provider} onChange={e => setProvider(e.target.value)} 
               className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
               placeholder="e.g. Local Dairy"
             />
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
             <button 
               type="button"
               onClick={() => setIsRoutine(!isRoutine)}
               className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isRoutine ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-400 bg-white dark:bg-gray-700'}`}
             >
                {isRoutine && <Check size={14} />}
             </button>
             <div>
                <span className="block text-sm font-medium">Add to Daily Routine?</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">If checked, this item appears on your home dashboard.</span>
             </div>
          </div>
          <Button type="submit" className="w-full">
            {editingItem ? 'Update Item' : 'Create Item'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};