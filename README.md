# 🎮 Unique Esports - Tournament Management Platform

A sleek black & white themed esports tournament management system with player registration and admin dashboard.

## ✨ Features

### 🎯 Player Portal
- **Dynamic Tournament Display**: View all tournaments (upcoming, ongoing, completed)
- **Easy Registration**: Simple form to register for tournaments
- **YouTube Links**: Watch completed tournament streams directly
- **Status Tracking**: See tournament status and prize pools

### 👨‍💼 Admin Portal
- **Secure Login**: Password-protected admin dashboard
- **Tournament Management**: Create, edit, and delete tournaments
- **Status Management**: Update tournament status (upcoming → ongoing → completed)
- **YouTube Integration**: Add YouTube links for completed tournaments
- **Registration Tracking**: View all registrations for each tournament
- **Excel Export**: Export registrations to Excel spreadsheet
- **Dashboard Overview**: Quick stats on tournaments and registrations

### 🗄️ Database
- **MySQL Integration**: Persistent data storage
- **Relational Schema**: Properly structured tables with foreign keys
- **Data Integrity**: Cascading deletes and constraints

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v14+) and npm
- **MySQL** (v5.7+ or MariaDB)
- A modern web browser

### Step 1: Install Dependencies

```bash
cd "e:\Unique esports\Website"
npm install
```

This will install:
- `express` - Web framework
- `mysql2` - MySQL driver
- `bcryptjs` - Password hashing
- `cors` - Cross-Origin requests
- `body-parser` - Request parsing
- `xlsx` - Excel export functionality
- `dotenv` - Environment variables
- `nodemon` - Development auto-reload

### Step 2: Setup Database

1. **Create Database**: Open MySQL and run the schema file:
   ```bash
   mysql -u root -p < schema.sql
   ```

   Or manually:
   ```sql
   -- Copy entire contents of schema.sql and run in MySQL client
   ```

2. **Default Admin Credentials**:
   - Username: `admin`
   - Password: `admin123`
   
   ⚠️ **IMPORTANT**: Change these credentials in production!

### Step 3: Configure Environment

1. **Copy `.env.example` to `.env`**:
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` with your database credentials**:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=unique_esports
   DB_PORT=3306
   PORT=5000
   NODE_ENV=development
   SESSION_SECRET=your_secret_key_here_change_in_production
   ```

### Step 4: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Server will start on `http://localhost:5000`

---

## 🌐 Accessing the Platform

### 🎮 Player Portal
**URL**: `http://localhost:5000/`

Features:
- Browse all tournaments
- View tournament details (prize pool, dates, status)
- Register for tournaments with team info
- View YouTube links for completed tournaments

### 👨‍💼 Admin Portal
**URL**: `http://localhost:5000/admin`

**Default Login**:
- Username: `admin`
- Password: `admin123`

Features:
- Dashboard with tournament statistics
- Create new tournaments
- Edit tournament details and status
- Add YouTube links for completed tournaments
- View all registrations
- Export registrations to Excel

---

## 📊 API Endpoints

### Public Endpoints

#### Get All Tournaments
```
GET /api/tournaments
Response: [{ id, name, game_type, description, start_date, end_date, prize_pool, status, youtube_link }]
```

#### Get Single Tournament
```
GET /api/tournaments/:id
Response: { id, name, game_type, ... }
```

#### Register for Tournament
```
POST /api/register
Body: {
  tournament_id: int,
  team_name: string,
  email: string,
  phone: string (optional),
  players_count: int,
  additional_info: string (optional)
}
Response: { success: true, registration_id: int }
```

### Admin Endpoints (Require Session)

#### Admin Login
```
POST /api/admin/login
Body: { username: string, password: string }
Response: { success: true, sessionId: string }
```

#### Get All Tournaments (Admin)
```
GET /api/admin/tournaments
Headers: { x-session-id: sessionId }
Response: [{ tournaments with all details }]
```

#### Create Tournament
```
POST /api/admin/tournaments
Headers: { x-session-id: sessionId }
Body: {
  name: string,
  game_type: string,
  description: string (optional),
  start_date: datetime,
  end_date: datetime,
  prize_pool: string (optional),
  status: enum (upcoming|ongoing|completed)
}
Response: { success: true, tournament_id: int }
```

