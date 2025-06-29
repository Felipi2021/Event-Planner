import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Admin from '../Admin';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


jest.mock('axios');


jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));


const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Admin Component', () => {
  const mockUsers = [
    { id: 1, username: 'admin', email: 'admin@example.com', is_admin: 1, is_banned: 0 },
    { id: 2, username: 'user1', email: 'user1@example.com', is_admin: 0, is_banned: 0 },
    { id: 3, username: 'banneduser', email: 'banned@example.com', is_admin: 0, is_banned: 1, ban_reason: 'Spam' },
  ];

  const mockEvents = [
    { id: 1, title: 'Event 1', created_by_username: 'user1', date: '2023-05-01T14:00:00.000Z', location: 'New York' },
    { id: 2, title: 'Event 2', created_by_username: 'user1', date: '2023-06-15T18:30:00.000Z', location: 'Los Angeles' },
  ];

  const mockComments = [
    { id: 1, event_id: 1, event_title: 'Event 1', username: 'user1', text: 'Great event!', created_at: '2023-05-02T10:15:00.000Z' },
    { id: 2, event_id: 2, event_title: 'Event 2', username: 'banneduser', text: 'Looking forward to it', created_at: '2023-06-10T11:30:00.000Z' },
  ];

  beforeEach(() => {
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'isAdmin') return 'true';
      if (key === 'token') return 'fake-token';
      return null;
    });

    
    jest.clearAllMocks();
  });

  it('redirects non-admin users to home page', async () => {
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'isAdmin') return 'false';
      return null;
    });

    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(toast.error).toHaveBeenCalledWith('Unauthorized access');
    });
  });

  it('displays users data correctly', async () => {
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/users/admin/all-users') {
        return Promise.resolve({ data: mockUsers });
      }
      if (url === 'http://localhost:5001/api/events/admin/all') {
        return Promise.resolve({ data: { events: mockEvents, comments: mockComments } });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('banneduser')).toBeInTheDocument();
    
    
    expect(screen.getByText('Banned')).toBeInTheDocument();
    
    
    const banButtons = screen.getAllByText('Ban');
    expect(banButtons[0]).toBeDisabled(); 
  });

  it('allows switching between tabs', async () => {
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/users/admin/all-users') {
        return Promise.resolve({ data: mockUsers });
      }
      if (url === 'http://localhost:5001/api/events/admin/all') {
        return Promise.resolve({ data: { events: mockEvents, comments: mockComments } });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    
    
    fireEvent.click(screen.getByText('Events'));
    expect(screen.getByText('Events Management')).toBeInTheDocument();
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
    
    
    fireEvent.click(screen.getByText('Comments'));
    expect(screen.getByText('Comments Management')).toBeInTheDocument();
    expect(screen.getByText('Great event!')).toBeInTheDocument();
    expect(screen.getByText('Looking forward to it')).toBeInTheDocument();
  });

  it('handles unbanning a user', async () => {
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/users/admin/all-users') {
        return Promise.resolve({ data: mockUsers });
      }
      if (url === 'http://localhost:5001/api/events/admin/all') {
        return Promise.resolve({ data: { events: mockEvents, comments: mockComments } });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    axios.post.mockResolvedValue({});

    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText('Banned')).toBeInTheDocument();
    });
    
    
    const unbanButton = screen.getByText('Unban');
    fireEvent.click(unbanButton);
    
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/users/admin/unban',
        { userId: 3 },
        { headers: { Authorization: 'Bearer fake-token' }}
      );
      expect(toast.success).toHaveBeenCalledWith('User unbanned successfully');
    });
  });

  it('handles banning a user', async () => {
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/users/admin/all-users') {
        return Promise.resolve({ data: mockUsers });
      }
      if (url === 'http://localhost:5001/api/events/admin/all') {
        return Promise.resolve({ data: { events: mockEvents, comments: mockComments } });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    axios.post.mockResolvedValue({});

    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
    
    
    const banButtons = screen.getAllByText('Ban');
    fireEvent.click(banButtons[1]); 
    
    
    expect(screen.getByText('Ban User: user1')).toBeInTheDocument();
    
    
    const reasonTextarea = screen.getByLabelText('Reason for ban:');
    fireEvent.change(reasonTextarea, { target: { value: 'Inappropriate behavior' } });
    
    const confirmBanButton = screen.getByText('Ban User');
    fireEvent.click(confirmBanButton);
    
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/users/admin/ban',
        { userId: 2, banReason: 'Inappropriate behavior' },
        { headers: { Authorization: 'Bearer fake-token' }}
      );
      expect(toast.success).toHaveBeenCalledWith('User banned successfully');
    });
  });

  it('handles deleting an event', async () => {
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/users/admin/all-users') {
        return Promise.resolve({ data: mockUsers });
      }
      if (url === 'http://localhost:5001/api/events/admin/all') {
        return Promise.resolve({ data: { events: mockEvents, comments: mockComments } });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    axios.delete.mockResolvedValue({});

    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
    
    
    fireEvent.click(screen.getByText('Events'));
    
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]); 
    
    
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this event?/)).toBeInTheDocument();
    
    
    const confirmDeleteButton = screen.getByText('Yes, Delete');
    fireEvent.click(confirmDeleteButton);
    
    
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5001/api/events/1',
        { headers: { Authorization: 'Bearer fake-token' }}
      );
      expect(toast.success).toHaveBeenCalledWith('Event deleted successfully');
    });
  });

  it('handles API errors gracefully', async () => {
    
    axios.get.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load events and comments')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Failed to load users');
      expect(toast.error).toHaveBeenCalledWith('Failed to load events and comments');
    });
  });
}); 