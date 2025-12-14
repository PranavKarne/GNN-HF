# Frontend - ECG Heart Prediction System

React + TypeScript + Vite application for ECG analysis.

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── layout/     # Layout components (Navbar, Footer, etc.)
│   │   └── ui/         # Shadcn UI components
│   ├── pages/          # Page components
│   │   └── dashboard/  # Dashboard pages
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   └── assets/         # Static assets
├── public/             # Public static files
└── package.json
```

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
# or
bun install
```

### Development
```bash
npm run dev
# or
bun run dev
```
Access at: http://localhost:8080

### Build for Production
```bash
npm run build
# or
bun run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎨 Tech Stack

- **React 18** - UI Library
- **TypeScript 5.8.3** - Type safety
- **Vite 7.2.7** - Build tool
- **TailwindCSS** - Utility-first CSS
- **Shadcn UI** - Component library
- **Framer Motion** - Animations
- **TanStack Query** - Data fetching
- **React Router** - Routing

## 🔧 Configuration

### Vite Config
See `vite.config.ts` for build and dev server configuration.

### TailwindCSS
See `tailwind.config.ts` for theme and plugin configuration.

### TypeScript
See `tsconfig.json` for TypeScript compiler options.

## 📦 Key Dependencies

- `@radix-ui/*` - Unstyled, accessible UI components
- `lucide-react` - Icon library
- `date-fns` - Date utilities
- `clsx` - Conditional className utility
- `react-hook-form` - Form management
- `zod` - Schema validation

## 🎯 Features

- ✅ Responsive design
- ✅ Dark mode support
- ✅ Form validation
- ✅ Protected routes
- ✅ Authentication flow
- ✅ ECG upload and prediction
- ✅ Patient history dashboard
- ✅ Real-time updates

## 📝 Environment Variables

Create a `.env` file if needed for API endpoints:

```env
VITE_API_URL=http://localhost:5000
```

## 🧪 Linting

```bash
npm run lint
```

## 📱 Pages

- `/` - Home page
- `/about` - About page
- `/features` - Features showcase
- `/docs` - Documentation
- `/faq` - Frequently asked questions
- `/login` - User login
- `/signup` - User registration
- `/dashboard/*` - Protected dashboard routes

## 🔐 Authentication

The app uses JWT tokens stored in localStorage for authentication. Protected routes automatically redirect to login if not authenticated.

