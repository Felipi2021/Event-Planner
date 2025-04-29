const { createEvent, getEvents } = require('../../models/eventmodel');
const db = require('../../models/db');

jest.mock('../../models/db', () => ({
  query: jest.fn()
}));

describe('Event Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should call db.query with correct parameters when creating an event', () => {

      const title = 'Test Event';
      const description = 'This is a test event';
      const date = '2023-01-01';
      const location = 'Test Location';
      const capacity = 100;
      const image = 'test-image.jpg';
      const mockCallback = jest.fn();


      createEvent(title, description, date, location, capacity, image, mockCallback);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO events (title, description, date, location, capacity, image) VALUES (?, ?, ?, ?, ?, ?)',
        ['Test Event', 'This is a test event', '2023-01-01', 'Test Location', 100, 'test-image.jpg'],
        mockCallback
      );
    });
  });

  describe('getEvents', () => {
    it('should call db.query with correct parameters when getting events', () => {
      const mockCallback = jest.fn();

      getEvents(mockCallback);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM events',
        mockCallback
      );
    });
  });
}); 