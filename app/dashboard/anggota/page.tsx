"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Users, 
  Mail, 
  Calendar, 
  Edit,
  Eye,
  Shield,
  Search,
  Plus,
  AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState("");

  // Mock data for users
  const users = [
    {
      id: 1,
      name: "Siti Rahayu",
      email: "siti@universitas.ac.id",
      role: "satgas",
      status: "active",
      joinDate: "2024-01-15",
      lastLogin: "2024-10-18",
    },
    {
      id: 2,
      name: "Budi Santoso",
      email: "budi@universitas.ac.id",
      role: "satgas",
      status: "active",
      joinDate: "2024-02-20",
      lastLogin: "2024-10-17",
    },
    {
      id: 3,
      name: "Dr. Ahmad Kurniawan",
      email: "ahmad@universitas.ac.id",
      role: "rektor",
      status: "active",
      joinDate: "2023-08-10",
      lastLogin: "2024-10-18",
    },
    {
      id: 4,
      name: "Rina Wijaya",
      email: "rina@universitas.ac.id",
      role: "user",
      status: "active",
      joinDate: "2024-05-30",
      lastLogin: "2024-10-16",
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "user":
        return <Badge variant="outline">User</Badge>;
      case "satgas":
        return <Badge variant="default">Satgas</Badge>;
      case "rektor":
        return <Badge variant="secondary">Rektor</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Aktif</Badge>;
      case "inactive":
        return <Badge variant="destructive">Non-aktif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRoleChange = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const confirmRoleChange = () => {
    console.log(`Changing role for ${selectedUser.name} to ${newRole}`);
    // In a real application, this would call an API to update the user's role
    setShowRoleModal(false);
    // You would update the user's role in your data state here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Anggota Satgas</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola anggota Satgas PPK dan pengguna sistem</p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Anggota
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari anggota berdasarkan nama atau email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800">
                  <option value="all">Semua Peran</option>
                  <option value="satgas">Satgas</option>
                  <option value="rektor">Rektor</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      {getRoleBadge(user.role)}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                    <div className="mt-3 flex gap-2">
                      {getStatusBadge(user.status)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Bergabung: {new Date(user.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        // In a real app, this would open a modal to view user details
                        console.log("View user", user.id);
                      }}>
                        <Eye className="w-4 h-4 mr-1" />
                        Lihat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRoleChange(user)}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Ubah Peran
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Hak Akses
            </CardTitle>
            <CardDescription>
              Informasi peran dan hak akses masing-masing pengguna
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Peran</th>
                    <th className="text-left py-2">Hak Akses</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3 font-medium">User</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      Melihat status laporan, melaporkan kasus, mengakses materi edukasi
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Satgas</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      Mengelola laporan, melakukan investigasi, membuat rekomendasi, mengakses semua data
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Rektor</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      Melihat laporan akhir, menyetujui rekomendasi, mengelola kebijakan tingkat tinggi
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Ubah Peran Pengguna
              </CardTitle>
              <CardDescription>
                Perbarui peran untuk <span className="font-semibold">{selectedUser.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Peran Saat Ini
                  </label>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Peran Baru
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="satgas">Satgas</option>
                    <option value="rektor">Rektor</option>
                  </select>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowRoleModal(false)}
                  >
                    Batal
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={confirmRoleChange}
                  >
                    Simpan Perubahan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}