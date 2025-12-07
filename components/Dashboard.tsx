import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getCycleStartDate } from '../db';
import { Plus, Minus, ShoppingCart, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { Item } from '../types';

interface DashboardProps {
  onAddItemClick: () => void;
}

interface CartItem {
  item: Item;
  quantity: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddItemClick }) => {
  const [cycleStart, setCycleStart] = useState(getCycleStartDate());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Listen for cycle reset events
  useEffect(() => {
    const handleReset = () => setCycleStart(getCycleStartDate());
    window.addEventListener('cycle-reset', handleReset);
    return () => window.removeEventListener('cycle-reset', handleReset);
  }, []);

  const items = useLiveQuery(() => db.items.filter(item => item.isRoutine === true).toArray());
  // Fetch logs for the selected date specifically to show accurate daily stats
  // We keep the cycleStart logic if needed for other things, but for "Daily Progress" we probably want THAT day's progress.
  // However, the original code used cycleStart. If the user wants to see "Cycle Total", we should keep that.
  // But the label said "Today". Let's fetch logs for the selected date to match the "Daily Usage" expectation.
  // Or better, fetch BOTH? 
  // Let's assume the user wants to see stats for the selected date on the cards.
  const dateLogs = useLiveQuery(
    () => db.logs.where('date').equals(selectedDate).toArray(),
    [selectedDate]
  );

  // We can also fetch cycle logs if we want to show cycle totals, but for now let's focus on the day view
  // since the tool is "DailyusageTracker".

  const getItemStats = (itemId: number) => {
    if (!dateLogs) return { totalQty: 0, totalCost: 0 };
    return dateLogs
      .filter(l => l.itemId === itemId)
      .reduce((acc, log) => ({
        totalQty: acc.totalQty + log.quantity,
        totalCost: acc.totalCost + log.cost
      }), { totalQty: 0, totalCost: 0 });
  };

  const getCartQuantity = (itemId: number) => {
    const cartItem = cart.find(c => c.item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const incrementItem = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c =>
          c.item.id === item.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const decrementItem = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (!existing) return prev;

      if (existing.quantity <= 1) {
        return prev.filter(c => c.item.id !== item.id);
      }

      return prev.map(c =>
        c.item.id === item.id
          ? { ...c, quantity: c.quantity - 1 }
          : c
      );
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Use selectedDate for the log entry
    // Construct timestamp preserving current time but on selected date
    const [year, month, day] = selectedDate.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const now = new Date();
    targetDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

    const timestamp = targetDate.getTime();

    // Add all cart items to logs
    for (const cartItem of cart) {
      const cost = cartItem.quantity * cartItem.item.rate;
      await db.logs.add({
        itemId: cartItem.item.id!,
        date: selectedDate, // Use the selected date string
        timestamp,
        quantity: cartItem.quantity,
        cost,
        provider: cartItem.item.provider,
        note: `Added at ${now.toLocaleTimeString()}`
      });
    }

    // Clear cart
    setCart([]);
  };

  const getTotalCost = () => {
    return cart.reduce((total, cartItem) => {
      return total + (cartItem.quantity * cartItem.item.rate);
    }, 0);
  };

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d - 1);
    setSelectedDate(formatDateForInput(date));
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d + 1);
    setSelectedDate(formatDateForInput(date));
  };

  const formatDateForInput = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDisplayDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  if (!items) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="space-y-6 pb-32">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Daily Routine</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cycle started: {new Date(cycleStart).toLocaleDateString()}
          </p>
        </div>

        {/* Date Selection Box */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <div
              className="flex-1 text-center relative group cursor-pointer"
              onClick={() => {
                if (dateInputRef.current) {
                  const input = dateInputRef.current;
                  // Use robust fallback or modern API
                  // Cast to any to avoid TS assuming showPicker always exists (which makes else branch 'never')
                  if (typeof (input as any).showPicker === 'function') {
                    (input as any).showPicker();
                  } else {
                    input.focus();
                  }
                }
              }}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                {isToday ? 'Today' : getDisplayDate(selectedDate).toLocaleDateString(undefined, { weekday: 'long' })}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
                {getDisplayDate(selectedDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                <Calendar size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>

              {/* Invisible Date Input using modern showPicker API or fallback */}
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="absolute opacity-0 pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  width: 1,
                  height: 1,
                  zIndex: -1,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
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
        <div className="space-y-4">
          {/* Items List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {items.map(item => {
              const stats = getItemStats(item.id!);
              const cartQty = getCartQuantity(item.id!);

              return (
                <div key={item.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          {item.unit}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        ₹{item.rate}/{item.unit}
                      </div>

                      {/* Daily Progress */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {isToday ? 'Today:' : `${getDisplayDate(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}:`}
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalQty}</span>
                        <span className="text-xs text-gray-400">({item.unit}s)</span>
                        {stats.totalCost > 0 && (
                          <span className="text-xs text-gray-400 ml-1">• ₹{stats.totalCost.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    {/* +/- Controls */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => decrementItem(item)}
                          disabled={cartQty === 0}
                          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-800"
                        >
                          <Minus size={16} />
                        </button>

                        <div className="w-8 text-center font-mono font-bold text-gray-900 dark:text-gray-100">
                          {cartQty}
                        </div>

                        <button
                          onClick={() => incrementItem(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {cartQty > 0 && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                          In Cart
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50 dark:via-gray-900 to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  <span className="font-semibold">
                    {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="text-sm opacity-90">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 overflow-hidden">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {cart.map((cartItem, idx) => (
                      <div key={idx} className="text-sm opacity-90 whitespace-nowrap">
                        • {cartItem.item.name}: <b>{cartItem.quantity}</b>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right min-w-[100px]">
                  <div className="text-2xl font-bold">
                    ₹{getTotalCost().toFixed(2)}
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="mt-2 w-full bg-white text-blue-600 hover:bg-gray-100 border-none"
                    size="sm"
                  >
                    Save All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};