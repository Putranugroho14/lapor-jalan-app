# 🚧 Lapor Jalan Rusak

Aplikasi web untuk melaporkan kerusakan jalan dengan foto dan lokasi GPS.

## ✨ Features

- 📸 **Upload Foto** - Ambil foto kerusakan jalan langsung dari kamera
- 📍 **GPS Location** - Otomatis deteksi lokasi menggunakan GPS
- 🗺️ **Interactive Map** - Lihat semua laporan di peta interaktif
- 👤 **User Authentication** - Register & Login dengan JWT
- 🛡️ **Admin Panel** - Kelola status laporan (Pending, Proses, Selesai)
- 🗑️ **Delete Reports** - Admin bisa hapus laporan spam
- 🎨 **Apple-Inspired UI** - Glassmorphism, floating UI, smooth animations

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Axios
- React Leaflet (Maps)
- React Webcam
- Lucide React (Icons)

### Backend
- Node.js + Express
- Sequelize ORM
- SQLite (Development) / PostgreSQL (Production)
- JWT Authentication
- Multer (File Upload)
- Bcrypt (Password Hashing)

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 14+
- npm atau yarn

### Installation

1. Clone repository
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/lapor-jalan-rusak.git
cd lapor-jalan-rusak
\`\`\`

2. Install dependencies

**Backend:**
\`\`\`bash
cd server
npm install
\`\`\`

**Frontend:**
\`\`\`bash
cd client
npm install
\`\`\`

3. Run migrations (Backend)
\`\`\`bash
cd server
npx sequelize-cli db:migrate
\`\`\`

4. Start development servers

**Backend (Terminal 1):**
\`\`\`bash
cd server
npm start
# Server running on http://localhost:5000
\`\`\`

**Frontend (Terminal 2):**
\`\`\`bash
cd client
npm start
# App running on http://localhost:3000
\`\`\`

5. Open browser: `http://localhost:3000`

## 📦 Deploy to Vercel

### Via GitHub (Recommended)

1. Push code ke GitHub
2. Buka [vercel.com](https://vercel.com)
3. Import repository
4. Deploy!

**Detailed guide:** Lihat `vercel_github_deploy.md`

### Via Vercel CLI

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

## 🗄️ Database

### Development
- SQLite (file: `server/database.sqlite`)
- Otomatis dibuat saat run migrations

### Production (Vercel)
- **Option 1:** Vercel Postgres (Recommended)
- **Option 2:** Neon Database (Free tier)
- **Note:** SQLite tidak persistent di Vercel serverless

## 📸 File Upload

### Development
- Local storage (`server/uploads/`)

### Production (Vercel)
- **Recommended:** Cloudinary (Free 25GB)
- **Note:** Local uploads tidak persistent di Vercel

## 🔐 Environment Variables

### Backend (`.env`)
\`\`\`env
JWT_SECRET=your-secret-key
NODE_ENV=development
\`\`\`

### Frontend (`.env`)
\`\`\`env
REACT_APP_API_URL=http://localhost:5000
\`\`\`

## 👥 User Roles

### User (Default)
- Buat laporan
- Lihat semua laporan di peta
- Lihat history laporan sendiri

### Admin
- Semua fitur User
- Ubah status laporan (Pending → Proses → Selesai)
- Hapus laporan spam/tidak pantas

**Create Admin:**
\`\`\`sql
-- Di database, ubah role user menjadi 'admin'
UPDATE Users SET role = 'admin' WHERE email = 'admin@example.com';
\`\`\`

## 📱 Screenshots

(Tambahkan screenshot aplikasi Anda di sini)

## 🎨 Design System

- **Colors:** Apple Blue (#007AFF), Gradients
- **Typography:** System fonts (SF Pro, Segoe UI, Roboto)
- **Effects:** Glassmorphism, Backdrop blur
- **Animations:** Smooth transitions, Hover effects
- **Layout:** Bento Grid, Floating UI, Card-based

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report (with photo)
- `PATCH /api/reports/:id/status` - Update status (Admin only)
- `DELETE /api/reports/:id` - Delete report (Admin only)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 👨‍💻 Author

**Putranugroho14**
- GitHub: [@Putranugroho14](https://github.com/Putranugroho14)

## 🙏 Acknowledgments

- Apple Human Interface Guidelines
- React Community
- Vercel Team

---

Made with ❤️ for better roads
