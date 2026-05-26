# Panduan & Protokol Pengujian A/B Testing - Aplikasi LaporJalan

Dokumen ini berisi rancangan skenario pengujian A/B testing untuk tiga usecase utama pada aplikasi **LaporJalan** guna menganalisis pengaruh varian desain terhadap kecepatan, kenyamanan, dan akurasi pengguna.

---

## 🚧 UC1 — Navigasi Mulai Melapor

### 1. Deskripsi Varian & Representasi Visual
* **Varian A (Navbar Entry Point):** Tombol lapor diletakkan di bagian atas pada Navbar Header (`+ Lapor`) — *Representasi visual: `A1.jpeg`*.
* **Varian B (Contextual FAB Entry Point):** Tombol lapor diletakkan sebagai *Floating Action Button* (FAB) di sudut kanan bawah peta — *Representasi visual: `B1.jpeg`*.

### 2. Tujuan Pengujian
Mengetahui apakah peletakan tombol lapor berpengaruh terhadap kecepatan dan kenyamanan jangkauan user dalam mengklik tombol lapor.

### 3. Metrik Pengukuran
* **Time to First Click (TTFC):** Mengukur kecepatan jangkauan pengguna ke tombol lapor (mulai dari halaman Beranda/Peta termuat hingga tombol diklik).
* **Kenyamanan (Skala Likert 1-5):** Mengukur kenyamanan jangkauan fisik tombol dari sudut pandang ergonomis.

#### Pertanyaan Skala Likert (UC1):
> **"Seberapa nyaman kamu menjangkau tombol untuk memulai pelaporan?"**
* **Skor 1:** Sangat Tidak Nyaman
* **Skor 2:** Tidak Nyaman
* **Skor 3:** Cukup Nyaman
* **Skor 4:** Nyaman
* **Skor 5:** Sangat Nyaman

### 4. Prosedur Pelaksanaan (UC1)
Eksperimen menggunakan desain *within-subject* dengan *counterbalancing* urutan:
* **Grup 1:** Buka Varian A → Catat TTFC → Isi Kuesioner Varian A → Jeda → Buka Varian B → Catat TTFC → Isi Kuesioner Varian B.
* **Grup 2:** Buka Varian B → Catat TTFC → Isi Kuesioner Varian B → Jeda → Buka Varian A → Catat TTFC → Isi Kuesioner Varian A.

---

## 📝 UC2 — Pengisian Form Pelaporan

### 1. Deskripsi Varian & Representasi Visual
* **Varian A (Single-Page Form):** Seluruh isian form ditampilkan langsung dalam satu halaman *scrollable* panjang — *Representasi visual: `A2.jpeg`*.
* **Varian B (3-Step Wizard Form):** Isian form dibagi menjadi 3 langkah berurutan (*Lokasi* → *Bukti Foto* → *Deskripsi*) dengan progress indicator di bagian atas — *Representasi visual: `B21.jpeg`, `B22.jpeg`, `B23.jpeg`*.

### 2. Tujuan Pengujian
Mengetahui apakah format form berpengaruh terhadap kecepatan pengisian dan kenyamanan yang dirasakan user saat memasukkan detail laporan.

### 3. Metrik Pengukuran
* **Time to Submit (TTS):** Mengukur kecepatan penyelesaian pengisian form (mulai dari form dibuka hingga menekan tombol kirim).
* **Kenyamanan (Skala Likert 1-5):** Tingkat kenyamanan subjektif pengguna saat mengisi form.

#### Skenario Tugas (Task Scenario):
> *"Bayangkan kamu sedang melewati jalan di sekitar tempat tinggalmu dan menemukan jalan yang rusak cukup parah. Kamu ingin melaporkan kerusakan tersebut melalui aplikasi ini. Coba laporkan kerusakan jalan yang kamu temukan tadi."*

#### Pertanyaan Skala Likert (UC2):
> **"Seberapa nyaman kamu mengisi form pelaporan tadi?"**
* **Skor 1:** Sangat Tidak Nyaman
* **Skor 2:** Tidak Nyaman
* **Skor 3:** Cukup Nyaman
* **Skor 4:** Nyaman
* **Skor 5:** Sangat Nyaman

### 4. Prosedur Pelaksanaan (UC2)
* **Grup 1:** Buka Varian A → Jalankan Skenario & Catat TTS → Isi Kuesioner Varian A → Jeda → Buka Varian B → Jalankan Skenario & Catat TTS → Isi Kuesioner Varian B.
* **Grup 2:** Buka Varian B → Jalankan Skenario & Catat TTS → Isi Kuesioner Varian B → Jeda → Buka Varian A → Jalankan Skenario & Catat TTS → Isi Kuesioner Varian A.

---

## ⏱️ UC3 — Melacak Status Riwayat Laporan

### 1. Deskripsi Varian & Representasi Visual
* **Varian A (Static Text Badge):** Status laporan ditampilkan hanya berupa teks badge statis (misal: "PENDING", "PROSES", "SELESAI") — *Representasi visual: `A3.jpeg`*.
* **Varian B (Interactive Visual Timeline):** Status laporan divisualisasikan dalam bentuk alur timeline vertikal yang interaktif dengan penanda tahap yang jelas — *Representasi visual: `B23.jpeg`*.

### 2. Tujuan Pengujian
Mengetahui apakah format tampilan status laporan memengaruhi kenyamanan pengguna saat memantau progres laporan serta pemahaman mereka terhadap alur tindak lanjut.

