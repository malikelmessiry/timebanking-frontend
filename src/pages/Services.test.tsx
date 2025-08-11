import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as api from '../services/api'; 
import Services from './Services';
import { vi } from 'vitest';

beforeEach(() => {
  window.localStorage.setItem('authToken', 'test-token');
});

// Mock API calls
beforeEach(() => {
  vi.spyOn(api, 'getAllServices').mockResolvedValue([
    {
      id: 1,
      name: 'Test Service',
      description: 'A test service',
      tags: ['test'],
      category: ['education'],
      credit_required: 5,
      service_type: 'virtual',
      created_at: new Date().toISOString(),
      zip_code: '12345',
      city: 'Testville',
      average_rating: 4.5,
      is_available: true,
      total_sessions: 10,
      remaining_sessions: 5,
      owner: 1,
      owner_email: 'owner@test.com',
      latitude: 0,
      longitude: 0,
      customer_reviews: [],
    },
  ]);
  vi.spyOn(api, 'getServiceById').mockResolvedValue(null);
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe('Services Page', () => {
  it('renders the Discover Services header', async () => {
    render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /discover services/i })).toBeInTheDocument()
    );
  });

  it('shows the total services stat', async () => {
    render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByText('Total Services')).toBeInTheDocument()
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders a service card with correct info', async () => {
    render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByText('Test Service')).toBeInTheDocument()
    );
  });

  it('shows the error state and try again button when API fails', async () => {
    // Mock getAllServices to throw an error for this test
    vi.spyOn(api, 'getAllServices').mockRejectedValueOnce(new Error('API failed'));

    render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/try again/i)).toBeInTheDocument()
    );
  });

});