import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

describe('Home', () => {
  it('renders the hero section', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    // Adjust the text to match your actual hero title
    expect(
      screen.getByText(/welcome to timebank/i)
    ).toBeInTheDocument();
  });

  it('renders the call-to-action button', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    // Adjust the text to match your CTA button
    expect(
      screen.getByRole('link', { name: /join the timebank/i })
    ).toBeInTheDocument();
  });
});