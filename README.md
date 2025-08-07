# Linqe 🚀

A modern LinkedIn-inspired social platform built with Next.js and Node.js. Connect, share, and engage with your professional network.

![Linqe Platform](https://img.shields.io/badge/Platform-Web-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Node](https://img.shields.io/badge/Node.js-18+-brightgreen) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)

## ✨ Features

### 🔐 Authentication & Security
- Secure JWT-based authentication with cookie storage
- User registration and login with validation
- Password hashing with bcrypt
- Protected routes and middleware

### 👤 User Management
- Customizable user profiles with bio editing
- Profile pictures with initials fallback
- User discovery and suggestions
- Real-time profile updates

### 📝 Content Creation
- Post creation with character limit (500 chars)
- Rich text formatting support
- Real-time post validation
- Content moderation ready

### 📱 Smart Feed System
- **All Posts Tab**: See posts from all users
- **Following Tab**: Personalized feed from followed users
- Real-time feed updates
- Infinite scroll ready architecture

### 👥 Social Features
- Follow/unfollow users
- Follower and following counts
- User suggestions panel
- Social interaction tracking

### 🎨 Modern UI/UX
- LinkedIn-inspired responsive design
- Dark/light theme with system preference
- Mobile-first responsive layout
- Beautiful gradient themes
- Loading states and skeleton loaders
- Error boundaries and graceful fallbacks

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Fetch API with custom wrapper
- **Theme**: Custom cookie-based theme system

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with MikroORM
- **Authentication**: JWT with secure cookies
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, bcrypt
- **Logging**: Custom logger with request tracking

### Database
- **Primary**: PostgreSQL 14+
- **ORM**: MikroORM with migrations
- **Schema**: Users, Posts, Follows entities
- **Indexing**: Optimized for social queries

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest for backend, React Testing Library
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Build**: Native Next.js and Node.js builds

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher (or Docker)
- **npm** or **yarn**

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd linqe
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# Start PostgreSQL container
docker-compose up -d postgres
```

#### Option B: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql

# Install PostgreSQL (Ubuntu)
sudo apt-get install postgresql

# Create database
createdb linqe_db
```

### 3. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Optional: Seed with test data
npm run seed

# Start backend server
npm run dev
```

Backend will be available at `http://localhost:3001`

### 4. Frontend Setup
```bash
# Navigate to frontend (new terminal)
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 🧪 Test Account

Use this account to test the application:

**Email**: `test@test.com`  
**Password**: `12345678`

## 📁 Project Structure

```
linqe/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic layer
│   │   ├── entities/        # Database models (User, Post, Follow)
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── migrations/      # Database schema migrations
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   └── test/            # Test suites
│   ├── package.json
│   ├── .env.example
│   └── tsconfig.json
├── frontend/                # Next.js Application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── feed/        # Main feed page
│   │   │   ├── profile/     # User profile pages
│   │   │   ├── login/       # Authentication pages
│   │   │   └── register/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui base components
│   │   │   └── ...          # Custom components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── lib/             # Utilities (API client, cookies)
│   │   └── types/           # TypeScript type definitions
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
├── docker-compose.yml       # PostgreSQL container setup
├── MIGRATION_GUIDE.md       # SQLite to PostgreSQL migration
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Posts
- `GET /api/posts` - Get all posts (public feed)
- `GET /api/posts/following` - Get posts from followed users
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post

### Users
- `GET /api/users` - Get all users (for suggestions)
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/posts` - Get user's posts
- `PUT /api/users/profile` - Update own profile

### Social Features
- `POST /api/follows/:userId` - Follow a user
- `DELETE /api/follows/:userId` - Unfollow a user
- `GET /api/follows/:userId/status` - Get follow status

### System
- `GET /api/health` - Health check endpoint

## 🎨 Key Features Deep Dive

### LinkedIn-Style Layout
- **Left Sidebar**: Personal profile card with stats and quick actions
- **Center Feed**: Post creation form + tabbed feed (All/Following)
- **Right Sidebar**: Suggested users with follow/unfollow buttons
- **Responsive**: Collapses to single column on mobile

### Smart Feed System
- **All Posts**: Global feed showing posts from all users
- **Following**: Personalized feed showing only followed users' posts
- **Real-time Switching**: Instant tab changes with loading states
- **Empty States**: Contextual messages for each feed type

### Professional UI/UX
- **Theme System**: Beautiful orange/amber gradients with dark mode
- **Responsive Design**: Mobile-first approach with breakpoints
- **Loading States**: Skeleton loaders and smooth transitions
- **Error Handling**: Graceful error boundaries with retry options
- **Accessibility**: ARIA labels and keyboard navigation

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Run tests in watch mode
npm run test:watch
```

### Building for Production
```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build
```

### Database Operations
```bash
# Create new migration
cd backend && npm run migrate:create

# Run migrations
npm run migrate

# Rollback migration
npm run migrate:down

# Fresh migration (drop all + recreate)
npm run migrate:fresh
```

### Code Quality
```bash
# Lint code
npm run lint

# Type checking
npm run type-check
```

## 🚀 Deployment

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linqe_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Production Checklist
- [ ] Update JWT secret to a strong random value
- [ ] Configure PostgreSQL with proper credentials
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for your domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database
- [ ] Set up CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Use conventional commit messages
- Update documentation for API changes
- Ensure responsive design for UI changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing React framework
- **shadcn/ui** for beautiful UI components
- **MikroORM** for the excellent TypeScript ORM
- **Tailwind CSS** for utility-first styling
- **PostgreSQL** for robust database foundation

---

**Built with ❤️ using modern web technologies**

For detailed setup instructions, troubleshooting, and migration guides, check out:
- [Migration Guide](MIGRATION_GUIDE.md) - SQLite to PostgreSQL migration
- [Database Setup](backend/DATABASE_SETUP.md) - Detailed database configuration