### 3. Metrik Pengukuran
* **Kenyamanan Visual (Skala Likert 1-5):** Mengukur kenyamanan membaca progres status.
* **Faktor Kenyamanan (Pertanyaan Pilihan):** Mengidentifikasi elemen desain spesifik yang memengaruhi kenyamanan.
* **Pemahaman Aktual (Pertanyaan Faktual):** Menguji pemahaman pengguna tentang status laporan mereka saat ini guna mendeteksi *Novelty Effect*.

---

### 4. Instrumen Evaluasi Kuesioner (UC3)

#### Bagian 1 — Kenyamanan (Skala Likert):
> **"Seberapa nyaman tampilan status laporan tadi dalam membantu kamu memantau progres laporan?"**
* **Skor 1:** Sangat Tidak Nyaman
* **Skor 2:** Tidak Nyaman
* **Skor 3:** Cukup Nyaman
* **Skor 4:** Nyaman
* **Skor 5:** Sangat Nyaman

#### Bagian 2 — Pertanyaan Pilihan (Faktor Pengaruh):
> **"Bagian apa yang paling memengaruhi kenyamananmu saat melihat status laporan?"**
* **A.** Posisi status laporan mudah ditemukan
* **B.** Tahapan progres laporan terlihat jelas
* **C.** Tampilan status mudah dipahami
* **D.** Desain tampilan terasa menarik dan nyaman dilihat

#### Bagian 3 — Pertanyaan Faktual (Pendeteksi Novelty Effect):
* **Untuk Varian A:**
  > *"Setelah melihat tampilan tadi, laporan kamu saat ini sedang ada di tahap apa?"*
  * **A.** Laporan Masuk
  * **B.** Dalam Proses Penanganan
  * **C.** Laporan Selesai Diperbaiki
* **Untuk Varian B:**
  > *"Dari tampilan tadi, masih ada berapa tahap lagi sebelum laporanmu selesai diproses?"*
  * **A.** Tidak ada, sudah selesai
  * **B.** Satu tahap lagi
  * **C.** Dua tahap lagi

### 5. Prosedur Pelaksanaan (UC3)
* **Grup 1:** Buka Varian A → Minta membaca status laporan → Isi Kuesioner Varian A (Likert + Pilihan + Faktual) → Jeda → Buka Varian B → Minta membaca status laporan → Isi Kuesioner Varian B (Likert + Pilihan + Faktual).
* **Grup 2:** Buka Varian B → Minta membaca status laporan → Isi Kuesioner Varian B (Likert + Pilihan + Faktual) → Jeda → Buka Varian A → Minta membaca status laporan → Isi Kuesioner Varian A (Likert + Pilihan + Faktual).

---

## 📊 Template Lembar Pencatatan Data

### Tabel Pencatatan Data Hasil Eksperimen

| ID Partisipan | Grup | UC1: TTFC A (s) | UC1: Likert A (1-5) | UC1: TTFC B (s) | UC1: Likert B (1-5) | UC2: TTS A (s) | UC2: Likert A (1-5) | UC2: TTS B (s) | UC2: Likert B (1-5) | UC3: Likert A (1-5) | UC3: Faktual A (Betul/Salah) | UC3: Likert B (1-5) | UC3: Faktual B (Betul/Salah) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| P01 | Grup 1 | | | | | | | | | | | | |
| P02 | Grup 2 | | | | | | | | | | | | |
| P03 | Grup 1 | | | | | | | | | | | | |
| P04 | Grup 2 | | | | | | | | | | | | |
| P05 | Grup 1 | | | | | | | | | | | | |
| P06 | Grup 2 | | | | | | | | | | | | |
| **Mean** | **-** | **[Rerata]**| **[Rerata]** | **[Rerata]**| **[Rerata]** | **[Rerata]**| **[Rerata]** | **[Rerata]**| **[Rerata]** | **[Rerata]**| **[% Betul]** | **[Rerata]**| **[% Betul]** |

---

## 📈 Metode Analisis Data

1. **Analisis Efisiensi (TTFC & TTS):**
   * Bandingkan nilai rata-rata (*mean*) TTFC pada UC1 dan TTS pada UC2.
   * Varian dengan nilai waktu rata-rata terkecil dianggap memiliki kinerja efisiensi yang lebih baik.

2. **Analisis Kenyamanan (Skala Likert):**
   * Bandingkan nilai rata-rata skor Likert kenyamanan di UC1, UC2, dan UC3.
   * Nilai yang lebih mendekati 5 menunjukkan kenyamanan yang lebih tinggi.

3. **Distribusi Faktor Kenyamanan (UC3 Bagian 2):**
   * Analisis persentase distribusi jawaban A, B, C, dan D untuk melihat faktor visual mana yang paling berkontribusi terhadap kenyamanan pengguna.

4. **Pendeteksian Efek Keberuan (*Novelty Effect Check*):**
   * **Logika Silang:** Lakukan analisis silang antara skor kenyamanan subjektif (Likert) dengan akurasi pemahaman objektif (Jawaban Faktual).
   * **Indikasi Novelty Effect:** Jika pengguna memberikan skor kenyamanan yang sangat tinggi pada Varian B (Timeline), tetapi salah menjawab pertanyaan faktual (misal: menebak jumlah sisa tahap dengan tidak tepat), ini mengindikasikan adanya bias *Novelty Effect* (pengguna menyukai tampilan karena terlihat baru/modern, padahal tingkat kejelasan informasi sebenarnya lebih rendah atau membingungkan dibandingkan tampilan statis yang sederhana).
