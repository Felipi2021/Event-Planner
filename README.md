#Event Planner Application
Overview
Event Planner is a web-based application designed to streamline event organization and participation. It allows users to create, manage, and attend events while fostering a community-driven experience through user profile evaluations. The platform includes additional features for user interactions, reputation scoring, and administrative oversight to ensure smooth operations.

Features
1. Event Management
Create Events: Users can create events with details such as name, description, location, date, and capacity.
Browse Events: All users can view a list of available events.
Register for Events: Users can register for events they are interested in attending.
Mark Attendance: Registered users can mark their attendance at events.
2. User Profiles
View Profiles: Each user has a profile showcasing their information and the events they have created or attended.
Rate and Review Profiles:
Star Ratings: Users can rate other users' profiles using a 5-star system.
Comments: Users can leave feedback and reviews on profiles.
Reputation Points: Profiles gain reputation points based on ratings and feedback, which influence the visibility of their events. Higher reputation profiles have their events featured at the top of the event board.
3. Administrative Controls
Admin Profile: A dedicated admin account with elevated privileges.
Manage Users:
Remove users from specific events.
Delete user accounts if necessary.
Manage Events:
Delete inappropriate or irrelevant events from the platform.
Technology Stack
The application is built using modern web technologies:

Frontend:

React.js: For building the user interface.
Axios: For making API requests.
Tailwind CSS / CSS Modules: For styling the application.
Backend:

Node.js with Express.js: For handling API requests and business logic.
MySQL: For database management.
JWT (JSON Web Tokens): For authentication and user session management.
Tools:

Postman: For API testing.
phpMyAdmin: For database administration.
jwt-decode: For decoding JWT tokens on the client side.
Installation and Setup
Prerequisites
Node.js and npm installed.
MySQL database setup with the required schema.
phpMyAdmin (optional) for managing the database.
Steps
Clone the repository:
bash
Copy code
git clone https://github.com/your-repo/event-planner.git
Navigate to the project directory:
bash
Copy code
cd event-planner
Install dependencies:
bash
Copy code
npm install
Set up the environment variables:
Create a .env file in the root directory.
Add the following variables:
makefile
Copy code
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=event_planner
JWT_SECRET=your_secret_key
PORT=5000
Start the backend server:
bash
Copy code
npm run server
Start the frontend:
bash
Copy code
npm run start
Database Schema
Users Table
id (Primary Key)
username
email
password (hashed)
reputation (integer, default 0)
Events Table
id (Primary Key)
name
description
location
date
capacity
creator_id (Foreign Key to Users Table)
Attendance Table
id (Primary Key)
user_id (Foreign Key to Users Table)
event_id (Foreign Key to Events Table)
Ratings Table
id (Primary Key)
rated_user_id (Foreign Key to Users Table)
rating_user_id (Foreign Key to Users Table)
rating (integer, 1-5)
comment (text)
Usage
Create an Account:

Register as a user to create or join events.
Admin accounts are created by the backend for security purposes.
Create or Join Events:

Users can create events or register for events listed on the homepage.
Interact with User Profiles:

View other users' profiles and leave ratings or comments.
High-rated users' events will appear at the top of the event board.
Administrative Actions:

Admins can remove users from events or delete entire events.
Admins can monitor and manage inappropriate activity.
Future Enhancements
Add notifications for event updates.
Implement real-time chat for event participants.
Introduce a search and filter feature for events.