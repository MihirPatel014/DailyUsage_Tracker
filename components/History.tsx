import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Log, Item } from '../types';

export const History: React.FC = () => {
  const logs = useLiveQuery(() => db.logs.orderBy('timestamp').reverse().toArray());
  const items = useLiveQuery(() => db.items.toArray());
  
  const itemMap = React.useMemo(() => {
    const map = new Map<number, Item>();
    items?.forEach(i => i.id && map.set(i.id, i));
    return map;
  }, [items]);

  // Group logs by date
  const groupedLogs = React.useMemo(() => {
    if (!logs) return {};
    return logs.reduce((groups, log) => {
      const date = log.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
      return groups;
    }, {} as Record<string, Log[]>);
  }, [logs]);

  if (!logs) return <div className="p-4 text-center">Loading history...</div>;

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold">History</h1>
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
                         <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item ? item.name : 'Unknown Item'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {log.provider && <span className="mr-2">{log.provider}</span>}
                              {log.note && <span className="italic text-gray-400">"{log.note}"</span>}
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                              {log.quantity} {item?.unit}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ${log.cost.toFixed(2)}
                            </div>
                         </div>
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