#### Update Tournament
```
PUT /api/admin/tournaments/:id
Headers: { x-session-id: sessionId }
Body: { Any of the tournament fields to update }
Response: { success: true, message: string }
```

#### Delete Tournament
```
DELETE /api/admin/tournaments/:id
Headers: { x-session-id: sessionId }
Response: { success: true, message: string }
```

#### Get Registrations for Tournament
```
GET /api/admin/registrations/:tournament_id
Headers: { x-session-id: sessionId }
Response: [{ id, tournament_id, team_name, email, phone, players_count, created_at }]
```

#### Export Registrations to Excel
```
POST /api/admin/export
Headers: { x-session-id: sessionId }
Body: { tournament_id: int }
Response: { success: true, fileName: string }
```

---

## 📁 Project Structure

```
website/
├── server.js                 # Main Express server & API routes
├── db.js                     # MySQL connection pool
├── package.json              # Dependencies
├── .env.example              # Environment template
├── schema.sql                # Database schema
├── html                      # Player portal (static)
├── admin.html               # Admin dashboard (static)
├── exports/                 # Generated Excel files
└── node_modules/            # Dependencies (auto-generated)
```

---

## 🎨 Design Features

### Black & White Theme
- Professional, sleek appearance
- High contrast for readability
- Smooth transitions and animations
- Responsive design for all devices

### UI Components
- Navigation bar with smooth scrolling
- Hero section with call-to-action
- Dynamic tournament cards with hover effects
- Clean registration form
- Professional admin dashboard
- Status badges with color coding

---

## 🔐 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **Session Management**: Session tokens for admin authentication
- **CORS Protection**: Cross-origin request handling
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Prepared statements with mysql2

### Important Security Notes
1. **Change Default Password**: Update admin password immediately in production
2. **Use HTTPS**: Enable SSL/TLS in production
3. **Environment Variables**: Keep sensitive data in .env (not in code)
4. **Session Secret**: Change SESSION_SECRET in .env
5. **Database Credentials**: Use strong passwords for MySQL

---

## 📝 Database Schema

### tournaments
- `id` - Primary key
- `name` - Tournament name
- `game_type` - Game type (e.g., Valorant, CS:GO)
- `description` - Tournament description
- `start_date` - Tournament start datetime
- `end_date` - Tournament end datetime
- `prize_pool` - Prize pool amount
- `status` - upcoming|ongoing|completed
- `youtube_link` - YouTube stream link
- `created_at`, `updated_at` - Timestamps

### registrations
- `id` - Primary key
- `tournament_id` - Foreign key to tournaments
- `team_name` - Team/Player name
- `email` - Email address
- `phone` - Phone number
- `players_count` - Number of players
- `additional_info` - Extra information
- `created_at` - Registration timestamp

### admin_users
- `id` - Primary key
- `username` - Unique username
- `password_hash` - Hashed password
- `email` - Email address
- `created_at` - Account creation timestamp

---

## 🚀 Deployment

### Development
```bash
npm start
# or with auto-reload
npm run dev
```

### Production
1. Set `NODE_ENV=production` in .env
2. Use a process manager (PM2, Forever, etc.)
3. Setup reverse proxy (Nginx, Apache)
4. Enable HTTPS/SSL
5. Use managed MySQL service or secure database server
6. Setup automated backups

---

## 📞 Support & Customization

### Common Customizations
- **Change Logo**: Edit in header/footer
- **Modify Theme**: Update CSS colors
- **Add More Games**: Create tournament types in admin
- **Email Notifications**: Add email service integration

### Troubleshooting
1. **Can't connect to database**: Verify MySQL is running and credentials are correct
2. **Port already in use**: Change PORT in .env
3. **CORS errors**: Check API_URL in frontend matches server URL
4. **Import errors**: Run `npm install` again

---

## 📄 License

Copyright © 2025 Unique Esports. All rights reserved.

---

## 🎮 Ready to Go!

Your Unique Esports tournament platform is now ready. Start managing tournaments and registrations with ease!

**Happy Gaming! ⚡**
