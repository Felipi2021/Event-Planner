import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import CreateEvent from './CreateEvent';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('CreateEvent', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    useNavigate.mockImplementation(() => mockNavigate);
    console.error = jest.fn(); // Mock console.error to prevent logging during tests
  });

  it('should render the create event form', () => {
    render(
      <MemoryRouter>
        <CreateEvent />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
  });

  it('should handle form submission successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Event created successfully' } });

    render(
      <MemoryRouter>
        <CreateEvent />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Event' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-05-01' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Test City' } });
    fireEvent.change(screen.getByLabelText(/capacity/i), { target: { value: '100' } });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/event image/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/events',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'multipart/form-data'
          })
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Event created successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });
  });

  it('should handle form submission without authentication', async () => {
    localStorage.clear();

    render(
      <MemoryRouter>
        <CreateEvent />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You need to log in to create an event.');
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    axios.post.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <CreateEvent />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Event' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-05-01' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Test City' } });
    fireEvent.change(screen.getByLabelText(/capacity/i), { target: { value: '100' } });

    const submitButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create event. Please try again.');
    });
  });
});
