import '@testing-library/jest-dom'; 
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventCard from './EventCard';

describe('EventCard', () => {
  const mockEvent = {
    id: 1,
    title: 'Test Event',
    date: '2025-05-01',
    location: 'Test City',
    capacity: 100,
    attendees_count: 10,
    created_by_username: 'TestUser',
    description: 'Test Description',
    image: 'test-image.jpg',
  };

  it('should render event details', () => {
    const { getByText } = render(
      <BrowserRouter>
        <EventCard event={mockEvent} isAttending={false} />
      </BrowserRouter>
    );

    expect(getByText('Test Event')).toBeInTheDocument();
    expect(getByText('Test City')).toBeInTheDocument();
    expect(getByText('100')).toBeInTheDocument();
  });

  it('should call onAttend when Attend button is clicked', () => {
    const onAttend = jest.fn();
    const { getByText } = render(
      <BrowserRouter>
        <EventCard event={mockEvent} isAttending={false} onAttend={onAttend} />
      </BrowserRouter>
    );

    fireEvent.click(getByText('Attend'));
    expect(onAttend).toHaveBeenCalledWith(mockEvent.id);
  });

  it('should call onRemoveAttend when Remove Attendance button is clicked', () => {
    const onRemoveAttend = jest.fn();
    const { getByText } = render(
      <BrowserRouter>
        <EventCard event={mockEvent} isAttending={true} onRemoveAttend={onRemoveAttend} />
      </BrowserRouter>
    );

    fireEvent.click(getByText('Remove Attendance'));
    expect(onRemoveAttend).toHaveBeenCalledWith(mockEvent.id);
  });

  it('should pass a dummy test', () => {
    expect(true).toBe(true);
  });
});
