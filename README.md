# 🎯 Social Media Sentiment Analyzer

Aplikasi web full-stack untuk menghimpun dan menganalisis sentimen komentar dari video YouTube, Instagram, TikTok, dan Threads.

## 📋 Tech Stack

- **Frontend:** React 18 + Vite + React Router + Recharts
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Sentiment Engine:** `sentiment` library + custom Indonesian lexicon
- **Deployment:** Docker / PM2 / Nginx

## 📁 Struktur Project

```
sentiment-analyzer/
├── backend/
│   ├── models/Analysis.js          # Schema MongoDB
│   ├── routes/analysis.js          # API routes
│   ├── controllers/                # Business logic
│   ├── services/                   # YouTube, sentiment, crawler
│   ├── middleware/                 # Error handler
│   ├── server.js                   # Entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                  # Home & Results
│   │   ├── components/             # Chart, Comments, Stats
│   │   ├── services/api.js         # Axios client
│   │   └── styles/                 # CSS minimalist
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml              # Orchestration semua service
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

## 🚀 Quick Start (Local Development)

### Prasyarat
- Node.js >= 18
- MongoDB >= 6 (atau gunakan Docker)
- YouTube Data API v3 key — dapatkan di https://console.cloud.google.com/

### Langkah 1 — Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env: isi MONGO_URI dan YOUTUBE_API_KEY

# Frontend
cd ../frontend
npm install
```

### Langkah 2 — Jalankan MongoDB

```bash
# Via Docker (paling cepat)
docker run -d -p 27017:27017 --name mongo-sentiment mongo:7

# Atau pakai MongoDB lokal
mongod --dbpath ./data
```

### Langkah 3 — Run

```bash
# Terminal 1 — backend
cd backend && npm run dev
# berjalan di http://localhost:5000

# Terminal 2 — frontend
cd frontend && npm run dev
# berjalan di http://localhost:5173
```

Buka `http://localhost:5173` di browser.

---

## 🐳 Deployment via Docker (Recommended)

Cara paling cepat untuk deploy ke server:

```bash
# 1. Set environment variable
export YOUTUBE_API_KEY=your_youtube_api_key_here

# 2. Build & jalankan semua service
docker-compose up -d --build

# 3. Cek status
docker-compose ps
docker-compose logs -f
```

Aplikasi akan tersedia di:
- Frontend: `http://server-ip` (port 80)
- Backend API: `http://server-ip:5000`
- MongoDB: `mongodb://server-ip:27017`

Untuk menghentikan:
```bash
docker-compose down            # stop
docker-compose down -v         # stop + hapus volume DB
```

---

## 🌐 Deployment Production (PM2 + Nginx)

### 1. Persiapan Server Ubuntu

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable mongod && sudo systemctl start mongod

# Install PM2 & Nginx
sudo npm install -g pm2
sudo apt install -y nginx
```

### 2. Deploy Backend

```bash
cd /var/www
sudo git clone <repo-url> sentiment-analyzer
cd sentiment-analyzer/backend
npm install --production

# Setup .env production
sudo nano .env
# Isi:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/sentiment
# YOUTUBE_API_KEY=xxx
# NODE_ENV=production

# Start dengan PM2
pm2 start server.js --name sentiment-api
pm2 save
pm2 startup        # auto-start saat reboot
```

### 3. Build & Deploy Frontend

```bash
cd ../frontend
npm install
# Update src/services/api.js → ganti baseURL ke domain Anda
npm run build
# Hasil build ada di folder `dist/`
```

### 4. Konfigurasi Nginx

```bash
sudo nano /etc/nginx/sites-available/sentiment-analyzer
```

Isi dengan:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (static files)
    root /var/www/sentiment-analyzer/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;   # crawling bisa lama
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/sentiment-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. HTTPS dengan Let's Encrypt (Opsional tapi disarankan)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔑 Mendapatkan YouTube API Key

1. Buka https://console.cloud.google.com/
2. Buat project baru
3. Aktifkan **YouTube Data API v3** di Library
4. Buat credentials → API key
5. Salin ke `.env`: `YOUTUBE_API_KEY=xxx`

Quota gratis: 10.000 unit/hari (~ 200 video × 100 komentar)

---

## ⚠️ Catatan Platform Non-YouTube

- **YouTube:** ✅ Implementasi lengkap via official API
- **Instagram / TikTok / Threads:** ⚠️ Stub implementation
  - Platform-platform ini tidak menyediakan API publik untuk komentar
  - Untuk produksi, butuh layanan pihak ketiga (Apify, Bright Data, RapidAPI) atau scraping headless
  - File `crawlerService.js` sudah disiapkan dengan interface untuk integrasi tersebut

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/analyze` | Mulai analisis dari URL |
| GET | `/api/analysis/:id` | Ambil hasil analisis |
| GET | `/api/analysis/:id/download?format=csv` | Download hasil (csv/json) |
| GET | `/api/history` | Daftar semua analisis |

Contoh request:

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

---

## 🛠️ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `ECONNREFUSED` ke MongoDB | Cek `sudo systemctl status mongod`, restart bila perlu |
| YouTube `quotaExceeded` | Quota harian habis, tunggu reset atau apply quota increase |
| CORS error di frontend | Cek `CORS_ORIGIN` di backend `.env` |
| `EADDRINUSE` port 5000 | `lsof -i :5000` lalu `kill -9 <PID>` |

---

## 📄 License

MIT
