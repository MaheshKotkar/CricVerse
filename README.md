# CricVerse 🏏

A modern, full-stack cricket tournament management platform that empowers organizers to schedule matches and players to join leagues seamlessly.

## 🚀 Features

### 🔐 Authentication
- **Multi-Role Support**: Specialized dashboards for `Organizer`, `Player`, and `Admin`.
- **Google OAuth Integration**: Fast and secure login using Google accounts.
- **JWT Security**: Protected routes and role-based access control (RBAC).

### 🏆 Organizer Dashboard
- **Tournament Management**: Create and manage tournaments (T20, ODI, Test).
- **Team Management**: Build and manage squads with custom logos and player roles.
- **Live Match Scheduling**: Dynamically schedule matches between registered teams.
- **Start Tournament**: Transition tournaments from Draft to Active with modern toast notifications.

### 👤 Player Dashboard
- **Personalized Profile**: View career stats, batting roles, and recent awards in a sleek UI.
- **Find Tournaments**: Browse available tournaments created by organizers across the portal.
- **Join Event**: Instantly register for upcoming tournaments with real-time feedback.

### 🎨 UI/UX Excellence
- **Fully Responsive**: Optimized for Mobile, Tablet, and Desktop views (Zero horizontal scrollbars).
- **Premium Design**: Dark-themed glassmorphism interface with smooth Framer Motion animations.
- **Real-time Notifications**: Integrated `react-hot-toast` for all actions and confirmations.

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Framer Motion, Lucide React, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Passport.js.
- **Styling**: Vanilla CSS with modern responsive grid/flex layouts.
- **Feedback**: React Hot Toast.

## 📂 Project Structure

```text
cricV/
├── next-client/     # Next.js Frontend
│   ├── src/app/     # App Router pages (Dashboard, Auth, etc.)
│   ├── components/  # Shared UI components
│   └── context/     # Auth Context
├── server/          # Node.js Backend
│   ├── models/      # Mongoose Schemas (User, Team, Tournament, Match)
│   ├── routes/      # API Endpoints
│   └── middleware/  # Auth/Role logic
└── README.md
```

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   ```

2. **Frontend Setup**:
   ```bash
   cd next-client
   npm install
   npm run dev
   ```

3. **Backend Setup**:
   ```bash
   cd server
   npm install
   # Add your .env (MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID, etc.)
   npm run dev
   ```

---
Built with ❤️ for the Cricket Community.
