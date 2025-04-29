import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Events from '../Events';

jest.mock('axios');

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

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

console.error = jest.fn();

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
    {
      id: 3,
      title: 'Test Event 3',
      description: 'Test description 3',
      date: '2024-05-10',
      location: 'Test Location 3',
      capacity: 50,
      attendees_count: 25,
      created_by_username: 'testuser',
      image: 'test-image-3.jpg',
    },
  ];

  const mockAttendance = {
    '1': true,
    '2': false,
    '3': false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    localStorageMock.getItem.mockImplementation((key) => {
      const storage = {
        'token': 'test-token',
        'userId': '1'
      };
      return storage[key];
    });

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

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
      expect(screen.getByText('Test Event 3')).toBeInTheDocument();
    });

    expect(screen.getByText('Location: Test Location 1')).toBeInTheDocument();
    expect(screen.getByText('Location: Test Location 2')).toBeInTheDocument();
    expect(screen.getByText('Location: Test Location 3')).toBeInTheDocument();
    
    const buttons = screen.getAllByText(/Remove Attendance|Attend/);
    expect(buttons.length).toBe(6);
    expect(screen.getByText('Remove Attendance')).toBeInTheDocument();
    expect(screen.getAllByText('Attend').length).toBe(2); 
  });

  it('handles attend functionality correctly', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Attendance added' } });

    render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });

    const attendButtons = screen.getAllByText('Attend');
    fireEvent.click(attendButtons[0]); 

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

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    const removeButton = screen.getByText('Remove Attendance');
    fireEvent.click(removeButton);

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

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    const sortOrderSelect = container.querySelector('.sort-controls select:nth-child(4)'); 
    fireEvent.change(sortOrderSelect, { target: { value: 'desc' } });

    const eventElements = screen.getAllByTestId(/^event-card-/);
    expect(eventElements[0]).toHaveTextContent('Test Event 3');
    expect(eventElements[1]).toHaveTextContent('Test Event 2');
    expect(eventElements[2]).toHaveTextContent('Test Event 1');
  });

  it('handles sorting by date', async () => {
    const { container } = render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    const sortCriteriaSelect = container.querySelector('.sort-controls select:nth-child(2)'); 
    fireEvent.change(sortCriteriaSelect, { target: { value: 'date' } });

    const eventElements = screen.getAllByTestId(/^event-card-/);
    expect(eventElements[0]).toHaveTextContent('Test Event 3'); 
    expect(eventElements[1]).toHaveTextContent('Test Event 1'); 
    expect(eventElements[2]).toHaveTextContent('Test Event 2'); 

    const sortOrderSelect = container.querySelector('.sort-controls select:nth-child(4)'); 
    fireEvent.change(sortOrderSelect, { target: { value: 'desc' } });

    const reorderedElements = screen.getAllByTestId(/^event-card-/);
    expect(reorderedElements[0]).toHaveTextContent('Test Event 2'); 
    expect(reorderedElements[1]).toHaveTextContent('Test Event 1'); 
    expect(reorderedElements[2]).toHaveTextContent('Test Event 3'); 
  });

  it('handles sorting by capacity', async () => {
    const { container } = render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    const sortCriteriaSelect = container.querySelector('.sort-controls select:nth-child(2)'); 
    fireEvent.change(sortCriteriaSelect, { target: { value: 'capacity' } });

    const eventElements = screen.getAllByTestId(/^event-card-/);
    expect(eventElements[0]).toHaveTextContent('Test Event 3'); 
    expect(eventElements[1]).toHaveTextContent('Test Event 1'); 
    expect(eventElements[2]).toHaveTextContent('Test Event 2'); 

    const sortOrderSelect = container.querySelector('.sort-controls select:nth-child(4)');
    fireEvent.change(sortOrderSelect, { target: { value: 'desc' } });

    const reorderedElements = screen.getAllByTestId(/^event-card-/);
    expect(reorderedElements[0]).toHaveTextContent('Test Event 2');
    expect(reorderedElements[1]).toHaveTextContent('Test Event 1'); 
    expect(reorderedElements[2]).toHaveTextContent('Test Event 3'); 
  });

  it('handles search functionality', async () => {
    const { container } = render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });

    const searchInput = container.querySelector('.search-controls input');
    fireEvent.change(searchInput, { target: { value: 'Event 1' } });

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Event 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Event 3')).not.toBeInTheDocument();
  });

  it('shows error when no token is available', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      return key === 'token' ? null : 'some-value';
    });

    render(<Events />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You need to log in.');
    });
  });

  it('shows error when attend is called without being logged in', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      const storage = {
        'token': 'test-token',
        'userId': '1'
      };
      return storage[key];
    });

    render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });

    localStorageMock.getItem.mockImplementation(() => null);

    const attendButton = screen.getAllByText('Attend')[0];
    fireEvent.click(attendButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You need to log in to mark attendance.');
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  it('shows error when remove attendance is called without being logged in', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      const storage = {
        'token': 'test-token',
        'userId': '1'
      };
      return storage[key];
    });

    render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    localStorageMock.getItem.mockImplementation(() => null);

    const removeButton = screen.getByText('Remove Attendance');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You need to log in to remove attendance.');
      expect(axios.delete).not.toHaveBeenCalled();
    });
  });

  it('handles error when fetching events fails', async () => {
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/events') {
        return Promise.reject(new Error('Failed to fetch events'));
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<Events />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching events:', expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch events.');
    });
  });

  it('handles error when attending an event fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to attend'));

    render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });

    const attendButton = screen.getAllByText('Attend')[0];
    fireEvent.click(attendButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error marking attendance:', expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith('Failed to mark attendance.');
    });
  });

  it('handles error when removing attendance fails', async () => {
    axios.delete.mockRejectedValueOnce(new Error('Failed to remove attendance'));

    render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    const removeButton = screen.getByText('Remove Attendance');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error removing attendance:', expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith('Failed to remove attendance.');
    });
  });
}); 