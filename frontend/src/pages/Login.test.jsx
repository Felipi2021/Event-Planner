import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Login from './Login';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form', () => {
    render(
      <MemoryRouter>
        <Login onLogin={jest.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(
      <MemoryRouter>
        <Login onLogin={jest.fn()} />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Email:');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    const mockOnLogin = jest.fn();
    axios.post.mockResolvedValueOnce({ 
      data: { 
        token: 'test-token',
        userId: '1'
      } 
    });
    axios.get.mockResolvedValueOnce({ 
      data: { 
        image: 'test-image.jpg'
      } 
    });

    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5001/api/users/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('userId')).toBe('1');
      expect(localStorage.getItem('profileImage')).toBe('test-image.jpg');
      expect(toast.success).toHaveBeenCalledWith('Logged in successfully!');
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  it('handles login failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('Login failed'));

    render(
      <MemoryRouter>
        <Login onLogin={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Login failed. Check your credentials.');
    });
  });
});
