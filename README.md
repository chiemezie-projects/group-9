# Workout Schedule Tracker

A full-stack web application for tracking workout schedules, timing exercises, and monitoring fitness progress. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- **User Authentication** – Register, login, and logout with bcrypt password hashing and session-based auth
- **Workout Management** – Create, edit, and delete workouts assigned to days of the week
- **Weekly Schedule** – Visual overview of your entire week's workout plan
- **Workout Timer** – Countdown timer with start, pause, resume, and reset
- **Progress Tracking** – Track total workouts, current streak, and weekly completions

## Tech Stack

| Layer      | Technology           |
|------------|----------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript |
| Backend    | Node.js, Express.js  |
| Database   | MongoDB, Mongoose    |
| Auth       | bcrypt, express-session |

## Project Structure

```
project/
├── server.js              # Express server entry point
├── config/
│   └── db.js              # MongoDB connection config
├── models/
│   ├── User.js            # User schema (name, email, password)
│   ├── Workout.js         # Workout schema (title, category, day, etc.)
│   └── Progress.js        # Progress schema (completed workouts)
├── routes/
│   ├── authRoutes.js      # Auth endpoints (register, login, logout)
│   ├── workoutRoutes.js   # Workout CRUD endpoints
│   └── progressRoutes.js  # Progress tracking endpoints
├── middleware/
│   └── auth.js            # Session-based authentication middleware
├── public/
│   ├── css/
│   │   └── style.css      # Application styles
│   ├── js/
│   │   ├── auth.js        # Login/register client logic
│   │   ├── workouts.js    # Workout CRUD client logic
│   │   ├── timer.js       # Timer countdown logic
│   │   └── progress.js    # Progress display logic
│   └── images/            # Static images
├── views/
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # Dashboard with schedule overview
│   ├── workouts.html      # Workout management page
│   ├── timer.html         # Workout timer page
│   └── progress.html      # Progress statistics page
├── .env.example           # Environment variable template
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Prerequisites

- **Node.js** (v16 or higher) – [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) – [Download](https://www.mongodb.com/try/download/community)

## Installation

1. **Clone or download** this project

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your MongoDB URI and session secret:
   ```
   MONGODB_URI=mongodb://localhost:27017/workout-tracker
   SESSION_SECRET=your-random-secret-key
   PORT=3000
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Start the application:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

## API Endpoints

### Authentication
| Method | Endpoint        | Description             |
|--------|-----------------|-------------------------|
| POST   | `/api/register` | Create a new account    |
| POST   | `/api/login`    | Login to an account     |
| POST   | `/api/logout`   | Logout (destroy session)|
| GET    | `/api/me`       | Get current user info   |

### Workouts (Protected)
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | `/api/workouts`       | Get all workouts    |
| POST   | `/api/workouts`       | Create a workout    |
| PUT    | `/api/workouts/:id`   | Update a workout    |
| DELETE | `/api/workouts/:id`   | Delete a workout    |

### Progress (Protected)
| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | `/api/progress` | Get progress statistics  |
| POST   | `/api/progress` | Log a completed workout  |

## Database Schema

### User
- `name` (String, required)
- `email` (String, required, unique)
- `passwordHash` (String, hashed with bcrypt)
- `createdAt` (Date)

### Workout
- `userId` (ObjectId → User)
- `title` (String, required)
- `category` (Enum: HIIT, Running, Cardio, Strength)
- `duration` (Number, in minutes)
- `dayOfWeek` (Enum: Monday–Sunday)
- `notes` (String, optional)
- `createdAt` (Date)

### Progress
- `userId` (ObjectId → User)
- `workoutId` (ObjectId → Workout)
- `completionDate` (Date)
- `durationCompleted` (Number, in minutes)

## Testing

1. Start the server and navigate to `http://localhost:3000`
2. Register a new account
3. Create several workouts assigned to different days
4. View the dashboard to see your weekly schedule
5. Go to the Timer page, select a workout, and run the countdown
6. Check the Progress page to see your completion stats

## Security Features

- Passwords hashed with **bcrypt** (10 salt rounds)
- Session-based authentication via **express-session**
- Sessions stored in MongoDB via **connect-mongo**
- Protected API routes require valid session
- Input validation on both client and server
- HTML escaping to prevent XSS
- Environment variables for sensitive configuration

## Authors

Group 9

## License

ISC
