
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModeToggle } from '../theme-mode-toggle';
import { useTheme, ThemeProvider } from 'next-themes';

jest.mock('next-themes', () => ({
  ...jest.requireActual('next-themes'),
  useTheme: jest.fn(),
}));

describe('ModeToggle', () => {
  it('renders the toggle button', () => {
    (useTheme as jest.Mock).mockReturnValue({ setTheme: jest.fn() });
    render(
      <ThemeProvider attribute="class">
        <ModeToggle />
      </ThemeProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('opens the dropdown menu on click', async () => {
    (useTheme as jest.Mock).mockReturnValue({ setTheme: jest.fn() });
    render(
      <ThemeProvider attribute="class">
        <ModeToggle />
      </ThemeProvider>
    );
    const button = screen.getByRole('button');
    await userEvent.click(button);
    const lightThemeOption = await screen.findByText('Light');
    expect(lightThemeOption).toBeInTheDocument();
  });

  it('calls setTheme when a theme option is clicked', async () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ setTheme });
    render(
      <ThemeProvider attribute="class">
        <ModeToggle />
      </ThemeProvider>
    );
    const button = screen.getByRole('button');
    await userEvent.click(button);
    const lightThemeOption = await screen.findByText('Light');
    await userEvent.click(lightThemeOption);
    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
