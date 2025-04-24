import '@testing-library/jest-dom'; 
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

describe('Home', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should render welcome message', () => {
    const { getByText } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(getByText('Welcome to Event Planner')).toBeInTheDocument();
  });

  it('should update city when search is submitted', () => {
    const { getByPlaceholderText, getByText } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const input = getByPlaceholderText('Enter city');
    const button = getByText('Search');

    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.click(button);

    expect(getByText('Weather in New York')).toBeInTheDocument();
  });

  it('should pass a dummy test', () => {
    expect(true).toBe(true);
  });
});
