"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "@/lib/auth-client";
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
            console.log("Attempting to sign in with:", { email, password: "***" });

            const result = await signIn.email({
                email,
                password,
                // Better Auth handles the callbackURL parameter for redirects
                callbackURL: "/dashboard", // Redirect after successful sign in
            });

            console.log("Sign in result:", result);

            if (result?.error) {
                console.error("Sign in error:", result.error);
                setError(result.error.message || "Gagal masuk. Periksa email dan password Anda.");
            } else if (result?.data) {
                console.log("Sign in successful, redirecting to dashboard");
                
                // Check the user's role to determine where to redirect
                // Note: Role might not be directly available in the session response
                // The role will be available when we fetch the session after sign-in
                router.push("/dashboard");
            } else {
                console.log("Unexpected result:", result);
                setError("Terjadi kesalahan tak terduga. Silakan coba lagi.");
            }
        } catch (err: any) {
            console.error("Sign in exception:", err);
            
            // Check if err has a message property
            const errorMessage = err?.message || err?.error?.message || "Terjadi kesalahan tak terduga. Silakan coba lagi.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Bagian Kiri (Informasi - Hero Section) */}
            <div
                className="relative hidden md:flex flex-col justify-start p-10 lg:p-16 w-1/2"
                style={{
                    backgroundColor: '#C53C3C', // Merah Marun
                    // Tambahkan backgroundImage: 'url(/path/ke/pola-anda.png)' di sini jika ada
                }}
            >
                {/* Logo dan Nama Aplikasi */}
                <div className="flex items-center space-x-3 mb-20">
                    <div className="relative w-12 h-12">
                        {/* 👇 PERBAIKAN PATH DI SINI (Hapus /public) */}
                        <Image 
                            src="/images/icons/Logo_UIN_Imam_Bonjol.png" 
                            alt="Logo UIN Imam Bonjol" 
                            width={48} 
                            height={48} 
                            // Properti style yang lebih modern
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <div className="text-white">
                        <p className="text-sm font-light">UIN IMAM BONJOL</p>
                        <h1 className="text-xl font-bold">SIMPEL - PK</h1>
                    </div>
                </div>

                {/* Judul Utama */}
                <h2 className="text-white text-4xl font-extrabold mb-6 leading-snug">
                    LAYANAN PENGADUAN <br /> ONLINE
                </h2>
                <p className="text-white text-base max-w-lg opacity-90">
                    Sistem informasi ini memberikan ruang aman bagi siapa pun yang membutuhkan perlindungan dan keadilan. Setiap laporan ditangani secara profesional dan dijaga kerahasiaannya.
                </p>
            </div>

            {/* Bagian Kanan (Formulir Login) */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-white p-4 sm:p-6 lg:p-8">
                <Card className="w-full max-w-md border-none shadow-none md:shadow-lg md:border">
                    <CardHeader className="text-center pb-0">
                        <CardTitle className="text-3xl font-bold text-gray-900 mb-4">Sign in</CardTitle>
                        {/* Tabs Login/Daftar */}
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
                        {/* Menampilkan Error jika ada */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Input Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your email here"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-11 border-gray-300 focus:border-red-700"
                                />
                            </div>

                            {/* Input Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                    <Link href="/forgot-password" className="text-xs text-red-700 hover:underline transition-colors">
                                        Lupa Password?
                                    </Link>
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
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Tombol Submit */}
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
                        
                        {/* Teks Pendaftaran & Kembali ke Beranda */}
                        <div className="flex flex-col items-center mt-6 space-y-3">
                            <p className="text-sm text-gray-600">
                                Belum punya akun? {" "}
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