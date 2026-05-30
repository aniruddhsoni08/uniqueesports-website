-- Unique Esports - Admin Account Management
-- Use this file to manage admin credentials

-- ⚠️ IMPORTANT SECURITY NOTES ⚠️
-- 1. Change default admin password immediately in production
-- 2. Use strong, unique passwords (min 12 characters, mix of letters/numbers/symbols)
-- 3. Store credentials securely
-- 4. Never share admin credentials
-- 5. Use HTTPS in production
-- 6. Implement 2FA for additional security (future enhancement)

-- DEFAULT ADMIN ACCOUNT (CHANGE THIS!)
-- Username: admin
-- Password: admin123
-- Email: admin@uniqueesports.com

-- Hash Notes:
-- The password hash in the database is generated using bcryptjs with 10 rounds
-- To generate a new password hash, use:
-- 1. Node.js REPL:
--    > const bcrypt = require('bcryptjs');
--    > bcrypt.hash('newpassword', 10).then(hash => console.log(hash));
-- 2. Or use this online tool: https://bcryptgenerator.com/

-- ========================================
-- HOW TO CHANGE ADMIN PASSWORD
-- ========================================

-- Option 1: Using the online generator
-- 1. Go to: https://bcryptgenerator.com/
-- 2. Enter your new password
-- 3. Copy the hash
-- 4. Replace in the UPDATE statement below

-- Option 2: Generate hash via Node.js
-- Run in terminal:
-- node -e "require('bcryptjs').hash('newpassword', 10).then(hash => console.log('UPDATE admin_users SET password_hash = \''+hash+'\' WHERE username = \'admin\';'))"

-- ========================================
-- UPDATE ADMIN PASSWORD (replace 'newpassword123' with your secure password)
-- ========================================
-- STEP 1: Generate hash at https://bcryptgenerator.com/ for 'newpassword123'
-- STEP 2: Replace the hash below with the one from step 1
-- STEP 3: Run in MySQL

-- UPDATE admin_users SET password_hash = 'PASTE_YOUR_BCRYPT_HASH_HERE' WHERE username = 'admin';

-- Example of updating password:
-- If your new password is 'MySecurePass2024!', 
-- and its bcrypt hash is: $2a$10$abcdefghijklmnopqrstuvwxyz1234567890...
-- Then run:
-- UPDATE admin_users SET password_hash = '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890...' WHERE username = 'admin';

-- ========================================
-- ADD NEW ADMIN ACCOUNT
-- ========================================

-- To add another admin user, first generate a bcrypt hash for the password
-- Then run:
-- INSERT INTO admin_users (username, password_hash, email) 
-- VALUES ('newadmin', '$2a$10$YourBcryptHashHere...', 'newadmin@uniqueesports.com');

-- ========================================
-- LIST ALL ADMIN USERS
-- ========================================
-- SELECT username, email, created_at FROM admin_users;

-- ========================================
-- DELETE ADMIN USER (be careful!)
-- ========================================
-- DELETE FROM admin_users WHERE username = 'admin';

-- ========================================
-- PASSWORD HASH EXAMPLES (DO NOT USE - these are demos)
-- ========================================
-- Password: admin123 → $2a$10$YOIz8kVYVfN7qY8QZ8QZQe8qZ8QZQe8QZ8QZQe8QZ8QZQe8QZ8QZQ
-- Password: test123 → $2a$10$dXJ3aW51cC5jb20wMDEyMzQ1Ng==
-- Password: complex!Pass2024 → $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Hs5z.

-- ========================================
-- PASSWORD SECURITY BEST PRACTICES
-- ========================================
-- ✅ DO:
-- - Use 12+ characters
-- - Mix uppercase, lowercase, numbers, symbols
-- - Use unique passwords for each account
-- - Store credentials in secure vault
-- - Change passwords regularly (every 90 days)
-- - Use environment variables for sensitive data

-- ❌ DON'T:
-- - Use simple passwords like "admin123"
-- - Reuse passwords across services
-- - Share admin credentials via email/chat
-- - Hardcode credentials in code
-- - Use personal information in passwords

-- ========================================
-- TWO-FACTOR AUTHENTICATION (FUTURE)
-- ========================================
-- Planned enhancement:
-- - Add 2FA table
-- - Implement TOTP (Time-based One-Time Password)
-- - Backup codes for recovery

-- For now, use strong passwords and HTTPS only!
