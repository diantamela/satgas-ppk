"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(), // sinkron dengan CITEXT
          password,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        const msg =
          json?.message ||
          (res.status === 401
            ? "Email atau password salah."
            : res.status === 0
            ? "Tidak bisa terhubung ke server."
            : "Login gagal. Coba lagi.");
        setError(msg);
        return;
      }

      // sukses - redirect berdasarkan role
      console.log('Login successful, redirecting based on role...');
      console.log('Response JSON:', json);

      // Role-based redirection
      const userRole = json.user?.role?.toUpperCase();
      if (userRole === 'SATGAS') {
        window.location.href = "/satgas/dashboard";
      } else if (userRole === 'REKTOR') {
        window.location.href = "/rektor/dashboard";
      } else {
         window.location.href = "/user/dashboard"; // Default for USER role
       }
    } catch {
      setError("Terjadi kesalahan tak terduga. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Kiri (Hero) */}
      <div
        className="relative hidden md:flex flex-col justify-start p-10 lg:p-16 w-1/2"
        style={{ backgroundColor: "#C53C3C" }}
      >
        <div className="flex items-center space-x-3 mb-20">
          <div className="relative w-12 h-12" />
          <div className="text-white">
            <p className="text-sm font-light">UIN IMAM BONJOL</p>
            <h1 className="text-xl font-bold">SIMPEL - PK</h1>
          </div>
        </div>

        <h2 className="text-white text-4xl font-extrabold mb-6 leading-snug">
          LAYANAN PENGADUAN <br /> ONLINE
        </h2>
        <p className="text-white text-base max-w-lg opacity-90">
          Sistem informasi ini memberikan ruang aman bagi siapa pun yang membutuhkan perlindungan dan keadilan. Setiap laporan ditangani secara profesional dan dijaga kerahasiaannya.
        </p>
      </div>

      {/* Kanan (Form Login) */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-white p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md border-none shadow-none md:shadow-lg md:border">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">Sign in</CardTitle>
            <div className="flex justify-center border-b border-gray-200">
              <button className="py-3 px-6 text-sm font-medium text-red-700 border-b-2 border-red-700 focus:outline-none">
                Login
              </button>
              <Link href="/sign-up" className="py-3 px-6 text-sm font-medium text-gray-500 hover:text-red-700 transition-colors">
                Daftar
              </Link>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form 
            action="/api/auth/signin"
              method="post"
              onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 border-gray-300 focus:border-red-700"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10 h-11 border-gray-300 focus:border-red-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2.5 rounded-md transition-colors duration-200 h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            <div className="flex flex-col items-center mt-6 space-y-3">
              <p className="text-sm text-gray-600">
                Belum punya akun?{" "}
                <Link href="/sign-up" className="font-medium text-red-700 hover:underline">
                  Daftar di sini
                </Link>
              </p>
              <Link href="/" className="text-sm text-gray-500 hover:underline mt-4">
                — Kembali ke Beranda
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
