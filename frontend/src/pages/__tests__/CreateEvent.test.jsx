import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import CreateEvent from '../CreateEvent';


jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
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

describe('CreateEvent', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-token';
      return null;
    });
  });

  it('renders create event form correctly', () => {
    render(<CreateEvent />);
    
    
    expect(screen.getByLabelText(/Title:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Capacity:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Image:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    
    axios.post.mockResolvedValueOnce({ data: { message: 'Event created successfully' } });
    
    render(<CreateEvent />);
    
    
    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByLabelText(/Location:/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Capacity:/i), { target: { value: '100' } });
    
    
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Event Image:/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    
    fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));
    
    
    await waitFor(() => {
      
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
      
      
      const formDataArg = axios.post.mock.calls[0][1];
      expect(formDataArg.get('title')).toBe('Test Event');
      expect(formDataArg.get('description')).toBe('Test Description');
      expect(formDataArg.get('date')).toBe('2023-12-31');
      expect(formDataArg.get('location')).toBe('Test Location');
      expect(formDataArg.get('capacity')).toBe('100');
      expect(formDataArg.get('image')).toEqual(file);

      
      expect(toast.success).toHaveBeenCalledWith('Event created successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });
  });

  it('shows error when not logged in', async () => {
    
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    render(<CreateEvent />);
    
    
    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByLabelText(/Location:/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Capacity:/i), { target: { value: '100' } });
    
    
    fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));
    
    
    expect(toast.error).toHaveBeenCalledWith('You need to log in to create an event.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('handles API error during submission', async () => {
    
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    
    render(<CreateEvent />);
    
    
    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByLabelText(/Location:/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Capacity:/i), { target: { value: '100' } });
    
    
    fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));
    
    
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