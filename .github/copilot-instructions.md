# Copilot Instructions

<!-- ## Project Overview
This project is a **Task Management Web Application** with the following features:
- Add and manage tasks
- Track work hours per task
- Create and manage teams
- Schedule team tasks
- Create custom schedules 
- User authentication and role management
- Safe login, enable google authentication, guest mode, and username and password login
- create custom calendar for users to keep their events. add a button to add holidays by country and religion
- Update task status (To Do, In Progress, Done)
- Admin permissions (not settable by normal users)
- Preferred working hours for users
- Private use and commercial use modes
- Payment page and subscription management with integration to a payment provider
- Subscription tiers: Free, Paid, Pro
- create custom reports for users to track their productivity and time spent on tasks
- create a virtual tour of the app for new users and guest mode -->

## Project Overview
Task Management Web Application with team collaboration, time tracking, and subscription features.

**Core Features**: Task CRUD, work hours tracking, team management, **intelligent calendar scheduling algorithm**, custom schedule based on efficiency and user preferences, personal calendar with events and holidays, user auth (JWT + Google), subscription tiers (Free/Paid/Pro), productivity reports.

**Critical Calendar Logic**: Smart scheduling algorithm that considers user work hours, due dates, team assignments, task priorities, personal events, and holidays. Handles scheduling conflicts with user options, supports team task scheduling, and can split long tasks when enabled.

**Tech Stack**: React (TypeScript) + TailwindCSS frontend, Node.js (Express) backend, SQLite + Prisma, Stripe payments, Zustand state management, Lucide React icons.

## Architecture
**Monorepo Structure**: `/client` (React frontend) + `/server` (Express backend)


### Tech Stack
- **Frontend**: React (TypeScript), TailwindCSS, React Router, Zustand for state management
- **Backend**: Node.js (TypeScript) with Express
- **Database**: SQLite3 (with migrations)
- **ORM**: Prisma or Knex.js
- **Payments**: Stripe API
- **Auth**: JWT authentication with refresh tokens
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library, Supertest

## Folder Structure
```
/project-root
  /client                → React frontend
    /src
      /components        → UI components
      /pages             → Main app pages
      /hooks             → Custom hooks
      /contexts          → State contexts
      /services          → API service calls
      /styles            → CSS/Tailwind
      App.tsx
      main.tsx
  /server                → Node.js backend
    /src
      /controllers
      /routes
      /services
      /models
      /middlewares
      /config
      /prisma            → ORM schema
      index.ts
  /docs                  → Documentation files
  README.md
  .env.example
  package.json
  tsconfig.json
```

## Development Guidelines
- **Code Style**: Follow ESLint + Prettier formatting.
- **Documentation**: Write self-documenting code and add JSDoc-style comments to every function.
- **Reusability**: Create reusable components and avoid duplication.
- **Backend**: Endpoints must return typed JSON responses.
- **Database**: Store SQLite DB in `/server/data/database.sqlite` and provide migration scripts.
- **Security**: Validate all inputs, secure admin-only routes, and protect premium features by subscription level.
- **Payments**: Integrate Stripe for subscription plans and implement webhooks for updates.
- **Authentication**: Implement JWT with refresh tokens, role-based access control, and secure password storage.
- **Authorization**: Implement role-based access control for different user roles (admin, user, guest).
- **Testing**: Write tests for all new features and ensure high test coverage.
- **Deployment**: Use Render for deployment and provide instructions.

## Testing
- **Unit Tests**: Use Jest.
- **API Testing**: Use Supertest.
- **Frontend Testing**: Use React Testing Library.

## Required Features Implementation Order
1. Backend Setup (Express server, SQLite config, ORM schema)
2. Auth System (JWT, role-based permissions, refresh tokens)
3. Task CRUD API (Create, Read, Update, Delete)
4. Teams API (create/join/leave, assign tasks)
5. Work Hours Tracking API
6. Subscription + Payment API
7. Frontend Pages & Components:
   - Login/Register
   - Dashboard
   - Task List & Detail
   - Team Management
   - Work Hours Tracker
   - Payment Page
8. User Flows Implementation
9. Testing & Deployment Scripts

## Design Guidelines
- **UI/UX**: Make designs beautiful, unique, and production-ready.
- **Icons**: Use Lucide React for all icons and logos.
- **CSS**: Use TailwindCSS for styling.
- **Responsiveness**: Ensure all pages are responsive and accessible.

## Example Commands
### Development
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start backend
npm run dev:server

# Start frontend
npm run dev:client
```

### Production
```bash
npm run build
npm run start
```

## Deliverables
- Fully functional frontend and backend
- A complete README.md
- Database schema and migration scripts
- Example .env file
- Basic tests
- Deployment instructions (Vercel/Netlify + Railway/Render)

