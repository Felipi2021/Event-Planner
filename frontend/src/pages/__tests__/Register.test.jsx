import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Register from '../Register';


jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Link: jest.fn(({ children, to }) => (
    <a href={to} data-testid="mock-link">{children}</a>
  )),
}));


jest.mock('axios');


jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));


console.error = jest.fn();

describe('Register', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders registration form correctly', () => {
    render(<Register />);
    
    expect(screen.getByLabelText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Profile Image:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-link')).toHaveAttribute('href', '/login');
  });

  it('validates email format', () => {
    render(<Register />);
    
    const emailInput = screen.getByLabelText(/Email:/i);
    
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    
    
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
  });

  it('validates password requirements', () => {
    render(<Register />);
    
    const passwordInput = screen.getByLabelText(/Password:/i);
    
    
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    expect(screen.getByText('Password must contain at least 1 uppercase letter.')).toBeInTheDocument();
    expect(screen.getByText('Password must contain at least 1 number.')).toBeInTheDocument();
    expect(screen.getByText('Password must contain at least 1 special character.')).toBeInTheDocument();
    
    
    fireEvent.change(passwordInput, { target: { value: 'password123!' } });
    expect(screen.getByText('Password must contain at least 1 uppercase letter.')).toBeInTheDocument();
    
    
    fireEvent.change(passwordInput, { target: { value: 'Password!' } });
    expect(screen.getByText('Password must contain at least 1 number.')).toBeInTheDocument();
    
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    expect(screen.getByText('Password must contain at least 1 special character.')).toBeInTheDocument();
    
    
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    expect(screen.getByText('Password is valid ✓')).toBeInTheDocument();
  });
});


describe('Register form submission', () => {
  let mockNavigate;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('handles successful registration', async () => {
    
    jest.spyOn(toast, 'success').mockImplementation(() => {});
    
    
    axios.post.mockResolvedValueOnce({ 
      data: { message: 'User registered successfully' } 
    });
    
    render(<Register />);
    
    
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'Password123!' } });
    
    
    const file = new File(['dummy content'], 'profile.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/Profile Image:/i);
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);
    
    
    const form = screen.getByRole('button', { name: /Register/i }).closest('form');
    fireEvent.submit(form);
    
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/users/register',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Registered successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('prevents submission with validation errors', async () => {
    
    jest.spyOn(toast, 'error').mockImplementation(() => {});
    
    render(<Register />);
    
    
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'weak' } });
    
    
    const form = screen.getByRole('button', { name: /Register/i }).closest('form');
    fireEvent.submit(form);
    
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fix the errors before submitting.');
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  it('shows error when no profile image is provided', async () => {
    
    jest.spyOn(toast, 'error').mockImplementation(() => {});
    
    render(<Register />);
    
    
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'Password123!' } });
    
    
    const form = screen.getByRole('button', { name: /Register/i }).closest('form');
    fireEvent.submit(form);
    
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Profile image is required.');
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  it('handles API error during registration', async () => {
    
    jest.spyOn(toast, 'error').mockImplementation(() => {});
    
    
    const errorMessage = 'Email already exists';
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });
    
    render(<Register />);
    
    
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'Password123!' } });
    
    
    const file = new File(['dummy content'], 'profile.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/Profile Image:/i);
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);
    
    
    const form = screen.getByRole('button', { name: /Register/i }).closest('form');
    fireEvent.submit(form);
    
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
}); 