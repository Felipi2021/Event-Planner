require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');


const isTestEnvironment = process.env.NODE_ENV === 'test';

const createAdminUser = async () => {
  const email = 'admin@event-planner.com';
  const password = 'Admin123!';
  const username = 'Admin';
  
  return new Promise(async (resolve, reject) => {
    try {
      const checkQuery = 'SELECT id FROM users WHERE email = ?';
      db.query(checkQuery, [email], async (err, results) => {
        if (err) {
          console.error('Error checking if admin exists:', err);
          if (!isTestEnvironment) process.exit(1);
          resolve();
          return;
        }
        
        if (results.length > 0) {
          console.log('Admin user already exists');
          if (!isTestEnvironment) process.exit(0);
          resolve();
          return;
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO users (username, email, password, created_at, is_admin, is_banned, ban_reason) VALUES (?, ?, ?, NOW(), 1, 0, NULL)';
        
        db.query(insertQuery, [username, email, hashedPassword], (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
            if (!isTestEnvironment) process.exit(1);
            resolve();
            return;
          }
          
          console.log('Admin user created successfully!');
          console.log('Email: admin@event-planner.com');
          console.log('Password: Admin123!');
          if (!isTestEnvironment) process.exit(0);
          resolve();
        });
      });
    } catch (err) {
      console.error('Unexpected error creating admin user:', err);
      if (!isTestEnvironment) process.exit(1);
      resolve();
    }
  });
};


if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser }; 