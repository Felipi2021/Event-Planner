import '@testing-library/jest-dom';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Profile from './Profile';

jest.mock('axios');

describe('Profile', () => {
  it('should render user profile details', async () => {
    const mockUser = {
      username: 'TestUser',
      email: 'testuser@example.com',
      description: 'This is a test user.',
      image: 'test-image.jpg',
    };

    axios.get.mockResolvedValueOnce({ data: mockUser });

    const { getByText, getByAltText } = render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(getByText('TestUser')).toBeInTheDocument();
      expect(getByText('testuser@example.com')).toBeInTheDocument();
      expect(getByText('This is a test user.')).toBeInTheDocument();
      expect(getByAltText('Profile')).toBeInTheDocument();
    });
  });
});
