import '@testing-library/jest-dom';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import EventDetails from './EventDetails';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}));

jest.mock('axios');

describe('EventDetails', () => {
  it('should render event details', async () => {
    const mockEvent = {
      title: 'Test Event',
      date: '2025-05-01',
      location: 'Test City',
      description: 'This is a test event.',
      created_by_username: 'TestUser',
      attendees_count: 10,
      capacity: 100,
    };

    const mockComments = [
      {
        id: 1,
        text: 'Great event!',
        username: 'User1',
        userAvatar: 'avatar1.png',
        created_at: '2025-04-01T10:00:00Z',
      },
      {
        id: 2,
        text: 'Looking forward to it!',
        username: 'User2',
        userAvatar: 'avatar2.png',
        created_at: '2025-04-02T12:00:00Z',
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5001/api/events/1') {
        return Promise.resolve({ data: mockEvent });
      }
      if (url === 'http://localhost:5001/api/events/1/comments') {
        return Promise.resolve({ data: mockComments });
      }
      return Promise.reject(new Error('Not Found'));
    });

    const { getByText, getByRole, getAllByText } = render(
      <BrowserRouter>
        <EventDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(getByText((content) => content.includes('Test Event'))).toBeInTheDocument();
      expect(getAllByText((content) => content.includes('Test City')).length).toBeGreaterThan(0);
      expect(getByText((content) => content.includes('This is a test event.'))).toBeInTheDocument();
      expect(getByText(/TestUser/)).toBeInTheDocument();
      expect(getByText('Great event!')).toBeInTheDocument();
      expect(getByText('Looking forward to it!')).toBeInTheDocument();
    });
  });
});
