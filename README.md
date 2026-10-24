# AI Resume Analyzer

A comprehensive MERN (MongoDB, Express, React, Node.js) stack application that uses artificial intelligence to analyze, improve, and optimize resumes. This tool helps job seekers enhance their resumes using AI-powered features including ATS scoring, keyword optimization, and interview preparation.

## 🌟 Features

- **Resume Analysis**: Detailed analysis of resume content and structure
- **ATS Scoring**: Analyze resume compatibility with Applicant Tracking Systems
- **Quality Assessment**: Get quality scores and improvement suggestions
- **Resume Improvement**: AI-powered recommendations to enhance your resume
- **Keyword Optimization**: Identify and suggest relevant keywords for your industry
- **Cover Letter Generation**: Automatically generate tailored cover letters
- **Interview Preparation**: Generate potential interview questions based on resume content
- **Resume Comparison**: Compare multiple resumes and get insights
- **User Authentication**: Secure login with Firebase authentication
- **Resume History**: Track and manage all your analyzed resumes
- **Admin Dashboard**: Manage users and track analytics (Admin only)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Firebase** - Authentication
- **CSS Modules** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Cohere API** - AI/ML capabilities
- **Multer** - File upload handling
- **dotenv** - Environment configuration

## 📁 Project Structure

```
public_ai_resume_mern/
├── backend_ai/                          # Backend server
│   ├── Controllers/                     # Route controllers
│   │   ├── resume.js                   # Resume-related endpoints
│   │   └── user.js                     # User-related endpoints
│   ├── Models/                          # MongoDB schemas
│   │   ├── resume.js                   # Resume model
│   │   └── user.js                     # User model
│   ├── Routes/                          # API routes
│   │   ├── resume.js                   # Resume routes
│   │   └── user.js                     # User routes
│   ├── services/                        # Business logic
│   │   ├── aiResponseParser.js         # Parse AI responses
│   │   ├── atsScoringService.js        # ATS score calculation
│   │   ├── cohereService.js            # Cohere API integration
│   │   ├── comparisonService.js        # Resume comparison
│   │   ├── coverLetterService.js       # Cover letter generation
│   │   ├── interviewQuestionService.js # Interview questions
│   │   ├── keywordService.js           # Keyword extraction
│   │   ├── resumeAnalysisService.js    # Resume analysis
│   │   ├── resumeImprovementService.js # Improvement suggestions
│   │   └── resumeQualityService.js     # Quality assessment
│   ├── utils/                           # Utility functions
│   │   └── multer.js                   # File upload configuration
│   ├── uploads/                         # Uploaded resumes storage
│   ├── build/                           # Built frontend files
│   ├── tests/                           # Unit tests
│   ├── index.js                         # Server entry point
│   ├── conn.js                          # Database connection
│   ├── package.json                     # Dependencies
│   └── .env.example                     # Environment variables template
│
└── mern_ai/                             # Frontend React app
    ├── src/
    │   ├── components/                  # React components
    │   │   ├── Admin/                  # Admin dashboard
    │   │   ├── AnalysisDetail/         # Analysis details view
    │   │   ├── AnalysisResults/        # Results display
    │   │   ├── Dashboard/              # Main dashboard
    │   │   ├── History/                # Resume history
    │   │   ├── Login/                  # Login page
    │   │   └── SideBar/                # Navigation sidebar
    │   ├── utils/
    │   │   ├── AuthContext.jsx         # Auth state management
    │   │   ├── axios.js                # HTTP client config
    │   │   ├── firebase.jsx            # Firebase setup
    │   │   └── HOC/withAuthHOC.jsx     # Auth protection HOC
    │   ├── App.jsx                      # Root component
    │   ├── main.jsx                     # React entry point
    │   ├── index.css                    # Global styles
    │   └── App.css                      # App styles
    ├── public/                          # Static assets
    ├── package.json                     # Dependencies
    ├── vite.config.js                   # Vite configuration
    ├── eslint.config.js                 # ESLint configuration
    ├── index.html                       # HTML template
    └── README.md                        # Frontend README
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Cohere API key (get from [cohere.ai](https://cohere.ai))
- Firebase project setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend_ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   # Backend Environment Variables
   MONGO_URI=mongodb://localhost:27017/ai_resume_analyzer
   COHERE_API_KEY=your_cohere_api_key_here
   PORT=5000
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd mern_ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

## 📋 API Endpoints

### Resume Endpoints
- `POST /api/resume/upload` - Upload and analyze a resume
- `GET /api/resume/:id` - Get resume details
- `GET /api/resume/user/:userId` - Get all resumes for a user
- `PUT /api/resume/:id` - Update resume analysis
- `DELETE /api/resume/:id` - Delete a resume

### User Endpoints
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/:id` - Get user profile
- `PUT /api/user/:id` - Update user profile

### Analysis Services
- **ATS Scoring**: Analyzes resume compatibility with job descriptions
- **Resume Quality**: Provides comprehensive quality assessment
- **Keyword Analysis**: Extracts and suggests relevant keywords
- **Cover Letter**: Generates tailored cover letters
- **Interview Questions**: Generates potential interview questions

## 🔐 Authentication

The application uses Firebase Authentication for secure user authentication:
- Email/Password authentication
- Session management with AuthContext
- Protected routes with HOC (withAuthHOC)
- Token-based API authorization

## 🧪 Testing

Run tests for backend services:
```bash
cd backend_ai
npm test
```

## 📝 Environment Variables Reference

### Backend (.env)
```
MONGO_URI          - MongoDB connection string
COHERE_API_KEY     - Cohere API key for AI services
PORT               - Server port (default: 5000)
NODE_ENV           - Environment (development/production)
```

### Frontend (.env)
```
VITE_API_URL                        - Backend API URL
VITE_FIREBASE_API_KEY              - Firebase API key
VITE_FIREBASE_AUTH_DOMAIN          - Firebase auth domain
VITE_FIREBASE_PROJECT_ID           - Firebase project ID
VITE_FIREBASE_STORAGE_BUCKET       - Firebase storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID  - Firebase messaging sender ID
VITE_FIREBASE_APP_ID               - Firebase app ID
```

## 🎯 Usage Guide

### For Job Seekers
1. **Sign up** with your email and password
2. **Upload your resume** (PDF format)
3. **Get analysis** including:
   - ATS compatibility score
   - Quality assessment
   - Improvement suggestions
   - Keyword recommendations
4. **Generate cover letter** based on job description
5. **Prepare for interviews** with AI-generated questions
6. **Track history** of all analyzed resumes

### For Admins
1. Access admin dashboard
2. View user statistics
3. Monitor resume analyses
4. Manage system settings

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check MONGO_URI in .env file
- Verify MongoDB credentials

**Cohere API Error**
- Verify API key is correct
- Check API rate limits
- Ensure API key has proper permissions

**Firebase Authentication Error**
- Verify Firebase configuration
- Check Firebase console settings
- Ensure API keys are correct

**File Upload Error**
- Check upload folder permissions
- Verify file size limits
- Ensure file format is supported (PDF)

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Documentation](https://expressjs.com)
- [Cohere API Documentation](https://docs.cohere.ai)
- [Firebase Documentation](https://firebase.google.com/docs)

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- Girish Elankonda

## 🙏 Acknowledgments

- Cohere for AI/ML capabilities
- Firebase for authentication
- MongoDB for database services
- React and Vite communities

---

**Happy Resume Building! 🚀**
