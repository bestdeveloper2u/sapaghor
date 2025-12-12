# Sapaghor ERP (সাপাঘর ERP)

## Overview
Sapaghor ERP is a comprehensive Printing & Design Business Management System built with Flask (Python) and React. It features TallyERP-style workflow management with full Bengali language support for order tracking, production management, invoicing, and delivery.

**Company**: Sapaghor (সাপাঘর)  
**Website**: facebook.com/sapaghor  
**Version**: 1.0.0  
**Last Updated**: December 2025

---

## Quick Start

### Default Credentials
- **Username**: admin
- **Password**: admin123

### Sample Data
The system comes pre-loaded with sample data including:
- 12 customers (Bengali company names)
- 25 orders in various workflow stages
- 7 users with different roles
- 12 inventory items
- 8 equipment items
- Sample payments and transactions

---

## Project Architecture

### Technology Stack
- **Backend**: Python 3.11, Flask, Flask-SQLAlchemy, Flask-Login
- **Frontend**: React 19, Vite, TailwindCSS, React Query
- **Database**: PostgreSQL
- **Authentication**: Session-based with Flask-Login

### Directory Structure
```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── pages/         # Page components
│   │   └── utils/         # API utilities
│   └── index.html
├── server/                 # Flask backend
│   ├── models/            # SQLAlchemy models
│   ├── routes/            # API endpoints
│   ├── app.py             # Flask application factory
│   ├── config.py          # Configuration
│   ├── extensions.py      # Flask extensions
│   └── seed_data.py       # Sample data seeder
├── main.py                # Application entry point
├── start.sh               # Development startup script
├── DEPLOYMENT.md          # Deployment documentation
└── replit.md              # This file
```

---

## Core Modules

### 1. Order Management
- Create and track orders through 9 workflow stages
- Bengali labels for all statuses
- Material cost tracking per order item
- Extra fees (design, urgency, cashing, misc)
- Payment status tracking

### 2. Customer Management (CRM)
- Customer database with Bengali names
- Contact information and addresses
- Order history and outstanding balance
- Credit limit management

### 3. Production Workflow
Stages (with Bengali labels):
1. অর্ডার (Order)
2. ডিজাইনে প্রেরণ (Design Sent)
3. প্রুফ প্রদান (Proof Given)
4. প্রুফ সম্পন্ন (Proof Complete)
5. প্লেট সেটিং এ প্রেরণ (Plate Setting)
6. ছাপা সম্পন্ন (Printing Complete)
7. বাইন্ডিং এ প্রেরণ (Binding Sent)
8. অর্ডার সম্পন্ন ও প্রস্তুত (Order Ready)
9. ডেলিভারী প্রদান (Delivered)

### 4. Material Tracking
Track costs per order for:
- প্লেট (Plate)
- কাগজ (Paper)
- ডুপ্লিকেট (Duplicate)
- কালি (Ink)
- ছাপা (Printing)
- বাইন্ডিং (Binding)
- লেমিনেটিং (Laminating)
- অন্যান্য (Others)

### 5. Finance Module
- Invoice generation
- Payment tracking (Cash, Bank, Mobile Banking)
- Receipt management
- Expense tracking
- Financial reports

### 6. Inventory Management
- Stock in/out tracking
- Low stock alerts
- Supplier management
- Material consumption tracking

### 7. Delivery Management
- Delivery scheduling
- Delivery personnel assignment
- Status tracking
- Delivery reports

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| Super Admin | Full system access | All modules |
| Management | Oversight & reports | Orders, Reports, Customers |
| Shareholder | Financial analytics | Reports, Finance |
| Designer | Design module | Design, Orders (view) |
| Production | Production tracking | Production, Orders (view) |
| Accountant | Finance operations | Finance, Orders (view), Customers |
| Delivery | Delivery operations | Delivery, Orders (view) |

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/<id>` - Get order
- `PUT /api/orders/<id>` - Update order
- `PUT /api/orders/<id>/status` - Update status

### Dashboard
- `GET /api/dashboard/stats` - Statistics
- `GET /api/dashboard/orders-by-status` - Status counts
- `GET /api/dashboard/recent-orders` - Recent orders

### Other Endpoints
- `/api/customers` - Customer CRUD
- `/api/payments` - Payment management
- `/api/invoices` - Invoice management
- `/api/deliveries` - Delivery management
- `/api/design-tasks` - Design tasks
- `/api/production-tasks` - Production tasks

---

## Development

### Run Development Server
```bash
bash start.sh
```

### Seed Database
```bash
flask seed          # Seed if empty
flask seed --force  # Force re-seed
```

### Build Frontend
```bash
cd client && npm run build
```

---

## Configuration

### Environment Variables
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| FLASK_SECRET_KEY | Flask session secret |
| SESSION_SECRET | Session encryption key |

---

## User Preferences

- **Language**: Bengali (বাংলা) with English labels
- **Currency**: BDT (৳)
- **Date Format**: DD/MM/YYYY

---

## Recent Changes

### December 2025
- Initial release with TallyERP-style workflow
- Bengali language support added
- Material tracking per order item
- Extra fees (design, urgency, cashing, misc)
- Sample data seeding
- Deployment documentation
- Dashboard with quick actions

---

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions including:
- Local development setup
- Production deployment with Gunicorn/Nginx
- Replit deployment (publishing)
- Database backup/restore

---

## Support

- **Facebook**: facebook.com/sapaghor
- **Email**: sapaghor@gmail.com
