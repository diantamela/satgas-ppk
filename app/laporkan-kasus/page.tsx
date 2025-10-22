"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Upload, Shield, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const reportFormSchema = z.object({
  title: z.string().min(10, { message: "Judul laporan harus minimal 10 karakter" }),
  description: z.string().min(50, { message: "Deskripsi laporan harus minimal 50 karakter" }),
  category: z.string().min(1, { message: "Pilih kategori kekerasan" }),
  severity: z.string().min(1, { message: "Pilih tingkat keparahan" }),
  isAnonymous: z.boolean().default(false),
  reporterName: z.string().optional(),
  reporterEmail: z.string().email("Email tidak valid").optional(),
  respondentName: z.string().min(1, { message: "Nama terlapor wajib diisi" }),
  incidentDate: z.string().optional(),
  incidentLocation: z.string().optional(),
});

export default function ReportFormPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      isAnonymous: false,
      title: "",
      description: "",
      category: "",
      severity: "",
      reporterName: "",
      reporterEmail: "",
      respondentName: "",
      incidentDate: "",
      incidentLocation: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: z.infer<typeof reportFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Prepare evidence files data (in a real implementation, you would upload files first and get URLs)
      const evidenceFiles = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }));
      
      // Submit the report to the API
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          evidenceFiles: evidenceFiles.length > 0 ? evidenceFiles : null,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsSubmitted(true);
        
        // Reset form after successful submission
        form.reset();
        setFiles([]);
      } else {
        alert(result.message || "Terjadi kesalahan saat mengirim laporan");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Terjadi kesalahan saat mengirim laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Laporan Terkirim!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Laporan Anda telah berhasil dikirimkan. Tim Satgas PPK akan segera memproses laporan Anda.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Nomor Laporan:</strong> SPPK-{Date.now().toString().slice(-6)}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Simpan nomor ini untuk mengecek status laporan Anda
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                  Laporkan Kasus Lain
                </Button>
                <Button onClick={() => window.location.href = "/cek-status"}>
                  Cek Status Laporan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Laporkan Kasus Kekerasan</CardTitle>
            <CardDescription>
              Formulir pelaporan kasus kekerasan secara online. Laporkan secara anonim atau terbuka.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Laporan *</FormLabel>
                        <FormControl>
                          <Input placeholder="Judul singkat laporan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori Kekerasan *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori kekerasan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="physical">Kekerasan Fisik</SelectItem>
                            <SelectItem value="verbal">Kekerasan Verbal</SelectItem>
                            <SelectItem value="sexual">Pelecehan Seksual</SelectItem>
                            <SelectItem value="psychological">Kekerasan Psikologis</SelectItem>
                            <SelectItem value="cyber">Bullying Online</SelectItem>
                            <SelectItem value="other">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Laporan *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Jelaskan secara rinci kejadian yang terjadi..." 
                          className="min-h-[150px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tingkat Keparahan *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tingkat keparahan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Rendah</SelectItem>
                            <SelectItem value="medium">Sedang</SelectItem>
                            <SelectItem value="high">Tinggi</SelectItem>
                            <SelectItem value="critical">Kritis</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="respondentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Terlapor *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama orang yang dilaporkan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="incidentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Kejadian</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="incidentLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lokasi Kejadian</FormLabel>
                        <FormControl>
                          <Input placeholder="Lokasi tempat kejadian berlangsung" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Identitas Pelapor</h3>
                  
                  <FormField
                    control={form.control}
                    name="isAnonymous"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0 mb-4">
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                        <div className="space-y-1 leading-none">
                          <FormLabel>Laporkan secara anonim</FormLabel>
                          <FormDescription>
                            Pilih ini jika Anda ingin melaporkan tanpa menyertakan identitas
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {!form.watch("isAnonymous") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="reporterName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Lengkap *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nama lengkap Anda" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="reporterEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Email Anda (opsional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Unggah Bukti</h3>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Seret dan lepas file di sini, atau klik untuk memilih
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Format didukung: JPG, PNG, PDF, DOCX (max 10MB)
                    </p>
                    <Input 
                      type="file" 
                      multiple 
                      onChange={handleFileChange}
                      className="hidden" 
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload" 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      Pilih File
                    </label>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">File Terpilih:</h4>
                      <ul className="space-y-2">
                        {files.map((file, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <span className="text-sm truncate max-w-xs">{file.name}</span>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeFile(index)}
                            >
                              Hapus
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center pt-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Laporan Anda akan dirahasiakan dan ditangani secara profesional
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}