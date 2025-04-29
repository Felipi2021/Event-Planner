const bcrypt = require('bcryptjs');
const db = require('../../models/db');

// Mock dla modułu bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword123')
}));

// Mock dla modułu db
jest.mock('../../models/db', () => ({
  query: jest.fn()
}));

describe('Migration Files', () => {
  const bcrypt = require('bcryptjs');
  const db = require('../../models/db');
  
  // Oryginalne implementacje konsoli
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock konsoli dla każdego testu
    console.log = jest.fn();
    console.error = jest.fn();
  });
  
  afterEach(() => {
    // Przywrócenie oryginalnej konsoli po każdym teście
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('create_admin_user.js', () => {
    test('should check if admin exists and create if not found', async () => {
      // Admin nie istnieje
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });
      
      // Utworzenie admina
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, { insertId: 1 });
      });

      const { createAdminUser } = require('../../models/migrations/create_admin_user');
      await createAdminUser();

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith('Admin123!', 10);
      expect(console.log).toHaveBeenCalledWith('Admin user created successfully!');
    });

    test('should exit if admin already exists', async () => {
      // Admin już istnieje
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ id: 1 }]);
      });

      const { createAdminUser } = require('../../models/migrations/create_admin_user');
      await createAdminUser();

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('Admin user already exists');
    });

    test('should handle error when checking for admin', async () => {
      // Błąd podczas sprawdzania
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const { createAdminUser } = require('../../models/migrations/create_admin_user');
      await createAdminUser();

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error checking if admin exists:', expect.any(Error));
    });

    test('should handle error when creating admin', async () => {
      // Admin nie istnieje
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });
      
      // Błąd podczas tworzenia
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Insert error'), null);
      });

      const { createAdminUser } = require('../../models/migrations/create_admin_user');
      await createAdminUser();

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith('Error creating admin user:', expect.any(Error));
    });
  });

  describe('create_fixtures.js', () => {
    test('should create test fixtures', async () => {
      // Mockujemy wszystkie wywołania db.query
      db.query.mockImplementation((query, params, callback) => {
        if (callback) callback(null, { insertId: 1, affectedRows: 1 });
        return {
          on: (event, handler) => {
            if (event === 'end') handler();
            return { on: jest.fn() };
          }
        };
      });

      const { createFixtures } = require('../../models/migrations/create_fixtures');
      await createFixtures();

      expect(db.query).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('All fixtures created successfully!');
    });
  });
}); 