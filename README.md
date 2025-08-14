# Gmail Clone - Full-Stack IMAP Email Viewer

A full-stack application that allows users to authenticate with their Gmail account and view their emails using the Gmail API. Built with React.js, Node.js, Express, MySQL, and Sequelize ORM.

## 🌟 Features

- **🔐 Secure OAuth2 Authentication** - Login with Google account
- **📧 Email Management** - View, search, and organize emails
- **🔍 Advanced Search** - Search emails by content, sender, subject
- **📱 Responsive Design** - Works on desktop and mobile devices
- **♾️ Infinite Scroll** - Load emails efficiently with pagination
- **⭐ Email Organization** - View starred, important, sent emails
- **📎 Attachment Support** - View email attachments
- **🎨 Modern UI** - Clean, Gmail-inspired interface with Tailwind CSS
- **🚀 Real-time Sync** - Sync emails from Gmail on demand
- **📊 Email Statistics** - View unread, starred, and total email counts

## 🏗️ Tech Stack

### Frontend
- **React.js** - User interface library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Date-fns** - Date formatting
- **DOMPurify** - HTML sanitization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM
- **Google APIs** - Gmail API integration
- **JWT** - Authentication tokens
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MySQL** (v5.7 or higher)
- **Google Cloud Console** account for OAuth2 setup

## 🚀 Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd gmail-clone
\`\`\`

### 2. Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create OAuth2 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/auth/google/callback` (for development)
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (frontend)
     - `http://localhost:5000` (backend)
5. Save the Client ID and Client Secret

### 3. Database Setup

1. Install and start MySQL
2. Create a new database:

\`\`\`sql
CREATE DATABASE gmail_clone;
\`\`\`

### 4. Backend Setup

1. Navigate to the backend directory:

\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Create environment file:

\`\`\`bash
cp env.example .env
\`\`\`

4. Configure your `.env` file:

\`\`\`env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gmail_clone
DB_USER=root
DB_PASSWORD=your_mysql_password

# Gmail OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
\`\`\`

5. Start the backend server:

\`\`\`bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
\`\`\`

The backend will be running at `http://localhost:5000`

### 5. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

\`\`\`bash
cd frontend
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Start the frontend development server:

\`\`\`bash
npm start
\`\`\`

The frontend will be running at `http://localhost:3000`

## 🎯 Usage

1. **Access the Application**: Open your browser and go to `http://localhost:3000`

2. **Login**: Click "Continue with Google" to authenticate with your Gmail account

3. **Grant Permissions**: Allow the application to read your Gmail emails

4. **Browse Emails**: 
   - Use the sidebar to navigate between Inbox, Starred, Sent, etc.
   - Search for specific emails using the search bar
   - Click on any email to view its full content

5. **Sync Emails**: Click the "Sync Emails" button to fetch the latest emails from Gmail

## 📁 Project Structure

\`\`\`
gmail-clone/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── emailController.js   # Email management logic
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── errorHandler.js     # Error handling middleware
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Email.js            # Email model
│   │   └── index.js            # Model associations
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   └── emails.js           # Email routes
│   ├── services/
│   │   ├── oauth.js            # OAuth2 service
│   │   └── gmail.js            # Gmail API service
│   ├── package.json
│   ├── server.js               # Main server file
│   └── env.example             # Environment variables template
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmailList.js    # Email list component
│   │   │   ├── EmailViewer.js  # Email viewer component
│   │   │   ├── Sidebar.js      # Navigation sidebar
│   │   │   ├── LoadingSpinner.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js  # Authentication context
│   │   ├── pages/
│   │   │   ├── LoginPage.js    # Login page
│   │   │   ├── AuthCallbackPage.js
│   │   │   └── DashboardPage.js # Main dashboard
│   │   ├── services/
│   │   │   └── api.js          # API service
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
\`\`\`

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/url` - Get Google OAuth URL
- `GET /api/auth/callback` - Handle OAuth callback
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

### Emails
- `GET /api/emails` - Get emails with pagination
- `GET /api/emails/search` - Search emails
- `GET /api/emails/stats` - Get email statistics
- `GET /api/emails/:id` - Get email by ID
- `POST /api/emails/sync` - Sync emails from Gmail

## 🛠️ Development

### Backend Development

\`\`\`bash
cd backend
npm run dev  # Starts server with nodemon for auto-reload
\`\`\`

### Frontend Development

\`\`\`bash
cd frontend
npm start    # Starts development server with hot reload
\`\`\`

### Database Management

The application uses Sequelize ORM which automatically creates and manages database tables. In development mode, the database schema will be synchronized automatically.

## 🚀 Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in your environment
2. Update database credentials for production
3. Set secure JWT secret
4. Configure production Google OAuth redirect URIs
5. Use a process manager like PM2:

\`\`\`bash
npm install -g pm2
pm2 start server.js --name "gmail-clone-api"
\`\`\`

### Frontend Deployment

1. Build the production bundle:

\`\`\`bash
cd frontend
npm run build
\`\`\`

2. Serve the built files using a web server like Nginx or deploy to services like Netlify, Vercel, etc.

## 🔒 Security Features

- **OAuth2 Authentication** - Secure Google login
- **JWT Tokens** - Stateless authentication
- **Input Validation** - Server-side validation using express-validator
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Configured for specific origins
- **SQL Injection Prevention** - Using Sequelize ORM
- **XSS Protection** - HTML sanitization with DOMPurify
- **Security Headers** - Using Helmet.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Google OAuth Error**
   - Verify Client ID and Secret in `.env`
   - Check redirect URIs in Google Console
   - Ensure Gmail API is enabled

3. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing processes: `lsof -ti:5000 | xargs kill -9`

4. **CORS Issues**
   - Verify FRONTEND_URL in backend `.env`
   - Check if both servers are running

### Getting Help

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that both frontend and backend servers are running

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using React, Node.js, and the Gmail API**
