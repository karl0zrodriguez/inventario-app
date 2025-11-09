import React, { useState, useEffect } from 'react';
import type { Warehouse } from '../../types';

interface AddWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warehouse: Warehouse) => void;
  warehouseToEdit: Warehouse | null;
}

const AddWarehouseModal: React.FC<AddWarehouseModalProps> = ({ isOpen, onClose, onSave, warehouseToEdit }) => {
  const [warehouse, setWarehouse] = useState<Omit<Warehouse, 'id'>>({ name: '' });

  useEffect(() => {
    if (warehouseToEdit) {
      setWarehouse(warehouseToEdit);
    } else {
      setWarehouse({ name: '' });
    }
  }, [warehouseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWarehouse(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouse.name) {
        alert("Warehouse Name is required.");
        return;
    }
    onSave({ ...warehouse, id: warehouseToEdit?.id || `wh_${new Date().getTime()}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{warehouseToEdit ? 'Edit Warehouse' : 'Add New Warehouse'}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Warehouse Name</label>
                        <input type="text" name="name" id="name" value={warehouse.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white" required />
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Warehouse</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddWarehouseModal;