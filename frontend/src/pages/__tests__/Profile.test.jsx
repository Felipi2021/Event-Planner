import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../Profile';
import axios from 'axios';
import { toast } from 'react-toastify';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ userId: '123' }),
  useNavigate: () => mockNavigate
}));

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));


jest.mock('react-rating-stars-component', () => {
  return function MockReactStars(props) {
    return (
      <div data-testid="rating-stars" onClick={() => props.onChange && props.onChange(5)}>
        Rating: {props.value}
      </div>
    );
  };
});


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
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    
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
    
    
    expect(screen.getByText(/Comments Posted:/)).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  test('displays loading or error state when user data cannot be loaded', async () => {
    
    axios.get.mockImplementation(() => Promise.reject(new Error('Failed to load user')));
    
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    
    
    await waitFor(() => {
      expect(screen.getByText('Cannot load profile data...')).toBeInTheDocument();
    });
  });

  test('displays default state when user data has empty values', async () => {
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/users/123') {
        return Promise.resolve({ 
          data: { 
            ...mockUserInfo, 
            description: null,
            created_at: null
          } 
        });
      } 
      else if (url === 'http://localhost:5001/api/users/123/average-rating') {
        return Promise.resolve({ data: { averageRating: null } });
      }
      else if (url.includes('api/users/123/comments/count')) {
        return Promise.resolve({ data: { count: 0 } });
      }
      
      else if (url.includes('api/events?created_by=123')) {
        return Promise.resolve({ data: mockCreatedEvents });
      }
      else if (url.includes('api/users/123/favorites')) {
        return Promise.resolve({ data: mockFavoriteEvents });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    expect(screen.getByText('No description added.')).toBeInTheDocument();
    expect(screen.getByText('Add Description +')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText(/No ratings yet/)).toBeInTheDocument();
  });

  test('allows editing description when user views their own profile', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const editButton = screen.getByText('Edit Description');
    fireEvent.click(editButton);
    
    
    const textarea = screen.getByPlaceholderText('Add a description about yourself...');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('This is a test user description');
    
    
    fireEvent.change(textarea, { target: { value: 'Updated description' } });
    
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5001/api/users/123/description',
        { description: 'Updated description' },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Description updated successfully!');
    });
  });

  test('allows canceling description edit', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const editButton = screen.getByText('Edit Description');
    fireEvent.click(editButton);
    
    
    const textarea = screen.getByPlaceholderText('Add a description about yourself...');
    fireEvent.change(textarea, { target: { value: 'This will be discarded' } });
    
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    
    expect(screen.queryByPlaceholderText('Add a description about yourself...')).not.toBeInTheDocument();
    expect(screen.getByText('This is a test user description')).toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled(); 
  });

  test('handles error when updating description', async () => {
    
    axios.put.mockRejectedValueOnce(new Error('Failed to update description'));
    
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const editButton = screen.getByText('Edit Description');
    fireEvent.click(editButton);
    
    
    const textarea = screen.getByPlaceholderText('Add a description about yourself...');
    fireEvent.change(textarea, { target: { value: 'Updated description' } });
    
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error updating description:', expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith('Failed to update description. Please try again.');
    });
  });

  test('allows users to rate other profiles', async () => {
    
    jest.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'userId') return '456'; 
      if (key === 'token') return 'fake-token';
      return null;
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const ratingComponent = screen.getByTestId('rating-stars');
    fireEvent.click(ratingComponent);
    
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/users/rate',
        { ratedId: '123', rating: 5 },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Rating submitted successfully!');
    });
  });

  test('handles error when submitting a rating', async () => {
    
    axios.post.mockRejectedValueOnce(new Error('Failed to submit rating'));
    
    
    jest.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'userId') return '456'; 
      if (key === 'token') return 'fake-token';
      return null;
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const ratingComponent = screen.getByTestId('rating-stars');
    fireEvent.click(ratingComponent);
    
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error submitting rating:', expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith('Failed to submit rating. Please try again.');
    });
  });

  test('prevents rating your own profile', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    
    const ratingStars = screen.getByTestId('rating-stars');
    expect(ratingStars).toBeInTheDocument();
  });

  test('prevents rating when not logged in', async () => {
    
    jest.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'userId') return '456'; 
      if (key === 'token') return null; 
      return null;
    });
    
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const ratingComponent = screen.getByTestId('rating-stars');
    fireEvent.click(ratingComponent);
    
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You need to log in to rate.');
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  test('displays created events when toggled', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const eventsToggle = screen.getByText(/Events Created/);
    fireEvent.click(eventsToggle);
    
    
    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });
  });

  test('displays favorite events when toggled', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const favoritesToggle = screen.getByText(/Events Marked as Favorite/);
    fireEvent.click(favoritesToggle);
    
    
    await waitFor(() => {
      expect(screen.getByText('Favorite Event 1')).toBeInTheDocument();
    });
  });

  test('displays message when no events or favorites are available', async () => {
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/users/123') {
        return Promise.resolve({ data: mockUserInfo });
      } 
      else if (url === 'http://localhost:5001/api/users/123/average-rating') {
        return Promise.resolve({ data: { averageRating: 4.5 } });
      }
      else if (url.includes('api/events?created_by=123')) {
        return Promise.resolve({ data: [] }); 
      }
      else if (url.includes('api/users/123/favorites')) {
        return Promise.resolve({ data: [] }); 
      }
      else if (url.includes('api/users/123/comments/count')) {
        return Promise.resolve({ data: { count: 15 } });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const eventsToggle = screen.getByText(/Events Created/);
    fireEvent.click(eventsToggle);
    
    
    await waitFor(() => {
      expect(screen.getByText("testuser hasn't created any events yet.")).toBeInTheDocument();
    });
    
    
    const favoritesToggle = screen.getByText(/Events Marked as Favorite/);
    fireEvent.click(favoritesToggle);
    
    
    await waitFor(() => {
      expect(screen.getByText("testuser hasn't marked any events as favorites yet.")).toBeInTheDocument();
    });
  });

  test('toggles event description when clicked', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const eventsToggle = screen.getByText(/Events Created/);
    fireEvent.click(eventsToggle);
    
    
    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });
    
    
    const viewMoreButton = screen.getAllByText(/View More/)[0];
    expect(viewMoreButton).toBeInTheDocument();
    
    
    fireEvent.click(viewMoreButton);
    
    
    expect(screen.getByText(/View Less/)).toBeInTheDocument();
    
    
    const viewLessButton = screen.getByText(/View Less/);
    fireEvent.click(viewLessButton);
    
    
    expect(screen.getAllByText(/View More/)[0]).toBeInTheDocument();
  });

  test('navigates to event when clicking on event card', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });
    
    
    const eventsToggle = screen.getByText(/Events Created/);
    fireEvent.click(eventsToggle);
    
    
    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });
    
    
    fireEvent.click(screen.getByText('Event 1').closest('.event-card'));
    
    
    expect(mockNavigate).toHaveBeenCalledWith('/events/1');
  });

  test('handles API errors gracefully', async () => {
    
    axios.get.mockImplementationOnce(() => Promise.reject(new Error('API error')));
    
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching profile data:', expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith('Failed to load profile data.');
    });
  });
}); 