# ECG Heart Prediction System

A full-stack deep learning application for ECG (electrocardiogram) analysis using CNN-GNN hybrid models with PyTorch.

## 🏗️ Project Structure

```
heartprediction/
├── frontend/          # React + TypeScript + Vite application
├── backend/           # Express.js API server
├── .venv/            # Python virtual environment (for ML models)
└── PROJECT_STATUS.md  # Detailed project documentation
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

## 📦 Installation

### Prerequisites
- Node.js 20.x or higher
- Python 3.13.x
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd heartprediction
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file with the following:
# MONGODB_URI=<your-mongodb-connection-string>
# JWT_SECRET=<your-secret-key>
# PORT=5000
```

### 3. Setup Python Environment
```bash
# From project root
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Python dependencies
cd backend
pip install -r requirements.txt
```

### 4. Setup Frontend
```bash
cd frontend
npm install
# or
bun install
```

## 🎯 Running the Application

### Start Backend Server
```bash
cd backend
node server.js
```
Backend will run on: http://localhost:5000

### Start Frontend Development Server
```bash
cd frontend
npm run dev
# or
bun run dev
```
Frontend will run on: http://localhost:8080

## 🔑 Key Features

- ✅ User Authentication (JWT-based)
- ✅ ECG Image Upload & Analysis
- ✅ Real-time ML Predictions
- ✅ Patient Report Management
- ✅ Dashboard with Statistics
- ✅ Responsive UI/UX
- ✅ Secure Password Hashing
- ✅ Protected Routes

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Predictions
- `POST /api/predict` - Upload ECG and get prediction

### Reports
- `GET /api/reports` - Get user's prediction history
- `GET /api/dashboardStats` - Get dashboard statistics

### Static Files
- `GET /uploads/:filename` - Access uploaded ECG images

## 🗂️ Database Schema

### User Model
```javascript
{
  email: String (unique),
  passwordHash: String,
  createdAt: Date,
  tokenExpiry: Date
}
```

### Patient Report Model
```javascript
{
  userId: ObjectId,
  patientId: String,
  ecgImagePath: String,
  predictions: Object,
  createdAt: Date
}
```

## 🔒 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=5000
```

## 🛠️ Development

### Frontend Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend Scripts
```bash
node server.js     # Start server
```

## 📝 License

[Add your license here]

## 👥 Contributors

[Add contributors]

## 📞 Support

For issues and questions, please open an issue in the repository.
