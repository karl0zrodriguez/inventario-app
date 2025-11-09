import React, { useState, useRef, useEffect } from 'react';
import type { ViewType, User, Role, PermissionAction } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { UsersIcon } from './icons/UsersIcon';


interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onAddProduct: () => void;
  onAddWarehouse: () => void;
  onAddUser: () => void;
  onAddRole: () => void;
  onImport: () => void;
  onResetAllData: () => void;
  onExportProducts: () => void;
  onExportInventory: () => void;
  currentUser: User | null;
  onLogout: () => void;
  hasPermission: (module: ViewType | 'reports' | 'import' | 'reset', action: PermissionAction) => boolean;
  roles?: Role[]; // Optional roles prop for displaying role name
}

const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onViewChange, 
  onAddProduct, 
  onAddWarehouse,
  onAddUser,
  onAddRole,
  onImport, 
  onResetAllData,
  onExportProducts,
  onExportInventory,
  currentUser,
  onLogout,
  hasPermission,
  roles = []
}) => {
  const [isReportsMenuOpen, setIsReportsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const reportsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userRole = roles.find(r => r.id === currentUser?.roleId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reportsMenuRef.current && !reportsMenuRef.current.contains(event.target as Node)) {
        setIsReportsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavButton: React.FC<{ view: ViewType, children: React.ReactNode }> = ({ view, children }) => {
    const isActive = currentView === view;
    if (!hasPermission(view, 'read')) return null;
    return (
      <button
        onClick={() => onViewChange(view)}
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          isActive
            ? 'bg-indigo-600 text-white'
            : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Warehouse Manager</h1>
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                <NavButton view="inventory">Inventory</NavButton>
                <NavButton view="movements">Movimientos</NavButton>
                <NavButton view="movementHistory">Historial</NavButton>
                <NavButton view="products">Products</NavButton>
                <NavButton view="warehouses">Warehouses</NavButton>
                <NavButton view="admin">Admin</NavButton>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasPermission('reports', 'read') && <div className="relative" ref={reportsMenuRef}>
              <button
                onClick={() => setIsReportsMenuOpen(prev => !prev)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <DocumentTextIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Reportes</span>
              </button>
              {isReportsMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <button
                      onClick={() => { onExportProducts(); setIsReportsMenuOpen(false); }}
                      className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Exportar Lista de Productos (CSV)
                    </button>
                    <button
                      onClick={() => { onExportInventory(); setIsReportsMenuOpen(false); }}
                      className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Exportar Inventario Completo (CSV)
                    </button>
                  </div>
                </div>
              )}
            </div>}
             {hasPermission('import', 'create') && <button
              onClick={onImport}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <UploadIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </button>}
             {hasPermission('admin', 'create') && currentView === 'admin' && <button
              onClick={onAddRole}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Role</span>
            </button>}
             {hasPermission('admin', 'create') && currentView === 'admin' && <button
              onClick={onAddUser}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <UsersIcon className="w-4 h-4" />
              <span className="hidden sm:inline">User</span>
            </button>}
            {hasPermission('products', 'create') && <button
              onClick={onAddProduct}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Product</span>
            </button>}
            {hasPermission('warehouses', 'create') && <button
              onClick={onAddWarehouse}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
               <PlusIcon className="w-4 h-4" />
               <span className="hidden sm:inline">Warehouse</span>
            </button>}
            {hasPermission('reset', 'delete') && <button
              onClick={onResetAllData}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Resetear</span>
            </button>}
             <div className="relative" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <UserCircleIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200">{currentUser?.name}</span>
                <ChevronDownIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
              {isUserMenuOpen && (
                 <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{userRole?.name}</p>
                      </div>
                       <button
                         onClick={onLogout}
                         className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                       >
                         Cerrar Sesión
                       </button>
                    </div>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;