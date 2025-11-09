import React, { useState, useEffect } from 'react';
import type { User, Role } from '../../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  userToEdit: User | null;
  roles: Role[];
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave, userToEdit, roles }) => {
  const [user, setUser] = useState<Omit<User, 'id'>>({ name: '', roleId: '' });

  useEffect(() => {
    if (userToEdit) {
      setUser({ name: userToEdit.name, roleId: userToEdit.roleId });
    } else {
      // Default to the first role in the list, or an empty string if no roles exist
      setUser({ name: '', roleId: roles[0]?.id || '' });
    }
  }, [userToEdit, isOpen, roles]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.name || !user.roleId) {
      alert("User Name and Role are required.");
      return;
    }
    onSave({ ...user, id: userToEdit?.id || `user_${new Date().getTime()}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{userToEdit ? 'Edit User' : 'Add New User'}</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">User Name</label>
                <input type="text" name="name" id="name" value={user.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm" required />
              </div>
              
              <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <select name="roleId" id="roleId" value={user.roleId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm">
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm">Save User</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
