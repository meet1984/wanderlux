# 🌍 WanderLux — AI-Powered Vacation Planner

A full-stack travel planning platform powered by Google Gemini AI. Enter a destination and trip duration, get a beautiful day-by-day itinerary — restaurants, attractions, budget, transport tips, and a downloadable PDF.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT + bcrypt |
| PDF | PDFKit |

---

## 📁 Project Structure

```
wanderlux/
├── backend/
│   ├── config/db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js         # Register, login, getMe
│   │   └── tripController.js         # CRUD, regenerate, PDF download
│   ├── middleware/
│   │   ├── auth.js                   # JWT verify + token generator
│   │   ├── logger.js                 # Dev request logger
│   │   └── validate.js               # express-validator rules
│   ├── routes/
│   │   ├── auth.js                   # /api/auth/*
│   │   └── trips.js                  # /api/trips/* (all protected)
│   ├── utils/
│   │   ├── geminiService.js          # Google Gemini AI integration
│   │   └── pdfGenerator.js           # PDFKit multi-page export
│   ├── schema.sql                    # MySQL schema
│   ├── server.js                     # Express entry point
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/AuthPage.js           # Login + Register
    │   │   ├── Dashboard/DashboardPage.js # Trip history cards
    │   │   ├── Itinerary/ItineraryPage.js # Day-by-day viewer
    │   │   ├── Landing/
    │   │   │   ├── LandingPage.js         # Hero + features
    │   │   │   └── PlannerPage.js         # Trip form + AI loading
    │   │   └── UI/
    │   │       ├── ErrorBoundary.js
    │   │       ├── Navbar.js
    │   │       ├── NotFoundPage.js
    │   │       └── ProtectedRoute.js
    │   ├── context/AuthContext.js         # Global auth state
    │   ├── hooks/
    │   │   ├── useToast.js               # Toast notifications
    │   │   └── useTrips.js               # Paginated trips hook
    │   ├── services/
    │   │   ├── api.js                    # Axios + JWT interceptors
    │   │   └── tripService.js            # Trip API calls
    │   ├── App.js
    │   └── index.css                     # Tailwind + Google Fonts
    └── tailwind.config.js
```

---

## ✅ Prerequisites

- **Node.js** v18+ → https://nodejs.org
- **MySQL** 8.0+ → https://dev.mysql.com/downloads/
- **Google Gemini API key** → https://aistudio.google.com/apikey (free tier available)

Verify:
```bash
node -v       # v18+
mysql --version
```

---

## 🚀 Local Development Setup

### Step 1 — Database

```bash
mysql -u root -p
```
```sql
source /full/path/to/wanderlux/backend/schema.sql
```

Or from terminal:
```bash
mysql -u root -p < backend/schema.sql
```

### Step 2 — Backend

```bash
cd backend
cp .env.example .env
nano .env          # fill in your values (see below)

npm install
npm run dev
# → ✅ MySQL connected
# → 🚀 WanderLux API running on http://localhost:5000
```

### Step 3 — Frontend

```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api  (already correct for local)

npm install
npm start
# → Opens http://localhost:3000
```

---

## 🔑 Environment Variables

### backend/.env

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wanderlux

# Generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=your_64_char_random_string
JWT_EXPIRES_IN=7d

GOOGLE_GEMINI_API_KEY=AIzaSy_your_key_here

FRONTEND_URL=http://localhost:3000
```

### frontend/.env

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📡 API Reference

### Auth

| Method | Endpoint | Body | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | ❌ |
| POST | `/api/auth/login` | `{ email, password }` | ❌ |
| GET | `/api/auth/me` | — | ✅ |

### Trips — all require `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/trips` | Generate AI itinerary |
| GET | `/api/trips?page=1` | Paginated list (9/page) |
| GET | `/api/trips/:id` | Single trip + itinerary |
| DELETE | `/api/trips/:id` | Delete trip |
| POST | `/api/trips/:id/regenerate` | Regenerate itinerary |
| GET | `/api/trips/:id/pdf` | Download PDF |

**POST `/api/trips` body:**
```json
{
  "destination": "Kyoto, Japan",
  "days": 5,
  "preferences": {
    "budget": "moderate",
    "travelStyle": "balanced",
    "interests": ["Culture", "Food", "History"]
  }
}
```

---

## 🗄️ Database Schema

```
users         → id, name, email, password_hash, created_at
trips         → id, user_id (FK), destination, days, preferences (JSON), status, created_at
itineraries   → id, trip_id (FK, UNIQUE), itinerary_data (JSON), model_used, tokens_used, created_at
```

- Deleting a trip cascades to its itinerary automatically.
- `status` = `generating | completed | failed`

---

## ☁️ Production Deployment (Ubuntu 22.04 VPS)

No Docker. Plain Node.js + Nginx + PM2 + MySQL.

### 1. Install system dependencies

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# MySQL 8
apt install -y mysql-server
mysql_secure_installation

# Nginx
apt install -y nginx

# PM2 — keeps Node running as a service
npm install -g pm2
```

