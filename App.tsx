import React, { useState, useEffect, useCallback } from 'react';
import type { Product, Warehouse, InventoryItem, ViewType, StockTransfer, TransferItem, User, Role, PermissionAction } from './types';
import Header from './components/Header';
import AddProductModal from './components/modals/AddProductModal';
import AddWarehouseModal from './components/modals/AddWarehouseModal';
import AddUserModal from './components/modals/AddUserModal';
import AddRoleModal from './components/modals/AddRoleModal';
import UpdateStockModal from './components/modals/UpdateStockModal';
import InventoryView from './components/InventoryView';
import CrudListView from './components/CrudListView';
import MovementView from './components/MovementView';
import MovementHistoryView from './components/MovementHistoryView';
import ImportModal from './components/modals/ImportModal';
import LoginView from './components/LoginView';
import Toast from './components/Toast';
import ConfirmModal from './components/modals/ConfirmModal';


// Mock Data
const initialProducts: Product[] = [
  { id: 'prod_1', name: 'Heavy Duty Wrench', sku: 'HDW-001', price: 49.99 },
  { id: 'prod_2', name: 'Precision Screwdriver Set', sku: 'PSS-002', price: 24.50 },
  { id: 'prod_3', name: 'LED Headlamp', sku: 'LED-003', price: 35.00 },
];

const initialWarehouses: Warehouse[] = [
  { id: 'wh_1', name: 'Main Distribution Center' },
  { id: 'wh_2', name: 'West Coast Hub' },
];

const initialInventory: InventoryItem[] = [
  { productId: 'prod_1', warehouseId: 'wh_1', quantity: 150 },
  { productId: 'prod_2', warehouseId: 'wh_1', quantity: 300 },
  { productId: 'prod_1', warehouseId: 'wh_2', quantity: 75 },
  { productId: 'prod_3', warehouseId: 'wh_2', quantity: 200 },
];

const initialRoles: Role[] = [
    { 
        id: 'role_admin', 
        name: 'Admin', 
        permissions: [
            { module: 'inventory', actions: ['read', 'update', 'export'] },
            { module: 'products', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'warehouses', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'movements', actions: ['create', 'read'] },
            { module: 'movementHistory', actions: ['read', 'delete', 'export'] },
            { module: 'admin', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'reports', actions: ['read', 'export'] },
            { module: 'import', actions: ['create'] },
            { module: 'reset', actions: ['delete'] },
        ]
    },
    { 
        id: 'role_manager', 
        name: 'Manager', 
        permissions: [
            { module: 'inventory', actions: ['read', 'update', 'export'] },
            { module: 'products', actions: ['create', 'read', 'update'] },
            { module: 'warehouses', actions: ['create', 'read', 'update'] },
            { module: 'movements', actions: ['create', 'read'] },
            { module: 'movementHistory', actions: ['read', 'export'] },
            { module: 'reports', actions: ['read', 'export'] },
        ]
    },
    { 
        id: 'role_operator', 
        name: 'Operator', 
        permissions: [
            { module: 'inventory', actions: ['read', 'export'] },
            { module: 'movements', actions: ['create', 'read'] },
            { module: 'movementHistory', actions: ['read', 'export'] },
            { module: 'reports', actions: ['read', 'export'] },
        ]
    },
];

const initialUsers: User[] = [
    { id: 'user_1', name: 'Admin User', roleId: 'role_admin' },
    { id: 'user_2', name: 'Manager User', roleId: 'role_manager' },
    { id: 'user_3', name: 'Operator User', roleId: 'role_operator' },
];

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// Type declarations for window-scoped libraries
declare global {
    interface Window {
        jspdf: any;
    }
}

/**
 * A robust CSV line parser that handles commas within single-quoted fields.
 * This implementation assumes quotes are only for enclosing fields and strips them.
 */
const parseCsvLine = (line: string): string[] => {
    const parts: string[] = [];
    let currentPart = '';
    let inQuotes = false;
    for (const char of line) {
        if (char === "'") {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            parts.push(currentPart.trim());
            currentPart = '';
        } else {
            currentPart += char;
        }
    }
    parts.push(currentPart.trim());
    return parts;
};

const roleColors: { [key: string]: string } = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  operator: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  default: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
};


