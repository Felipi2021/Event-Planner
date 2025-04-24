import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

describe('Navbar', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true,
    });
  });

  it('should render links for logged-out users', () => {
    const { getByText } = render(
      <BrowserRouter>
        <Navbar isLoggedIn={false} />
      </BrowserRouter>
    );

    expect(getByText('Login')).toBeInTheDocument();
    expect(getByText('Register')).toBeInTheDocument();
  });

  it('should render profile image and logout button for logged-in users', () => {
    const { getByText, getByAltText } = render(
      <BrowserRouter>
        <Navbar isLoggedIn={true} profileImage="test-image.jpg" />
      </BrowserRouter>
    );

    expect(getByText('Logout')).toBeInTheDocument();
    expect(getByAltText('Profile')).toBeInTheDocument();
  });

  it('should call handleLogout when Logout button is clicked', () => {
    const { getByText } = render(
      <BrowserRouter>
        <Navbar isLoggedIn={true} />
      </BrowserRouter>
    );

    fireEvent.click(getByText('Logout'));
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should pass a dummy test', () => {
    expect(true).toBe(true);
  });
});
