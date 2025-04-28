require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');


const createAdminUser = async () => {
  const email = 'admin@event-planner.com';
  const password = 'Admin123!';
  const username = 'Admin';
  
  try {
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error checking if admin exists:', err);
        process.exit(1);
      }
      
      if (results.length > 0) {
        console.log('Admin user already exists');
        process.exit(0);
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = 'INSERT INTO users (username, email, password, created_at, is_admin, is_banned, ban_reason) VALUES (?, ?, ?, NOW(), 1, 0, NULL)';
      
      db.query(insertQuery, [username, email, hashedPassword], (err) => {
        if (err) {
          console.error('Error creating admin user:', err);
          process.exit(1);
        }
        
        console.log('Admin user created successfully!');
        console.log('Email: admin@event-planner.com');
        console.log('Password: Admin123!');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Unexpected error creating admin user:', err);
    process.exit(1);
  }
};

createAdminUser(); 