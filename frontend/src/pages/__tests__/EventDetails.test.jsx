import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EventDetails from '../EventDetails';
import axios from 'axios';
import { toast } from 'react-toastify';

// Mock the required modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

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

describe('EventDetails Component', () => {
  const mockEvent = {
    id: 1,
    title: 'Test Event',
    description: 'This is a test event description that is longer than 200 characters so that we can test the truncation functionality of the component. This description should be long enough to trigger the view more button in the component.',
    date: '2023-12-31',
    location: 'Test Location',
    image: 'test-banner.jpg',
    created_by: '123',
    created_by_username: 'Test User',
    capacity: 100,
    attendees_count: 50
  };

  const mockComments = [
    {
      id: 1,
      text: 'Great event!',
      user_id: '456',
      username: 'Commenter1',
      userAvatar: 'commenter1.jpg',
      created_at: '2023-10-15T10:30:00Z'
    },
    {
      id: 2,
      text: 'Looking forward to it!',
      user_id: '789',
      username: 'Commenter2',
      userAvatar: 'commenter2.jpg',
      created_at: '2023-10-15T11:00:00Z'
    }
  ];

  const mockAttendanceStatus = {
    '1': true // User is attending event with id 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url === `http://localhost:5001/api/events/1`) {
        return Promise.resolve({ data: mockEvent });
      } 
      else if (url === `http://localhost:5001/api/events/1/comments`) {
        return Promise.resolve({ data: mockComments });
      }
      else if (url.includes(`/users/123/attendance`)) {
        return Promise.resolve({ data: mockAttendanceStatus });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    // Mock POST request for comments
    axios.post.mockImplementation((url) => {
      if (url === `http://localhost:5001/api/events/1/comments`) {
        return Promise.resolve({
          data: {
            id: 3,
            text: 'New comment',
            username: 'Current User',
            userAvatar: 'default-avatar.png',
            created_at: new Date().toISOString()
          }
        });
      }
      else if (url === `http://localhost:5001/api/events/1/attend`) {
        return Promise.resolve({ data: { message: 'Attendance added' } });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    // Mock DELETE request for removing attendance
    axios.delete.mockImplementation((url) => {
      if (url === `http://localhost:5001/api/events/1/attend`) {
        return Promise.resolve({ data: { message: 'Attendance removed' } });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('renders event details correctly', async () => {
    render(
      <BrowserRouter>
        <EventDetails />
      </BrowserRouter>
    );

    // Wait for the component to fetch and render the event details
    await waitFor(() => {
      expect(screen.getByText(/Test Event/)).toBeInTheDocument();
    });
    
    // Check event details are properly displayed
    expect(screen.getByText('Location:', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Capacity:', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Attendees:', { exact: false })).toBeInTheDocument();
    
    // Check comments are rendered
    await waitFor(() => {
      expect(screen.getByText('Great event!')).toBeInTheDocument();
      expect(screen.getByText('Looking forward to it!')).toBeInTheDocument();
    });
  });

  test('handles attendance toggling correctly', async () => {
    render(
      <BrowserRouter>
        <EventDetails />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Test Event/)).toBeInTheDocument();
    });
    
    // Since the user is already attending (mockAttendanceStatus has '1': true),
    // the button should show "Remove Attendance"
    const attendButton = screen.getByText('Remove Attendance');
    expect(attendButton).toBeInTheDocument();
    
    // Click to remove attendance
    fireEvent.click(attendButton);
    
    // Check that the API call was made correctly
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5001/api/events/1/attend',
        {
          headers: { Authorization: 'Bearer fake-token' },
          data: { userId: '123' }
        }
      );
      expect(toast.info).toHaveBeenCalledWith('You are no longer attending this event.');
    });
  });

  test('allows adding a comment', async () => {
    render(
      <BrowserRouter>
        <EventDetails />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Test Event/)).toBeInTheDocument();
    });
    
    // Add a comment
    const commentInput = screen.getByPlaceholderText('Add your comment...');
    fireEvent.change(commentInput, { target: { value: 'New comment test' } });
    
    // Submit the comment
    const submitButton = screen.getByRole('button', { name: '→' });
    fireEvent.click(submitButton);
    
    // Verify the comment was submitted correctly
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/events/1/comments',
        { text: 'New comment test' },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Comment added successfully!');
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API error for initial event load
    axios.get.mockImplementationOnce(() => Promise.reject(new Error('API error')));
    
    render(
      <BrowserRouter>
        <EventDetails />
      </BrowserRouter>
    );
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load event details.')).toBeInTheDocument();
    });
  });
}); 