require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');
const fs = require('fs');
const path = require('path');

/**
 * This script creates sample data for the app:
 * - Users (including banned users)
 * - Events
 * - Comments
 * - Registrations
 * - Favorites
 * 
 * Run with: node models/migrations/create_fixtures.js
 */


const DEFAULT_IMAGE = 'default-event.jpg';
const DEFAULT_USER_IMAGE = 'default-avatar.png';


const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin123!',
    description: 'System administrator',
    is_admin: true,
    is_banned: false
  },
  {
    username: 'alice_johnson',
    email: 'alice@example.com',
    password: 'Test123!',
    description: 'Event enthusiast and community organizer',
    is_admin: false,
    is_banned: false
  },
  {
    username: 'bob_smith',
    email: 'bob@example.com',
    password: 'Test123!',
    description: 'Love attending local meetups and conferences',
    is_admin: false,
    is_banned: false
  },
  {
    username: 'carol_williams',
    email: 'carol@example.com',
    password: 'Test123!',
    description: 'Tech conference addict',
    is_admin: false,
    is_banned: false
  },
  {
    username: 'dave_brown',
    email: 'dave@example.com',
    password: 'Test123!',
    description: 'Professional photographer looking for events to capture',
    is_admin: false,
    is_banned: true,
    ban_reason: 'Posting inappropriate content in comments'
  },
  {
    username: 'evan_miller',
    email: 'evan@example.com',
    password: 'Test123!',
    description: 'Music lover and concert goer',
    is_admin: false,
    is_banned: true,
    ban_reason: 'Spamming events with fake registrations'
  }
];

const events = [
  {
    title: 'Tech Conference 2023',
    description: 'Join us for the biggest tech conference of the year featuring keynotes, workshops, and networking opportunities.',
    date: '2023-08-25 09:00:00',
    location: 'Convention Center, New York',
    capacity: 500,
    image: DEFAULT_IMAGE
  },
  {
    title: 'Community Cleanup Day',
    description: 'Help clean up our local parks and streets. Tools and refreshments provided.',
    date: '2023-09-15 08:30:00',
    location: 'Central Park, Main Entrance',
    capacity: 100,
    image: DEFAULT_IMAGE
  },
  {
    title: 'Summer Music Festival',
    description: 'Three-day music festival featuring local and international artists. Food, drinks, and camping available.',
    date: '2023-07-30 12:00:00',
    location: 'Riverside Park',
    capacity: 2000,
    image: DEFAULT_IMAGE
  },
  {
    title: 'Charity Fun Run',
    description: '5K fun run to raise money for local children\'s hospital. All fitness levels welcome.',
    date: '2023-10-10 07:00:00',
    location: 'City Sports Complex',
    capacity: 300,
    image: DEFAULT_IMAGE
  },
  {
    title: 'Food & Wine Tasting',
    description: 'Sample dishes and wines from top local restaurants and wineries.',
    date: '2023-09-05 18:00:00',
    location: 'Downtown Culinary Center',
    capacity: 150,
    image: DEFAULT_IMAGE
  }
];



const isTestEnvironment = process.env.NODE_ENV === 'test';


async function createFixtures() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting to create fixtures...');
      
      const userIds = await createUsers();
      console.log(`Created ${userIds.length} users`);
      
      const eventIds = await createEvents();
      console.log(`Created ${eventIds.length} events`);
      
      await createComments(userIds, eventIds);
      
      await createRegistrations(userIds, eventIds);
      
      await createFavorites(userIds, eventIds);
      
      console.log('All fixtures created successfully!');
      if (!isTestEnvironment) process.exit(0);
      resolve();
    } catch (error) {
      console.error('Error creating fixtures:', error);
      if (!isTestEnvironment) process.exit(1);
      reject(error);
    }
  });
}


async function createUsers() {
  const userIds = [];
  
  for (const user of users) {
    try {
      
      const [existingUsers] = await queryPromise(
        'SELECT id FROM users WHERE email = ?',
        [user.email]
      );
      
      if (existingUsers.length > 0) {
        console.log(`User ${user.email} already exists. Skipping.`);
        userIds.push(existingUsers[0].id);
        continue;
      }
      
      
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      
      const insertQuery = `
        INSERT INTO users 
        (username, email, password, description, image, created_at, is_admin, is_banned, ban_reason) 
        VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
      `;
      
      const [result] = await queryPromise(
        insertQuery,
        [
          user.username,
          user.email,
          hashedPassword,
          user.description || null,
          DEFAULT_USER_IMAGE,
          user.is_admin ? 1 : 0,
          user.is_banned ? 1 : 0,
          user.ban_reason || null
        ]
      );
      
      userIds.push(result.insertId);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
      throw error;
    }
  }
  
  return userIds;
}


