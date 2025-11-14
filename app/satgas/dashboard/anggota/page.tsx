"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Mail
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function SatgasMemberManagementPage() {
  console.log('SatgasMemberManagementPage - Component rendered');

  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "USER"
  });

  // Fetch members
  const fetchMembers = async () => {
    console.log('fetchMembers - Starting API call');
    try {
      const response = await fetch('/api/admin/user-roles');
      console.log('fetchMembers - Response status:', response.status);
      const data = await response.json();
      console.log('fetchMembers - Response data:', data);

      if (data.users) {
        // Filter to show only Satgas-related roles or all users that Satgas can manage
        setMembers(data.users);
        console.log('fetchMembers - Members set:', data.users.length);
      } else {
        console.log('fetchMembers - No users in response');
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
      console.log('fetchMembers - Loading set to false');
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Create new member
  const handleCreateMember = async () => {
    try {
      // For now, we'll use the signup API to create new accounts
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: "TempPass123!", // Temporary password that should be changed
          role: formData.role
        })
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setFormData({ name: "", email: "", role: "USER" });
        fetchMembers(); // Refresh the list
        alert("Anggota berhasil dibuat! Password sementara: TempPass123!");
      } else {
        alert("Gagal membuat anggota");
      }
    } catch (error) {
      console.error("Error creating member:", error);
      alert("Terjadi kesalahan saat membuat anggota");
    }
  };

  // Update member role
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/user-roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole })
      });

      if (response.ok) {
        fetchMembers(); // Refresh the list
        setShowEditDialog(false);
        setSelectedMember(null);
      } else {
        alert("Gagal mengupdate peran");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Terjadi kesalahan saat mengupdate peran");
    }
  };

  // Filter members based on search
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "USER":
        return <Badge variant="outline">User</Badge>;
      case "SATGAS":
        return <Badge variant="default">Satgas</Badge>;
      case "REKTOR":
        return <Badge variant="secondary">Rektor</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Kelola Anggota Satgas</h1>
            <p className="text-gray-600 dark:text-gray-400">Mengelola anggota dan membuat akun baru</p>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4 h-20"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4 h-20"></div>
        </div>
      </div>
    );
  }

  return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Kelola Anggota Satgas</h1>
            <p className="text-gray-600 dark:text-gray-400">Mengelola anggota dan membuat akun baru</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <UserPlus className="w-4 h-4 mr-2" />
                Buat Akun Baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Akun Anggota Baru</DialogTitle>
                <DialogDescription>
                  Buat akun baru untuk anggota Satgas PPK
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Masukkan alamat email"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Peran</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="SATGAS">Satgas</SelectItem>
                      <SelectItem value="REKTOR">Rektor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateMember} className="flex-1">
                    Buat Akun
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Batal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

          {/* Search */}
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
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <div className="space-y-4">
            {filteredMembers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Tidak ada anggota</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {members.length === 0
                      ? "Belum ada anggota terdaftar."
                      : "Tidak ada anggota yang sesuai dengan pencarian Anda."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{member.name}</h3>
                            {getRoleBadge(member.role)}
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Bergabung: {new Date(member.createdAt || Date.now()).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Dialog open={showEditDialog && selectedMember?.id === member.id} onOpenChange={(open) => {
                          setShowEditDialog(open);
                          if (!open) setSelectedMember(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMember(member)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit Peran
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Peran Anggota</DialogTitle>
                              <DialogDescription>
                                Ubah peran untuk {selectedMember?.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Peran Saat Ini</Label>
                                <div className="mt-1">
                                  {selectedMember && getRoleBadge(selectedMember.role)}
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="edit-role">Peran Baru</Label>
                                <Select
                                  value={selectedMember?.role || "USER"}
                                  onValueChange={(value) => {
                                    if (selectedMember) {
                                      setSelectedMember({...selectedMember, role: value});
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="SATGAS">Satgas</SelectItem>
                                    <SelectItem value="REKTOR">Rektor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={() => selectedMember && handleUpdateRole(selectedMember.id, selectedMember.role)}
                                  className="flex-1"
                                >
                                  Simpan Perubahan
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowEditDialog(false);
                                    setSelectedMember(null);
                                  }}
                                  className="flex-1"
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
      </div>
  );
}