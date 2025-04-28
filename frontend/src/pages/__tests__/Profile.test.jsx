import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../Profile';
import axios from 'axios';
import { toast } from 'react-toastify';

// Mock required modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ userId: '123' }),
  useNavigate: () => jest.fn()
}));

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock react-rating-stars-component
jest.mock('react-rating-stars-component', () => {
  return function MockReactStars(props) {
    return (
      <div data-testid="rating-stars" onClick={() => props.onChange && props.onChange(5)}>
        Rating: {props.value}
      </div>
    );
  };
});

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {
    'token': 'fake-token',
    'userId': '123',
    'profileImage': 'default-avatar.png'
  };
  
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('Profile Component', () => {
  const mockUserInfo = {
    id: 123,
    username: 'testuser',
    email: 'test@example.com',
    image: 'profile.jpg',
    description: 'This is a test user description',
    created_at: '2023-01-01T10:00:00Z'
  };

  const mockCreatedEvents = [
    {
      id: 1,
      title: 'Event 1',
      description: 'This is a description for event 1 that is long enough to test the toggle description functionality of the component.',
      date: '2023-12-31',
      location: 'Test Location 1',
      image: 'event1.jpg',
      created_by: '123'
    },
    {
      id: 2,
      title: 'Event 2',
      description: 'This is a description for event 2 that is also quite long to ensure we can properly test the toggling behavior.',
      date: '2024-01-15',
      location: 'Test Location 2',
      image: 'event2.jpg',
      created_by: '123'
    }
  ];

  const mockFavoriteEvents = [
    {
      id: 3,
      title: 'Favorite Event 1',
      description: 'This is a description for a favorite event.',
      date: '2023-11-20',
      location: 'Test Location 3',
      image: 'event3.jpg',
      created_by: '456'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default API responses
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/users/123') {
        return Promise.resolve({ data: mockUserInfo });
      } 
      else if (url === 'http://localhost:5001/api/users/123/average-rating') {
        return Promise.resolve({ data: { averageRating: 4.5 } });
      }
      else if (url.includes('api/events?created_by=123')) {
        return Promise.resolve({ data: mockCreatedEvents });
      }
      else if (url.includes('api/users/123/favorites')) {
        return Promise.resolve({ data: mockFavoriteEvents });
      }
      else if (url.includes('api/users/123/comments/count')) {
        return Promise.resolve({ data: { count: 15 } });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    axios.put.mockResolvedValue({ data: { message: 'Description updated successfully' } });
    axios.post.mockResolvedValue({ data: { message: 'Rating submitted successfully' } });
  });

  test('renders user profile information correctly', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
    expect(screen.getByText('This is a test user description')).toBeInTheDocument();
    expect(screen.getByText(/Average Rating:/)).toBeInTheDocument();
    expect(screen.getByText(/4.5/)).toBeInTheDocument();
    
    // Check for comments - look for separate elements
    expect(screen.getByText(/Comments Posted:/)).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  test('allows editing description when user views their own profile', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    // Click Edit Description button (only visible on own profile)
    const editButton = screen.getByText('Edit Description');
    fireEvent.click(editButton);
    
    // Check if textarea appears
    const textarea = screen.getByPlaceholderText('Add a description about yourself...');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('This is a test user description');
    
    // Update description
    fireEvent.change(textarea, { target: { value: 'Updated description' } });
    
    // Save the changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5001/api/users/123/description',
        { description: 'Updated description' },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Description updated successfully!');
    });
  });

  test('allows users to rate other profiles', async () => {
    // Mock different user ID for viewing someone else's profile
    jest.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'userId') return '456'; // Different from the profile being viewed
      if (key === 'token') return 'fake-token';
      return null;
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    // Find and click rating component
    const ratingComponent = screen.getByTestId('rating-stars');
    fireEvent.click(ratingComponent);
    
    // Check if API was called correctly
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/users/rate',
        { ratedId: '123', rating: 5 },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Rating submitted successfully!');
    });
  });

  test('displays created events when toggled', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    // Toggle created events section
    const eventsToggle = screen.getByText(/Events Created/);
    fireEvent.click(eventsToggle);
    
    // Check if events are displayed
    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API error
    axios.get.mockImplementationOnce(() => Promise.reject(new Error('API error')));
    
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load profile data.');
    });
  });
}); 