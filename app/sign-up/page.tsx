"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signUp } from "@/lib/auth-client";
import { Loader2, Eye, EyeOff } from "lucide-react";

const signUpSchema = z.object({
    name: z.string().min(2, "Nama harus minimal 2 karakter"),
    email: z.string().email("Alamat email tidak valid"),
    password: z
        .string()
        .min(8, "Password harus minimal 8 karakter")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password harus mengandung huruf besar, huruf kecil, dan angka"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const form = useForm<SignUpForm>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: SignUpForm) => {
        setIsLoading(true);
        setError("");

        try {
            const result = await signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
            });

            if (result.error) {
                setError(result.error.message || "Sign up failed");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("An unexpected error occurred");
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
                    backgroundColor: '#C53C3C',
                }}
            >
                {/* Logo dan Nama Aplikasi */}
                <div className="flex items-center space-x-3 mb-20">
                    <div className="relative w-12 h-12">
                        <Image 
                            src="/images/icons/Logo_UIN_Imam_Bonjol.png" 
                            alt="Logo UIN Imam Bonjol" 
                            width={48} 
                            height={48} 
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

            {/* Bagian Kanan (Formulir Pendaftaran) */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-white p-4 sm:p-6 lg:p-8">
                <Card className="w-full max-w-md border-none shadow-none md:shadow-lg md:border">
                    <CardHeader className="text-center pb-0">
                        <CardTitle className="text-3xl font-bold text-gray-900 mb-4">Sign up</CardTitle>
                        {/* Tabs Login/Daftar */}
                        <div className="flex justify-center border-b border-gray-200">
                            <Link href="/sign-in" className="py-3 px-6 text-sm font-medium text-gray-500 hover:text-red-700 transition-colors">
                                Login
                            </Link>
                            <button className="py-3 px-6 text-sm font-medium text-red-700 border-b-2 border-red-700 focus:outline-none">
                                Daftar
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            
                                {/* Input Nama */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">Nama Lengkap</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Masukkan nama lengkap"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="h-11 border-gray-300 focus:border-red-700"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Input Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Masukkan email Anda"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="h-11 border-gray-300 focus:border-red-700"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Input Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Buat password yang kuat"
                                                        {...field}
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
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Input Konfirmasi Password */}
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">Konfirmasi Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Konfirmasi password Anda"
                                                        {...field}
                                                        disabled={isLoading}
                                                        className="pr-10 h-11 border-gray-300 focus:border-red-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                        disabled={isLoading}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Tombol Submit */}
                                <Button
                                    type="submit"
                                    className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2.5 rounded-md transition-colors duration-200 h-11"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Mendaftar...
                                        </>
                                    ) : (
                                        "Daftar"
                                    )}
                                </Button>
                            </form>
                        </Form>

                        {/* Teks Login & Kembali ke Beranda */}
                        <div className="flex flex-col items-center mt-6 space-y-3">
                            <p className="text-sm text-gray-600">
                                Sudah punya akun? {" "}
                                <Link href="/sign-in" className="font-medium text-red-700 hover:underline">
                                    Masuk di sini
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