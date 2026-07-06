import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const mockSignInAction = vi.fn();
vi.mock('@/app/[locale]/(auth)/actions', () => ({
  signInAction: (...args: unknown[]) => mockSignInAction(...args),
}));

import { SignInForm } from '@/app/[locale]/sign-in/sign-in-form';

describe('SignInForm', () => {
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
    afterEach(() => {
      mockSignInAction.mockReset();
    });

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

    it('shows no root alert when signInAction succeeds', async () => {
      mockSignInAction.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.type(screen.getByPlaceholderText('john@email.com'), 'ada@example.com');
      await user.type(screen.getByLabelText('password'), 'correct-password');
      await user.click(screen.getByRole('button', { name: 'signInButton' }));

      await waitFor(() => expect(mockSignInAction).toHaveBeenCalledOnce());
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
