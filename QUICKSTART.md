# ⚡ Quick Start Guide - Unique Esports

## 🚀 Get Up & Running in 5 Minutes

### Step 1: Install Node Dependencies (1 min)
```bash
npm install
```

### Step 2: Setup MySQL Database (2 min)

**Windows - Command Prompt or PowerShell:**
```bash
mysql -u root -p < schema.sql
```

**macOS/Linux - Terminal:**
```bash
mysql -u root -p < schema.sql
```

When prompted, enter your MySQL password.

**Alternative - Using MySQL Workbench or phpMyAdmin:**
1. Open the schema.sql file
2. Copy-paste entire content
3. Execute the query

### Step 3: Configure Environment (1 min)

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env    # Windows
   cp .env.example .env       # macOS/Linux
   ```

2. Edit `.env` and update with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=YourMySQLPassword
   DB_NAME=unique_esports
   DB_PORT=3306
   ```

### Step 4: Start Server (instant!)
```bash
npm start
```

You should see:
```
🎮 Unique Esports Server running on http://localhost:5000
📊 Admin Panel: http://localhost:5000/admin
```

### Step 5: Access the Platform

**🎮 Player Portal**
- Open browser: http://localhost:5000/
- View tournaments
- Register for tournaments

**👨‍💼 Admin Dashboard**
- Open browser: http://localhost:5000/admin
- Login with default credentials:
  - Username: `admin`
  - Password: `admin123`
- Create tournaments
- Manage registrations
- Export to Excel

---

## 📋 What You Get

✅ Dynamic tournament listing from database
✅ Player registration system with form validation
✅ Admin dashboard with full tournament management
✅ Excel export for registrations
✅ Status tracking (upcoming → ongoing → completed)
✅ YouTube integration for completed tournaments
✅ Secure admin login
✅ Beautiful black & white design
✅ Fully responsive on all devices

---

## ⚙️ Key Files

- **server.js** - Main backend with all API routes
- **db.js** - Database connection
- **html** - Player portal frontend
- **admin.html** - Admin dashboard frontend
- **schema.sql** - Database structure
- **.env** - Your configuration (create from .env.example)

---

## 🔑 Default Admin Credentials

⚠️ **IMPORTANT**: Change immediately in production!

- Username: `admin`
- Password: `admin123`

To change: Use your MySQL client to update the admin_users table.

---

## 🆘 Need Help?

### Common Issues

**❌ "Cannot find module 'express'"**
→ Run: `npm install`

**❌ "Error: connect ECONNREFUSED 127.0.0.1:3306"**
→ MySQL is not running. Start MySQL service.

**❌ "Port 5000 already in use"**
→ Change PORT in .env to 5001 or another free port

**❌ "Error: ER_BAD_DB_ERROR: Unknown database 'unique_esports'"**
→ Run the schema.sql file in MySQL to create database

**❌ API calls failing or returning errors**
→ Check browser console (F12) for specific error messages
→ Verify .env configuration matches your MySQL setup

---

## 💡 Pro Tips

1. **Development with Auto-Reload**
   ```bash
   npm run dev
   ```

2. **Export Registrations**
   - Go to Admin → Registrations
   - Select tournament
   - Click "Export to Excel"

3. **Mark Tournament as Completed**
   - Go to Admin → Tournaments
   - Click Edit
   - Change Status to "Completed"
   - Add YouTube link
   - Save

4. **Add More Tournaments**
   - Admin → Create Tournament
   - Fill form and submit
   - Tournament appears on player portal instantly

---

## 📱 Responsive Design

Works perfectly on:
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768)
- ✅ Tablet (768px width)
- ✅ Mobile (320px+ width)

---

## 🎯 Next Steps

1. **Customize**: Edit colors, logos, text to match your brand
2. **Add Data**: Create tournaments in admin panel
3. **Share**: Give players the link to register
4. **Track**: Monitor registrations in admin panel
5. **Deploy**: Put online for production use

---

**You're all set! Happy hosting! 🎮⚡**
