const { getAllEvents, getEventById, markAttendance, createEvent, registerForEvent, removeAttendance, markFavorite } = require('../../controllers/eventController');
const db = require('../../models/db');


jest.mock('../../models/db', () => ({
  query: jest.fn(),
  escape: jest.fn(val => `'${val}'`)
}));


console.error = jest.fn();
console.log = jest.fn();

describe('Event Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEvents', () => {
    it('should return all events without filtering', () => {
      
      const req = {
        query: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const mockEvents = [
        { id: 1, title: 'Event 1', created_by_username: 'User1' },
        { id: 2, title: 'Event 2', created_by_username: 'User2' }
      ];

      
      db.query.mockImplementation((query, callback) => {
        callback(null, mockEvents);
      });

      
      getAllEvents(req, res);

      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT events.*, users.username AS created_by_username'),
        expect.any(Function)
      );
      expect(db.query.mock.calls[0][0]).not.toContain('WHERE');

      
      expect(res.send).toHaveBeenCalledWith(mockEvents);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should filter events by created_by', () => {
      
      const req = {
        query: { created_by: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const mockFilteredEvents = [
        { id: 1, title: 'Event 1', created_by: 123, created_by_username: 'User1' }
      ];

      
      db.escape.mockReturnValue("'123'");
      db.query.mockImplementation((query, callback) => {
        callback(null, mockFilteredEvents);
      });

      
      getAllEvents(req, res);

      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE events.created_by = '123'"),
        expect.any(Function)
      );
      expect(db.escape).toHaveBeenCalledWith('123');

      
      expect(res.send).toHaveBeenCalledWith(mockFilteredEvents);
    });

    it('should handle database errors', () => {
      
      const req = {
        query: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const dbError = new Error('Database error');
      db.query.mockImplementation((query, callback) => {
        callback(dbError, null);
      });

      
      console.error = jest.fn();

      
      getAllEvents(req, res);

      
      expect(console.error).toHaveBeenCalledWith('Error fetching events:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Database error',
        error: dbError
      });
    });
  });

  describe('getEventById', () => {
    it('should return an event by ID', () => {
      
      const req = {
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const mockEvent = {
        id: 123,
        title: 'Test Event',
        description: 'A test event',
        created_by_username: 'User1'
      };

      
      db.query.mockImplementation((query, params, callback) => {
        callback(null, [mockEvent]);
      });

      
      getEventById(req, res);

      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE events.id = ?'),
        ['123'],
        expect.any(Function)
      );

      
      expect(res.send).toHaveBeenCalledWith(mockEvent);
    });

    it('should return 404 if event not found', () => {
      
      const req = {
        params: { id: '999' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      db.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      
      getEventById(req, res);

      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Event not found' });
    });

    it('should handle database errors', () => {
      
      const req = {
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const dbError = new Error('Database error');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      
      console.error = jest.fn();

      
      getEventById(req, res);

      
      expect(console.error).toHaveBeenCalledWith('Error fetching event details:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Database error',
        error: dbError
      });
    });
  });

  describe('markAttendance', () => {
    it('should mark a user as attending an event', () => {
      
      const req = {
        body: { userId: '123' },
        params: { id: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const mockEventData = [{
        capacity: 100,
        attendees_count: 50
      }];

      
      const mockAttendanceCheck = [];

      
      db.query
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, mockEventData);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, mockAttendanceCheck);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, { affectedRows: 1 });
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, { affectedRows: 1 });
        });

      
      console.log = jest.fn();

      
      markAttendance(req, res);

      
      expect(db.query).toHaveBeenCalledTimes(4);
      
      
      expect(db.query.mock.calls[0][0]).toContain('SELECT capacity, attendees_count FROM events');
      expect(db.query.mock.calls[0][1]).toEqual(['456']);
      
      
      expect(db.query.mock.calls[1][0]).toContain('SELECT * FROM registration');
      expect(db.query.mock.calls[1][1]).toEqual(['123', '456']);
      
      
      expect(db.query.mock.calls[2][0]).toContain('INSERT INTO registration');
      expect(db.query.mock.calls[2][1]).toEqual(['123', '456']);
      
      
      expect(db.query.mock.calls[3][0]).toContain('UPDATE events SET attendees_count');
      expect(db.query.mock.calls[3][1]).toEqual(['456']);

      
      expect(res.send).toHaveBeenCalledWith({ 
        message: 'You have been marked as attending this event!' 
      });
    });

    it('should return 400 if event is at capacity', () => {
      
      const req = {
        body: { userId: '123' },
        params: { id: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const mockEventData = [{
        capacity: 100,
        attendees_count: 100
      }];

      
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, mockEventData);
      });

      
      markAttendance(req, res);

      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ 
        message: 'Event has reached its capacity.' 
      });
      
      
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if user is already attending', () => {
      
      const req = {
        body: { userId: '123' },
        params: { id: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const mockEventData = [{
        capacity: 100,
        attendees_count: 50
      }];

      
      const mockAttendanceCheck = [{ id: 789, user_id: '123', event_id: '456' }];

      
      db.query
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, mockEventData);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, mockAttendanceCheck);
        });

      
      markAttendance(req, res);

      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ 
        message: 'User already marked as attending this event.' 
      });
      
      
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('should return 404 if event not found', () => {
      
      const req = {
        body: { userId: '123' },
        params: { id: '999' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });

      
      markAttendance(req, res);

      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Event not found.' });
      
      
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if userId or eventId is missing', () => {
      
      const req = {
        body: {},
        params: { id: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      markAttendance(req, res);

      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ 
        message: 'User ID and Event ID are required.' 
      });
      
      
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  describe('createEvent', () => {
    it('should create an event successfully', () => {
      
      const req = {
        body: {
          title: 'New Test Event',
          description: 'A test event description',
          date: '2023-05-01',
          location: 'Test Location',
          capacity: 100
        },
        file: { filename: 'test-image.jpg' },
        user: { id: 456 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      db.query.mockImplementation((query, params, callback) => {
        callback(null, { insertId: 789 });
      });

      
      createEvent(req, res);

      
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO events (title, description, date, location, capacity, created_by, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['New Test Event', 'A test event description', '2023-05-01', 'Test Location', 100, 456, 'test-image.jpg'],
        expect.any(Function)
      );

      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ message: 'Event created successfully!' });
    });

    it('should handle missing required fields', () => {
      
      const req = {
        body: {
          title: 'New Test Event',
          
          capacity: 100
        },
        user: { id: 456 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      createEvent(req, res);

      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'All fields are required.' });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should handle database errors when creating an event', () => {
      
      const req = {
        body: {
          title: 'New Test Event',
          description: 'A test event description',
          date: '2023-05-01',
          location: 'Test Location',
          capacity: 100
        },
        file: null, 
        user: { id: 456 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const dbError = new Error('Database insert error');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      
      createEvent(req, res);

      
      expect(console.error).toHaveBeenCalledWith('Error inserting event into database:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Failed to create event.',
        error: dbError
      });
    });

    it('should handle unexpected errors', () => {
      
      const req = {
        body: {
          title: 'New Test Event',
          description: 'A test event description',
          date: '2023-05-01',
          location: 'Test Location',
          capacity: 100
        },
        
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      createEvent(req, res);

      
      expect(console.error).toHaveBeenCalledWith(
        'Unexpected error in createEvent:',
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: expect.any(Error)
      });
    });
  });

  describe('registerForEvent', () => {
    it('should register a user for an event successfully', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      db.query
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, []);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, { affectedRows: 1 });
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, { affectedRows: 1 });
        });

      
      registerForEvent(req, res);

      
      expect(db.query).toHaveBeenNthCalledWith(
        1,
        'SELECT * FROM registration WHERE user_id = ? AND event_id = ?',
        ['789', '123'],
        expect.any(Function)
      );
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        'INSERT INTO registration (user_id, event_id) VALUES (?, ?)',
        ['789', '123'],
        expect.any(Function)
      );
      expect(db.query).toHaveBeenNthCalledWith(
        3,
        'UPDATE events SET attendees_count = attendees_count + 1 WHERE id = ?',
        ['123'],
        expect.any(Function)
      );

      
      expect(res.send).toHaveBeenCalledWith({ message: 'Successfully registered for the event!' });
    });

    it('should return 400 if userId or eventId is missing', () => {
      
      const req = {
        body: {},
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      registerForEvent(req, res);

      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'User ID and Event ID are required.' });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should return 400 if user is already registered', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const existingRegistration = [{ id: 1, user_id: '789', event_id: '123' }];
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, existingRegistration);
      });

      
      registerForEvent(req, res);

      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'User is already registered for this event.' });
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors when checking registration', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const dbError = new Error('Database error');
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(dbError, null);
      });

      
      registerForEvent(req, res);

      
      expect(console.error).toHaveBeenCalledWith('Database error:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Database error', error: dbError });
    });

    it('should handle database errors when inserting registration', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const dbError = new Error('Insert error');
      db.query
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, []);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(dbError, null);
        });

      
      registerForEvent(req, res);

      
      expect(console.error).toHaveBeenCalledWith('Error inserting registration:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Error registering for event.', error: dbError });
    });

    it('should handle database errors when updating attendees count', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const dbError = new Error('Update error');
      db.query
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, []);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, { affectedRows: 1 });
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(dbError, null);
        });

      
      registerForEvent(req, res);

      
      expect(console.error).toHaveBeenCalledWith('Error updating attendees count:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Error updating attendees count.', error: dbError });
    });
  });

  describe('removeAttendance', () => {
    it('should remove attendance successfully', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const mockEvent = [{ attendees_count: 5 }];

      
      db.query
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, mockEvent);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, { affectedRows: 1 });
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, { affectedRows: 1 });
        });

      
      removeAttendance(req, res);

      
      expect(db.query).toHaveBeenNthCalledWith(
        1,
        'SELECT attendees_count FROM events WHERE id = ?',
        ['123'],
        expect.any(Function)
      );
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        'DELETE FROM registration WHERE user_id = ? AND event_id = ?',
        ['789', '123'],
        expect.any(Function)
      );
      expect(db.query).toHaveBeenNthCalledWith(
        3,
        'UPDATE events SET attendees_count = attendees_count - 1 WHERE id = ?',
        ['123'],
        expect.any(Function)
      );

      
      expect(res.send).toHaveBeenCalledWith({ message: 'You are no longer attending this event.' });
    });

    it('should return 400 if userId or eventId is missing', () => {
      
      const req = {
        body: {},
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      removeAttendance(req, res);

      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'User ID and Event ID are required.' });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should return 404 if event not found', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });

      
      removeAttendance(req, res);

      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Event not found.' });
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if no attendees to remove', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const mockEvent = [{ attendees_count: 0 }];
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, mockEvent);
      });

      
      removeAttendance(req, res);

      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'Cannot remove attendance. No attendees to remove.' });
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if no attendance record found', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const mockEvent = [{ attendees_count: 5 }];
      db.query
        .mockImplementationOnce((query, params, callback) => {
          callback(null, mockEvent);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, { affectedRows: 0 });
        });

      
      removeAttendance(req, res);

      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'No attendance record found.' });
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors when checking event', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const dbError = new Error('Database error');
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(dbError, null);
      });

      
      removeAttendance(req, res);

      
      expect(console.error).toHaveBeenCalledWith('Error fetching event:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Database error', error: dbError });
    });
  });

  describe('markFavorite', () => {
    it('should mark an event as favorite', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      db.query
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, []);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, { affectedRows: 1 });
        });

      
      markFavorite(req, res);

      
      expect(db.query).toHaveBeenNthCalledWith(
        1,
        'SELECT * FROM favorites WHERE user_id = ? AND event_id = ?',
        ['789', '123'],
        expect.any(Function)
      );
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        'INSERT INTO favorites (user_id, event_id) VALUES (?, ?)',
        ['789', '123'],
        expect.any(Function)
      );

      
      expect(res.send).toHaveBeenCalledWith({ message: 'Event marked as favorite!' });
    });

    it('should remove an event from favorites if already a favorite', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const existingFavorite = [{ id: 1, user_id: '789', event_id: '123' }];
      db.query
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, existingFavorite);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, { affectedRows: 1 });
        });

      
      markFavorite(req, res);

      
      expect(db.query).toHaveBeenNthCalledWith(
        1,
        'SELECT * FROM favorites WHERE user_id = ? AND event_id = ?',
        ['789', '123'],
        expect.any(Function)
      );
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        'DELETE FROM favorites WHERE user_id = ? AND event_id = ?',
        ['789', '123'],
        expect.any(Function)
      );

      
      expect(res.send).toHaveBeenCalledWith({ message: 'Event unmarked as favorite!' });
    });

    it('should return 400 if userId or eventId is missing', () => {
      
      const req = {
        body: {},
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      markFavorite(req, res);

      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'User ID and Event ID are required.' });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should handle database errors when checking favorites', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const dbError = new Error('Database error');
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(dbError, null);
      });

      
      markFavorite(req, res);

      
      expect(console.error).toHaveBeenCalledWith('Error checking favorite:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Database error', error: dbError });
    });

    it('should handle database errors when marking as favorite', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const dbError = new Error('Insert error');
      db.query
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, []);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(dbError, null);
        });

      
      markFavorite(req, res);

      
      expect(console.error).toHaveBeenCalledWith('Error marking favorite:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Database error', error: dbError });
    });

    it('should handle database errors when removing from favorites', () => {
      
      const req = {
        body: { userId: '789' },
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      
      const existingFavorite = [{ id: 1, user_id: '789', event_id: '123' }];
      
      
      const dbError = new Error('Delete error');
      db.query
        .mockImplementationOnce((query, params, callback) => {
          
          callback(null, existingFavorite);
        })
        .mockImplementationOnce((query, params, callback) => {
          
          callback(dbError, null);
        });

      
      markFavorite(req, res);

      
      expect(console.error).toHaveBeenCalledWith('Error removing favorite:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Database error', error: dbError });
    });
  });
}); 