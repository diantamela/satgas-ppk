'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function UserRoleManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('USER');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/user-roles');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      setMessage('Error fetching users: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch('/api/admin/user-roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole: role })
      });
      const result = await response.json();
      
      if (response.ok) {
        setMessage(result.message);
        // Refresh the users list
        fetchUsers();
        setEditingUserId(null);
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error updating role: ' + (error as Error).message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (userId: string) => {
    if (!editingUserId) {
      setEditingUserId(userId);
      const user = users.find(u => u.id === userId);
      if (user) setNewRole(user.role);
    } else if (editingUserId === userId) {
      // Save the role change
      if (newRole !== users.find(u => u.id === userId)?.role) {
        updateUserRole(userId, newRole);
      } else {
        setEditingUserId(null); // Just cancel if no change
      }
    } else {
      // Cancel previous edit
      setEditingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">User Role Manager</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Role Manager</h1>
      
      <div className="mb-4">
        <Button onClick={fetchUsers}>Refresh Users</Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Role</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{user.id.substring(0, 8)}...</td>
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">
                  {editingUserId === user.id ? (
                    <select 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="USER">USER</option>
                      <option value="SATGAS">SATGAS</option>
                      <option value="REKTOR">REKTOR</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded ${user.role === 'USER' ? 'bg-blue-100 text-blue-800' : user.role === 'SATGAS' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editingUserId === user.id ? (
                    <Button onClick={() => handleRoleChange(user.id)} size="sm">
                      Save
                    </Button>
                  ) : (
                    <Button onClick={() => handleRoleChange(user.id)} size="sm">
                      Edit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}