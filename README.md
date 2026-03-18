# Cosy – Student Accommodation Marketplace

A modern platform connecting South African students with quality, affordable, NSFAS-accredited accommodation near their universities.

---

## Table of Contents

- [Project Vision](#project-vision)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Project Vision

**Cosy** solves the accommodation crisis for South African university students by providing:

- 🏠 A searchable marketplace of student-friendly accommodation listings
- ✅ NSFAS accreditation filtering so funded students find eligible properties
- 📍 Distance-from-campus filtering for convenient living
- 📋 A streamlined request system connecting students and property admins
- 📱 A mobile-first, responsive UI inspired by Airbnb aesthetics

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Next.js 14, React, TailwindCSS      |
| State        | Zustand, React Query (TanStack)     |
| Backend      | Node.js, Express.js                 |
| Database     | MongoDB Atlas + Mongoose            |
| Auth         | JWT + bcrypt                        |
| Image CDN    | Cloudinary                          |
| Deployment   | Vercel (frontend), Railway (backend)|

---

## Architecture

```
cosy/
├── frontend/        # Next.js 14 application
│   ├── pages/       # Next.js pages (file-based routing)
│   ├── components/  # Reusable React components
│   ├── hooks/       # Custom React hooks
│   ├── services/    # API client functions
│   ├── utils/       # Utility helpers
│   ├── styles/      # Global CSS & TailwindCSS config
│   └── context/     # React context providers
│
├── backend/         # Express REST API
│   ├── routes/      # Express route definitions
│   ├── controllers/ # Route handler logic
│   ├── models/      # Mongoose data models
│   ├── middleware/  # Auth & validation middleware
│   ├── config/      # DB connection & env config
│   └── utils/       # Backend utility helpers
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A [Cloudinary](https://cloudinary.com/) account

### Installation

```bash
# Clone the repository
git clone https://github.com/UmalumeWabanye/cosy.git
cd cosy

# Install all dependencies (root + workspaces)
npm run install:all
```

### Environment Variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

See [backend/.env.example](./backend/.env.example) and [frontend/.env.example](./frontend/.env.example) for the required variables.

---

## Project Structure

### Frontend (`/frontend`)

| Directory         | Purpose                                         |
|-------------------|-------------------------------------------------|
| `pages/`          | Next.js route pages                             |
| `pages/api/`      | Next.js API routes (thin proxy if needed)       |
| `components/`     | Reusable UI components grouped by feature       |
| `hooks/`          | Custom hooks (useAuth, useProperties, etc.)     |
| `services/`       | Axios-based API service functions               |
| `utils/`          | Pure helper functions (formatters, validators)  |
| `styles/`         | global.css and Tailwind config                  |
| `context/`        | Zustand stores & React context                  |

### Backend (`/backend`)

| Directory        | Purpose                                          |
|------------------|--------------------------------------------------|
| `routes/`        | Express router files per resource                |
| `controllers/`   | Business logic for each route                    |
| `models/`        | Mongoose schemas (User, Property, Request)       |
| `middleware/`    | JWT auth guard, error handler, validation        |
| `config/`        | MongoDB connection, Cloudinary config            |
| `utils/`         | Shared helpers (token generation, etc.)          |

---

## Development Workflow

```bash
# Start backend in watch mode (from repo root)
npm run dev:backend

# Start frontend dev server (from repo root)
npm run dev:frontend
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:3000`

---

## Deployment

| Service  | Platform  | Notes                              |
|----------|-----------|------------------------------------|
| Frontend | Vercel    | Auto-deploy from `main` branch     |
| Backend  | Railway   | Set env vars in Railway dashboard  |
| Database | MongoDB Atlas | Whitelist Railway/Vercel IPs   |
| Images   | Cloudinary | Free tier for MVP                 |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add property search"`
4. Push and open a Pull Request

---

*Built with ❤️ to make student life a little cozier.*
