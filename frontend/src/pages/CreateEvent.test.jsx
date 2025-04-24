import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateEvent from './CreateEvent';

describe('CreateEvent', () => {
  it('should render the create event form', () => {
    const { getByLabelText, getByRole } = render(
      <BrowserRouter>
        <CreateEvent />
      </BrowserRouter>
    );

    expect(getByLabelText('Title:')).toBeInTheDocument();
    expect(getByLabelText('Date:')).toBeInTheDocument();
    expect(getByLabelText('Location:')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Create Event' })).toBeInTheDocument();
  });

  it('should handle form submission', () => {
    const mockCreateEvent = jest.fn();
    const { getByLabelText, getByRole } = render(
      <BrowserRouter>
        <CreateEvent onCreateEvent={mockCreateEvent} />
      </BrowserRouter>
    );

    fireEvent.change(getByLabelText('Title:'), { target: { value: 'New Event' } });
    fireEvent.change(getByLabelText('Date:'), { target: { value: '2025-05-01' } });
    fireEvent.change(getByLabelText('Location:'), { target: { value: 'Test City' } });

    fireEvent.click(getByRole('button', { name: 'Create Event' }));

    expect(mockCreateEvent).toHaveBeenCalledWith({
      title: 'New Event',
      date: '2025-05-01',
      location: 'Test City',
    });
  });
});
