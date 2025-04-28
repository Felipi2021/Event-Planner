import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Events from './Events';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Events', () => {
  const mockEvents = [
    { id: 1, title: 'Event 1', date: '2024-03-20', location: 'City 1', capacity: 100, description: 'Description 1' },
    { id: 2, title: 'Event 2', date: '2024-03-21', location: 'City 2', capacity: 200, description: 'Description 2' }
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
      if (url === 'http://localhost:5001/api/events') {
        return Promise.resolve({ data: mockEvents });
      } else if (url === 'http://localhost:5001/api/users/1/attendance') {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render a list of events', async () => {
    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
      expect(screen.getByText('City 1')).toBeInTheDocument();
      expect(screen.getByText('City 2')).toBeInTheDocument();
    });
  });

  it('should handle sorting events', async () => {
    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    fireEvent.change(sortSelect, { target: { value: 'date' } });

    const orderSelect = screen.getByRole('combobox', { name: /order/i });
    fireEvent.change(orderSelect, { target: { value: 'desc' } });

    await waitFor(() => {
      const events = screen.getAllByText(/Event/);
      expect(events[0]).toHaveTextContent('Event 2');
      expect(events[1]).toHaveTextContent('Event 1');
    });
  });

  it('should handle search functionality', async () => {
    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search events by title');
    fireEvent.change(searchInput, { target: { value: 'Event 1' } });

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.queryByText('Event 2')).not.toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch events.');
    });
  });
});
