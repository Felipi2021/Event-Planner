# Admin Functionality Setup

This document describes how to set up and use the admin functionality for Event Planner.

## Database Changes

You need to add the admin to the users table:

## Creating the Admin User

1. Run the admin creation script:
```bash
cd backend
node models/migrations/create_admin_user.js
```

This will create an admin user with the following credentials:
- Email: admin@event-planner.com
- Password: Admin123!

## Creating Test Data (Optional)

If you want to populate your database with sample data for testing, you can run the fixtures script:

```bash
cd backend
node models/migrations/create_fixtures.js
```

This script will create:
- 5 sample users (3 regular users, 2 banned users)
- 5 events with different dates and locations
- ~20 comments on various events
- Event registrations for regular users
- Favorite events for regular users

Once created, you can log in with these sample accounts:
- Regular users: 
  - alice@example.com / Test123!
  - bob@example.com / Test123!
  - carol@example.com / Test123!
- Banned users:
  - dave@example.com / Test123!
  - evan@example.com / Test123!

The banned users will allow you to test the ban functionality and see how the banned user experience works.

## Admin Features

Once logged in as an admin, you will have access to:

1. Admin Panel (accessible from the navbar)
2. User Management:
   - View all users
   - Ban users (with custom ban reason)
   - Unban users

## Banned User Experience

When a banned user attempts to log in:
1. They will see a message indicating they are banned
2. The message will include the reason provided by the admin
3. They will not be able to access any part of the application

## Security Notes

- The admin panel is protected at both frontend and backend
- Only users with the `is_admin` flag set to true can access admin features
- Token verification ensures only admins can perform admin actions

## Manual Admin Creation (if needed)

If you need to create an admin user manually, you can use the admin creation endpoint:

```
POST /api/users/admin/create
```

Body:
```json
{
  "username": "Admin",
  "email": "admin@example.com",
  "password": "StrongPassword123!",
  "adminSecret": "your-admin-secret-key"
}
```

The `adminSecret` value should match the `ADMIN_SECRET_KEY` in your environment variables. 