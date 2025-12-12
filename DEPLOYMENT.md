# Sapaghor ERP - Deployment & Setup Guide

## Overview
Sapaghor ERP (সাপাঘর ERP) is a printing and design business management system built with Flask (Python) and React. It features TallyERP-style workflow management with Bengali language support.

---

## Quick Start (Replit)

### Development Mode
1. The application auto-starts when you open the Replit project
2. Default credentials: **admin** / **admin123**
3. Sample data is automatically seeded on first run

### Manual Commands
```bash
# Seed database with sample data (if needed)
flask seed

# Force re-seed (clears existing data)
flask seed --force
```

---

## System Requirements

### For Local Deployment
- **Python 3.11+**
- **Node.js 20+**
- **PostgreSQL 14+**

### For Production
- **Linux server** (Ubuntu 22.04 recommended)
- **Nginx** (reverse proxy)
- **Gunicorn** (WSGI server)
- **PM2** or **systemd** (process management)

---

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sapaghor_erp

# Flask
FLASK_SECRET_KEY=your-secret-key-here
FLASK_ENV=production

# Session
SESSION_SECRET=your-session-secret
```

### Required Environment Variables:
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://... |
| FLASK_SECRET_KEY | Flask secret for sessions | random-string |
| SESSION_SECRET | Session encryption key | random-string |

---

## Local Development Setup

### 1. Clone and Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt
# OR using uv
uv sync

# Install Node.js dependencies
cd client && npm install
```

### 2. Set Up Database
```bash
# Create PostgreSQL database
createdb sapaghor_erp

# Set DATABASE_URL
export DATABASE_URL="postgresql://localhost/sapaghor_erp"
```

### 3. Initialize Database & Seed Data
```bash
# Start application (auto-creates tables)
python main.py

# Or manually seed data
flask seed
```

### 4. Run Development Servers
```bash
# Option 1: Run both servers
bash start.sh

# Option 2: Run separately
# Terminal 1 - Backend
python main.py

# Terminal 2 - Frontend
cd client && npm run dev
```

Access the application at: **http://localhost:5000**

---

## Production Deployment

### 1. Build Frontend
```bash
cd client
npm run build
```

### 2. Configure Gunicorn
Create `gunicorn.conf.py`:
```python
bind = "0.0.0.0:5001"
workers = 4
threads = 2
worker_class = "sync"
timeout = 120
accesslog = "-"
errorlog = "-"
```

### 3. Run with Gunicorn
```bash
gunicorn --config gunicorn.conf.py "main:app"
```

### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /path/to/client/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. Systemd Service
Create `/etc/systemd/system/sapaghor-erp.service`:
```ini
[Unit]
Description=Sapaghor ERP Application
After=network.target postgresql.service

[Service]
User=www-data
WorkingDirectory=/path/to/sapaghor-erp
Environment=DATABASE_URL=postgresql://...
Environment=FLASK_SECRET_KEY=your-secret
ExecStart=/path/to/gunicorn --config gunicorn.conf.py main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable sapaghor-erp
sudo systemctl start sapaghor-erp
```

---

## Replit Deployment (Publishing)

### 1. Configure Deployment
Click **Deploy** in Replit and configure:
- **Run Command**: `gunicorn --bind 0.0.0.0:5000 main:app`
- **Build Command**: `cd client && npm run build`

### 2. Environment Variables
Add production secrets in Replit Secrets:
- `FLASK_SECRET_KEY`
- `DATABASE_URL` (automatically set if using Replit DB)

---

## User Roles & Permissions

| Role | Description | Default Password |
|------|-------------|------------------|
| Super Admin | Full access to all modules | admin123 |
| Management | Oversight & reports | password123 |
| Shareholder | Financial reports | password123 |
| Designer | Design module access | password123 |
| Production | Production tracking | password123 |
| Accountant | Finance module | password123 |
| Delivery | Delivery management | password123 |

---

## Order Workflow Stages (Bengali)

| Stage Key | English | বাংলা |
|-----------|---------|-------|
| order | Order | অর্ডার |
| design_sent | Design Sent | ডিজাইনে প্রেরণ |
| proof_given | Proof Given | প্রুফ প্রদান |
| proof_complete | Proof Complete | প্রুফ সম্পন্ন |
| plate_setting | Plate Setting | প্লেট সেটিং এ প্রেরণ |
| printing_complete | Printing Complete | ছাপা সম্পন্ন |
| binding_sent | Binding Sent | বাইন্ডিং এ প্রেরণ |
| order_ready | Order Ready | অর্ডার সম্পন্ন ও প্রস্তুত |
| delivered | Delivered | ডেলিভারী প্রদান |
| cancelled | Cancelled | বাতিল |

---

## Material Types (Bengali)

| Type Key | English | বাংলা |
|----------|---------|-------|
| plate | Plate | প্লেট |
| paper | Paper | কাগজ |
| duplicate | Duplicate | ডুপ্লিকেট |
| ink | Ink | কালি |
| printing | Printing | ছাপা |
| binding | Binding | বাইন্ডিং |
| laminating | Laminating | লেমিনেটিং |
| others | Others | অন্যান্য |

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Orders
- `GET /api/orders` - List orders (with filters)
- `POST /api/orders` - Create order
- `GET /api/orders/<id>` - Get order details
- `PUT /api/orders/<id>` - Update order
- `PUT /api/orders/<id>/status` - Update order status

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/<id>` - Get customer
- `PUT /api/customers/<id>` - Update customer

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/orders-by-status` - Orders grouped by status
- `GET /api/dashboard/recent-orders` - Recent orders

### Finance
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment

---

## Backup & Restore

### PostgreSQL Backup
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### PostgreSQL Restore
```bash
psql $DATABASE_URL < backup_20231206.sql
```

---

## Troubleshooting

### Common Issues

**1. Database connection failed**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure database exists

**2. Frontend not loading**
- Run `npm run build` in client folder
- Check if dist folder exists
- Verify Vite config allows all hosts

**3. Login not working**
- Check if admin user exists
- Run `flask seed` to create default users
- Verify session cookies are enabled

**4. Bengali fonts not displaying**
- Ensure UTF-8 encoding in database
- Browser must support Bengali Unicode

---

## Support

- **Facebook**: facebook.com/sapaghor
- **Email**: sapaghor@gmail.com
- **Phone**: 01711-XXXXXX

---

**Version**: 1.0.0  
**Last Updated**: December 2025
