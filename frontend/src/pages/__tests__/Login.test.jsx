import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Login from '../Login';


jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));


jest.mock('axios');


jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));


console.error = jest.fn();


const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Login', () => {
  const mockNavigate = jest.fn();
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders login form correctly', () => {
    render(<Login onLogin={mockOnLogin} />);

    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('validates email format', () => {
    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/Email:/i);
    
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
  });

  it('handles successful login for regular user', async () => {
    
    const mockLoginResponse = {
      data: {
        token: 'test-token',
        userId: '1',
        isAdmin: false
      },
    };
    
    const mockUserDetailsResponse = {
      data: {
        image: 'test-image.jpg',
      },
    };

    axios.post.mockResolvedValueOnce(mockLoginResponse);
    axios.get.mockResolvedValueOnce(mockUserDetailsResponse);

    render(<Login onLogin={mockOnLogin} />);

    
    const emailInput = screen.getByLabelText(/Email:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5001/api/users/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5001/api/users/1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', '1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('isAdmin', 'false');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('profileImage', 'test-image.jpg');
      expect(toast.success).toHaveBeenCalledWith('Logged in successfully!');
      expect(mockOnLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles successful login for admin user', async () => {
    
    const mockLoginResponse = {
      data: {
        token: 'admin-token',
        userId: '1',
        isAdmin: true
      },
    };
    
    const mockUserDetailsResponse = {
      data: {
        image: 'admin-image.jpg',
      },
    };

    axios.post.mockResolvedValueOnce(mockLoginResponse);
    axios.get.mockResolvedValueOnce(mockUserDetailsResponse);

    render(<Login onLogin={mockOnLogin} />);

    
    const emailInput = screen.getByLabelText(/Email:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'adminpassword' } });
    fireEvent.click(submitButton);

    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5001/api/users/login', {
        email: 'admin@example.com',
        password: 'adminpassword',
      });
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5001/api/users/1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'admin-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', '1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('isAdmin', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('profileImage', 'admin-image.jpg');
      expect(toast.success).toHaveBeenCalledWith('Logged in successfully!');
      expect(mockOnLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('handles banned user login', async () => {
    
    const mockBannedResponse = {
      response: {
        data: {
          message: 'Account banned',
          isBanned: true,
          banReason: 'Inappropriate behavior'
        },
        status: 403
      }
    };

    axios.post.mockRejectedValueOnce(mockBannedResponse);

    render(<Login onLogin={mockOnLogin} />);

    
    const emailInput = screen.getByLabelText(/Email:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'banned@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5001/api/users/login', {
        email: 'banned@example.com',
        password: 'password',
      });
      
      // Check that the banned user view is shown
      expect(screen.getByText('Account Banned')).toBeInTheDocument();
      expect(screen.getByText('You have been banned from Event Planner for:')).toBeInTheDocument();
      expect(screen.getByText('Inappropriate behavior')).toBeInTheDocument();
      
      // Check that local storage is cleared of any auth data
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userId');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('isAdmin');
    });
  });

  it('handles login failure', async () => {
    
    axios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: 'Invalid credentials' }
      }
    });

    render(<Login onLogin={mockOnLogin} />);

    
    const emailInput = screen.getByLabelText(/Email:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5001/api/users/login', {
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      expect(toast.error).toHaveBeenCalledWith('Login failed. Check your credentials.');
      expect(mockNavigate).not.toHaveBeenCalled(); 
    });
  });

  it('prevents form submission with invalid email', () => {
    
    render(<Login onLogin={mockOnLogin} />);
    
    
    const emailInput = screen.getByLabelText(/Email:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });
    
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    
    
    fireEvent.click(submitButton);
    
    
    expect(axios.post).not.toHaveBeenCalled();
  });
}); 