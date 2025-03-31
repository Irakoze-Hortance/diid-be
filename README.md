# DIID Backend API

Digital Inclusion and Innovation for Development (DIID) backend is a NestJS application that provides API endpoints for user management, authentication, and course management specifically designed for digital literacy education in refugee communities.

## Project Overview

This backend system handles:
- User authentication and registration
- User management with different roles (students and teachers)
- Course creation and management
- Student enrollment in courses
- Tracking course completion

## Architecture

The backend is built with NestJS and uses the following modules:

- **AppModule**: Main application module
- **UsersModule**: Handles user management
- **AuthModule**: Manages authentication with Passport and JWT
- **CoursesModule**: Manages courses and student enrollments

## API Endpoints

### Users

- `GET /users/:id` - Get user by ID
- `GET /users/students/all` - Get all students
- `GET /users/teachers/all` - Get all teachers

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Courses

- `POST /courses` - Create a new course
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course by ID
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `GET /courses/teacher/:teacherId` - Get courses by teacher
- `POST /courses/:id/enroll` - Enroll a student in a course
- `DELETE /courses/:courseId/students/:studentId` - Remove a student from a course
- `GET /courses/:id/enrollments` - Get all enrollments for a course
- `GET /courses/student/:studentId` - Get courses by student
- `PATCH /courses/enrollments/:enrollmentId/complete` - Mark an enrollment as completed

## Database Schema

The application uses TypeORM with the following entities:

- **User**: Stores user information with roles (student/teacher)
- **Course**: Stores course information created by teachers
- **Enrollment**: Junction table tracking student enrollments in courses

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [<repository-url>](https://github.com/Irakoze-Hortance/diid-be/)
cd diid-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with the following variables:
```
DB_HOST=your-database-host
DB_PORT=5432
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password
DB_DATABASE=diid
DB_SYNC=true
JWT_SECRET=your-jwt-secret
```

4. Start the development server
```bash
npm run start:dev
```

The server will be running at http://localhost:4000

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. The flow is:

1. Users register via `/auth/register`
2. Users login via `/auth/login` to receive a JWT token
3. The token must be included in subsequent requests as a Bearer token in the Authorization header

## Deployment

To deploy the application:

1. Build the application
```bash
npm run build
```

2. Start the production server
```bash
npm run start:prod
```

## Development

### Running Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

[MIT](LICENSE)
