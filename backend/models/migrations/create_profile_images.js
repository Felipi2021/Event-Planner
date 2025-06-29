const fs = require('fs');
const path = require('path');


const uploadsDir = path.join(__dirname, '../../uploads');
const usersDir = path.join(uploadsDir, 'users');
const eventsDir = path.join(uploadsDir, 'events');


ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(usersDir);
ensureDirectoryExists(eventsDir);


createDefaultImage('default-avatar.png', usersDir);
createDefaultImage('default-event.jpg', eventsDir);

console.log('Default profile images created successfully!');


function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}


function createDefaultImage(fileName, directory) {
  const filePath = path.join(directory, fileName);
  
  
  if (!fs.existsSync(filePath)) {
    
    
    let imageData;
    if (fileName.endsWith('.png')) {
      
      imageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wIBBzYVEX67KwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAPElEQVR42u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICXAQ+6AAH9w4Z4AAAAAElFTkSuQmCC', 'base64');
    } else {
      
      imageData = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCABkAGQDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAMEAgj/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH9UAAAAACaiaiaiaiaiagiCIIgiAAAGzmbOZs5mzmbAAAAAAAAAAAIgiZkCvCrJlaFWSK0AAAAAA+D0nyHJ6sNHpA0ekAAAAAJojRpZDTozNOgAAAAAAAAAAAP/8QAHxAAAgIBBAMAAAAAAAAAAAAAAAEQAhESMUBgUFGA/9oACAEBAAEFAuPGKxnGcZxnHiA4EKM4t0ozGMXGNK5XK5XK6V4WrN5nJZZZZZBgwYEUYYYYUUUUUKKMHRRRQopVzRRRQoowowoYYYYOj', 'base64');
    }
    
    fs.writeFileSync(filePath, imageData);
    console.log(`Created default image: ${filePath}`);
  } else {
    console.log(`Default image already exists: ${filePath}`);
  }
} 