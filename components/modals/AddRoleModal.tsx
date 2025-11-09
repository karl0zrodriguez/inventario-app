import React, { useState, useEffect } from 'react';
import type { Role, Permission, ViewType, PermissionAction } from '../../types';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  roleToEdit: Role | null;
}

const modules: (ViewType | 'reports' | 'import' | 'reset')[] = ['inventory', 'products', 'warehouses', 'movements', 'movementHistory', 'admin', 'reports', 'import', 'reset'];
const actions: PermissionAction[] = ['create', 'read', 'update', 'delete', 'export'];

const moduleLabels: Record<string, string> = {
    inventory: 'Inventario',
    products: 'Productos',
    warehouses: 'Depósitos',
    movements: 'Movimientos',
    movementHistory: 'Historial Movimientos',
    admin: 'Administración (Usuarios y Roles)',
    reports: 'Reportes CSV',
    import: 'Importar Datos',
    reset: 'Resetear Sistema'
};

const AddRoleModal: React.FC<AddRoleModalProps> = ({ isOpen, onClose, onSave, roleToEdit }) => {
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState<Map<string, Set<PermissionAction>>>(new Map());

  useEffect(() => {
    if (roleToEdit) {
      setRoleName(roleToEdit.name);
      const permsMap = new Map<string, Set<PermissionAction>>();
      roleToEdit.permissions.forEach(p => {
        permsMap.set(p.module, new Set(p.actions));
      });
      setPermissions(permsMap);
    } else {
      setRoleName('');
      setPermissions(new Map());
    }
  }, [roleToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePermissionChange = (module: string, action: PermissionAction, checked: boolean) => {
    setPermissions(prev => {
      const newPerms = new Map<string, Set<PermissionAction>>(prev);
      const moduleActions = new Set(newPerms.get(module));
      if (checked) {
        moduleActions.add(action);
      } else {
        moduleActions.delete(action);
      }
      newPerms.set(module, moduleActions);
      return newPerms;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) {
      alert("Role Name is required.");
      return;
    }
    
    // FIX: Explicitly type the return value of the map function to correct the type inference for the 'actions' property.
    // Also, corrected the type cast for 'module' to be the full union type from the Permission interface.
    const permissionsArray: Permission[] = Array.from(permissions.entries()).map(([module, actionsSet]): Permission => ({
      module: module as (ViewType | 'reports' | 'import' | 'reset'),
      actions: Array.from(actionsSet),
    })).filter(p => p.actions.length > 0);

    onSave({ 
        id: roleToEdit?.id || `role_${new Date().getTime()}`,
        name: roleName,
        permissions: permissionsArray
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{roleToEdit ? 'Edit Role' : 'Add New Role'}</h2>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto">
            <div>
              <label htmlFor="roleName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role Name</label>
              <input type="text" name="roleName" id="roleName" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm" required />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Permissions</h3>
              <div className="space-y-4">
                {modules.map(module => (
                  <div key={module} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">{moduleLabels[module]}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                      {actions.map(action => (
                        <label key={action} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={permissions.get(module)?.has(action) || false}
                            onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{action}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 flex justify-end gap-3 mt-auto border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm">Save Role</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoleModal;
