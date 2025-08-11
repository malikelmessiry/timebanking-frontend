import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as api from '../services/api'; // Adjust the path if needed
import Dashboard from './Dashboard';
import { vi } from 'vitest';

// Mock localStorage before each test
beforeEach(() => {
  window.localStorage.setItem('authToken', 'test-token');
});

// Mock API calls
beforeEach(() => {
  vi.spyOn(api, 'getUserProfile').mockResolvedValue({
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    username: 'testuser',
    time_credits: 10,
  });
  vi.spyOn(api, 'getAllServices').mockResolvedValue([]);
  vi.spyOn(api, 'getServicesByOwner').mockResolvedValue([]);
  vi.spyOn(api, 'getBookings').mockResolvedValue([]);
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe('Dashboard', () => {
  it('renders the Dashboard page', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    // Wait for the dashboard to load and check for a known heading or element
    await waitFor(() =>
      expect(
        screen.getByText(/timebank dashboard/i)
      ).toBeInTheDocument()
    );
  });

  it('shows the services tab when clicked', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    // Wait for the user to load
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /timebank dashboard/i })).toBeInTheDocument()
    );
    // Click the "My Services" tab
    screen.getByRole('button', { name: /my services/i }).click();
    // Wait for the tab content to appear
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /my services/i })).toBeInTheDocument()
    );
  });
});