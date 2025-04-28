import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Events from '../Events';

// Mock axios
jest.mock('axios');

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock the EventCard component used inside Events
jest.mock('../../components/EventCard', () => {
  return ({ event, isAttending, onAttend, onRemoveAttend }) => (
    <div data-testid={`event-card-${event.id}`}>
      <h3>{event.title}</h3>
      <p>Location: {event.location}</p>
      <p>Capacity: {event.capacity}</p>
      <p>Attendees: {event.attendees_count}</p>
      <button 
        onClick={() => isAttending ? onRemoveAttend(event.id) : onAttend(event.id)}
      >
        {isAttending ? 'Remove Attendance' : 'Attend'}
      </button>
    </div>
  );
});

// Suppress console.error
console.error = jest.fn();

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Events', () => {
  const mockEvents = [
    {
      id: 1,
      title: 'Test Event 1',
      description: 'Test description 1',
      date: '2024-06-15',
      location: 'Test Location 1',
      capacity: 100,
      attendees_count: 50,
      created_by_username: 'testuser',
      image: 'test-image-1.jpg',
    },
    {
      id: 2,
      title: 'Test Event 2',
      description: 'Test description 2',
      date: '2024-07-20',
      location: 'Test Location 2',
      capacity: 200,
      attendees_count: 75,
      created_by_username: 'testuser',
      image: 'test-image-2.jpg',
    },
  ];

  const mockAttendance = {
    '1': true,
    '2': false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up localStorage mock
    localStorageMock.getItem.mockImplementation((key) => {
      const storage = {
        'token': 'test-token',
        'userId': '1'
      };
      return storage[key];
    });

    // Set up axios mocks
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/events') {
        return Promise.resolve({ data: mockEvents });
      }
      if (url.includes('/attendance')) {
        return Promise.resolve({ data: mockAttendance });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders events list correctly', async () => {
    render(<Events />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });

    // Check for event details
    expect(screen.getByText('Location: Test Location 1')).toBeInTheDocument();
    expect(screen.getByText('Location: Test Location 2')).toBeInTheDocument();
    
    // Check attendance buttons
    expect(screen.getByText('Remove Attendance')).toBeInTheDocument(); // For event 1 (isAttending true)
    expect(screen.getByText('Attend')).toBeInTheDocument(); // For event 2 (isAttending false)
  });

  it('handles attend functionality correctly', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Attendance added' } });

    render(<Events />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });

    // Find and click the attend button for event 2
    const attendButton = screen.getByText('Attend');
    fireEvent.click(attendButton);

    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/events/2/attend',
        { userId: '1' },
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('You are now attending this event.');
    });
  });

  it('handles remove attendance functionality correctly', async () => {
    axios.delete.mockResolvedValueOnce({});

    render(<Events />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    // Find and click the remove attendance button for event 1
    const removeButton = screen.getByText('Remove Attendance');
    fireEvent.click(removeButton);

    // Verify API call
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5001/api/events/1/attend',
        {
          headers: { Authorization: 'Bearer test-token' },
          data: { userId: '1' },
        }
      );
      expect(toast.info).toHaveBeenCalledWith('You are no longer attending this event.');
    });
  });

  it('handles sorting by name', async () => {
    const { container } = render(<Events />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    // Change sort to name descending
    const sortOrderSelect = container.querySelector('.sort-controls select:nth-child(4)'); // The second select (Order)
    fireEvent.change(sortOrderSelect, { target: { value: 'desc' } });

    // Events should be re-ordered
    const eventElements = screen.getAllByTestId(/^event-card-/);
    expect(eventElements[0]).toHaveTextContent('Test Event 2');
    expect(eventElements[1]).toHaveTextContent('Test Event 1');
  });

  it('handles search functionality', async () => {
    const { container } = render(<Events />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });

    // Search for event 1
    const searchInput = container.querySelector('.search-controls input');
    fireEvent.change(searchInput, { target: { value: 'Event 1' } });

    // Only event 1 should be visible
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Event 2')).not.toBeInTheDocument();
  });

  it('shows error when no token is available', async () => {
    // Mock no token in localStorage
    localStorageMock.getItem.mockImplementation((key) => {
      return key === 'token' ? null : 'some-value';
    });

    render(<Events />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You need to log in.');
    });
  });
}); 