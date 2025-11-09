export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

export interface Warehouse {
  id: string;
  name: string;
}

export interface InventoryItem {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface TransferItem {
  productId: string;
  sourceWarehouseId: string;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  date: string;
  destinationWarehouseId: string;
  items: TransferItem[];
  status: 'Completed';
}

export type ViewType = 'inventory' | 'products' | 'warehouses' | 'movements' | 'movementHistory' | 'admin';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export';

export interface Permission {
  module: ViewType | 'reports' | 'import' | 'reset';
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  roleId: string;
  password?: string; // Optional for now, for future backend integration
}