import React from 'react';
import type { User, Role } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface LoginViewProps {
  users: User[];
  roles: Role[];
  onLogin: (user: User) => void;
}

const roleColors: { [key: string]: string } = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  operator: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  default: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
};

const LoginView: React.FC<LoginViewProps> = ({ users, roles, onLogin }) => {
  // FIX: Explicitly type `roleMap` to fix type inference on `.get()`.
  const roleMap = new Map<string, Role>(roles.map(r => [r.id, r]));

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400">
            Seleccione un usuario para continuar (simulación)
          </p>
        </div>
        <div className="space-y-4">
          {users.map((user) => {
            const role = roleMap.get(user.roleId);
            const roleName = role?.name.toLowerCase() || 'default';
            return (
                <button
                key={user.id}
                onClick={() => onLogin(user)}
                className="w-full flex items-center p-4 text-left bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                <UserCircleIcon className="w-10 h-10 mr-4 text-slate-400" />
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[roleName] || roleColors.default}`}>
                    {role?.name || 'No Role'}
                    </span>
                </div>
                </button>
            )
          })}
        </div>
        <p className="px-8 text-xs text-center text-slate-500 dark:text-slate-400">
            Esto es una simulación. En una aplicación real, aquí habría un formulario de usuario y contraseña.
        </p>
      </div>
    </div>
  );
};

export default LoginView;