"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  Calendar,
  Upload,
  Image as ImageIcon,
  Edit,
  Trash2,
  X
} from "lucide-react";
import { RoleGuard } from "../../../../components/auth/role-guard";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  image: string;
  uploadedBy?: { name: string };
}

export default function GalleryUploadPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "Edukasi"
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setGalleryItems(data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('date', formData.date);
      uploadFormData.append('location', formData.location);
      uploadFormData.append('category', formData.category);

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: uploadFormData
      });

      if (response.ok) {
        setShowUploadForm(false);
        setFormData({
          title: "",
          description: "",
          date: "",
          location: "",
          category: "Edukasi"
        });
        setSelectedFile(null);
        fetchGalleryItems();
      } else {
        const error = await response.json();
        alert(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      date: item.date,
      location: item.location,
      category: item.category
    });
    setShowEditForm(true);
    setShowUploadForm(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      let response;
      
      if (selectedFile) {
        // If there's a file, send FormData
        const uploadFormData = new FormData();
        uploadFormData.append('id', editingItem.id);
        uploadFormData.append('title', formData.title);
        uploadFormData.append('description', formData.description);
        uploadFormData.append('date', formData.date);
        uploadFormData.append('location', formData.location);
        uploadFormData.append('category', formData.category);
        uploadFormData.append('file', selectedFile);
        
        response = await fetch('/api/gallery', {
          method: 'PUT',
          body: uploadFormData
        });
      } else {
        // If no file, send JSON
        response = await fetch('/api/gallery', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingItem.id,
            title: formData.title,
            description: formData.description,
            date: formData.date,
            location: formData.location,
            category: formData.category
          })
        });
      }

      if (response.ok) {
        setShowEditForm(false);
        setEditingItem(null);
        setSelectedFile(null);
        setFormData({
          title: "",
          description: "",
          date: "",
          location: "",
          category: "Edukasi"
        });
        fetchGalleryItems();
      } else {
        const error = await response.json();
        alert(error.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchGalleryItems();
      } else {
        const error = await response.json();
        alert(error.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const cancelEdit = () => {
    setShowEditForm(false);
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      category: "Edukasi"
    });
  };

  const formatDate = (dateStr: string) => {
    if (dateStr.includes('-')) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return dateStr;
  };

  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Berita Kegiatan</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola galeri kegiatan Satgas PPK</p>
          </div>
          <div className="flex gap-2">
            {!showEditForm && (
              <Button onClick={() => setShowUploadForm(!showUploadForm)}>
                <Upload className="w-4 h-4 mr-2" />
                {showUploadForm ? 'Batal Upload' : 'Upload Foto'}
              </Button>
            )}
            {showEditForm && (
              <Button onClick={cancelEdit} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Batal Edit
              </Button>
            )}
          </div>
        </div>

        {(showUploadForm || showEditForm) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload Foto Berita Kegiatan</CardTitle>
              <CardDescription>
                Tambahkan foto kegiatan Satgas PPK ke galeri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={showEditForm ? handleUpdate : handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Judul
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deskripsi
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tanggal
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lokasi
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Edukasi">Edukasi</SelectItem>
                      <SelectItem value="Pelatihan">Pelatihan</SelectItem>
                      <SelectItem value="Sosialisasi">Sosialisasi</SelectItem>
                      <SelectItem value="Kampanye">Kampanye</SelectItem>
                      <SelectItem value="Diskusi">Diskusi</SelectItem>
                      <SelectItem value="Infrastruktur">Infrastruktur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!showEditForm && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Foto
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                )}
                {showEditForm && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Foto (kosongkan jika tidak ingin mengubah)
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
                <Button type="submit" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? (showEditForm ? 'Mengupdate...' : 'Mengupload...') : (showEditForm ? 'Update' : 'Upload')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden group">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                  <Badge variant="secondary">{item.category}</Badge>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {item.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                </div>
                {item.uploadedBy && (
                  <p className="text-xs text-gray-500 mt-2">
                    Diupload oleh: {item.uploadedBy.name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {galleryItems.length === 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Belum ada foto di berita kegiatan</p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}