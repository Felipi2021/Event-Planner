import '@testing-library/jest-dom';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Events from './Events';

jest.mock('axios');

describe('Events', () => {
  it('should render a list of events', async () => {
    const mockEvents = [
      { id: 1, title: 'Event 1', date: '2025-05-01', location: 'City 1' },
      { id: 2, title: 'Event 2', date: '2025-06-01', location: 'City 2' },
    ];

    axios.get.mockResolvedValueOnce({ data: mockEvents });

    const { getByText, queryByText } = render(
      <BrowserRouter>
        <Events />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(getByText((content) => content.includes('Event 1'))).toBeInTheDocument();
      expect(getByText((content) => content.includes('City 1'))).toBeInTheDocument();
      expect(getByText((content) => content.includes('Event 2'))).toBeInTheDocument();
      expect(getByText((content) => content.includes('City 2'))).toBeInTheDocument();
    });

    expect(queryByText('Nonexistent Event')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    const { getByText } = render(
      <BrowserRouter>
        <Events />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(getByText((content) => content.includes('Failed to load events.'))).toBeInTheDocument();
    });
  });
});
