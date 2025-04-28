import React from 'react';
import { render } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';


const ThrowError = () => {
  throw new Error('Test error');
};


const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('renders fallback UI when there is an error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('calls componentDidCatch when an error occurs', () => {
    
    const spy = jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch');
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(spy).toHaveBeenCalled();
    
    
    spy.mockRestore();
  });
}); 