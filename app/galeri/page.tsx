"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  Calendar,
  MapPin,
  ArrowLeft,
  Filter,
} from "lucide-react";

interface GalleryItem {
  id: string | number;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  image: string;
  uploadedBy?: { name: string };
}

const CATEGORIES = [
  "Semua",
  "Edukasi",
  "Pelatihan",
  "Sosialisasi",
  "Kampanye",
  "Diskusi",
  "Infrastruktur",
];

export default function GaleriPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/gallery");
      if (response.ok) {
        const data = await response.json();
        setGalleryItems(data);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const staticGalleryItems: GalleryItem[] = [
    {
      id: 1,
      title: "Workshop Pencegahan Kekerasan Seksual",
      description:
        "Kegiatan workshop edukasi pencegahan kekerasan seksual untuk mahasiswa baru UIN Imam Bonjol Padang.",
      date: "15 November 2024",
      location: "Aula Utama Kampus III",
      image: "/images/icons/Logo_UIN_Imam_Bonjol.png",
      category: "Edukasi",
    },
    {
      id: 2,
      title: "Pelatihan Tim Satgas PPK",
      description:
        "Pelatihan intensif untuk meningkatkan kompetensi anggota Satgas dalam penanganan kasus kekerasan.",
      date: "20 Oktober 2024",
      location: "Ruang Rapat Rektorat",
      image: "/images/icons/peta_uin.png",
      category: "Pelatihan",
    },
    {
      id: 3,
      title: "Sosialisasi Permendikbudristek No. 55",
      description:
        "Sosialisasi peraturan terbaru tentang pencegahan dan penanganan kekerasan seksual di perguruan tinggi.",
      date: "5 Oktober 2024",
      location: "Auditorium Kampus I",
      image: "/images/icons/Logo_UIN_Imam_Bonjol.png",
      category: "Sosialisasi",
    },
    {
      id: 4,
      title: "Kampanye 16 Hari Anti Kekerasan Terhadap Perempuan",
      description:
        "Kegiatan kampanye internasional untuk meningkatkan kesadaran tentang kekerasan terhadap perempuan.",
      date: "25 November 2024",
      location: "Lapangan Kampus II",
      image: "/images/icons/peta_uin.png",
      category: "Kampanye",
    },
    {
      id: 5,
      title: "Diskusi Panel dengan Alumni Korban",
      description:
        "Diskusi panel bersama alumni yang pernah menjadi korban kekerasan untuk berbagi pengalaman dan solusi.",
      date: "10 September 2024",
      location: "Ruang Seminar Fakultas Ushuluddin",
      image: "/images/icons/Logo_UIN_Imam_Bonjol.png",
      category: "Diskusi",
    },
    {
      id: 6,
      title: "Pembentukan Posko Pengaduan",
      description:
        "Peresmian posko pengaduan kekerasan seksual yang beroperasi 24 jam di kampus.",
      date: "1 Agustus 2024",
      location: "Gedung Rektorat Lt. 1",
      image: "/images/icons/peta_uin.png",
      category: "Infrastruktur",
    },
  ];

  const formatDate = (dateStr: string) => {
    if (dateStr.includes("-")) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return dateStr;
  };

  const parseDate = (dateStr: string) => {
    if (dateStr.includes("-")) {
      return new Date(dateStr);
    }
    // Parse Indonesian date format like "15 November 2024"
    const months = {
      'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
      'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = months[parts[1] as keyof typeof months];
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  const allItems = [...staticGalleryItems, ...galleryItems].sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });

  const filteredItems =
    selectedCategory === "Semua"
      ? allItems
      : allItems.filter((item) => 
          item.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  const visibleItems = filteredItems.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Back + badge */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild className="px-0">
          </Button>

          <div className="hidden sm:flex items-center gap-2 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 px-4 py-1">
            <Filter className="w-4 h-4" />
            Dokumentasi kegiatan Satgas sepanjang tahun
          </div>
        </div>

        {/* Hero / Intro */}
        <Card className="mb-8 border border-red-100/70 dark:border-red-900/40 bg-white/95 dark:bg-gray-950/90 shadow-xl overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-300/30 dark:bg-red-900/40 blur-3xl" />
          <CardHeader className="relative text-center space-y-3 pt-8 pb-6">
            <CardTitle className="text-3xl font-extrabold flex items-center justify-center gap-3 text-gray-900 dark:text-white">
              <ImageIcon className="w-8 h-8 text-red-600" />
              Galeri Kegiatan Satgas PPK
            </CardTitle>
            <p className="text-sm md:text-base max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
              Rekam jejak kegiatan Satgas PPK UIN Imam Bonjol dalam
              pencegahan, penanganan, dan edukasi terkait kekerasan di
              lingkungan kampus.
            </p>
          </CardHeader>
        </Card>

        {/* Filter Kategori */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setVisibleCount(6); // reset jumlah visible saat ganti filter
                }}
                className={[
                  "px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all",
                  isActive
                    ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-500/30"
                    : "bg-white/90 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Grid Galeri */}
        {filteredItems.length === 0 ? (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
            Belum ada dokumentasi untuk kategori ini.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleItems.map((item) => (
                <Card
                  key={String(item.id)}
                  className="overflow-hidden bg-white/95 dark:bg-gray-950/95 border border-gray-200/80 dark:border-gray-800 hover:border-red-400 dark:hover:border-red-500 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item);
                    setIsDialogOpen(true);
                  }}
                >
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-2 drop-shadow">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>
                      {item.uploadedBy?.name && (
                        <div className="ml-auto text-[10px] italic">
                          Diunggah oleh {item.uploadedBy.name}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-8">
              {canLoadMore && (
                <Button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  disabled={isLoading}
                  className="rounded-full px-8 py-2 bg-red-700 hover:bg-red-800 text-sm font-semibold"
                >
                  {isLoading ? "Memuat..." : "Muat Lebih Banyak"}
                </Button>
              )}
              {!canLoadMore && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Semua dokumentasi untuk kategori ini sudah ditampilkan.
                </p>
              )}
            </div>
          </>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedItem.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-semibold">
                      {selectedItem.category}
                    </span>
                  </div>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative overflow-hidden rounded-lg">
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {selectedItem.description}
                  </DialogDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <span className="text-gray-700 dark:text-gray-200">
                        {formatDate(selectedItem.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span className="text-gray-700 dark:text-gray-200">
                        {selectedItem.location}
                      </span>
                    </div>
                  </div>
                  {selectedItem.uploadedBy?.name && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Diunggah oleh {selectedItem.uploadedBy.name}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
