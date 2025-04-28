import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import EventDetails from './EventDetails';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

describe('EventDetails', () => {
  const mockEvent = {
    id: 1,
    title: 'Test Event',
    description: 'Test Description',
    date: '2024-03-20',
    location: 'Test Location',
    creator: { id: 1, username: 'testuser' },
    attendees: [{ id: 1, username: 'testuser' }],
    comments: [
      { id: 1, content: 'Test Comment 1', user: { username: 'user1' } },
      { id: 2, content: 'Test Comment 2', user: { username: 'user2' } }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    useParams.mockReturnValue({ id: '1' });
    
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock axios responses
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/events/1') {
        return Promise.resolve({ data: mockEvent });
      } else if (url === 'http://localhost:5001/api/events/1/comments') {
        return Promise.resolve({ data: mockEvent.comments });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders event details correctly', async () => {
    render(
      <MemoryRouter>
        <EventDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Event/)).toBeInTheDocument();
      expect(screen.getByText(/Test Description/)).toBeInTheDocument();
      expect(screen.getByText(/Test Location/)).toBeInTheDocument();
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
      expect(screen.getByText(/Test Comment 1/)).toBeInTheDocument();
      expect(screen.getByText(/Test Comment 2/)).toBeInTheDocument();
    });
  });

  it('handles attendance toggle', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');
    
    axios.post.mockResolvedValueOnce({ data: { message: 'Attendance updated' } });

    render(
      <MemoryRouter>
        <EventDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Event/)).toBeInTheDocument();
    });

    const attendButton = screen.getByText('Attend');
    fireEvent.click(attendButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/events/1/attend',
        { userId: '1' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Attendance updated successfully!');
    });
  });

  it('handles comment submission', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');
    
    axios.post.mockResolvedValueOnce({ data: { message: 'Comment added' } });

    render(
      <MemoryRouter>
        <EventDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Event/)).toBeInTheDocument();
    });

    const commentInput = screen.getByPlaceholderText('Add your comment...');
    const submitButton = screen.getByText('→');

    fireEvent.change(commentInput, { target: { value: 'New Comment' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/events/1/comments',
        { content: 'New Comment', userId: '1' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Comment added successfully!');
    });
  });

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <EventDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load event details.');
    });
  });
});
