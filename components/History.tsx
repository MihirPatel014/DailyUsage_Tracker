import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Log, Item } from '../types';
import { Calendar, Trash2 } from 'lucide-react';

export const History: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const logs = useLiveQuery(() => db.logs.orderBy('timestamp').reverse().toArray());
  const items = useLiveQuery(() => db.items.toArray());

  const itemMap = React.useMemo(() => {
    const map = new Map<number, Item>();
    items?.forEach(i => i.id && map.set(i.id, i));
    return map;
  }, [items]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await db.logs.delete(id);
    }
  };

  // Filter logs by date range
  const filteredLogs = React.useMemo(() => {
    if (!logs) return [];

    return logs.filter(log => {
      if (startDate && log.date < startDate) return false;
      if (endDate && log.date > endDate) return false;
      return true;
    });
  }, [logs, startDate, endDate]);

  // Group logs by date
  const groupedLogs = React.useMemo(() => {
    if (!filteredLogs) return {};
    return filteredLogs.reduce((groups, log) => {
      const date = log.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
      return groups;
    }, {} as Record<string, Log[]>);
  }, [filteredLogs]);

  if (!logs) return <div className="p-4 text-center">Loading history...</div>;

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold mb-4">History</h1>

        {/* Date Filter */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter History</span>
          </div>

          <div className="space-y-4">
            {/* Month Selector */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Quick Select Month</label>
              <input
                type="month"
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [year, month] = e.target.value.split('-').map(Number);
                  const lastDay = new Date(year, month, 0).getDate();
                  setStartDate(`${year}-${String(month).padStart(2, '0')}-01`);
                  setEndDate(`${year}-${String(month).padStart(2, '0')}-${lastDay}`);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white dark:bg-gray-800 text-xs text-gray-500">or custom range</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {(startDate || endDate) && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
              <span>Showing {filteredLogs.length} of {logs.length} records</span>
              {startDate && endDate && (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {Object.keys(groupedLogs).length === 0 ? (
        <div className="text-center py-10 text-gray-500">No history available yet.</div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedLogs).map(date => (
            <div key={date}>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-gray-50 dark:bg-gray-900 py-2">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {groupedLogs[date].map(log => {
                  const item = itemMap.get(log.itemId);
                  return (
                    <div key={log.id} className="p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item ? item.name : 'Unknown Item'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.provider && <span className="mr-2">{log.provider}</span>}
                          {log.note && <span className="italic text-gray-400">"{log.note}"</span>}
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          {log.quantity} {item?.unit}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ₹{log.cost.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => log.id && handleDelete(log.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};