async function createEvents() {
  const eventIds = [];
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    try {
      
      const [existingEvents] = await queryPromise(
        'SELECT id FROM events WHERE title = ? AND date = ?',
        [event.title, event.date]
      );
      
      if (existingEvents.length > 0) {
        console.log(`Event "${event.title}" already exists. Skipping.`);
        eventIds.push(existingEvents[0].id);
        continue;
      }
      
      
      const [users] = await queryPromise(
        'SELECT id FROM users WHERE is_banned = 0 LIMIT 3'
      );
      
      
      let creatorId = 1;
      
      
      if (users && users.length > 0) {
        creatorId = users[i % users.length].id;
      } else {
        console.log('No users found to assign as event creators, using default ID 1');
      }
      
      const insertQuery = `
        INSERT INTO events 
        (title, description, date, location, capacity, image, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await queryPromise(
        insertQuery,
        [
          event.title,
          event.description,
          event.date,
          event.location,
          event.capacity,
          event.image,
          creatorId
        ]
      );
      
      eventIds.push(result.insertId);
    } catch (error) {
      console.error(`Error creating event "${event.title}":`, error);
      throw error;
    }
  }
  
  return eventIds;
}


async function createComments(userIds, eventIds) {
  const comments = [
    'Great event, looking forward to it!',
    'Is there parking available nearby?',
    'The last one was amazing, can\'t wait!',
    'Will there be food available?',
    'What time does it end?',
    'Has anyone attended this before? What was it like?',
    'Just registered, see you all there!',
    'Perfect timing for me.',
    'Is this suitable for beginners?',
    'Can I bring my kids?'
  ];
  
  let commentCount = 0;
  
  
  for (let i = 0; i < 20; i++) {
    try {
      
      const randomUserIndex = Math.floor(Math.random() * (userIds.length - 2)); 
      const userId = userIds[randomUserIndex];
      
      
      const randomEventIndex = Math.floor(Math.random() * eventIds.length);
      const eventId = eventIds[randomEventIndex];
      
      
      const randomCommentIndex = Math.floor(Math.random() * comments.length);
      const commentText = comments[randomCommentIndex];
      
      
      const insertQuery = `
        INSERT INTO comments 
        (user_id, event_id, text, created_at) 
        VALUES (?, ?, ?, DATE_SUB(NOW(), INTERVAL ? HOUR))
      `;
      
      
      const randomHours = Math.floor(Math.random() * 168); 
      
      await queryPromise(
        insertQuery,
        [userId, eventId, commentText, randomHours]
      );
      
      commentCount++;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }
  
  console.log(`Created ${commentCount} comments`);
}


async function createRegistrations(userIds, eventIds) {
  let registrationCount = 0;
  
  
  for (let i = 0; i < userIds.length - 2; i++) {
    const userId = userIds[i];
    
    
    const numberOfEvents = Math.floor(Math.random() * 2) + 2;
    
    
    const shuffledEvents = [...eventIds].sort(() => 0.5 - Math.random());
    
    for (let j = 0; j < numberOfEvents && j < shuffledEvents.length; j++) {
      try {
        const eventId = shuffledEvents[j];
        
        
        const [existingRegistrations] = await queryPromise(
          'SELECT id FROM registration WHERE user_id = ? AND event_id = ?',
          [userId, eventId]
        );
        
        if (existingRegistrations.length > 0) {
          console.log(`Registration for user ${userId} and event ${eventId} already exists. Skipping.`);
          continue;
        }
        
        
        const insertQuery = `
          INSERT INTO registration 
          (user_id, event_id) 
          VALUES (?, ?)
        `;
        
        await queryPromise(
          insertQuery,
          [userId, eventId]
        );
        
        registrationCount++;
      } catch (error) {
        console.error(`Error creating registration for user ${userId}:`, error);
        throw error;
      }
    }
  }
  
  console.log(`Created ${registrationCount} registrations`);
}


async function createFavorites(userIds, eventIds) {
  let favoriteCount = 0;
  
  
  for (let i = 0; i < userIds.length - 2; i++) {
    const userId = userIds[i];
    
    
    const numberOfEvents = Math.floor(Math.random() * 2) + 1;
    
    
    const shuffledEvents = [...eventIds].sort(() => 0.5 - Math.random());
    
    for (let j = 0; j < numberOfEvents && j < shuffledEvents.length; j++) {
      try {
        const eventId = shuffledEvents[j];
        
        
        const [existingFavorites] = await queryPromise(
          'SELECT id FROM favorites WHERE user_id = ? AND event_id = ?',
          [userId, eventId]
        );
        
        if (existingFavorites.length > 0) {
          console.log(`Favorite for user ${userId} and event ${eventId} already exists. Skipping.`);
          continue;
        }
        
        
        const insertQuery = `
          INSERT INTO favorites 
          (user_id, event_id) 
          VALUES (?, ?)
        `;
        
        await queryPromise(
          insertQuery,
          [userId, eventId]
        );
        
        favoriteCount++;
      } catch (error) {
        console.error(`Error creating favorite for user ${userId}:`, error);
        throw error;
      }
    }
  }
  
  console.log(`Created ${favoriteCount} favorites`);
}


function queryPromise(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve([results, fields]);
    });
  });
}



if (require.main === module) {
  createFixtures();
}

module.exports = { createFixtures }; 