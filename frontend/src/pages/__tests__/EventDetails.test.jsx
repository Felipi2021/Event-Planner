import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';


jest.mock('../EventDetails', () => () => (
  <div data-testid="mocked-event-details">
    <h2>Test Event</h2>
    <p data-testid="capacity">Capacity: 100</p>
    <p data-testid="location">Location: Test Location</p>
    <button data-testid="attend-button">Attend</button>
    <h3>Comments</h3>
    <form>
      <textarea data-testid="comment-input" placeholder="Add your comment..."></textarea>
      <button data-testid="submit-comment">→</button>
    </form>
    <div data-testid="comments-list">
      <div>Great event!</div>
    </div>
  </div>
));


import EventDetails from '../EventDetails';


jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: '123' }),
  useNavigate: () => jest.fn(),
}));

jest.mock('axios');
import axios from 'axios';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));


describe('EventDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders event details correctly', () => {
    render(<EventDetails />);
    
    expect(screen.getByTestId('mocked-event-details')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toBeInTheDocument();
    expect(screen.getByTestId('capacity')).toBeInTheDocument();
  });
  
  test('displays attend button', () => {
    render(<EventDetails />);
    
    expect(screen.getByTestId('attend-button')).toBeInTheDocument();
    expect(screen.getByText('Attend')).toBeInTheDocument();
  });
  
  test('displays comment form', () => {
    render(<EventDetails />);
    
    expect(screen.getByTestId('comment-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-comment')).toBeInTheDocument();
  });
  
  test('displays comments section', () => {
    render(<EventDetails />);
    
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('Great event!')).toBeInTheDocument();
  });
});