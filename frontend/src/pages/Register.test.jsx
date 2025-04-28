import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Register from './Register';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders the registration form', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Profile Image:')).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email:');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('validates password requirements', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText('Password:');
    
    // Test too short password
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    });

    // Test missing uppercase
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least 1 uppercase letter.')).toBeInTheDocument();
    });

    // Test missing number
    fireEvent.change(passwordInput, { target: { value: 'Password' } });
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least 1 number.')).toBeInTheDocument();
    });

    // Test missing special character
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least 1 special character.')).toBeInTheDocument();
    });
  });

  it('handles successful registration', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    axios.post.mockResolvedValueOnce({ data: { message: 'Registration successful' } });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('Profile Image:'), { target: { files: [mockFile] } });

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/users/register',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Registered successfully!');
    });
  });

  it('handles registration failure', async () => {
    axios.post.mockRejectedValueOnce({ 
      response: { 
        data: { 
          message: 'Email already exists' 
        } 
      } 
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('Profile Image:'), { target: { files: [new File(['test'], 'test.jpg')] } });

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already exists');
    });
  });
});
