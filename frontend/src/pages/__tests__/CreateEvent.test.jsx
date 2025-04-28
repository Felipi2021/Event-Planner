import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import CreateEvent from '../CreateEvent';

// Mock the react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
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

// Suppress console.error
console.error = jest.fn();

// Mock localStorage
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

describe('CreateEvent', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    
    // Set up localStorage mock with token
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-token';
      return null;
    });
  });

  it('renders create event form correctly', () => {
    render(<CreateEvent />);
    
    // Check form elements are present
    expect(screen.getByLabelText(/Title:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Capacity:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Image:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    // Mock successful form submission
    axios.post.mockResolvedValueOnce({ data: { message: 'Event created successfully' } });
    
    render(<CreateEvent />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByLabelText(/Location:/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Capacity:/i), { target: { value: '100' } });
    
    // Mock a file input
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Event Image:/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));
    
    // Verify FormData was created and sent correctly
    await waitFor(() => {
      // Verify axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/events',
        expect.any(FormData),
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Verify FormData was created correctly
      const formDataArg = axios.post.mock.calls[0][1];
      expect(formDataArg.get('title')).toBe('Test Event');
      expect(formDataArg.get('description')).toBe('Test Description');
      expect(formDataArg.get('date')).toBe('2023-12-31');
      expect(formDataArg.get('location')).toBe('Test Location');
      expect(formDataArg.get('capacity')).toBe('100');
      expect(formDataArg.get('image')).toEqual(file);

      // Verify toast and navigation
      expect(toast.success).toHaveBeenCalledWith('Event created successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });
  });

  it('shows error when not logged in', async () => {
    // Mock localStorage to return no token
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    render(<CreateEvent />);
    
    // Fill out minimal required fields
    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByLabelText(/Location:/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Capacity:/i), { target: { value: '100' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));
    
    // Verify error toast was shown
    expect(toast.error).toHaveBeenCalledWith('You need to log in to create an event.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('handles API error during submission', async () => {
    // Mock API error
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    
    render(<CreateEvent />);
    
    // Fill out minimal required fields
    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByLabelText(/Location:/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Capacity:/i), { target: { value: '100' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));
    
    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create event. Please try again.');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('navigates to events page when explore button is clicked', () => {
    render(<CreateEvent />);
    
    const exploreButton = screen.getByRole('button', { name: /Explore Events/i });
    fireEvent.click(exploreButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/events');
  });
}); 