import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const mockReplace = vi.fn();
const mockRefresh = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

const mockSignInAction = vi.fn();
vi.mock('@/lib/auth/actions', () => ({
  signInAction: (...args: unknown[]) => mockSignInAction(...args),
}));

import { SignInForm } from '@/app/[locale]/(auth)/sign-in/sign-in-form';

describe('SignInForm', () => {
  afterEach(() => {
    mockSignInAction.mockReset();
    mockReplace.mockReset();
    mockRefresh.mockReset();
  });

  describe('rendering', () => {
    it('renders the email input', () => {
      render(<SignInForm />);
      expect(screen.getByPlaceholderText('john@email.com')).toBeInTheDocument();
    });

    it('renders the password input', () => {
      render(<SignInForm />);
      expect(screen.getByLabelText('password')).toBeInTheDocument();
    });

    it('renders the submit button with the signInButton translation key', () => {
      render(<SignInForm />);
      expect(screen.getByRole('button', { name: 'signInButton' })).toBeInTheDocument();
    });

    it('renders the password label using the translation key', () => {
      render(<SignInForm />);
      expect(screen.getByText('password')).toBeInTheDocument();
    });
  });

  describe('validation (onSubmit mode)', () => {
    it('does not show validation errors before submission', () => {
      render(<SignInForm />);
      expect(screen.queryByText('invalid_email')).not.toBeInTheDocument();
      expect(screen.queryByText('password_required')).not.toBeInTheDocument();
    });

    it('shows invalid_email and password_required after submitting empty form', async () => {
      const user = userEvent.setup();
      render(<SignInForm />);
      await user.click(screen.getByRole('button', { name: 'signInButton' }));

      await waitFor(() => {
        expect(screen.getByText('invalid_email')).toBeInTheDocument();
        expect(screen.getByText('password_required')).toBeInTheDocument();
      });
    });

    it('shows only password_required (no invalid_email) when a valid email is typed and submitted', async () => {
      const user = userEvent.setup();
      render(<SignInForm />);
      await user.type(screen.getByPlaceholderText('john@email.com'), 'valid@example.com');
      await user.click(screen.getByRole('button', { name: 'signInButton' }));

      await waitFor(() => {
        expect(screen.queryByText('invalid_email')).not.toBeInTheDocument();
        expect(screen.getByText('password_required')).toBeInTheDocument();
      });
    });
  });

  describe('server submission', () => {
    it('shows the returned error as a root alert when signInAction fails', async () => {
      mockSignInAction.mockResolvedValue({ error: 'invalid_credentials' });
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.type(screen.getByPlaceholderText('john@email.com'), 'ada@example.com');
      await user.type(screen.getByLabelText('password'), 'wrong-password');
      await user.click(screen.getByRole('button', { name: 'signInButton' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('invalid_credentials');
      });
      expect(mockSignInAction).toHaveBeenCalledWith({
        email: 'ada@example.com',
        password: 'wrong-password',
      });
    });

    it('shows validation_error when the server rejects the payload', async () => {
      mockSignInAction.mockResolvedValue({ error: 'validation_error' });
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.type(screen.getByPlaceholderText('john@email.com'), 'ada@example.com');
      await user.type(screen.getByLabelText('password'), 'correct-password');
      await user.click(screen.getByRole('button', { name: 'signInButton' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('validation_error');
      });
    });

    it('navigates home when signInAction succeeds', async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.type(screen.getByPlaceholderText('john@email.com'), 'ada@example.com');
      await user.type(screen.getByLabelText('password'), 'correct-password');
      await user.click(screen.getByRole('button', { name: 'signInButton' }));

      await waitFor(() => {
        expect(mockSignInAction).toHaveBeenCalledOnce();
        expect(mockReplace).toHaveBeenCalledWith('/');
        expect(mockRefresh).toHaveBeenCalledOnce();
      });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('disables submit and shows pending label while signInAction is in flight', async () => {
      let resolveAction!: (value: { success: true }) => void;
      mockSignInAction.mockReturnValue(
        new Promise((resolve) => {
          resolveAction = resolve;
        })
      );
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.type(screen.getByPlaceholderText('john@email.com'), 'ada@example.com');
      await user.type(screen.getByLabelText('password'), 'correct-password');
      await user.click(screen.getByRole('button', { name: 'signInButton' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'signInPending' })).toBeDisabled();
      });

      resolveAction({ success: true });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'signInButton' })).not.toBeDisabled();
      });
    });
  });
});
