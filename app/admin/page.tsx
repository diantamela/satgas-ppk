import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Data Consistency</h2>
          <p className="mb-4">Check and fix data consistency issues in the database</p>
          <Link href="/admin/data-consistency">
            <Button>Manage Data Consistency</Button>
          </Link>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">User Role Management</h2>
          <p className="mb-4">View and modify user roles</p>
          <Link href="/admin/user-roles">
            <Button>Manage User Roles</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}