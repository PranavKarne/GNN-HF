# Backend - ECG Heart Prediction System

Express.js API server with MongoDB and PyTorch ML models.

## 📁 Directory Structure

```
backend/
├── server.js              # Main Express server
├── predict.js             # Prediction API wrapper
├── routes/                # API route handlers
│   ├── auth.js           # Authentication routes
│   ├── reports.js        # Patient reports
│   ├── dashboardStats.js # Dashboard statistics
│   ├── save.js           # Save predictions
│   └── updatePassword.js # Password management
├── models/                # MongoDB schemas
│   ├── User.js           # User model
│   └── PatientReport.js  # Patient report model
├── ml/                    # Machine Learning models
│   ├── predict.py        # CNN-GNN hybrid model (production)
│   ├── predict_minimal.py # Minimal prediction script
│   ├── models/           # PyTorch model files (.pt)
│   └── *.ipynb          # Jupyter notebooks (training)
├── data/                  # Seed data
├── uploads/               # ECG image uploads
└── utils/                 # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- Python 3.13.x
- MongoDB Atlas account (or local MongoDB)

### Install Node Dependencies
```bash
npm install
```

### Setup Python Environment
```bash
# From project root
python3 -m venv ../.venv
source ../.venv/bin/activate  # On Windows: ..\.venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Environment Variables
Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/heartprediction
JWT_SECRET=your_secret_key_here_make_it_long_and_random
PORT=5000
```

### Start Server
```bash
node server.js
```

Server will run on: http://localhost:5000

## 🔧 Tech Stack

- **Node.js 20.19.1** - Runtime
- **Express.js 5.2.1** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose 9.0.1** - ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **PyTorch** - ML models
- **Python 3.13.3** - ML runtime

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup`
  - Register new user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `POST /api/auth/login`
  - Login existing user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

### Predictions
- `POST /api/predict`
  - Upload ECG image and get prediction
  - Headers: `Authorization: Bearer <token>`
  - Form-data: `ecgImage` (file)
  - Returns: Prediction results

### Reports
- `GET /api/reports`
  - Get user's prediction history
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of reports

- `GET /api/dashboardStats`
  - Get dashboard statistics
  - Headers: `Authorization: Bearer <token>`
  - Returns: User statistics

### Static Files
- `GET /uploads/:filename`
  - Access uploaded ECG images
  - Public access

## 🗄️ Database Models

### User
```javascript
{
  email: String (unique, required),
  passwordHash: String (required),
  createdAt: Date,
  tokenExpiry: Date
}
```

### PatientReport
```javascript
{
  userId: ObjectId (ref: 'User'),
  patientId: String,
  ecgImagePath: String,
  predictions: {
    has_heart_disease: Boolean,
    confidence: Number,
    // ... other prediction fields
  },
  createdAt: Date
}
```

## 🤖 Machine Learning

### Models
- **ecgornotpredictionmodel.pt** - ECG validator (MobileNetV2)
- **heartdiseasepredictormodel.pt** - Heart disease predictor (CNN-GNN)

### Prediction Pipeline
1. Upload ECG image via `/api/predict`
2. Save image to `uploads/` directory
3. Execute `predict.py` with Python subprocess
4. Parse JSON prediction results
5. Save to database
6. Return to frontend

### Python Script
The `predict.py` script:
- Validates ECG image authenticity
- Digitizes 6x2 grid ECG signals
- Runs CNN-GNN hybrid model
- Returns JSON predictions

## 🔒 Security

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: 7-day expiry
- **CORS**: Enabled for frontend origin
- **File Uploads**: Validated and sanitized
- **Environment Variables**: Sensitive data in `.env`

## 📦 Dependencies

### Core
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables
- `cors` - Cross-origin requests

### Authentication
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing

### File Handling
- `multer` - File uploads

### Python (requirements.txt)
- `torch` - Deep learning
- `torchvision` - Vision models
- `opencv-python` - Image processing
- `numpy` - Numerical operations
- `pandas` - Data manipulation

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common status codes:
- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

## 📝 Logging

Server logs include:
- MongoDB connection status
- Upload folder verification
- Environment variable loading
- Server port information
- API request/response logs

## 🧪 Testing

Run the server and test endpoints:

```bash
# Test server health
curl http://localhost:5000

# Test authentication
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📊 Performance

- Prediction time: ~2-5 seconds per ECG image
- Database queries: Optimized with Mongoose indexes
- File uploads: Limited to 10MB per file

## 🔧 Maintenance

### Database Backup
Backup MongoDB regularly via Atlas or using `mongodump`.

### Log Rotation
Implement log rotation for production deployments.

### Model Updates
Replace `.pt` files in `ml/models/` to update models.

## 🚀 Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use process manager (PM2, Docker)
3. Configure reverse proxy (Nginx)
4. Enable HTTPS
5. Set up monitoring (New Relic, DataDog)
