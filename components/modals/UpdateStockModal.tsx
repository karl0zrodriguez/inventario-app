
import React, { useState, useEffect } from 'react';
import type { Product, Warehouse } from '../../types';

interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quantity: number) => void;
  product: Product | undefined;
  warehouse: Warehouse | undefined;
  currentQuantity: number;
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({ isOpen, onClose, onSave, product, warehouse, currentQuantity }) => {
  const [quantity, setQuantity] = useState(currentQuantity);

  useEffect(() => {
    setQuantity(currentQuantity);
  }, [currentQuantity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm">
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Update Stock</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Product: <span className="font-semibold">{product?.name}</span></p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Warehouse: <span className="font-semibold">{warehouse?.name}</span></p>
                
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label>
                    <input 
                        type="number" 
                        name="quantity" 
                        id="quantity" 
                        value={quantity} 
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)} 
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white" 
                        required 
                    />
                </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Update Quantity</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStockModal;