### 2. Create a dedicated MySQL user

```bash
mysql -u root -p
```
```sql
CREATE USER 'wanderlux'@'localhost' IDENTIFIED BY 'StrongDbPassword!';
GRANT ALL PRIVILEGES ON wanderlux.* TO 'wanderlux'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import schema:
```bash
mysql -u wanderlux -p wanderlux < /var/www/wanderlux/backend/schema.sql
```

### 3. Deploy code

```bash
mkdir -p /var/www/wanderlux
cd /var/www/wanderlux

# Clone from GitHub
git clone https://github.com/yourname/wanderlux.git .

# Or upload from local machine with rsync:
# rsync -avz --exclude node_modules ./wanderlux/ user@server:/var/www/wanderlux/
```

### 4. Start the backend with PM2

```bash
cd /var/www/wanderlux/backend
cp .env.example .env
nano .env    # fill in production values

npm install --omit=dev

pm2 start server.js --name wanderlux-api
pm2 save
pm2 startup   # run the printed command to enable auto-start on reboot
```

Check:
```bash
pm2 status
pm2 logs wanderlux-api
```

### 5. Build the frontend

```bash
cd /var/www/wanderlux/frontend

echo "REACT_APP_API_URL=https://api.yourdomain.com/api" > .env.production

npm install
npm run build
# Creates: /var/www/wanderlux/frontend/build/
```

### 6. Configure Nginx

```bash
nano /etc/nginx/sites-available/wanderlux
```

```nginx
# Serves the React SPA
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/wanderlux/frontend/build;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript application/json;

    # React Router — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache hashed static assets indefinitely
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Reverse proxy to Node.js API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_cache_bypass $http_upgrade;

        # AI generation can take up to 30s
        proxy_read_timeout    90s;
        proxy_connect_timeout 10s;
    }
}
```

Enable it:
```bash
ln -s /etc/nginx/sites-available/wanderlux /etc/nginx/sites-enabled/
nginx -t          # must print: syntax is ok
systemctl reload nginx
```

### 7. Add free HTTPS (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx

certbot --nginx \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com
```

Certbot rewrites the Nginx config automatically and sets up auto-renewal.

Test renewal:
```bash
certbot renew --dry-run
```

### 8. Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

### 9. Updating the app

```bash
cd /var/www/wanderlux

# Pull new code
git pull

# Update backend
cd backend
npm install --omit=dev
pm2 restart wanderlux-api

# Rebuild frontend
cd ../frontend
npm install
npm run build
# Nginx picks up the new build with no restart needed
```

---

## 🔒 Security Checklist

- [x] Passwords hashed with **bcrypt** (cost 12)
- [x] JWT with expiry — 7 days default
- [x] **Helmet.js** — secure HTTP headers
- [x] **Rate limiting** — 100 req/15min global, 5 req/min on AI endpoint
- [x] **CORS** restricted to frontend origin
- [x] **Parameterised SQL** — no injection risk
- [x] **Input validation** on all endpoints (express-validator)
- [x] User isolation — users only see their own trips
- [x] Non-root MySQL user in production
- [x] HTTPS via Let's Encrypt
- [x] UFW firewall — ports 22, 80, 443 only

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| `MySQL connection refused` | `systemctl start mysql` |
| PM2 process crashes | `pm2 logs wanderlux-api --lines 50` |
| Blank page after deploy | Check `REACT_APP_API_URL` in `.env.production`, rebuild |
| `502 Bad Gateway` from AI | Gemini timed out — retry. Check quota at aistudio.google.com |
| CORS error in browser | Ensure `FRONTEND_URL` in backend `.env` matches your frontend origin exactly (including `https://`) |
| PDF download fails | Check backend logs — pdfkit must be installed |

---

## 🎨 Design Tokens

| Name | Hex | Use |
|---|---|---|
| `ink` | `#1a1a2e` | Dark background |
| `cream` | `#f8f4ef` | Primary text |
| `sand` | `#e8a87c` | Accent, CTAs |
| `sand-dark` | `#c4845a` | Hover on sand |
| `sky` | `#4a90a4` | Secondary accent |

Fonts: **Playfair Display** (headings) · **DM Sans** (body)

---

## 📄 License

MIT
