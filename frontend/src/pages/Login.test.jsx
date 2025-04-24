import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

describe('Login', () => {
  it('should render login form', () => {
    const { getByLabelText } = render(
      <BrowserRouter>
        <Login onLogin={jest.fn()} />
      </BrowserRouter>
    );
    expect(getByLabelText('Email:')).toBeInTheDocument();
    expect(getByLabelText('Password:')).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const { getByLabelText, getByText } = render(
      <BrowserRouter>
        <Login onLogin={jest.fn()} />
      </BrowserRouter>
    );
    const emailInput = getByLabelText('Email:');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('should pass a dummy test', () => {
    expect(true).toBe(true);
  });
});
