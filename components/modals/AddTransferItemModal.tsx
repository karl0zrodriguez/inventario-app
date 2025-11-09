
import React, { useState, useMemo, useEffect } from 'react';
import type { Product, Warehouse, InventoryItem, TransferItem } from '../../types';

interface AddTransferItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: TransferItem) => void;
  products: Product[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
}

const AddTransferItemModal: React.FC<AddTransferItemModalProps> = ({ isOpen, onClose, onAddItem, products, warehouses, inventory }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [availableQty, setAvailableQty] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen) {
        // Reset state on close
        setSelectedProductId('');
        setSourceWarehouseId('');
        setQuantity(1);
        setAvailableQty(0);
        setSearchTerm('');
    }
  }, [isOpen])

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Limit results for performance
  }, [searchTerm, products]);

  const availableWarehouses = useMemo(() => {
    if (!selectedProductId) return [];
    return inventory
      .filter(i => i.productId === selectedProductId && i.quantity > 0)
      .map(i => {
        const warehouse = warehouses.find(w => w.id === i.warehouseId);
        return { ...warehouse, id: i.warehouseId, name: warehouse?.name || 'Unknown', quantity: i.quantity };
      });
  }, [selectedProductId, inventory, warehouses]);

  useEffect(() => {
    if (sourceWarehouseId) {
      const inv = inventory.find(i => i.productId === selectedProductId && i.warehouseId === sourceWarehouseId);
      setAvailableQty(inv?.quantity || 0);
      setQuantity(1);
    } else {
      setAvailableQty(0);
      setQuantity(1);
    }
  }, [sourceWarehouseId, selectedProductId, inventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !sourceWarehouseId || quantity <= 0 || quantity > availableQty) {
      alert('Por favor, complete todos los campos correctamente y verifique la cantidad.');
      return;
    }
    onAddItem({ productId: selectedProductId, sourceWarehouseId, quantity });
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Añadir Artículo al Movimiento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Buscar Producto</label>
                {selectedProduct ? (
                     <div className="mt-1 flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                        <span>{selectedProduct.name} ({selectedProduct.sku})</span>
                        <button type="button" onClick={() => { setSelectedProductId(''); setSearchTerm(''); }} className="text-sm text-red-500 hover:text-red-700">Cambiar</button>
                    </div>
                ) : (
                    <>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Escriba el nombre o SKU del producto"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm"
                        />
                        {filteredProducts.length > 0 && (
                            <ul className="mt-1 border border-slate-300 dark:border-slate-600 rounded-md max-h-40 overflow-y-auto">
                                {filteredProducts.map(p => (
                                    <li key={p.id} onClick={() => { setSelectedProductId(p.id); setSearchTerm(''); }} className="px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                                        {p.name} ({p.sku})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
              </div>

              {selectedProductId && (
                <div>
                  <label htmlFor="sourceWarehouse" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Depósito de Origen</label>
                  <select 
                    id="sourceWarehouse" 
                    value={sourceWarehouseId} 
                    onChange={e => setSourceWarehouseId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm"
                    required
                  >
                    <option value="">Seleccione un depósito</option>
                    {availableWarehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} (Disponible: {w.quantity})</option>
                    ))}
                  </select>
                </div>
              )}

              {sourceWarehouseId && (
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad a Mover</label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    min="1"
                    max={availableQty}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm"
                    required
                  />
                   <p className="text-xs text-slate-500 mt-1">Máximo disponible: {availableQty}</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700">Añadir Artículo</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransferItemModal;
