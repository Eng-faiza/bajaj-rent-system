# Bajaj Rent System

A full-stack MERN application for managing Bajaj vehicle rentals with admin and user functionalities.

## Features

### Admin Features
- Add new Bajaj vehicles
- Delete existing vehicles
- View and manage all bookings
- Update booking status

### User Features
- Browse available vehicles
- Make bookings with date selection
- View personal booking history
- User authentication

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT with bcrypt
- **Deployment**: Vercel

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Local Development

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd bajaj-rent-system
   \`\`\`

2. **Backend Setup**
   \`\`\`bash
   cd server
   npm install
   cp .env.example .env
   # Update .env with your MongoDB URI and JWT secret
   npm run dev
   \`\`\`

3. **Frontend Setup**
   \`\`\`bash
   # In the root directory
   npm install
   cp .env.example .env
   # Update .env with your API URL
   npm run dev
   \`\`\`

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Environment Variables

#### Backend (.env)
\`\`\`
MONGODB_URI=mongodb://localhost:27017/bajaj-rent
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
\`\`\`

#### Frontend (.env)
\`\`\`
VITE_API_URL=http://localhost:5000/api
\`\`\`

### Deployment

The application is configured for deployment on Vercel:

1. **Deploy to Vercel**
   \`\`\`bash
   vercel --prod
   \`\`\`

2. **Set Environment Variables**
   - Add MONGODB_URI, JWT_SECRET, and PORT in Vercel dashboard
   - Update VITE_API_URL to your production API URL

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Bajaj Management
- `GET /api/bajaj` - Get all vehicles
- `GET /api/bajaj/available` - Get available vehicles
- `POST /api/bajaj` - Add new vehicle (Admin only)
- `DELETE /api/bajaj/:id` - Delete vehicle (Admin only)

### Bookings
- `POST /api/booking` - Create booking
- `GET /api/booking/my-bookings` - Get user bookings
- `GET /api/booking/all` - Get all bookings (Admin only)
- `PATCH /api/booking/:id/status` - Update booking status

## Default Admin Account

To create an admin account, register with role "admin" or update a user's role in the database.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
