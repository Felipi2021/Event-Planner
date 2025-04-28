import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';

jest.mock('axios');

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });

  it('shows login page when not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('fetches profile image when logged in', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');
    
    const mockProfileData = {
      image: 'test-image.jpg'
    };
    
    axios.get.mockResolvedValueOnce({ data: mockProfileData });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5001/api/users/1');
    });
  });

  it('handles profile image fetch error gracefully', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');
    
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5001/api/users/1');
    });
  });

  it('redirects to login when accessing protected routes while not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/events']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('allows access to protected routes when logged in', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');

    render(
      <MemoryRouter initialEntries={['/events']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
  });
}); 