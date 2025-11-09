
import React, { useState, useMemo } from 'react';
import type { Product, Warehouse, InventoryItem, TransferItem } from '../types';
import AddTransferItemModal from './modals/AddTransferItemModal';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowRightLeftIcon } from './icons/ArrowRightLeftIcon';

interface MovementViewProps {
  products: Product[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  onSaveTransfer: (transferData: { destinationWarehouseId: string; items: TransferItem[] }) => void;
}

const MovementView: React.FC<MovementViewProps> = ({ products, warehouses, inventory, onSaveTransfer }) => {
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<string>('');
  const [items, setItems] = useState<TransferItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const warehouseMap = useMemo(() => new Map(warehouses.map(w => [w.id, w])), [warehouses]);

  const handleAddItem = (item: TransferItem) => {
    // Logic to prevent adding duplicate product from the same source, instead, suggest editing.
    const existingItem = items.find(i => i.productId === item.productId && i.sourceWarehouseId === item.sourceWarehouseId);
    if (existingItem) {
      alert("Este producto del mismo origen ya ha sido añadido. Por favor, elimínelo y vuelva a añadirlo con la cantidad correcta si desea modificarlo.");
      return;
    }
    setItems(prev => [...prev, item]);
    setIsModalOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!destinationWarehouseId) {
      alert('Por favor, seleccione un depósito de destino.');
      return;
    }
    if (items.some(item => item.sourceWarehouseId === destinationWarehouseId)) {
        alert('Un artículo no puede ser movido al mismo depósito del que proviene.');
        return;
    }
    if (items.length === 0) {
      alert('Por favor, añada al menos un artículo al movimiento.');
      return;
    }
    onSaveTransfer({ destinationWarehouseId, items });
    setDestinationWarehouseId('');
    setItems([]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ArrowRightLeftIcon className="w-7 h-7" />
            Nuevo Movimiento de Stock
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Transfiera productos de un depósito a otro.</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="destinationWarehouse" className="block text-sm font-medium text-slate-700 dark:text-slate-300">1. Seleccione el Depósito de Destino</label>
            <select
              id="destinationWarehouse"
              value={destinationWarehouseId}
              onChange={(e) => setDestinationWarehouseId(e.target.value)}
              className="mt-1 block w-full max-w-md px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
            >
              <option value="">-- Seleccionar Depósito --</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">2. Artículos a Mover</h3>
            <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                  <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th scope="col" className="px-4 py-3">Producto</th>
                      <th scope="col" className="px-4 py-3">Depósito Origen</th>
                      <th scope="col" className="px-4 py-3 text-center">Cantidad</th>
                      <th scope="col" className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? items.map((item, index) => (
                      <tr key={index} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{productMap.get(item.productId)?.name}</td>
                        <td className="px-4 py-3">{warehouseMap.get(item.sourceWarehouseId)?.name}</td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-500 dark:text-slate-400">No hay artículos en este movimiento.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
            >
              <PlusIcon className="w-4 h-4" />
              Añadir Artículo
            </button>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={items.length === 0 || !destinationWarehouseId}
          >
            Completar Movimiento
          </button>
        </div>
      </div>

      <AddTransferItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddItem={handleAddItem}
        products={products}
        warehouses={warehouses}
        inventory={inventory}
      />
    </div>
  );
};

export default MovementView;
