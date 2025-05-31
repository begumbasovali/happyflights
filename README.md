
# HappyFlights - Flight Booking System

A full-stack flight booking application with user authentication, flight search, seat selection, and payment processing.

## 🎯 Assignment Features Completed

### User Side (Customer)
- ✅ View all available flights
- ✅ Search flights by origin, destination, date
- ✅ Book tickets by entering passenger information
- ✅ View booking confirmation

### Admin Side (Admin Panel)
- ✅ Admin login system
- ✅ Add, edit, delete flights
- ✅ View all ticket bookings

### Flight Scheduling Rules
- ✅ **Rule 1**: 81 Turkish cities available
- ✅ **Rule 2**: No two flights from same city can depart at same time
- ✅ **Rule 3**: No two flights can arrive at same city at same time

## Features

- **User Authentication**: Register and login using JWT tokens
- **Flight Management**: Admin panel to create, edit, and delete flights
- **Flight Search**: Search for available flights by date, origin, and destination
- **Booking System**: Step-by-step booking process with seat selection
- **Payment Simulation**: Simulate payment processing (for demo purposes)
- **Ticket Management**: View and manage booked tickets
- **Email Confirmations**: Receive booking confirmations by email
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

### Frontend
- HTML5
- CSS3 with Bootstrap 5
- Vanilla JavaScript
- EJS templating engine

### Backend
- Node.js (v14+ required)
- Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Nodemailer for email functionality

## System Requirements

- **Node.js**: Version 14.0.0 or higher
- **MongoDB**: Version 4.4 or higher
- **RAM**: Minimum 512MB
- **Storage**: 100MB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HappyFlights
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/happyflights
   
   # Security
   JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
   
   # Email Configuration (Optional - for production)
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_specific_password
   
   # Server Configuration (Optional)
   PORT=3000
   NODE_ENV=development
   ```

4. **Setup and seed database**
   ```bash
   npm run seed
   ```

5. **Start the application**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open your browser and navigate to: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin/login`

## 📋 API Endpoints

### Flight Management
- `GET /api/flights` - List all future flights
- `GET /api/flights/admin/all` - List all flights (admin only)
- `GET /api/flights/:id` - Get specific flight
- `POST /api/flights` - Create new flight (admin only)
- `PUT /api/flights/:id` - Update flight (admin only)
- `DELETE /api/flights/:id` - Delete flight (admin only)

### Ticket Management
- `POST /api/tickets` - Book a ticket
- `GET /api/tickets/:email` - List tickets by user email
- `GET /api/tickets/admin/all` - List all tickets (admin only)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

## Usage

### Regular Users
1. Visit the homepage at `http://localhost:3000`
2. Search for flights using the search form
3. Register/login to book tickets
4. Select a flight and choose a seat
5. Complete the payment simulation
6. Receive booking confirmation and email

### Administrators
1. Access the admin panel at `http://localhost:3000/admin/login`
2. **Default admin credentials** (created by seed script):
   - **Username**: `admin`
   - **Password**: `admin123`
3. Manage flights: create, edit, delete
4. View all ticket bookings and system data

## Project Structure

```
HappyFlights/
├── models/          # MongoDB schema definitions
├── routes/          # API endpoints and page routes
├── middleware/      # Authentication middleware
├── utils/           # Utility functions (seeding, emails)
├── views/           # EJS templates
│   ├── layouts/     # Layout templates
│   └── partials/    # Reusable components
├── public/          # Static assets
│   ├── css/         # Stylesheets
│   ├── js/          # Client-side JavaScript
│   └── img/         # Images
├── server.js        # Main application file
└── package.json     # Dependencies and scripts
```

## 🌟 Bonus Features Implemented

- ✅ **Seat Selection**: Interactive airplane seat map
- ✅ **Email Confirmations**: Automatic booking confirmations via email
- ✅ **Payment Simulation**: Realistic credit card payment interface
- ✅ **User Authentication**: Complete registration and login system
- ✅ **Responsive Design**: Mobile-first design with Bootstrap 5

## Database Information

- **Database Name**: `happyflights`
- **Connection**: `mongodb://localhost:27017/happyflights`
- **Collections**: admins, flights, tickets, users
- **Sample Data**: Included via seed script
- **Export Instructions**: See `database-export-instructions.md`

## Key Pages

1. **Home Page** (`/`) - Flight search and results display
2. **Flight Detail** (`/flight/:id`) - Flight information and booking form
3. **Payment** (`/payment`) - Credit card payment simulation
4. **Confirmation** (`/confirmation/:ticketId`) - Booking success page
5. **Admin Panel** (`/admin/panel`) - Flight and ticket management
6. **My Tickets** (`/my-tickets`) - User ticket history
7. **Register/Login** (`/register`, `/login`) - User authentication

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill existing process
   npx kill-port 3000
   # Or use different port in .env file
   ```

2. **MongoDB connection failed**
   - Ensure MongoDB is running locally
   - Check connection string in `.env` file
   - Verify MongoDB service is started

3. **Email not working**
   - Email is optional for development
   - Test emails work with Ethereal accounts
   - Check console for preview URLs

### Support
For issues or questions, check the console logs for detailed error messages.

## Assignment Deliverables ✅

- ✅ **Frontend Code**: Complete React-like interface with vanilla JS
- ✅ **Backend Code**: Full REST API with Express.js
- ✅ **Database**: MongoDB with sample data
- ✅ **README**: This comprehensive documentation
- ✅ **Admin Credentials**: admin/admin123
- ✅ **All Required Features**: User booking, admin management, flight rules
- ✅ **Bonus Features**: Seat selection, email, payment simulation

## Credits

Created as a demonstration project for Full Stack Development Final Assignment.
**Author**: Student Project  
**Course**: Web Development  
**Framework**: MEAN Stack (MongoDB, Express.js, Angular-style frontend, Node.js)
