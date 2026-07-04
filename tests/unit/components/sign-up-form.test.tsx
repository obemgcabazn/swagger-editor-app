import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import { SignUpForm } from '@/app/[locale]/sign-up/sign-up-form';

describe('SignUpForm', () => {
  describe('rendering', () => {
    it('renders name, email, password, and passwordConfirm fields', () => {
      render(<SignUpForm />);
      expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('john@email.com')).toBeInTheDocument();
      expect(screen.getByLabelText('password')).toBeInTheDocument();
      expect(screen.getByLabelText('passwordConfirm')).toBeInTheDocument();
    });

    it('renders the submit button with the signUpButton translation key', () => {
      render(<SignUpForm />);
      expect(screen.getByRole('button', { name: 'signUpButton' })).toBeInTheDocument();
    });

    it('renders translated labels using the translation key identity mock', () => {
      render(<SignUpForm />);
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('passwordConfirm')).toBeInTheDocument();
    });
  });

  describe('validation (onChange mode)', () => {
    describe('name field', () => {
      it('shows name_too_short immediately when a single character is typed', async () => {
        const user = userEvent.setup();
        render(<SignUpForm />);
        await user.type(screen.getByPlaceholderText('John'), 'a');

        await waitFor(() => {
          expect(screen.getByText('name_too_short')).toBeInTheDocument();
        });
      });

      it('clears name_too_short once a two-character name is entered', async () => {
        const user = userEvent.setup();
        render(<SignUpForm />);
        await user.type(screen.getByPlaceholderText('John'), 'a');
        await waitFor(() => expect(screen.getByText('name_too_short')).toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('John'), 'b');
        await waitFor(() => {
          expect(screen.queryByText('name_too_short')).not.toBeInTheDocument();
        });
      });
    });

    describe('email field', () => {
      it('shows invalid_email immediately when an invalid value is typed', async () => {
        const user = userEvent.setup();
        render(<SignUpForm />);
        await user.type(screen.getByPlaceholderText('john@email.com'), 'notanemail');

        await waitFor(() => {
          expect(screen.getByText('invalid_email')).toBeInTheDocument();
        });
      });
    });

    describe('password field', () => {
      it('shows password_too_short for a short password', async () => {
        const user = userEvent.setup();
        render(<SignUpForm />);
        await user.type(screen.getByLabelText('password'), 'aB1!');

        await waitFor(() => {
          expect(screen.getByText('password_too_short')).toBeInTheDocument();
        });
      });

      it('shows password_needs_letter when no letter is present', async () => {
        const user = userEvent.setup();
        render(<SignUpForm />);
        await user.type(screen.getByLabelText('password'), '12345678!');

        await waitFor(() => {
          expect(screen.getByText('password_needs_letter')).toBeInTheDocument();
        });
      });

      it('shows password_needs_digit when no digit is present', async () => {
        const user = userEvent.setup();
        render(<SignUpForm />);
        await user.type(screen.getByLabelText('password'), 'abcdefgh!');

        await waitFor(() => {
          expect(screen.getByText('password_needs_digit')).toBeInTheDocument();
        });
      });

      it('shows password_needs_special when no special character is present', async () => {
        const user = userEvent.setup();
        render(<SignUpForm />);
        await user.type(screen.getByLabelText('password'), 'abcde123');

        await waitFor(() => {
          expect(screen.getByText('password_needs_special')).toBeInTheDocument();
        });
      });

      it('clears password errors once all constraints are satisfied', async () => {
        const user = userEvent.setup();
        render(<SignUpForm />);
        await user.type(screen.getByLabelText('password'), 'aB1!');
        await waitFor(() => expect(screen.getByText('password_too_short')).toBeInTheDocument());

        await user.clear(screen.getByLabelText('password'));
        await user.type(screen.getByLabelText('password'), 'Password1!');
        await waitFor(() => {
          expect(screen.queryByText('password_too_short')).not.toBeInTheDocument();
          expect(screen.queryByText('password_needs_letter')).not.toBeInTheDocument();
          expect(screen.queryByText('password_needs_digit')).not.toBeInTheDocument();
          expect(screen.queryByText('password_needs_special')).not.toBeInTheDocument();
        });
      });
    });

    describe('passwordConfirm field', () => {
      it('shows password_dont_match when confirmation differs from password', async () => {
        const user = userEvent.setup();
        render(<SignUpForm />);
        // password must be fully valid for the refine to run
        await user.type(screen.getByLabelText('password'), 'Password1!');
        await user.type(screen.getByLabelText('passwordConfirm'), 'Different1!');

        await waitFor(() => {
          expect(screen.getByText('password_dont_match')).toBeInTheDocument();
        });
      });

      it('clears password_dont_match once the confirmation matches', async () => {
        const user = userEvent.setup();
        render(<SignUpForm />);
        await user.type(screen.getByLabelText('password'), 'Password1!');
        await user.type(screen.getByLabelText('passwordConfirm'), 'Different1!');
        await waitFor(() => expect(screen.getByText('password_dont_match')).toBeInTheDocument());

        await user.clear(screen.getByLabelText('passwordConfirm'));
        await user.type(screen.getByLabelText('passwordConfirm'), 'Password1!');
        await waitFor(() => {
          expect(screen.queryByText('password_dont_match')).not.toBeInTheDocument();
        });
      });
    });

    it('shows no errors when all fields contain valid data and submit is clicked', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);
      await user.type(screen.getByPlaceholderText('John'), 'Ada');
      await user.type(screen.getByPlaceholderText('john@email.com'), 'ada@example.com');
      await user.type(screen.getByLabelText('password'), 'Password1!');
      await user.type(screen.getByLabelText('passwordConfirm'), 'Password1!');
      await user.click(screen.getByRole('button', { name: 'signUpButton' }));

      await waitFor(() => {
        expect(screen.queryByText('name_too_short')).not.toBeInTheDocument();
        expect(screen.queryByText('invalid_email')).not.toBeInTheDocument();
        expect(screen.queryByText('password_too_short')).not.toBeInTheDocument();
        expect(screen.queryByText('password_dont_match')).not.toBeInTheDocument();
      });
    });
  });
});
