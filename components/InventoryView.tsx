import React, { useState, useMemo } from 'react';
import type { Product, Warehouse, InventoryItem } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface InventoryViewProps {
  products: Product[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  onUpdateStock: (item: InventoryItem) => void;
  onDownloadPdf: (warehouseId: string) => void;
  canUpdateStock: boolean;
  canExport: boolean;
}

const InventoryView: React.FC<InventoryViewProps> = ({ products, warehouses, inventory, onUpdateStock, onDownloadPdf, canUpdateStock, canExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  const filteredWarehouses = useMemo(() => {
    if (!searchTerm) return warehouses;
    
    const lowercasedFilter = searchTerm.toLowerCase();
    const productIdsInFilter = new Set(
      products.filter(p => p.name.toLowerCase().includes(lowercasedFilter) || p.sku.toLowerCase().includes(lowercasedFilter)).map(p => p.id)
    );
    
    return warehouses.filter(w => {
      const inventoryInWarehouse = inventory.filter(i => i.warehouseId === w.id);
      return inventoryInWarehouse.some(i => productIdsInFilter.has(i.productId));
    });

  }, [searchTerm, products, warehouses, inventory]);

  const getInventoryForWarehouse = (warehouseId: string) => {
    const items = inventory.filter(item => item.warehouseId === warehouseId);
    if (!searchTerm) return items;
    
    const lowercasedFilter = searchTerm.toLowerCase();
    return items.filter(item => {
        const product = productMap.get(item.productId);
        return product && (product.name.toLowerCase().includes(lowercasedFilter) || product.sku.toLowerCase().includes(lowercasedFilter));
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for products or SKUs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      {filteredWarehouses.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Results Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or add some inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map(warehouse => {
            const warehouseInventory = getInventoryForWarehouse(warehouse.id);
            if (warehouseInventory.length === 0 && searchTerm) return null;
            
            return (
              <div key={warehouse.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{`Reporte de Inventario: ${warehouse.name}`}</h3>
                  </div>
                  {canExport && (
                    <button onClick={() => onDownloadPdf(warehouse.id)} className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                      <DownloadIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  {warehouseInventory.length > 0 ? (
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                      <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700 sticky top-0 z-10">
                        <tr>
                          <th scope="col" className="px-4 py-3">Product</th>
                           <th scope="col" className="px-4 py-3">SKU</th>
                          <th scope="col" className="px-4 py-3 text-center">Qty</th>
                          <th scope="col" className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {warehouseInventory.map(item => {
                          const product = productMap.get(item.productId);
                          if (!product) return null;
                          return (
                            <tr key={item.productId} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                {product.name}
                              </td>
                              <td className="px-4 py-3">{product.sku}</td>
                              <td className="px-4 py-3 text-center">{item.quantity}</td>
                              <td className="px-4 py-3 text-right">
                                {canUpdateStock && (
                                  <button onClick={() => onUpdateStock(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                    <PencilIcon className="w-5 h-5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">No products in this warehouse.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryView;