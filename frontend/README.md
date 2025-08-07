# Community Platform Frontend

A Mini LinkedIn-like Community Platform built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- 🔐 **Authentication**: Login/Register with JWT tokens
- 🏠 **Public Feed**: View and create text posts with timestamps
- 👤 **User Profiles**: View user details and their posts
- ✏️ **Profile Editing**: Update name and bio
- 🌙 **Dark/Light Theme**: Toggle between themes
- 📱 **Responsive Design**: Mobile-friendly interface
- 🎨 **Clean UI**: Using shadcn/ui components

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (simplified)
- **Icons**: Lucide React
- **State Management**: React Context
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:3001`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your backend URL:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build

Build for production:

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── feed/           # Main feed page
│   ├── profile/[id]/   # User profile page
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Homepage
├── components/         # Reusable components
│   ├── ui/            # UI components (Button, Card, etc.)
│   ├── navigation.tsx  # Main navigation
│   ├── post-card.tsx  # Post display component
│   ├── create-post-form.tsx # Post creation form
│   ├── theme-provider.tsx   # Theme context provider
│   └── theme-toggle.tsx     # Theme switcher
├── contexts/          # React contexts
│   └── auth-context.tsx # Authentication context
├── lib/               # Utilities
│   ├── api-client.ts  # API client for backend communication
│   └── utils.ts       # Utility functions
└── types/             # TypeScript type definitions
    └── index.ts       # Shared types
```

## Features Overview

### Authentication

- JWT-based authentication
- Persistent login sessions
- Protected routes
- Auto-redirect logic

### Posts

- Create text posts (max 1000 characters)
- Real-time post feed
- Author information display
- Timestamp formatting

### User Profiles

- View user details and bio
- See all posts by user
- Edit own profile (name, bio)
- Avatar placeholder with initials

### UI/UX

- Clean, modern design
- Dark/light theme toggle
- Responsive layout
- Loading states
- Error handling
- Form validation

## API Integration

The frontend integrates with the backend API endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/posts` - Get user's posts
- `PUT /api/users/profile` - Update profile

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001)

## Development Notes

- The application uses Next.js App Router
- Authentication state is managed with React Context
- Theme switching is handled by next-themes
- All forms include loading states and error handling
- The UI is built with a simplified version of shadcn/ui components
- TypeScript is used throughout for type safety

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
