'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface UserWithInvalidRole {
  id: string;
  email: string;
  role: string;
}

interface UserWithMissingFields {
  id: string;
  email: string;
  name: string | null;
}

interface DataConsistencyData {
  totalUsers: number;
  isConsistent: boolean;
  userCountByRole: {
    USER: number;
    SATGAS: number;
    REKTOR: number;
  };
  invalidRoleUsers: UserWithInvalidRole[];
  duplicateEmails: string[];
  usersWithMissingFields: UserWithMissingFields[];
}

export default function DataConsistencyChecker() {
  const [data, setData] = useState<DataConsistencyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const checkConsistency = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/check-data-consistency');
      const result = await response.json();
      setData(result);
    } catch (error) {
      setMessage('Error checking consistency: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fixInvalidRoles = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/fix-data-consistency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fix-invalid-roles' })
      });
      const result = await response.json();
      setMessage(result.message);
      // Refresh data after fix
      setTimeout(() => checkConsistency(), 1000);
    } catch (error) {
      setMessage('Error fixing invalid roles: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const ensureDefaultRoles = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/fix-data-consistency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ensure-default-roles' })
      });
      const result = await response.json();
      setMessage(result.message);
      // Refresh data after fix
      setTimeout(() => checkConsistency(), 1000);
    } catch (error) {
      setMessage('Error ensuring default roles: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConsistency();
  }, []);

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Data Consistency Checker</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data Consistency Checker</h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p><strong>Total Users:</strong> {data.totalUsers}</p>
        <p><strong>Consistent Data:</strong> {data.isConsistent ? 'Yes' : 'No'}</p>
        <p><strong>USER Role:</strong> {data.userCountByRole.USER}</p>
        <p><strong>SATGAS Role:</strong> {data.userCountByRole.SATGAS}</p>
        <p><strong>REKTOR Role:</strong> {data.userCountByRole.REKTOR}</p>
      </div>

      {data.invalidRoleUsers.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Users with Invalid Roles</h2>
          <ul>
            {data.invalidRoleUsers.map((user: UserWithInvalidRole) => (
              <li key={user.id}>{user.email} (Role: {user.role})</li>
            ))}
          </ul>
          <Button onClick={fixInvalidRoles} disabled={loading} className="mt-2">
            {loading ? 'Processing...' : 'Fix Invalid Roles'}
          </Button>
        </div>
      )}

      {data.duplicateEmails.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Duplicate Emails</h2>
          <ul>
            {data.duplicateEmails.map((email: string) => (
              <li key={email}>{email}</li>
            ))}
          </ul>
        </div>
      )}

      {data.usersWithMissingFields.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Users with Missing Fields</h2>
          <ul>
            {data.usersWithMissingFields.map((user: UserWithMissingFields) => (
              <li key={user.id}>{user.email} (Name: {user.name || 'N/A'})</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <Button onClick={ensureDefaultRoles} disabled={loading}>
          {loading ? 'Processing...' : 'Ensure Default Roles'}
        </Button>
        <Button onClick={checkConsistency} disabled={loading} className="ml-2">
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mt-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}