# ShareHub: Peer-to-Peer Asset Sharing Platform

Welcome to **ShareHub**, a modern, peer-to-peer rental marketplace designed to help neighbors rent out gear, tools, and assets locally. The platform features an escrow wallet ledger, trust verification (KYC), real-time chat coordination, dispute resolution, and review moderation.

---

## 🚀 Key Features

- **Asset Listings**: Browse, search, filter, and detail view of local gear. Owners can manage and delete their listings.
- **Booking Engine**: Coordinate rentals with automatic check-in/check-out flows. Renter/Staff booking restrictions apply.
- **Escrow Wallet**: Secure transactions tracked in an admin ledger.
- **Trust Verification (KYC)**: Compliant verification upload for users with admin approval dashboard.
- **Real-Time Chat**: Direct buyer-owner communication during active bookings.
- **Dispute Resolution**: Dedicated damage claims arbitrated by staff/admins.
- **Reviews Moderation**: Admin feedback dashboard to inspect rating metrics, filter low ratings, and remove inappropriate content.
- **Theme Redesign**: A warm-minimalist, cream-beige & vermillion design system with premium Outfit typography.

---

## 📁 Repository Structure

```text
asset-sharing-platform/
├── backend/            # Django REST Framework (DRF) Web API
│   ├── accounts/       # User profiles, auth, and analytics
│   ├── bookings/       # Rental booking coordination
│   ├── chat/           # Renter-owner communication
│   ├── disputes/       # Damage claims arbitration
│   ├── items/          # Asset listing and categories
│   ├── kyc/            # Trust verification submissions
│   ├── reviews/        # User feedback and moderation
│   ├── wallet/         # Ledger, escrow account, and balance sheets
│   └── manage.py       # Django CLI entrypoint
└── frontend/           # React, Vite, and Tailwind CSS v4 UI
    ├── src/
    │   ├── components/ # Reusable UI controls
    │   ├── layouts/    # Main and Admin layouts
    │   ├── pages/      # Route pages (Auth, Marketplace, Dashboard, Admin)
    │   ├── services/   # Axios API integrations
    │   └── App.jsx     # Root router container
    └── package.json    # NodeJS dependencies
```

---

## 🛠️ Setup & Installation

### 1. Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations and start the development server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```
   *The API will be available at `http://127.0.0.1:8000/api/`*

### 2. Frontend Setup (React & Vite)

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Launch the hot-reloading development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173/` in your browser to view the application.*

---

## 🔑 Default Credentials (Testing)

For development and platform evaluation:
- **Default Administrator**: `admin@example.com`
- **Default Password**: `password123`
