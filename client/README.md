# Task Management Application - Frontend

## Overview

This is the React-based frontend for the Task Management Web Application. It provides a modern, responsive UI for managing tasks, teams, schedules, and subscriptions with intelligent calendar scheduling capabilities.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Context API + Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Authentication**: JWT with Google OAuth integration
- **Testing**: Jest + React Testing Library

## Project Structure

```
/client
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AuthDialog.tsx
│   │   ├── Dialog.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskManager.tsx
│   │   ├── TeamForm.tsx
│   │   ├── TeamManager.tsx
│   │   └── UserProfile.tsx
│   ├── config/              # Configuration files
│   │   ├── env-config.js
│   │   └── env.ts
│   ├── contexts/            # React Context providers
│   │   ├── TaskContext.tsx
│   │   ├── TeamContext.tsx
│   │   └── UserContext.tsx
│   ├── core/                # Core application modules
│   │   ├── contexts/        # Shared contexts
│   │   ├── layout/          # Layout components (Header, Sidebar)
│   │   └── router/          # Route configurations
│   ├── features/            # Feature-based modules
│   │   ├── auth/            # Authentication feature
│   │   ├── calendar/        # Calendar and events
│   │   ├── payments/        # Payment and subscriptions
│   │   ├── schedule/        # Intelligent scheduling
│   │   ├── tasks/           # Task management
│   │   └── teams/           # Team collaboration
│   ├── hooks/               # Custom React hooks
│   │   └── useAuthRedirect.tsx
│   ├── services/            # API service layer
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── baseApi.ts
│   │   ├── paymentService.ts
│   │   ├── scheduleService.ts
│   │   ├── taskService.ts
│   │   ├── teamService.ts
│   │   └── userService.ts
│   ├── shared/              # Shared utilities
│   │   ├── components/      # Shared components
│   │   ├── hooks/           # Shared hooks
│   │   ├── types/           # Shared TypeScript types
│   │   └── utils/           # Utility functions
│   ├── types/               # TypeScript type definitions
│   │   ├── env.d.ts
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── constants.ts
│   ├── App.tsx              # Root application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # TailwindCSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Features

### Core Features
- **Task Management**: Create, update, delete, and track tasks with status updates
- **Team Collaboration**: Create teams, invite members, and assign team tasks
- **Time Tracking**: Log and track work hours per task
- **Intelligent Scheduling**: Smart algorithm that considers:
  - User work hours and preferences
  - Task due dates and priorities
  - Team assignments
  - Personal calendar events
  - Holidays by country/religion
  - Conflict resolution with user options
  - Task splitting for long tasks

### User Features
- **Authentication**: 
  - JWT-based authentication
  - Google OAuth integration
  - Guest mode
  - Username/password login
- **User Profile**: Manage profile, preferred working hours, and settings
- **Personal Calendar**: Custom calendar with events and holiday integration
- **Productivity Reports**: Track time spent and productivity metrics

### Subscription Features
- **Free Tier**: Basic task management
- **Paid Tier**: Advanced features with team collaboration
- **Pro Tier**: Full feature access with unlimited teams and advanced analytics

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running (see `/server` folder)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the `/client` root:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

See `.env.example` for all available variables.

### Development

```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Run with host access (for network testing)
npm run dev -- --host
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Key Concepts

### Feature-Based Architecture

The application follows a feature-based architecture where each major feature is self-contained:

```
/features
  /tasks
    /components       # Task-specific components
    /hooks           # Task-specific hooks
    /pages           # Task pages
    /services        # Task API services
    /types           # Task TypeScript types
    index.ts         # Public exports
```

### Service Layer

All API calls are abstracted into service modules:

```typescript
// Example: taskService.ts
export const taskService = {
  getTasks: () => api.get('/tasks'),
  createTask: (task) => api.post('/tasks', task),
  updateTask: (id, task) => api.put(`/tasks/${id}`, task),
  deleteTask: (id) => api.delete(`/tasks/${id}`)
};
```

### State Management

- **Context API**: Used for global state (User, Tasks, Teams)
- **Zustand**: Used for complex state management in features
- **Local State**: Used for component-specific state

### Authentication Flow

1. User logs in via username/password or Google OAuth
2. JWT access token stored in memory
3. Refresh token stored in httpOnly cookie
4. Protected routes check authentication status
5. Token refresh handled automatically on expiration

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm test` | Run tests |

## API Integration

The frontend communicates with the backend API at `VITE_API_URL`. All API calls include:

- JWT authentication headers
- Automatic token refresh
- Error handling and logging
- Request/response interceptors

Example API call:

```typescript
import { taskService } from '@/services/taskService';

// Get all tasks
const tasks = await taskService.getTasks();

// Create a new task
const newTask = await taskService.createTask({
  title: 'New Task',
  description: 'Task description',
  dueDate: '2025-12-31',
  priority: 'high'
});
```

## Styling Guidelines

- Use TailwindCSS utility classes for styling
- Follow responsive design principles (mobile-first)
- Use Lucide React for all icons
- Maintain consistent spacing and color palette
- Ensure accessibility (ARIA labels, keyboard navigation)

## Code Style

- Follow TypeScript strict mode
- Use functional components with hooks
- Use named exports over default exports
- Write self-documenting code with JSDoc comments
- Keep components small and focused (Single Responsibility)

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `/dist` folder.

### Deployment Platforms

- **Vercel**: Recommended for React apps
- **Netlify**: Alternative option
- **Render**: For full-stack deployment

See `/docs/DEPLOYING_TO_RENDER.md` for deployment instructions.

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file exists in `/client` root
   - Restart dev server after changing `.env`
   - Use `VITE_` prefix for all env variables

2. **API Connection Failed**
   - Check backend server is running
   - Verify `VITE_API_URL` is correct
   - Check for CORS issues

3. **Google OAuth Not Working**
   - Verify `VITE_GOOGLE_CLIENT_ID` is set
   - Check authorized redirect URIs in Google Console
   - See `/docs/GOOGLE_AUTH_FIXES.md`

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check TypeScript errors: `npm run type-check`

## Contributing

1. Follow the existing code structure and conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting PR
5. Follow the feature-based architecture pattern

## Documentation

Additional documentation can be found in the `/docs` folder:

- `ARCHITECTURE_REFACTORING.md` - Architecture decisions
- `AUTHENTICATION_SYSTEM.md` - Auth implementation details
- `ENV_VARIABLES_FIX.md` - Environment variable setup
- `GOOGLE_AUTH_FIXES.md` - Google OAuth troubleshooting
- `ENHANCED_SCHEDULE_SUMMARY.md` - Scheduling algorithm details

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions:
- Check documentation in `/docs`
- Review existing issues
- Contact the development team

---

Built with ❤️ using React, TypeScript, and TailwindCSS
