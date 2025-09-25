# My Time Manager

A comprehensive task management web application with team collaboration, time tracking, and intelligent scheduling features. Now with Google OAuth integration for seamless authentication.

## Features

### Core Features
- ✅ **Task Management**: Create, edit, delete, and organize tasks
- ⏰ **Time Tracking**: Track work hours and productivity
- 👥 **Team Collaboration**: Create teams and assign tasks
- 📅 **Smart Scheduling**: Intelligent calendar scheduling algorithm
- 💳 **Subscription Plans**: Free, Paid, and Pro tiers with Stripe integration

### Authentication Options
- 🔐 **Traditional Login**: Email and password authentication
- 🚀 **Google OAuth**: **NEW!** Sign in with Google for quick and secure access
- 👤 **Guest Mode**: Limited access without registration

### Advanced Features
- 📊 **Productivity Reports**: Track and analyze work patterns
- 🗓️ **Personal Calendar**: Manage events and holidays
- ⚡ **Task Splitting**: Break down large tasks automatically
- 🎯 **Priority Management**: Organize tasks by priority levels
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Console account (for OAuth - optional)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd my_time_manager
   ```

2. **Install dependencies**:
   ```bash
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

3. **Environment Setup**:
   ```bash
   # Copy environment files
   cp .env.example .env
   cp client/.env.example client/.env
   
   # Edit .env files with your configuration
   ```

4. **Start the application**:
   ```bash
   # Start server (in server directory)
   npm start
   
   # Start client (in client directory, new terminal)
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

## Google Authentication Setup

To enable Google OAuth authentication:

1. **Google Cloud Console**:
   - Create a project at [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized domains

2. **Environment Configuration**:
   ```bash
   # Server .env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   
   # Client .env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

3. **Documentation**:
   See [Google Authentication Guide](./docs/google-authentication.md) for detailed setup instructions.

## Project Structure

```
my_time_manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── LoginForm.tsx
│   │   │   └── GoogleSignInButton.tsx  # NEW!
│   │   ├── services/      # API services
│   │   │   ├── api.ts
│   │   │   └── googleAuth.ts          # NEW!
│   │   └── ...
├── server/                 # Node.js backend
│   ├── routes/
│   │   └── auth.js        # Authentication routes (updated)
│   ├── database.js        # Database setup (updated)
│   └── ...
├── docs/                   # Documentation
│   └── google-authentication.md  # NEW!
└── README.MD
```

## Technology Stack

- **Frontend**: React (TypeScript), TailwindCSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT + Google OAuth 2.0
- **Payments**: Stripe API
- **State Management**: React hooks and Context API
- **Icons**: Lucide React

## Authentication Flow

### Traditional Authentication
1. User enters email and password
2. Server validates credentials
3. JWT token issued and stored
4. User redirected to main application

### Google Authentication (**NEW!**)
1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User authorizes application
4. Google JWT token verified server-side
5. User account created/updated
6. JWT token issued and stored
7. User redirected to main application

## Development

### Available Scripts

**Client**:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Server**:
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
```

### Database

- **Location**: `server/taskmanagement.db`
- **Type**: SQLite
- **Migration**: Automatic on server startup
- **Schema**: Supports both traditional and Google authentication

## Screenshots

### Traditional Login
![Traditional Login](image-1.png)

### Google Authentication (NEW!)
The login form now includes a "Sign in with Google" button below the traditional login fields, separated by an "or" divider.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including both auth methods)
5. Submit a pull request

## Security

- JWT tokens for session management
- Password hashing with bcryptjs
- Google OAuth 2.0 token verification
- Environment variable configuration
- Input validation and sanitization

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the [Google Authentication Guide](./docs/google-authentication.md)
2. Review server logs for error details
3. Ensure all environment variables are configured
4. Test with fresh browser sessions