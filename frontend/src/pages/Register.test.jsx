import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';

describe('Register', () => {
  it('should render the registration form', () => {
    const { getByLabelText, getAllByText } = render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(getByLabelText('Username:')).toBeInTheDocument();
    expect(getByLabelText('Email:')).toBeInTheDocument();
    expect(getByLabelText('Password:')).toBeInTheDocument();
    expect(getAllByText('Register').length).toBeGreaterThan(0);
  });

  it('should validate email format', async () => {
    const { getByLabelText, getByText } = render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const emailInput = getByLabelText('Email:');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeInTheDocument();
    });
  });
});
