# 🫀 GNN-HF: ECG Heart Failure Prediction System

AI-powered heart failure detection using Graph Neural Networks and ECG image analysis.

[![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20PyTorch-blue)](#-tech-stack)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

## ⚡ Quick Start

```bash 
# 1️⃣ Clone the repository
git clone https://github.com/PranavKarne/GNN-HF.git
cd GNN-HF

# 2️⃣ Setup Backend
cd backend
npm install
cp .env.example .env    # Edit this file with your MongoDB URI
node server.js          # Starts on http://localhost:5000

# 3️⃣ Setup Frontend (new terminal)
cd frontend
npm install
npm run dev             # Starts on http://localhost:8080
```

That's it! Open http://localhost:8080 in your browser.

---

## 🏗️ Project Structure

```
GNN-HF/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Express.js API + ML integration
│   ├── ml/           # PyTorch models
│   ├── routes/       # API endpoints
│   ├── models/       # MongoDB schemas
│   └── uploads/      # ECG image storage
└── .venv/            # Python virtual environment (local only)
```

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript 5.8.3
- **Build Tool**: Vite 7.2.7
- **UI Library**: Shadcn UI + TailwindCSS
- **Animations**: Framer Motion
- **State Management**: TanStack Query
- **Routing**: React Router

### Backend
- **Runtime**: Node.js 20.19.1
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB Atlas (Mongoose 9.0.1)
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer

### Machine Learning
- **Framework**: PyTorch
- **Models**: CNN-GNN hybrid + MobileNetV2 validator
- **Python**: 3.13.3
- **Image Processing**: OpenCV (ECGtizer)

## 📦 Detailed Installation

### Prerequisites
- **Node.js** 20.x or higher ([Download](https://nodejs.org))
- **Python** 3.13.x ([Download](https://python.org))
- **MongoDB Atlas** account ([Sign up free](https://mongodb.com/cloud/atlas))

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/PranavKarne/GNN-HF.git
cd GNN-HF
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

**Create `.env` file** in `backend/` directory:
```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/heartprediction
JWT_SECRET=your_super_secret_key_change_this
PORT=5000
FRONTEND_URL=http://localhost:8080
```

> 💡 **Tip:** Use `.env.example` as a template

### 3️⃣ Setup Python Environment (for ML models)

```bash
# From project root
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
# OR
.venv\Scripts\activate     # Windows

# Install Python dependencies
cd backend
pip install -r requirements.txt
```

### 4️⃣ Setup Frontend

```bash
cd frontend
npm install
```

**Create `.env` file** in `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Running the Application

### Option 1: Run Separately (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```
✅ Backend running at: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running at: http://localhost:8080

### Option 2: Quick Start Script

```bash
# Backend
cd backend && node server.js &

# Frontend  
cd frontend && npm run dev
```

## 🧪 Test the Application

1. Open http://localhost:8080
2. Click "Sign Up" and create an account
3. Login with your credentials
4. Upload an ECG image on the Dashboard
5. View AI prediction results!

## 🔑 Key Features

- 🔐 **Secure Authentication** - JWT-based user login/signup
- 🧠 **AI-Powered Analysis** - CNN-GNN hybrid model for ECG classification
- 📊 **Real-time Predictions** - Instant heart failure risk assessment
- 📁 **Report Management** - Save and view patient analysis history
- 📈 **Dashboard Analytics** - Visual statistics and insights
- 💅 **Modern UI/UX** - Responsive design with Shadcn UI + TailwindCSS
- 🔒 **Data Security** - Encrypted passwords, protected routes

## 🎨 Screenshots

[Add screenshots of your application here]

## 📚 API Endpoints

### 🔐 Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### 🧪 Predictions
- `POST /api/predict` - Upload ECG image and get AI prediction (requires auth)

### 📊 Reports
- `GET /api/reports/get-reports` - Get user's prediction history (requires auth)
- `GET /api/reports/dashboardStats` - Dashboard statistics (requires auth)
- `GET /api/reports/download-pdf/:id` - Download PDF report (requires auth)
- `DELETE /api/reports/delete-report/:id` - Delete report (requires auth)

### 👤 Profile
- `GET /api/profile` - Get user profile (requires auth)
- `PUT /api/profile` - Update user profile (requires auth)
- `POST /api/update-password` - Change password (requires auth)

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  passwordHash: String (required),
  patientInfo: {
    patientId: String (unique),
    patientName: String,
    age: Number,
    gender: String,
    contactNumber: String,
    symptoms: String,
    medicalHistory: String
  },
  createdAt: Date
}
```

### Patient Report Model
```javascript
{
  userId: ObjectId (ref: User),
  patientId: String,
  name: String,
  age: Number,
  gender: String,
  symptoms: String,
  medicalHistory: String,
  
  predictedClass: String,
  confidence: Number,
  riskLevel: String (low/moderate/high),
  riskScore: Number,
  
  imagePath: String,
  imageBase64: String,
  probabilities: Object,
  
  timestamp: Date
}
```

## 🔒 Environment Variables

### Backend (`.env`)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_random_secret_key_here
PORT=5000
FRONTEND_URL=http://localhost:8080
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000
```

## ⚠️ Common Issues & Solutions

### Issue: "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Python errors when predicting
```bash
# Make sure Python virtual environment is activated
source .venv/bin/activate

# Reinstall Python packages
pip install -r backend/requirements.txt
```

### Issue: MongoDB connection failed
- Check your MongoDB URI in `.env`
- Ensure IP address is whitelisted in MongoDB Atlas
- Verify username/password are correct

### Issue: Port already in use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill

# Or use a different port in .env
PORT=5001
```

## 🛠️ Development Scripts

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend
```bash
node server.js     # Start Express server
```

## 🌐 Deployment Guide

### Prerequisites
- GitHub account with your code pushed
- MongoDB Atlas cluster (free tier works)
- Accounts on Vercel & Railway (both have free tiers)

### 🚀 Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select `GNN-HF` repository
   - **Root Directory**: `frontend`
   - Framework Preset: Vite (auto-detected)

3. **Configure Environment Variables**
   - Add: `VITE_API_URL` = Your Railway backend URL (e.g., `https://your-app.railway.app`)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your frontend is live! 🎉

5. **Enable Auto-Deploy**
   - ✅ Already enabled! Every push to `main` auto-deploys

### 🔧 Deploy Backend to Railway

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `GNN-HF` repository
   - **Root Directory**: Leave as root (Railway auto-detects `backend/`)

3. **Configure Environment Variables**
   - Click "Variables" tab and add:
   ```env
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
   JWT_SECRET=your_secret_key_here
   PORT=5000
   FRONTEND_URL=https://your-app.vercel.app
   PYTHON_PATH=python3
   ```

4. **Configure Build Settings**
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - Railway auto-detects Python for ML models ✅

5. **Deploy**
   - Click "Deploy"
   - Wait 3-5 minutes (Python dependencies take longer)
   - Copy your Railway URL (e.g., `https://gnn-hf.railway.app`)

6. **Update Frontend URL in Vercel**
   - Go back to Vercel project settings
   - Update `VITE_API_URL` to your Railway URL
   - Redeploy frontend

7. **Enable Auto-Deploy**
   - ✅ Already enabled! Every push to `main` auto-deploys

### 🔄 Auto-Deploy Workflow

Once setup is complete:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# ✨ Magic happens:
# 1. Railway auto-deploys backend (3-5 min)
# 2. Vercel auto-deploys frontend (1-2 min)
# 3. Your live app is updated!
```

### ✅ Verify Deployment

Test these URLs in your browser:

```
Frontend: https://your-app.vercel.app
Backend Health: https://your-app.railway.app/health
Backend API: https://your-app.railway.app/api/auth/login
```

### 📋 Post-Deployment Checklist

- ✅ MongoDB Atlas IP allowlist includes `0.0.0.0/0` (allow all IPs for serverless)
- ✅ Frontend `VITE_API_URL` points to Railway backend
- ✅ Backend `FRONTEND_URL` points to Vercel frontend
- ✅ JWT_SECRET is a strong random key (generate: `openssl rand -base64 32`)
- ✅ Both platforms show "Build Successful"
- ✅ Health check returns 200 OK

### 🆓 Free Tier Limits

**Vercel**
- 100GB bandwidth/month
- Unlimited projects
- Auto-scaling

**Railway**
- $5 free credits/month
- ~500 hours of runtime
- Auto-sleep after inactivity (wakes on request)

### 🐛 Troubleshooting Deployment

**Frontend build fails**
```bash
# Check node version (should be 18+)
# Vercel auto-uses Node 20
```

**Backend crashes on Railway**
```bash
# Check Railway logs for Python errors
# Ensure requirements.txt is present in backend/
# Verify Python version (Railway uses 3.11+)
```

**CORS errors after deployment**
```bash
# Update FRONTEND_URL in Railway to match Vercel URL
# Restart Railway service
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Developed by the GNN-HF Team

## 📞 Support

For issues and questions, please open an issue in the repository.
