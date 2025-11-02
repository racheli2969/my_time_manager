# My Time Manager

A comprehensive task management web application with team collaboration, time tracking, and intelligent scheduling features. Built with modern React, TypeScript, and Node.js, featuring Google OAuth integration for seamless authentication.

## Features

### Core Features
- ✅ **Task Management**: Create, edit, delete, and organize tasks with full CRUD operations
- ⏰ **Time Tracking**: Track work hours and productivity with detailed intervals
- 👥 **Team Collaboration**: Create teams, assign tasks, and manage members
- 📅 **Smart Scheduling**: Intelligent calendar scheduling algorithm with conflict resolution
- 💳 **Subscription Plans**: Free, Paid, and Pro tiers with Stripe integration

### Authentication Options
- 🔐 **Traditional Login**: Email and password authentication with JWT tokens
- 🚀 **Google OAuth**: Sign in with Google for quick and secure access
- 👤 **Guest Mode**: Limited access without registration
- 🔄 **Token Refresh**: Automatic token refresh for seamless sessions

### Advanced Features
- 📊 **Productivity Reports**: Track and analyze work patterns and time allocation
- 🗓️ **Personal Calendar**: Manage events, holidays, and custom schedules
- ⚡ **Task Splitting**: Break down large tasks automatically with configurable intervals
- 🎯 **Priority Management**: Organize tasks by priority levels (Low, Medium, High)
- 📱 **Responsive Design**: Fully responsive UI that works on desktop and mobile devices
- 🎨 **Modern UI/UX**: Clean, intuitive interface built with TailwindCSS and Lucide icons

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
│   │   ├── components/    # Reusable UI components
│   │   │   ├── AuthDialog.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskManager.tsx
│   │   │   ├── TeamForm.tsx
│   │   │   └── TeamManager.tsx
│   │   ├── core/          # Core application logic
│   │   │   ├── contexts/  # React Context providers
│   │   │   │   ├── TaskContext.tsx
│   │   │   │   ├── TeamContext.tsx
│   │   │   │   └── UserContext.tsx
│   │   │   ├── layout/    # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── router/    # Routing configuration
│   │   ├── features/      # Feature-based modules
│   │   │   ├── auth/      # Authentication features
│   │   │   ├── calendar/  # Calendar features
│   │   │   ├── payments/  # Payment features
│   │   │   ├── schedule/  # Scheduling features
│   │   │   ├── tasks/     # Task management
│   │   │   │   ├── components/
│   │   │   │   │   ├── TaskCardItem.tsx
│   │   │   │   │   ├── TaskDetailModal.tsx
│   │   │   │   │   ├── TaskFilters.tsx
│   │   │   │   │   └── TaskFormModal.tsx
│   │   │   │   └── pages/
│   │   │   │       └── TaskManagerPage.tsx
│   │   │   └── teams/     # Team management
│   │   ├── services/      # API services
│   │   │   ├── api.ts            # Main API service
│   │   │   ├── authService.ts    # Auth operations
│   │   │   ├── baseApi.ts        # Base API config
│   │   │   ├── paymentService.ts # Payment operations
│   │   │   ├── scheduleService.ts # Schedule operations
│   │   │   ├── taskService.ts    # Task operations
│   │   │   └── teamService.ts    # Team operations
│   │   ├── shared/        # Shared utilities
│   │   │   ├── components/# Shared components
│   │   │   ├── hooks/     # Custom hooks
│   │   │   ├── types/     # TypeScript types
│   │   │   └── utils/     # Utility functions
│   │   ├── types/         # Global type definitions
│   │   └── utils/         # Utility functions
│   └── tests/            # Test files
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   │   ├── appConfig.js
│   │   ├── google_client.js
│   │   └── jwt.js
│   ├── constants/        # Constants
│   ├── data/             # Database files
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # JWT authentication
│   │   └── errorHandler.js
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── schedule.js   # Schedule routes
│   │   ├── tasks.js      # Task routes
│   │   ├── teams.js      # Team routes
│   │   └── users.js      # User routes
│   ├── services/         # Business logic
│   │   └── scheduleService.js
│   ├── tests/            # Test files
│   └── utils/            # Utility functions
├── docs/                 # Documentation
│   ├── ARCHITECTURE_REFACTORING.md
│   ├── AUTHENTICATION_SYSTEM.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── google-auth-setup.md
│   └── google-authentication.md
└── README.MD
```

## Technology Stack

- **Frontend**: React 18 (TypeScript), TailwindCSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT + Google OAuth 2.0 with refresh tokens
- **Payments**: Stripe API integration
- **State Management**: React Context API with custom hooks
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library, Supertest
- **Code Quality**: ESLint, TypeScript strict mode

## Recent Improvements

### Code Quality Enhancements (November 2025)
- ✅ **Fixed TypeScript Errors**: Removed unused variables and imports across the codebase
- ✅ **Optimized State Management**: Cleaned up unused state setters in Context providers
- ✅ **Import Path Corrections**: Fixed module resolution issues
- ✅ **Type Safety**: Added proper type annotations throughout the application
- ✅ **API Service Improvements**: Streamlined token management and refresh logic
- ✅ **Component Optimization**: Removed unused icon imports reducing bundle size

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
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
```

