"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Styling
const styles = {
  root: `min-h-screen bg-[#FAF9F6] p-6`,
  wrap: `max-w-[900px] mx-auto`,
  topbar: `bg-[#A13D3D] text-[#E9B44C] p-3 rounded-lg text-center font-bold mb-4 shadow-md`,
  card: `bg-white p-6 rounded-xl shadow-lg`,
  heading: `text-[#A13D3D] text-2xl font-bold mb-2`,
  lead: `text-[#666666] mb-4`,
  row: `flex flex-col md:flex-row gap-3 mb-3`,
  col: `flex-1`,
  label: `text-sm text-gray-700 mb-1.5 font-semibold`,
  required: `text-[#b00020]`,
  small: `text-xs text-[#666666] mt-1.5`,
  note: `mt-3 p-2.5 border-l-4 border-[#E9B44C] bg-[#fffaf0] rounded-md text-[#5b3f00] text-sm`,
  result: `mt-4 p-3 rounded-lg bg-[#f3fff0] border-l-6 border-[#2f8a3a] text-[#1f5d2b]`,
  filesList: `mt-2 text-sm`,
  error: `text-[#b00020] text-xs mt-1.5`
};

const formSchema = z.object({
  email: z.string().email({ message: "Isi email yang valid" }),
  wa: z.string().min(1, { message: "Isi nomor WA pelapor" }),
  nama_terlapor: z.string().min(1, { message: "Isi nama terlapor" }),
  jabatan_terlapor: z.string().optional(),
  jenis: z.string().min(1, { message: "Pilih jenis kejadian" }),
  waktu: z.string().min(1, { message: "Pilih waktu kejadian" }),
  lokasi: z.string().min(1, { message: "Isi lokasi kejadian" }),
  kronologi: z.string().min(10, { message: "Tuliskan kronologi minimal 10 karakter" })
}).strict();

type FormData = z.infer<typeof formSchema>;

export default function ReportFormPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ id?: string; error?: string } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      wa: "",
      nama_terlapor: "",
      jabatan_terlapor: "",
      jenis: "",
      waktu: "",
      lokasi: "",
      kronologi: ""
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
    }
  };

  const generateReportNumber = () => {
    const n = Math.floor(Math.random() * 9000) + 1000;
    const yy = String(new Date().getFullYear()).slice(-2);
    return `LPN-${yy}${n}`;
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Process files
      const fileEntries = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          base64: await readFileAsDataURL(f)
        }))
      );

      // Create report object
      const report = {
        id: generateReportNumber(),
        created_at: new Date().toISOString(),
        ...data,
        files: fileEntries
      };

      // Simulate storing to localStorage (as in original code)
      const LS_KEY = "ppks_reports_v1";
      const store = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      store.push(report);
      localStorage.setItem(LS_KEY, JSON.stringify(store));

      // Show success
      setSubmitResult({ id: report.id });
      form.reset();
      setFiles([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitResult({ error: "Terjadi kesalahan saat mengirim laporan" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset semua input?")) {
      form.reset();
      setFiles([]);
      setSubmitResult(null);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.wrap}>
        <div className={styles.topbar}>
          SISTEM INFORMASI PENGADUAN SATGAS PPKS
        </div>

        <Card className={styles.card}>
          <h1 className={styles.heading}>Form Pelaporan</h1>
          <p className={styles.lead}>
            Isi form berikut dengan lengkap. Pastikan nomor WhatsApp yang dicantumkan aktif — admin akan menghubungi bila diperlukan.
          </p>

          {submitResult?.id && (
            <div className={styles.result}>
              <strong>Laporan terkirim.</strong>
              <div className="mt-1.5">
                Nomor laporan Anda: <strong>{submitResult.id}</strong>
              </div>
              <div className="text-sm mt-1.5">
                Simpan nomor laporan untuk cek status. Pelapor akan memeriksa status secara berkala di sistem.
              </div>
            </div>
          )}

          {submitResult?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{submitResult.error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Kontak Pelapor */}
              <div className={styles.row}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className={styles.col}>
                      <FormLabel>
                        Email Pelapor <span className={styles.required}>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="email@contoh.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wa"
                  render={({ field }) => (
                    <FormItem className={styles.col}>
                      <FormLabel>
                        No. WhatsApp Pelapor <span className={styles.required}>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="62812xxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className={styles.small}>
                        Contoh: 62812xxxxxxx (Indonesia tanpa tanda +)
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              {/* Identitas Terlapor */}
              <div className={styles.row}>
                <FormField
                  control={form.control}
                  name="nama_terlapor"
                  render={({ field }) => (
                    <FormItem className={styles.col}>
                      <FormLabel>
                        Nama Terlapor <span className={styles.required}>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nama terlapor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jabatan_terlapor"
                  render={({ field }) => (
                    <FormItem className={styles.col}>
                      <FormLabel>Jabatan / Status Terlapor</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Dosen / Tenaga Kependidikan / Mahasiswa / Lainnya" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dokumen & Jenis */}
              <div className={styles.row}>
                <div className={styles.col}>
                  <FormLabel>Dokumen Pendukung (opsional)</FormLabel>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {files.length > 0 && (
                    <div className={styles.filesList}>
                      <ul>
                        {files.map((f, i) => (
                          <li key={i}>
                            {f.name} ({Math.round(f.size/1024)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className={styles.small}>
                    Anda dapat mengunggah beberapa file. (pdf, docx, jpg, png)
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="jenis"
                  render={({ field }) => (
                    <FormItem className={styles.col}>
                      <FormLabel>
                        Jenis Kejadian <span className={styles.required}>*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="-- Pilih Jenis Kejadian --" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kekerasan_seksual">Kekerasan Seksual</SelectItem>
                          <SelectItem value="kekerasan_fisik">Kekerasan Fisik</SelectItem>
                          <SelectItem value="kekerasan_psikis">Kekerasan Psikis / Verbal</SelectItem>
                          <SelectItem value="bullying">Perundungan (Bullying)</SelectItem>
                          <SelectItem value="diskriminasi">Diskriminasi / Intoleransi</SelectItem>
                          <SelectItem value="lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Waktu & Lokasi */}
              <div className={styles.row}>
                <FormField
                  control={form.control}
                  name="waktu"
                  render={({ field }) => (
                    <FormItem className={styles.col}>
                      <FormLabel>
                        Waktu Kejadian <span className={styles.required}>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lokasi"
                  render={({ field }) => (
                    <FormItem className={styles.col}>
                      <FormLabel>
                        Lokasi Kejadian <span className={styles.required}>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contoh: Ruang A, Perpustakaan, Kampus A" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Kronologis */}
              <FormField
                control={form.control}
                name="kronologi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kronologis / Detail Kejadian <span className={styles.required}>*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tuliskan kronologi secara singkat namun informatif. Sertakan waktu, siapa yang terlibat, dan bukti bila ada."
                        className="min-h-[140px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: "#A13D3D", color: "#E9B44C" }}
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
                </Button>
              </div>

              <div className={styles.note}>
                Penting: Sistem menjamin kerahasiaan data pelapor. Pelapor dapat memilih untuk tidak mencantumkan identitas lengkap (opsi anonim akan tersedia di versi final). Untuk sekarang, isi data sesuai kenyamanan.
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
