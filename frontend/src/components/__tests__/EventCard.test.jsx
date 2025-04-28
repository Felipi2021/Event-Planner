import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../EventCard';


jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));


jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node,
}));

describe('EventCard', () => {
  const mockEvent = {
    id: 1,
    title: 'Test Event',
    description: 'Test description',
    date: '2024-06-15',
    location: 'Test Location',
    capacity: 100,
    attendees_count: 50,
    created_by_username: 'testuser',
    image: 'test-image.jpg',
  };

  const mockOnAttend = jest.fn();
  const mockOnRemoveAttend = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders event card correctly', () => {
    render(
      <EventCard 
        event={mockEvent} 
        isAttending={false} 
        onAttend={mockOnAttend} 
        onRemoveAttend={mockOnRemoveAttend} 
      />
    );

    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByText(/Test Location/)).toBeInTheDocument();
    expect(screen.getByText('Capacity:')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/Attendees:/)).toBeInTheDocument();
    expect(screen.getByText(/Created By:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Attend/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Show Description/i })).toBeInTheDocument();
  });

  it('calls onAttend when attend button is clicked', () => {
    render(
      <EventCard 
        event={mockEvent} 
        isAttending={false} 
        onAttend={mockOnAttend} 
        onRemoveAttend={mockOnRemoveAttend} 
      />
    );

    const attendButton = screen.getByRole('button', { name: /Attend/i });
    fireEvent.click(attendButton);

    expect(mockOnAttend).toHaveBeenCalledWith(mockEvent.id);
  });

  it('calls onRemoveAttend when remove attendance button is clicked', () => {
    render(
      <EventCard 
        event={mockEvent} 
        isAttending={true} 
        onAttend={mockOnAttend} 
        onRemoveAttend={mockOnRemoveAttend} 
      />
    );

    const removeButton = screen.getByRole('button', { name: /Remove Attendance/i });
    fireEvent.click(removeButton);

    expect(mockOnRemoveAttend).toHaveBeenCalledWith(mockEvent.id);
  });

  it('navigates to event details page when card is clicked', () => {
    render(
      <EventCard 
        event={mockEvent} 
        isAttending={false} 
        onAttend={mockOnAttend} 
        onRemoveAttend={mockOnRemoveAttend} 
      />
    );

    const card = screen.getByText(mockEvent.title).closest('.event-card');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith(`/events/${mockEvent.id}`);
  });

  it('shows modal with description when show description button is clicked', () => {
    render(
      <EventCard 
        event={mockEvent} 
        isAttending={false} 
        onAttend={mockOnAttend} 
        onRemoveAttend={mockOnRemoveAttend} 
      />
    );

    const showDescriptionButton = screen.getByRole('button', { name: /Show Description/i });
    fireEvent.click(showDescriptionButton);

    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    render(
      <EventCard 
        event={mockEvent} 
        isAttending={false} 
        onAttend={mockOnAttend} 
        onRemoveAttend={mockOnRemoveAttend} 
      />
    );

    
    const showDescriptionButton = screen.getByRole('button', { name: /Show Description/i });
    fireEvent.click(showDescriptionButton);

    
    expect(screen.getByText('Test description')).toBeInTheDocument();

    
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });
}); 