**Server**:
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm test             # Run tests
```

### Development Workflow

1. **Start the backend server**:
   ```bash
   cd server
   npm start
   ```

2. **Start the frontend development server** (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

### Code Quality

The project maintains high code quality standards:

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with React and TypeScript rules
- **No Unused Variables**: All unused variables and imports have been removed
- **Proper Type Annotations**: All functions and components are properly typed
- **Clean State Management**: Optimized React Context usage with no unused setters

### Database

- **Location**: `server/taskmanagement.db`
- **Type**: SQLite3
- **Migration**: Automatic schema initialization on server startup
- **Schema**: Comprehensive relational design supporting:
  - User authentication (traditional + Google OAuth)
  - Task management with priorities and assignments
  - Team collaboration and memberships
  - Schedule entries and conflict resolution
  - Personal events and calendar integration
  - User preferences and work hours
  - Task intervals for time tracking

### Key Files Recently Updated

- **api.ts**: Fixed unused parameter in `generateSchedule()` method
- **UserContext.tsx**: Removed unused `setTeamMembers` setter
- **TaskContext.tsx**: Removed unused `setTeamTasks` and `setEvents` setters
- **TaskCardItem.tsx**: Removed unused `ChevronDown` import
- **TaskManager.tsx**: Removed unused `Filter` and `MoreHorizontal` imports

## Screenshots

### Traditional Login
![Traditional Login](image-1.png)

### Google Authentication (NEW!)
The login form now includes a "Sign in with Google" button below the traditional login fields, separated by an "or" divider.

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes following the code quality standards:
   - Remove all unused variables and imports
   - Add proper TypeScript type annotations
   - Ensure ESLint passes without errors
   - Write tests for new features
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request
7. Test thoroughly (including both traditional and Google authentication)

### Code Standards

- Use TypeScript for type safety
- Follow the existing project structure
- Remove unused code and imports
- Add JSDoc comments for complex functions
- Ensure all tests pass before submitting PR

## Security

This application implements multiple security layers:

- **JWT Tokens**: Secure session management with access and refresh tokens
- **Password Hashing**: bcryptjs with salt rounds for password security
- **Google OAuth 2.0**: Secure third-party authentication
- **Token Verification**: Server-side JWT signature verification
- **Environment Variables**: Sensitive data stored in .env files
- **Input Validation**: Comprehensive input sanitization on both client and server
- **HTTPS**: Enforced in production environments
- **CORS**: Configured to allow only authorized origins

## Performance Optimizations

- **Code Splitting**: React lazy loading for routes
- **Bundle Optimization**: Removed unused imports reducing bundle size
- **Context Optimization**: Removed unused state setters
- **Type Safety**: TypeScript strict mode catches errors at compile time
- **Database Indexing**: Proper indexes on frequently queried fields

## Support

For issues and questions:
1. Check the [Google Authentication Guide](./docs/google-authentication.md)
2. Review the [Architecture Documentation](./PROJECT_ARCHITECTURE_AND_DESIGN.md)
3. Check server logs for detailed error messages
4. Ensure all environment variables are properly configured
5. Test with fresh browser sessions (clear cache if needed)
6. Review the [Backend Architecture](./docs/BACKEND_ARCHITECTURE.md)
7. Check the [Authentication System](./docs/AUTHENTICATION_SYSTEM.md) documentation

## Changelog

### November 2025
- ✅ Fixed all TypeScript compilation errors
- ✅ Removed unused variables and imports across codebase
- ✅ Optimized Context providers by removing unused state setters
- ✅ Fixed import path issues in TaskManagerPage
- ✅ Improved code quality and type safety
- ✅ Reduced bundle size by removing unused icon imports
- ✅ Enhanced documentation with detailed project structure

### October 2025
- ✅ Added Google OAuth 2.0 authentication
- ✅ Implemented JWT refresh token mechanism
- ✅ Created comprehensive documentation
- ✅ Set up feature-based architecture
- ✅ Integrated Stripe payment system

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Version**: 2.0.0  
**Last Updated**: November 2, 2025  
**Status**: Active Development  
**Maintainer**: Development Team