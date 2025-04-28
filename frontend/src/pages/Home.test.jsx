import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Home from './Home';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Home', () => {
  const mockWeatherData = {
    main: { temp: 20, humidity: 50 },
    weather: [{ description: 'clear sky', icon: '01d' }],
    wind: { speed: 5 },
    name: 'Warsaw'
  };

  const mockEvents = [
    { id: 1, title: 'Event 1', date: '2024-03-20', location: 'City 1', description: 'Description 1' },
    { id: 2, title: 'Event 2', date: '2024-03-21', location: 'City 2', description: 'Description 2' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock initial API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('api.openweathermap.org')) {
        return Promise.resolve({ data: mockWeatherData });
      } else if (url === 'http://localhost:5001/api/events') {
        return Promise.resolve({ data: mockEvents });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders welcome message', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/Welcome to Event Planner/)).toBeInTheDocument();
  });

  it('updates city when search is submitted', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Enter city');
    const button = screen.getByText('Search');

    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('api.openweathermap.org'),
        expect.any(Object)
      );
      expect(screen.getByText(/20°C/)).toBeInTheDocument();
      expect(screen.getByText(/clear sky/)).toBeInTheDocument();
    });
  });

  it('displays latest events', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Event 1/)).toBeInTheDocument();
      expect(screen.getByText(/Event 2/)).toBeInTheDocument();
      expect(screen.getByText(/City 1/)).toBeInTheDocument();
      expect(screen.getByText(/City 2/)).toBeInTheDocument();
    });
  });

  it('handles favorite event toggle', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');
    
    axios.post.mockResolvedValueOnce({ data: { message: 'Event added to favorites' } });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Event 1/)).toBeInTheDocument();
    });

    const starIcons = screen.getAllByText('★');
    fireEvent.click(starIcons[0]); // Click the first star icon

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/events/1/favorite',
        { userId: '1' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Event added to favorites!');
    });
  });

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch weather data.');
    });
  });
});
