import '@testing-library/jest-dom'; 
import React from 'react';
import { render } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test Child</div>
      </ErrorBoundary>
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('should catch errors and display fallback UI', () => {
    const ProblematicComponent = () => {
      throw new Error('Test Error');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong.')).toBeInTheDocument();
  });
});
