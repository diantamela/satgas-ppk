// Komponen Navigasi Utama
import Link from 'next/link';

export const Navbar = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo/Judul Aplikasi */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-red-700">SATGAS PPKS</span>
        </Link>

        {/* Menu Navigasi */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium">
            Beranda
          </Link>
          <Link href="/laporan" className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium">
            Lapor Online
          </Link>
          <Link href="/edukasi" className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium">
            Edukasi
          </Link>
          <Link href="/tentang" className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium">
            Tentang
          </Link>
        </nav>

        {/* Tombol Login (Akses Dashboard Satgas) */}
        <div className="flex items-center space-x-4">
          <Link
            href="/satgas"
            className="bg-red-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition duration-300 font-medium"
          >
            Login Satgas
          </Link>
        </div>

        {/* Tambahkan ikon hamburger/menu untuk mobile di sini jika perlu */}
      </div>
    </header>
  );
};