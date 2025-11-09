import React, { useState, useMemo } from 'react';
import type { StockTransfer, Product, Warehouse } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface MovementHistoryViewProps {
  transfers: StockTransfer[];
  products: Product[];
  warehouses: Warehouse[];
  onDeleteTransfer: (transferId: string) => void;
  onDownloadPdf: (transferId: string) => void;
  canDelete: boolean;
  canExport: boolean;
}

const MovementHistoryView: React.FC<MovementHistoryViewProps> = ({ transfers, products, warehouses, onDeleteTransfer, onDownloadPdf, canDelete, canExport }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const warehouseMap = useMemo(() => new Map(warehouses.map(w => [w.id, w])), [warehouses]);
  
  const sortedTransfers = useMemo(() => {
    return [...transfers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transfers]);
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (transfers.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No hay movimientos registrados</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Vaya a la pestaña 'Movimientos' para crear una nueva transferencia de stock.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-4">
        {sortedTransfers.map(transfer => {
          const destinationWarehouse = warehouseMap.get(transfer.destinationWarehouseId);
          const isExpanded = expandedId === transfer.id;
          
          return (
            <div key={transfer.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 flex justify-between items-center">
                <div 
                  className="flex-grow cursor-pointer"
                  onClick={() => toggleExpand(transfer.id)}
                >
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Movimiento a: <span className="text-indigo-600 dark:text-indigo-400">{destinationWarehouse?.name}</span>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(transfer.date).toLocaleString()} &bull; {transfer.items.length} tipo(s) de producto
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    {canExport && (
                      <button
                          onClick={() => onDownloadPdf(transfer.id)}
                          className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                          aria-label="Download movement slip"
                      >
                          <DownloadIcon className="w-5 h-5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                          onClick={() => onDeleteTransfer(transfer.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-slate-700"
                          aria-label="Delete movement"
                      >
                          <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                        onClick={() => toggleExpand(transfer.id)}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-expanded={isExpanded}
                        aria-controls={`transfer-details-${transfer.id}`}
                    >
                        <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
              </div>
              
              {isExpanded && (
                <div id={`transfer-details-${transfer.id}`} className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Detalles del Movimiento:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                      <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase">
                        <tr>
                          <th className="py-2 px-3">Producto</th>
                          <th className="py-2 px-3">Desde Depósito</th>
                          <th className="py-2 px-3 text-right">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfer.items.map((item, index) => {
                          const product = productMap.get(item.productId);
                          const sourceWarehouse = warehouseMap.get(item.sourceWarehouseId);
                          return (
                            <tr key={index} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                              <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{product?.name || 'Producto Desconocido'}</td>
                              <td className="py-2 px-3">{sourceWarehouse?.name || 'Depósito Desconocido'}</td>
                              <td className="py-2 px-3 text-right">{item.quantity}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MovementHistoryView;