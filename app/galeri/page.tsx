"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Calendar, MapPin, ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";

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

export default function GaleriPage() {
  const { data: session } = useSession();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

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

  const staticGalleryItems = [
    {
      id: 1,
      title: "Workshop Pencegahan Kekerasan Seksual",
      description: "Kegiatan workshop edukasi pencegahan kekerasan seksual untuk mahasiswa baru UIN Imam Bonjol Padang.",
      date: "15 November 2024",
      location: "Aula Utama Kampus III",
      image: "/images/icons/Logo_UIN_Imam_Bonjol.png", // Placeholder
      category: "Edukasi"
    },
    {
      id: 2,
      title: "Pelatihan Tim Satgas PPK",
      description: "Pelatihan intensif untuk meningkatkan kompetensi anggota Satgas dalam penanganan kasus kekerasan.",
      date: "20 Oktober 2024",
      location: "Ruang Rapat Rektorat",
      image: "/images/icons/peta_uin.png", // Placeholder
      category: "Pelatihan"
    },
    {
      id: 3,
      title: "Sosialisasi Permendikbudristek No. 55",
      description: "Sosialisasi peraturan terbaru tentang pencegahan dan penanganan kekerasan seksual di perguruan tinggi.",
      date: "5 Oktober 2024",
      location: "Auditorium Kampus I",
      image: "/images/icons/Logo_UIN_Imam_Bonjol.png", // Placeholder
      category: "Sosialisasi"
    },
    {
      id: 4,
      title: "Kampanye 16 Hari Anti Kekerasan Terhadap Perempuan",
      description: "Kegiatan kampanye internasional untuk meningkatkan kesadaran tentang kekerasan terhadap perempuan.",
      date: "25 November 2024",
      location: "Lapangan Kampus II",
      image: "/images/icons/peta_uin.png", // Placeholder
      category: "Kampanye"
    },
    {
      id: 5,
      title: "Diskusi Panel dengan Alumni Korban",
      description: "Diskusi panel bersama alumni yang pernah menjadi korban kekerasan untuk berbagi pengalaman dan solusi.",
      date: "10 September 2024",
      location: "Ruang Seminar Fakultas Ushuluddin",
      image: "/images/icons/Logo_UIN_Imam_Bonjol.png", // Placeholder
      category: "Diskusi"
    },
    {
      id: 6,
      title: "Pembentukan Posko Pengaduan",
      description: "Peresmian posko pengaduan kekerasan seksual yang beroperasi 24 jam di kampus.",
      date: "1 Agustus 2024",
      location: "Gedung Rektorat Lt. 1",
      image: "/images/icons/peta_uin.png", // Placeholder
      category: "Infrastruktur"
    }
  ];

  const categories = ["Semua", "Edukasi", "Pelatihan", "Sosialisasi", "Kampanye", "Diskusi", "Infrastruktur"];

  const formatDate = (dateStr: string) => {
    if (dateStr.includes('-')) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return dateStr;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <a href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </a>
          </Button>
        </div>
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Image className="w-8 h-8 text-purple-600" />
              Galeri Kegiatan Satgas PPK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-purple dark:prose-invert max-w-none text-center">
              <p className="text-lg">
                Dokumentasi kegiatan-kegiatan Satgas PPK UIN Imam Bonjol dalam upaya
                pencegahan dan penanganan kekerasan di lingkungan kampus.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filter Kategori */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-full text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid Galeri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...staticGalleryItems, ...galleryItems].map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {item.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            Muat Lebih Banyak
          </button>
        </div>
      </div>
    </div>
  );
}
