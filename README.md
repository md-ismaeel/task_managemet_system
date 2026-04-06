# TaskFlow - Fullstack Task Management Application

A modern fullstack task management application built with TypeScript, Next.js, Express, and SQLite. Features JWT authentication, task CRUD operations with pagination, filtering, and search functionality.

## Features

### Authentication System
- **Register** - Create a new account with name, email, and secure password
- **Login** - Authenticate with email/password
- **Logout** - Securely logout and clear tokens
- **Token Refresh** - Automatic access token refresh using refresh token rotation
- **Password Security** - Bcrypt hashing with 12 rounds

### Task Management
- **Create Task** - Add new tasks with title, description, status, priority, and due date
- **Read Tasks** - View all tasks with pagination (10/25/50 per page)
- **Update Task** - Edit task details including status and priority
- **Delete Task** - Remove tasks with confirmation
- **Toggle Status** - Cycle through PENDING → IN_PROGRESS → COMPLETED → PENDING

### Filtering & Search
- **Search** - Search tasks by title (debounced)
- **Status Filter** - Filter by PENDING, IN_PROGRESS, or COMPLETED
- **Priority Filter** - Filter by LOW, MEDIUM, or HIGH
- **Sort** - Sort by createdAt, updatedAt, dueDate, priority, or title
- **Pagination** - Navigate through pages with prev/next controls

### UI/UX Features
- Responsive design with dark theme
- Toast notifications for actions
- Loading states and skeleton screens
- Modal forms for task creation/editing
- Context menu for task actions

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite via sql.js + TypeORM
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Security**: Helmet, CORS, Cookie Parser

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Custom UI + Radix UI primitives
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Folder Structure

```
task_manager/
├── server/                    # Express.js Backend
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Request handlers (auth, tasks)
│   │   ├── entity/           # TypeORM entities (User, Task, RefreshToken)
│   │   ├── middleware/       # Auth middleware
│   │   ├── routes/           # API route definitions
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/           # JWT utilities
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts         # Server entry point
│   ├── data/                 # SQLite database file
│   ├── .env                  # Environment variables
│   └── package.json
│
└── client/                   # Next.js Frontend
    ├── app/                  # Next.js App Router pages
    │   ├── (auth)/          # Auth pages (login, register)
    │   ├── (dashboard)/     # Protected dashboard
    │   └── globals.css      # Global styles
    ├── components/          # React components
    │   ├── tasks/           # Task-related components
    │   └── ui/              # UI primitives
    ├── hooks/               # Custom React hooks
    ├── lib/                 # API clients and utilities
    ├── types/               # TypeScript types
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

Create a `.env` file in the `/server` directory:

```env
# Server Port
PORT=5000

# Database (SQLite)
DATABASE_URL=./data/app.db

# JWT Secrets - use long random strings in production
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-change-in-production
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-in-production

# Token expiry
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS - Your frontend URL
CLIENT_URL=http://localhost:3000
```

Create a `.env.local` file in the `/client` directory (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run the Application

**Start the backend server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Start the frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:3000
```

### 4. Build for Production

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout and clear refresh token |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass1"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id", "name", "email", "createdAt" },
    "accessToken": "eyJ..."
  }
}
```

### Tasks (Protected - requires Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks (paginated, filterable) |
| GET | `/tasks/:id` | Get single task |
| POST | `/tasks` | Create a new task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/toggle` | Toggle task status |

**GET /tasks Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)
- `search` - Search by title
- `status` - Filter by PENDING, IN_PROGRESS, COMPLETED
- `priority` - Filter by LOW, MEDIUM, HIGH
- `sortBy` - Sort field (createdAt, updatedAt, title, dueDate, priority)
- `sortOrder` - Sort direction (asc, desc)

**GET /tasks Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "limit": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**POST /tasks Request:**
```json
{
  "title": "Complete project",
  "description": "Finish the task management app",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2024-12-31T23:59:59Z"
}
```

## Authentication Flow

1. **Login/Register**: User submits credentials → Server validates → Returns access token + refresh token (in httpOnly cookie)

2. **API Requests**: Client includes `Authorization: Bearer <accessToken>` header

3. **Token Expiry**: When access token expires (15 min), client makes `/auth/refresh` request with refresh token cookie

4. **Token Rotation**: Server issues new access + refresh tokens, invalidates old refresh token

5. **Logout**: Server removes refresh token from database and clears cookie

## Security Features

- HTTP-only cookies for refresh tokens
- JWT access tokens with short expiry
- Password hashing with bcrypt (12 rounds)
- CORS configured for specific origin
- Helmet for security headers
- Input validation with Zod

## Validation Rules

### Registration
- Name: 2-50 characters
- Email: Valid email format
- Password: Min 8 characters, at least 1 uppercase, 1 number

### Task
- Title: 1-200 characters
- Description: Max 2000 characters
- Status: PENDING | IN_PROGRESS | COMPLETED
- Priority: LOW | MEDIUM | HIGH
- Due Date: ISO 8601 datetime (optional)

## Future Improvements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Task categories/tags
- [ ] Subtasks
- [ ] Task attachments
- [ ] Task sharing/collaboration
- [ ] Dark/light theme toggle
- [ ] PWA support
- [ ] Real-time updates with WebSocket