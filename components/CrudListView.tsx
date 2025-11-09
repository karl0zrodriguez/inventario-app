import React from 'react';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface CrudListViewProps<T extends { id: string; name: string; }> {
  items: T[];
  columns: Column<T>[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  itemType: string;
  canEdit: boolean;
  canDelete: boolean;
}

const CrudListView = <T extends { id: string; name: string; },>({
  items,
  columns,
  onEdit,
  onDelete,
  itemType,
  canEdit,
  canDelete
}: CrudListViewProps<T>) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {items.length > 0 ? (
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                <tr>
                  {columns.map(col => (
                    <th key={String(col.key)} scope="col" className="px-6 py-3">{col.header}</th>
                  ))}
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                    {columns.map(col => (
                      <td key={`${item.id}-${String(col.key)}`} className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {col.render ? col.render(item) : String(item[col.key])}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right flex justify-end gap-4">
                      {canEdit && (
                        <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No {itemType}s Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Click the button in the header to add a new {itemType}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrudListView;