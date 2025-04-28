import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Profile from './Profile';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('Profile', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    description: 'Test description',
    image_url: 'test-image.jpg',
    created_at: '2024-01-01T00:00:00.000Z'
  };

  const mockCreatedEvents = [
    { id: 1, title: 'Created Event 1', date: '2024-03-20', location: 'City 1' },
    { id: 2, title: 'Created Event 2', date: '2024-03-21', location: 'City 2' }
  ];

  const mockFavoriteEvents = [
    { id: 3, title: 'Favorite Event 1', date: '2024-03-22', location: 'City 3' },
    { id: 4, title: 'Favorite Event 2', date: '2024-03-23', location: 'City 4' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');
    
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock axios responses
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/users/1') {
        return Promise.resolve({ data: mockUser });
      } else if (url === 'http://localhost:5001/api/users/1/average-rating') {
        return Promise.resolve({ data: { averageRating: 4.5 } });
      } else if (url === 'http://localhost:5001/api/events?created_by=1') {
        return Promise.resolve({ data: mockCreatedEvents });
      } else if (url === 'http://localhost:5001/api/users/1/favorites') {
        return Promise.resolve({ data: mockFavoriteEvents });
      } else if (url === 'http://localhost:5001/api/users/1/comments/count') {
        return Promise.resolve({ data: { count: 5 } });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders user profile information', async () => {
    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/4.5/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });
  });

  it('displays created events', async () => {
    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Created Event 1/)).toBeInTheDocument();
      expect(screen.getByText(/Created Event 2/)).toBeInTheDocument();
    });
  });

  it('displays favorite events', async () => {
    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Favorite Event 1/)).toBeInTheDocument();
      expect(screen.getByText(/Favorite Event 2/)).toBeInTheDocument();
    });
  });

  it('redirects to login when not authenticated', () => {
    localStorage.clear();
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load profile data.');
    });
  });
});
