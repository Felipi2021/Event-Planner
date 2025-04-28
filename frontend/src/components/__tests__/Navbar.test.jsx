import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../Navbar';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location.reload
const reloadFn = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    reload: reloadFn,
  },
  writable: true
});

describe('Navbar', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(ui, { wrapper: BrowserRouter });
  };

  it('renders navbar correctly when user is logged in', () => {
    renderWithRouter(<Navbar isLoggedIn={true} profileImage="test-image.jpg" />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Create Event')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByAltText('Profile')).toBeInTheDocument();
  });

  it('renders navbar correctly when user is not logged in', () => {
    renderWithRouter(<Navbar isLoggedIn={false} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Create Event')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByAltText('Profile')).not.toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    renderWithRouter(<Navbar isLoggedIn={true} />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('userId');
    expect(toast.success).toHaveBeenCalledWith('You have been logged out successfully!');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(reloadFn).toHaveBeenCalled();
  });

  it('navigates to profile page when profile image is clicked', () => {
    localStorageMock.getItem.mockReturnValue('1');
    
    renderWithRouter(<Navbar isLoggedIn={true} profileImage="test-image.jpg" />);

    const profileImage = screen.getByAltText('Profile');
    fireEvent.click(profileImage);

    expect(localStorageMock.getItem).toHaveBeenCalledWith('userId');
    expect(mockNavigate).toHaveBeenCalledWith('/profile/1');
  });

  it('shows error toast when profile click happens with no userId', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    renderWithRouter(<Navbar isLoggedIn={true} profileImage="test-image.jpg" />);

    const profileImage = screen.getByAltText('Profile');
    fireEvent.click(profileImage);

    expect(localStorageMock.getItem).toHaveBeenCalledWith('userId');
    expect(toast.error).toHaveBeenCalledWith('Failed to load profile data.');
  });

  it('toggles menu when hamburger is clicked', () => {
    renderWithRouter(<Navbar isLoggedIn={false} />);

    const navbar = document.querySelector('.navbar');
    expect(navbar).not.toHaveClass('active');

    const hamburger = document.querySelector('.hamburger');
    fireEvent.click(hamburger);

    expect(navbar).toHaveClass('active');

    fireEvent.click(hamburger);
    expect(navbar).not.toHaveClass('active');
  });

  it('closes menu when a link is clicked', () => {
    renderWithRouter(<Navbar isLoggedIn={false} />);

    // First open the menu
    const hamburger = document.querySelector('.hamburger');
    fireEvent.click(hamburger);

    // Menu should be open
    const navbar = document.querySelector('.navbar');
    expect(navbar).toHaveClass('active');

    // Click a link
    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);

    // Menu should be closed
    expect(navbar).not.toHaveClass('active');
  });
}); 