const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentView, setCurrentView] = useState<ViewType>('inventory');
  const [adminSubView, setAdminSubView] = useState<'users' | 'roles'>('users');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [warehouseToEdit, setWarehouseToEdit] = useState<Warehouse | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockToUpdate, setStockToUpdate] = useState<InventoryItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState({ title: '', message: '' });

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = new Date().getTime();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const hasPermission = useCallback((module: ViewType | 'reports' | 'import' | 'reset', action: PermissionAction): boolean => {
    if (!currentUser) return false;
    const userRole = roles.find(r => r.id === currentUser.roleId);
    if (!userRole) return false;
    const permission = userRole.permissions.find(p => p.module === module);
    if (!permission) return false;
    return permission.actions.includes(action);
  }, [currentUser, roles]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const tempHasPermission = (module: ViewType) => {
        const userRole = initialRoles.find(r => r.id === user.roleId);
        return userRole?.permissions.some(p => p.module === module && p.actions.includes('read'));
    };
    if (tempHasPermission('inventory')) {
        setCurrentView('inventory');
    } else if (tempHasPermission('movements')) {
        setCurrentView('movements');
    } else if (tempHasPermission('movementHistory')) {
        setCurrentView('movementHistory');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('inventory');
  };
  
  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === product.id);
      if (index > -1) {
        const newProducts = [...prev];
        newProducts[index] = product;
        addToast('Producto actualizado correctamente.', 'success');
        return newProducts;
      }
      addToast('Producto creado correctamente.', 'success');
      return [...prev, product];
    });
    setProductToEdit(null);
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    setConfirmMessage({
        title: 'Eliminar Producto',
        message: '¿Está seguro de que desea eliminar este producto? Esta acción también eliminará todos sus registros de inventario y no se puede deshacer.'
    });
    setConfirmAction(() => () => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        setInventory(prev => prev.filter(i => i.productId !== productId));
        addToast('Producto eliminado.', 'success');
    });
    setIsConfirmModalOpen(true);
  };

  const handleSaveWarehouse = (warehouse: Warehouse) => {
    setWarehouses(prev => {
      const index = prev.findIndex(w => w.id === warehouse.id);
      if (index > -1) {
        const newWarehouses = [...prev];
        newWarehouses[index] = warehouse;
        addToast('Depósito actualizado correctamente.', 'success');
        return newWarehouses;
      }
      addToast('Depósito creado correctamente.', 'success');
      return [...prev, warehouse];
    });
    setWarehouseToEdit(null);
    setIsWarehouseModalOpen(false);
  };

  const handleDeleteWarehouse = (warehouseId: string) => {
     setConfirmMessage({
        title: 'Eliminar Depósito',
        message: '¿Está seguro de que desea eliminar este depósito? Esta acción también eliminará todos sus registros de inventario y no se puede deshacer.'
    });
    setConfirmAction(() => () => {
        setWarehouses(prev => prev.filter(w => w.id !== warehouseId));
        setInventory(prev => prev.filter(i => i.warehouseId !== warehouseId));
        addToast('Depósito eliminado.', 'success');
    });
    setIsConfirmModalOpen(true);
  };

  const handleSaveUser = (user: User) => {
    setUsers(prev => {
      const index = prev.findIndex(u => u.id === user.id);
      if (index > -1) {
        const newUsers = [...prev];
        newUsers[index] = user;
        addToast('Usuario actualizado correctamente.', 'success');
        return newUsers;
      }
      addToast('Usuario creado correctamente.', 'success');
      return [...prev, user];
    });
    setUserToEdit(null);
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
        addToast('No se puede eliminar el usuario actual.', 'error');
        return;
    }
     setConfirmMessage({
        title: 'Eliminar Usuario',
        message: '¿Está seguro de que desea eliminar este usuario?'
    });
    setConfirmAction(() => () => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        addToast('Usuario eliminado.', 'success');
    });
    setIsConfirmModalOpen(true);
  };

  const handleSaveRole = (role: Role) => {
    setRoles(prev => {
        const index = prev.findIndex(r => r.id === role.id);
        if (index > -1) {
            const newRoles = [...prev];
            newRoles[index] = role;
            addToast('Rol actualizado correctamente.', 'success');
            return newRoles;
        }
        addToast('Rol creado correctamente.', 'success');
        return [...prev, role];
    });
    setRoleToEdit(null);
    setIsRoleModalOpen(false);
  };

  const handleDeleteRole = (roleId: string) => {
    if (users.some(u => u.roleId === roleId)) {
        addToast('No se puede eliminar un rol en uso.', 'error');
        return;
    }
     setConfirmMessage({
        title: 'Eliminar Rol',
        message: '¿Está seguro de que desea eliminar este rol?'
    });
    setConfirmAction(() => () => {
        setRoles(prev => prev.filter(r => r.id !== roleId));
        addToast('Rol eliminado.', 'success');
    });
    setIsConfirmModalOpen(true);
  };
  
  const handleUpdateStock = (quantity: number) => {
    if (!stockToUpdate) return;
    setInventory(prev => {
      const index = prev.findIndex(i => i.productId === stockToUpdate.productId && i.warehouseId === stockToUpdate.warehouseId);
      if (index > -1) {
        const newInventory = [...prev];
        newInventory[index] = { ...newInventory[index], quantity };
        return newInventory;
      }
      return [...prev, { ...stockToUpdate, quantity }];
    });
    addToast('Stock actualizado.', 'success');
    setIsStockModalOpen(false);
    setStockToUpdate(null);
  };

  const handleSaveTransfer = (transferData: { destinationWarehouseId: string; items: TransferItem[] }) => {
    setInventory(currentInventory => {
      const inventoryMap = new Map<string, InventoryItem>();
      currentInventory.forEach(item => {
        inventoryMap.set(`${item.productId}|${item.warehouseId}`, { ...item });
      });

      for (const item of transferData.items) {
        const sourceKey = `${item.productId}|${item.sourceWarehouseId}`;
        const sourceItem = inventoryMap.get(sourceKey);

        if (sourceItem && sourceItem.quantity >= item.quantity) {
          sourceItem.quantity -= item.quantity;
        } else {
          console.error("Insufficient stock or source item not found:", item);
          addToast("Error: Inventario insuficiente. La transferencia ha fallado.", 'error');
          return currentInventory; 
        }

        const destKey = `${item.productId}|${transferData.destinationWarehouseId}`;
        const destItem = inventoryMap.get(destKey);
        if (destItem) {
          destItem.quantity += item.quantity;
        } else {
          inventoryMap.set(destKey, {
            productId: item.productId,
            warehouseId: transferData.destinationWarehouseId,
            quantity: item.quantity,
          });
        }
      }
      return Array.from(inventoryMap.values());
    });

    const newTransfer: StockTransfer = {
        id: `mv_${new Date().getTime()}`,
        date: new Date().toISOString(),
        destinationWarehouseId: transferData.destinationWarehouseId,
        items: transferData.items,
        status: 'Completed',
    };
    setStockTransfers(prev => [...prev, newTransfer]);
    addToast('Movimiento de stock completado con éxito!', 'success');
  };

  const handleImportData = (csvData: string) => {
    try {
        const lines = csvData.trim().split('\n');
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const expectedHeader = ['codigo', 'nombre_del_producto', 'cantidad', 'deposito', 'precio'];
        
        if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) {
            throw new Error(`La cabecera del CSV es incorrecta. Se esperaba: ${expectedHeader.join(',')}`);
        }

        const dataLines = lines.slice(1);
        if (dataLines.length === 0) {
        throw new Error("El archivo CSV está vacío o solo contiene la cabecera.");
        }

        let updatedProducts: Product[] = [];
        let updatedWarehouses: Warehouse[] = [];
        let updatedInventory: InventoryItem[] = [];

        setProducts(prevProducts => {
            updatedProducts = [...prevProducts];
            setWarehouses(prevWarehouses => {
                updatedWarehouses = [...prevWarehouses];
                setInventory(prevInventory => {
                    const inventoryMap = new Map<string, number>();
                    prevInventory.forEach(item => {
                        inventoryMap.set(`${item.productId}|${item.warehouseId}`, item.quantity);
                    });

                    for (let i = 0; i < dataLines.length; i++) {
                        const line = dataLines[i];
                        if (!line.trim()) continue;

                        const parts = parseCsvLine(line);

                        if (parts.length !== 5) {
                            throw new Error(`Error en la fila ${i + 2}: Se esperaban 5 columnas, pero se encontraron ${parts.length}.`);
                        }
                        
                        const [sku, name, quantityStr, warehouseName, priceStr] = parts;

                        const quantity = parseInt(quantityStr, 10);
                        const price = parseFloat(priceStr.replace(',', '.'));
                        
                        if (!sku || !name || !warehouseName) {
                            throw new Error(`Error en la fila ${i + 2}: El código, nombre y depósito no pueden estar vacíos.`);
                        }

                        if (isNaN(quantity) || quantity < 0) {
                            throw new Error(`Error en la fila ${i + 2}: La cantidad '${quantityStr}' no es un número válido.`);
                        }
                        
                        if (isNaN(price) || price < 0) {
                            throw new Error(`Error en la fila ${i + 2}: El precio '${priceStr}' no es un número válido.`);
                        }

                        let product: Product | undefined;
                        const productIndex = updatedProducts.findIndex(p => p.sku.toLowerCase() === sku.toLowerCase());
                        
                        if (productIndex > -1) {
                            updatedProducts[productIndex] = { ...updatedProducts[productIndex], name, price };
                            product = updatedProducts[productIndex];
                        } else {
                            product = {
                            id: `prod_${new Date().getTime()}_${i}`,
                            sku: sku,
                            name: name,
                            price: price,
                            };
                            updatedProducts.push(product);
                        }

                        let warehouse = updatedWarehouses.find(w => w.name.toLowerCase() === warehouseName.toLowerCase());
                        if (!warehouse) {
                            warehouse = {
                            id: `wh_${new Date().getTime()}_${i}`,
                            name: warehouseName,
                            };
                            updatedWarehouses.push(warehouse);
                        }
                        
                        const inventoryKey = `${product.id}|${warehouse.id}`;
                        const currentQuantity = inventoryMap.get(inventoryKey) || 0;
                        inventoryMap.set(inventoryKey, currentQuantity + quantity);
                    }
                    
                    updatedInventory = Array.from(inventoryMap.entries()).map(([key, quantity]) => {
                        const [productId, warehouseId] = key.split('|');
                        return { productId, warehouseId, quantity };
                    });

                    return updatedInventory;
                });
                return updatedWarehouses;
            });
            return updatedProducts;
        });
        
        addToast(`¡Importación completada con éxito! Se procesaron ${dataLines.length} registros.`, 'success');
        setIsImportModalOpen(false);
    } catch (error: any) {
        addToast(error.message, 'error');
        throw error; // Re-throw to be caught by the modal
    }
  };

  const handleDeleteTransfer = (transferId: string) => {
    setConfirmMessage({
        title: 'Eliminar Movimiento',
        message: '¿Está seguro de que desea eliminar este registro de movimiento? Esta acción no se puede deshacer.'
    });
    setConfirmAction(() => () => {
        setStockTransfers(prev => prev.filter(t => t.id !== transferId));
        addToast('Movimiento eliminado.', 'success');
    });
    setIsConfirmModalOpen(true);
  };

  const handleRequestReset = () => {
    setIsConfirmingReset(true);
  };
  
  const handleCancelReset = () => {
    setIsConfirmingReset(false);
  };

  const handleConfirmReset = () => {
    setProducts([]);
    setWarehouses([]);
    setInventory([]);
    setStockTransfers([]);
    setIsConfirmingReset(false);
    addToast('Todos los datos han sido reseteados.', 'success');
  };
  
  const handleConfirmDelete = () => {
    if (confirmAction) {
        confirmAction();
    }
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  };

  const escapeCsvField = (field: any): string => {
    const stringField = String(field);
    if (stringField.includes(',')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };
  
  const downloadCsv = (content: string, filename: string) => {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  };

  const handleExportProducts = () => {
    const productStockMap = inventory.reduce<Record<string, number>>((acc, item) => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
        return acc;
    }, {});
    
    const headers = ['sku', 'name', 'price', 'totalStock'];
    const rows = products.map(p => [
      escapeCsvField(p.sku),
      escapeCsvField(p.name),
      escapeCsvField(p.price),
      escapeCsvField(productStockMap[p.id] || 0),
    ].join(','));
  
    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCsv(csvContent, `productos_${new Date().toISOString().slice(0,10)}.csv`);
  };
  
  const handleExportInventory = () => {
    const productMap = new Map<string, Product>(products.map(p => [p.id, p]));
    const warehouseMap = new Map<string, Warehouse>(warehouses.map(w => [w.id, w]));

    const headers = ['warehouseName', 'productSKU', 'productName', 'quantity'];
    const rows = inventory.map(item => {
        const product = productMap.get(item.productId);
        const warehouse = warehouseMap.get(item.warehouseId);
        return [
            escapeCsvField(warehouse?.name || 'Unknown'),
            escapeCsvField(product?.sku || 'Unknown'),
            escapeCsvField(product?.name || 'Unknown'),
            escapeCsvField(item.quantity)
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCsv(csvContent, `inventario_completo_${new Date().toISOString().slice(0,10)}.csv`);
  };
  
  const handleDownloadWarehousePdf = async (warehouseId: string) => {
    setIsGeneratingPdf(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
        const warehouse = warehouses.find(w => w.id === warehouseId);
        if (!warehouse) throw new Error("Warehouse not found");

        const productMap = new Map<string, Product>(products.map(p => [p.id, p]));
        const warehouseInventory = inventory.filter(item => item.warehouseId === warehouseId);
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.setFontSize(18);
        pdf.text("Reporte de Inventario", 14, 22);
        pdf.setFontSize(11);
        pdf.text(`Depósito: ${warehouse.name}`, 14, 32);
        pdf.text(`Fecha: ${new Date().toLocaleString()}`, 14, 38);
        
        const tableData = warehouseInventory
          .map(item => {
            const product = productMap.get(item.productId);
            return {
              sku: product?.sku || 'N/A',
              name: product?.name || 'Producto Desconocido',
              quantity: item.quantity
            };
          })
          .sort((a, b) => a.sku.localeCompare(b.sku));
        
        (pdf as any).autoTable({
            columns: [
              { header: "SKU", dataKey: "sku" },
              { header: "Producto", dataKey: "name" },
              { header: "Cantidad", dataKey: "quantity" },
            ],
            body: tableData,
            startY: 50,
            theme: 'grid',
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255],
            },
            styles: {
                fontSize: 7,
                cellPadding: 1,
                textColor: [0, 0, 0],
            },
        });
        
        pdf.save(`reporte-inventario-${warehouse.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error: any) {
        console.error("Error generating warehouse PDF:", error);
        addToast("Hubo un error al generar el PDF del inventario.", 'error');
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const handleDownloadTransferPdf = async (transferId: string) => {
    const transfer = stockTransfers.find(t => t.id === transferId);
    if (!transfer) {
      console.error("Transfer not found for PDF generation");
      addToast("No se encontró el movimiento para generar el PDF.", 'error');
      return;
    }

    setIsGeneratingPdf(true);
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const productMap = new Map<string, Product>(products.map(p => [p.id, p]));
      const warehouseMap = new Map<string, Warehouse>(warehouses.map(w => [w.id, w]));
      const destinationWarehouse = warehouseMap.get(transfer.destinationWarehouseId);

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();

      pdf.setFontSize(18);
      pdf.text("Comprobante de Movimiento de Stock", pdf.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

      pdf.setFontSize(10);
      pdf.text(`ID de Movimiento: ${transfer.id}`, 14, 32);
      pdf.text(`Fecha: ${new Date(transfer.date).toLocaleString()}`, 14, 38);
      pdf.text(`Depósito de Destino: ${destinationWarehouse?.name || 'Desconocido'}`, pdf.internal.pageSize.getWidth() - 14, 32, { align: 'right' });

      const tableData = transfer.items.map(item => {
        const product = productMap.get(item.productId);
        const sourceWarehouse = warehouseMap.get(item.sourceWarehouseId);
        return {
          sku: product?.sku || 'N/A',
          name: product?.name || 'Producto Desconocido',
          source: sourceWarehouse?.name || 'Depósito Desconocido',
          quantity: item.quantity.toString()
        };
      });

      (pdf as any).autoTable({
        columns: [
          { header: "SKU", dataKey: "sku" },
          { header: "Producto", dataKey: "name" },
          { header: "Desde Depósito", dataKey: "source" },
          { header: "Cantidad", dataKey: "quantity" },
        ],
        body: tableData,
        startY: 50,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [255, 255, 255],
        },
        styles: {
            fontSize: 7,
            cellPadding: 1,
            textColor: [0, 0, 0],
        },
        didDrawPage: (data: any) => {
          if (data.pageNumber === data.pageCount) {
            const pageHeight = pdf.internal.pageSize.getHeight();
            const finalY = data.cursor.y;
            const signatureY = Math.max(finalY + 30, pageHeight - 60);

            pdf.setFontSize(10);
            const halfWidth = pdf.internal.pageSize.getWidth() / 2;
            
            pdf.text("Entregado por:", halfWidth / 2, signatureY + 10, { align: 'center' });
            pdf.line(halfWidth * 0.25, signatureY, halfWidth * 0.75, signatureY);
            pdf.text("(Firma y Nombre)", halfWidth / 2, signatureY + 20, { align: 'center' });
            
            pdf.text("Recibido por:", halfWidth + halfWidth / 2, signatureY + 10, { align: 'center' });
            pdf.line(halfWidth + halfWidth * 0.25, signatureY, halfWidth + halfWidth * 0.75, signatureY);
            pdf.text("(Firma y Nombre)", halfWidth + halfWidth / 2, signatureY + 20, { align: 'center' });
          }
        }
      });
      
      pdf.save(`comprobante-movimiento-${transfer.id}.pdf`);
    } catch (error: any) {
      console.error("Error generating transfer PDF:", error);
      addToast("Hubo un error al generar el PDF del comprobante.", 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const openProductModal = (product: Product | null) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const openWarehouseModal = (warehouse: Warehouse | null) => {
    setWarehouseToEdit(warehouse);
    setIsWarehouseModalOpen(true);
  };

  const openUserModal = (user: User | null) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };
  
  const openRoleModal = (role: Role | null) => {
    setRoleToEdit(role);
    setIsRoleModalOpen(true);
  };
  
  const openStockModal = (item: InventoryItem) => {
    setStockToUpdate(item);
    setIsStockModalOpen(true);
  }

  const renderAdminView = () => {
    const roleMap = new Map<string, Role>(roles.map(r => [r.id, r]));

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                <button
                    onClick={() => setAdminSubView('users')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${adminSubView === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    Gestionar Usuarios
                </button>
                <button
                    onClick={() => setAdminSubView('roles')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${adminSubView === 'roles' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    Gestionar Roles
                </button>
            </div>
            {adminSubView === 'users' ? (
                <CrudListView<User>
                    items={users}
                    columns={[
                        { key: 'name', header: 'Name' },
                        { 
                            key: 'roleId', 
                            header: 'Role',
                            render: (user) => {
                                const role = roleMap.get(user.roleId);
                                const roleName = role?.name.toLowerCase() || 'default';
                                return (
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleColors[roleName] || roleColors.default}`}>
                                        {role?.name || 'No Role'}
                                    </span>
                                )
                            }
                        }
                    ]}
                    onEdit={(u) => openUserModal(u)}
                    onDelete={handleDeleteUser}
                    itemType="user"
                    canEdit={hasPermission('admin', 'update')}
                    canDelete={hasPermission('admin', 'delete')}
                />
            ) : (
                <CrudListView<Role>
                    items={roles}
                    columns={[
                        { key: 'name', header: 'Role Name' }
                    ]}
                    onEdit={(r) => openRoleModal(r)}
                    onDelete={handleDeleteRole}
                    itemType="role"
                    canEdit={hasPermission('admin', 'update')}
                    canDelete={hasPermission('admin', 'delete')}
                />
            )}
        </div>
    );
  };

  const renderView = () => {
    if (!currentUser) return null;
    
    switch(currentView) {
      case 'admin': 
        return hasPermission('admin', 'read') ? renderAdminView() : null;
      
      case 'movementHistory':
        return hasPermission('movementHistory', 'read') ? <MovementHistoryView 
          transfers={stockTransfers}
          products={products}
          warehouses={warehouses}
          onDeleteTransfer={handleDeleteTransfer}
          onDownloadPdf={handleDownloadTransferPdf}
          canDelete={hasPermission('movementHistory', 'delete')}
          canExport={hasPermission('movementHistory', 'export')}
        /> : null;
      
      case 'movements':
        return hasPermission('movements', 'read') ? <MovementView
          products={products}
          warehouses={warehouses}
          inventory={inventory}
          onSaveTransfer={handleSaveTransfer}
        /> : null;
      
      case 'products': {
        if (!hasPermission('products', 'read')) return null;

        const productStockMap = inventory.reduce<Record<string, number>>((acc, item) => {
          acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
          return acc;
        }, {});

        const productsWithStock = products.map(product => ({
          ...product,
          totalStock: productStockMap[product.id] || 0,
        }));
        
        return <CrudListView<Product & { totalStock: number }>
          items={productsWithStock}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'sku', header: 'SKU' },
            { key: 'price', header: 'Price' },
            { key: 'totalStock', header: 'EXISTENCIA' }
          ]}
          onEdit={(p) => openProductModal(p)}
          onDelete={handleDeleteProduct}
          itemType="product"
          canEdit={hasPermission('products', 'update')}
          canDelete={hasPermission('products', 'delete')}
        />;
      }
      case 'warehouses':
        if (!hasPermission('warehouses', 'read')) return null;

        return <CrudListView<Warehouse>
          items={warehouses}
          columns={[
            { key: 'name', header: 'Name' }
          ]}
          onEdit={(w) => openWarehouseModal(w)}
          onDelete={handleDeleteWarehouse}
          itemType="warehouse"
          canEdit={hasPermission('warehouses', 'update')}
          canDelete={hasPermission('warehouses', 'delete')}
        />;
      
      case 'inventory':
      default:
        return hasPermission('inventory', 'read') ? <InventoryView 
                  products={products} 
                  warehouses={warehouses} 
                  inventory={inventory} 
                  onUpdateStock={openStockModal}
                  onDownloadPdf={handleDownloadWarehousePdf}
                  canUpdateStock={hasPermission('inventory', 'update')}
                  canExport={hasPermission('inventory', 'export')}
                /> : null;
    }
  };
  
  if (!currentUser) {
    return <LoginView users={users} onLogin={handleLogin} roles={roles} />;
  }
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onAddProduct={() => openProductModal(null)}
        onAddWarehouse={() => openWarehouseModal(null)}
        onAddUser={() => openUserModal(null)}
        onAddRole={() => openRoleModal(null)}
        onImport={() => setIsImportModalOpen(true)}
        onResetAllData={handleRequestReset}
        onExportProducts={handleExportProducts}
        onExportInventory={handleExportInventory}
        currentUser={currentUser}
        onLogout={handleLogout}
        hasPermission={hasPermission}
        roles={roles}
      />
      
      {isGeneratingPdf && (
        <div className="no-print fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl flex items-center gap-4">
                <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg font-medium text-slate-800 dark:text-slate-200">Generando PDF...</span>
            </div>
        </div>
      )}


      {isConfirmingReset && (
        <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 max-w-7xl mx-auto my-4 rounded-r-lg shadow-md no-print" role="alert">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <p className="font-bold">Confirmar reseteo de datos</p>
                    <p className="text-sm">Esta acción eliminará permanentemente todos los productos, depósitos e historiales. ¿Desea continuar?</p>
                </div>
                <div className="flex-shrink-0">
                    <button 
                        onClick={handleConfirmReset} 
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-2"
                    >
                        Sí, borrar todo
                    </button>
                    <button 
                        onClick={handleCancelReset} 
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto">
        {renderView()}
      </main>
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={confirmMessage.title}
        message={confirmMessage.message}
      />

      <AddProductModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />
      <AddWarehouseModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        onSave={handleSaveWarehouse}
        warehouseToEdit={warehouseToEdit}
      />
      <AddUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
        roles={roles}
      />
      <AddRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSave={handleSaveRole}
        roleToEdit={roleToEdit}
      />
      <UpdateStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSave={handleUpdateStock}
        product={products.find(p => p.id === stockToUpdate?.productId)}
        warehouse={warehouses.find(w => w.id === stockToUpdate?.warehouseId)}
        currentQuantity={stockToUpdate?.quantity ?? 0}
      />
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportData}
      />
    </div>
  );
};

export default App;