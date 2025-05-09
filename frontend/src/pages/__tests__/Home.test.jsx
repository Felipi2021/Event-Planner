import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import axios from 'axios';
import { toast } from 'react-toastify';


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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

describe('Home Component', () => {
  const mockEvents = [
    {
      id: 1,
      title: 'Summer Festival',
      description: 'Annual summer festival with music, food, and activities.',
      date: '2023-07-15',
      location: 'Central Park',
      image: 'summer-festival.jpg'
    },
    {
      id: 2,
      title: 'Tech Conference',
      description: 'Conference discussing the latest tech trends.',
      date: '2023-08-10',
      location: 'Convention Center',
      image: 'tech-conference.jpg'
    },
    {
      id: 3,
      title: 'Food Fair',
      description: 'Taste dishes from different cultures.',
      date: '2023-09-05',
      location: 'Downtown Square',
      image: 'food-fair.jpg'
    }
  ];

  const mockWeatherData = {
    weather: [{ icon: '01d', description: 'clear sky' }],
    main: { temp: 25.5, humidity: 60 },
    wind: { speed: 5.5 },
    name: 'Warsaw'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/events') {
        return Promise.resolve({ data: mockEvents });
      } 
      else if (url.includes('api.openweathermap.org')) {
        return Promise.resolve({ data: mockWeatherData });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    axios.post.mockResolvedValue({ data: { message: 'Event favorite status updated' } });
  });

  test('renders home page with correct sections', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    
    expect(screen.getByText('Welcome to Event Planner')).toBeInTheDocument();
    expect(screen.getByText('Discover events, stay updated, and plan your next adventure!')).toBeInTheDocument();
    
    
    expect(screen.getByText('Latest Events')).toBeInTheDocument();
    expect(screen.getByText('News Around the World')).toBeInTheDocument();
    expect(screen.getByText('Weather in Warsaw')).toBeInTheDocument();
    
    
    await waitFor(() => {
      expect(screen.getByText('Summer Festival')).toBeInTheDocument();
    });
    
    
    expect(screen.getByText('Tech Conference')).toBeInTheDocument();
    expect(screen.getByText('Food Fair')).toBeInTheDocument();
    
    
    expect(screen.getByText('Global Warming Alert')).toBeInTheDocument();
    expect(screen.getByText('Tech Breakthrough')).toBeInTheDocument();
    expect(screen.getByText('Sports Update')).toBeInTheDocument();
    
    
    await waitFor(() => {
      expect(screen.getByText('Temperature:')).toBeInTheDocument();
      
      expect(screen.getByText(/25.5°C/)).toBeInTheDocument();
    });
    
    expect(screen.getByText('Condition:')).toBeInTheDocument();
    expect(screen.getByText('clear sky')).toBeInTheDocument();
    expect(screen.getByText('Humidity:')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Wind Speed:')).toBeInTheDocument();
    expect(screen.getByText('5.5 m/s')).toBeInTheDocument();
  });

  test('allows searching for weather by city', async () => {
    
    const newCityWeather = {
      weather: [{ icon: '10d', description: 'light rain' }],
      main: { temp: 18.3, humidity: 75 },
      wind: { speed: 3.2 },
      name: 'London'
    };
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/events') {
        return Promise.resolve({ data: mockEvents });
      } 
      else if (url.includes('api.openweathermap.org') && url.includes('q=London')) {
        return Promise.resolve({ data: newCityWeather });
      }
      else if (url.includes('api.openweathermap.org')) {
        return Promise.resolve({ data: mockWeatherData });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    
    await waitFor(() => {
      expect(screen.getByText('Temperature:')).toBeInTheDocument();
      
      expect(screen.getByText(/25.5°C/)).toBeInTheDocument();
    });
    
    
    const searchInput = screen.getByPlaceholderText('Enter city');
    fireEvent.change(searchInput, { target: { value: 'London' } });
    
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);
    
    
    await waitFor(() => {
      expect(screen.getByText('Weather in London')).toBeInTheDocument();
      expect(screen.getByText(/18.3°C/)).toBeInTheDocument();
      expect(screen.getByText('light rain')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('3.2 m/s')).toBeInTheDocument();
    });
  });

  test('handles favoriting events when logged in', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    
    await waitFor(() => {
      expect(screen.getByText('Summer Festival')).toBeInTheDocument();
    });
    
    
    const foodFairTitle = screen.getByText('Food Fair');
    const foodFairCard = foodFairTitle.closest('.event-card');
    const starIcon = foodFairCard.querySelector('.star-icon');
    fireEvent.click(starIcon);
    
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/events/3/favorite',
        { userId: '123' },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Event added to favorites!');
    });
  });

  test('shows error when trying to favorite without being logged in', async () => {
    
    jest.spyOn(localStorage, 'getItem').mockImplementation(() => null);
    
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    
    await waitFor(() => {
      expect(screen.getByText('Summer Festival')).toBeInTheDocument();
    });
    
    
    const starIcons = screen.getAllByText('★');
    fireEvent.click(starIcons[0]);
    
    
    expect(toast.error).toHaveBeenCalledWith('You need to log in to mark favorites.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('handles navigation to event details page', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    
    await waitFor(() => {
      expect(screen.getByText('Summer Festival')).toBeInTheDocument();
    });
    
    
    const eventCards = screen.getAllByText('Summer Festival');
    fireEvent.click(eventCards[0]);
    
    
    expect(mockNavigate).toHaveBeenCalledWith('/events/1');
  });

  test('handles API error when fetching events', async () => {
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/events') {
        return Promise.reject(new Error('API error'));
      }
      else if (url.includes('api.openweathermap.org')) {
        return Promise.resolve({ data: mockWeatherData });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching latest events:',
        expect.any(Error)
      );
    });
  });

  test('handles weather API errors gracefully', async () => {
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/events') {
        return Promise.resolve({ data: mockEvents });
      }
      else if (url.includes('api.openweathermap.org')) {
        return Promise.reject(new Error('Weather API error'));
      }
      return Promise.reject(new Error('Not found'));
    });
    
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching weather data:',
        expect.any(Error)
      );
    });
    
    
    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
  });
}); 