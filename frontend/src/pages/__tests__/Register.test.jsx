import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Register from '../Register';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Link: jest.fn(({ children, to }) => (
    <a href={to} data-testid="mock-link">{children}</a>
  )),
}));

// Mock axios
jest.mock('axios');

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Suppress console errors
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
    
    // Test invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    
    // Test valid email
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
  });

  it('validates password requirements', () => {
    render(<Register />);
    
    const passwordInput = screen.getByLabelText(/Password:/i);
    
    // Test too short password
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    expect(screen.getByText('Password must contain at least 1 uppercase letter.')).toBeInTheDocument();
    expect(screen.getByText('Password must contain at least 1 number.')).toBeInTheDocument();
    expect(screen.getByText('Password must contain at least 1 special character.')).toBeInTheDocument();
    
    // Test password missing uppercase
    fireEvent.change(passwordInput, { target: { value: 'password123!' } });
    expect(screen.getByText('Password must contain at least 1 uppercase letter.')).toBeInTheDocument();
    
    // Test password missing number
    fireEvent.change(passwordInput, { target: { value: 'Password!' } });
    expect(screen.getByText('Password must contain at least 1 number.')).toBeInTheDocument();
    
    // Test password missing special character
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    expect(screen.getByText('Password must contain at least 1 special character.')).toBeInTheDocument();
    
    // Test valid password
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    expect(screen.getByText('Password is valid ✓')).toBeInTheDocument();
  });
});

// Keep these tests separate since we're mocking them differently
describe('Register form submission', () => {
  let mockNavigate;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('handles successful registration', async () => {
    // Mock toast functions directly in the specific test
    jest.spyOn(toast, 'success').mockImplementation(() => {});
    
    // Mock successful API response
    axios.post.mockResolvedValueOnce({ 
      data: { message: 'User registered successfully' } 
    });
    
    render(<Register />);
    
    // Fill out the form with valid data
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'Password123!' } });
    
    // Mock file upload
    const file = new File(['dummy content'], 'profile.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/Profile Image:/i);
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);
    
    // Get the form element and submit it
    const form = screen.getByRole('button', { name: /Register/i }).closest('form');
    fireEvent.submit(form);
    
    // Wait for async operations to complete
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
    // Mock toast functions
    jest.spyOn(toast, 'error').mockImplementation(() => {});
    
    render(<Register />);
    
    // Fill form with invalid data
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'weak' } });
    
    // Get the form element and submit it
    const form = screen.getByRole('button', { name: /Register/i }).closest('form');
    fireEvent.submit(form);
    
    // Wait for validation check
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fix the errors before submitting.');
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  it('shows error when no profile image is provided', async () => {
    // Mock toast functions
    jest.spyOn(toast, 'error').mockImplementation(() => {});
    
    render(<Register />);
    
    // Fill form with valid data but no image
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'Password123!' } });
    
    // Get the form element and submit it
    const form = screen.getByRole('button', { name: /Register/i }).closest('form');
    fireEvent.submit(form);
    
    // Wait for validation check
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Profile image is required.');
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  it('handles API error during registration', async () => {
    // Mock toast functions
    jest.spyOn(toast, 'error').mockImplementation(() => {});
    
    // Mock API error
    const errorMessage = 'Email already exists';
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });
    
    render(<Register />);
    
    // Fill out the form with valid data
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'Password123!' } });
    
    // Mock file upload
    const file = new File(['dummy content'], 'profile.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/Profile Image:/i);
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);
    
    // Get the form element and submit it
    const form = screen.getByRole('button', { name: /Register/i }).closest('form');
    fireEvent.submit(form);
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
}); 