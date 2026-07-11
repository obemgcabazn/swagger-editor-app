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

vi.mock('@/lib/auth/actions', () => ({
  signUpAction: vi.fn().mockResolvedValue(undefined),
}));

import { signUpAction } from '@/lib/auth/actions';
import { SignUpForm } from '@/app/[locale]/(auth)/sign-up/sign-up-form';

const mockSignUpAction = vi.mocked(signUpAction);

const VALID_SIGN_UP = {
  name: 'Ada',
  email: 'ada@example.com',
  password: 'Password1!',
  passwordConfirm: 'Password1!',
};

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('John'), VALID_SIGN_UP.name);
  await user.type(screen.getByPlaceholderText('john@email.com'), VALID_SIGN_UP.email);
  await user.type(screen.getByLabelText('password'), VALID_SIGN_UP.password);
  await user.type(screen.getByLabelText('passwordConfirm'), VALID_SIGN_UP.passwordConfirm);
}

describe('SignUpForm', () => {
  afterEach(() => {
    mockSignUpAction.mockReset().mockResolvedValue(undefined as never);
    mockReplace.mockReset();
    mockRefresh.mockReset();
  });

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
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: 'signUpButton' }));

      await waitFor(() => {
        expect(screen.queryByText('name_too_short')).not.toBeInTheDocument();
        expect(screen.queryByText('invalid_email')).not.toBeInTheDocument();
        expect(screen.queryByText('password_too_short')).not.toBeInTheDocument();
        expect(screen.queryByText('password_dont_match')).not.toBeInTheDocument();
      });
    });
  });

  describe('server submission', () => {
    it('shows the returned error as a root alert when signUpAction fails', async () => {
      mockSignUpAction.mockResolvedValue({ error: 'user_already_exists' });
      const user = userEvent.setup();
      render(<SignUpForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: 'signUpButton' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('user_already_exists');
      });
    });

    it('shows validation_error when the server rejects the payload', async () => {
      mockSignUpAction.mockResolvedValue({ error: 'validation_error' });
      const user = userEvent.setup();
      render(<SignUpForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: 'signUpButton' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('validation_error');
      });
    });

    it('clears a previous server error once resubmitted', async () => {
      mockSignUpAction.mockResolvedValueOnce({ error: 'user_already_exists' });
      const user = userEvent.setup();
      render(<SignUpForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: 'signUpButton' }));
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

      mockSignUpAction.mockResolvedValueOnce({ success: true });
      await user.click(screen.getByRole('button', { name: 'signUpButton' }));

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('calls signUpAction with the parsed payload and navigates home on success', async () => {
      mockSignUpAction.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      render(<SignUpForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: 'signUpButton' }));

      await waitFor(() => {
        expect(mockSignUpAction).toHaveBeenCalledWith(VALID_SIGN_UP);
        expect(mockReplace).toHaveBeenCalledWith('/');
        expect(mockRefresh).toHaveBeenCalledOnce();
      });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('disables submit and shows pending label while signUpAction is in flight', async () => {
      let resolveAction!: (value: { success: true }) => void;
      mockSignUpAction.mockReturnValue(
        new Promise((resolve) => {
          resolveAction = resolve;
        })
      );
      const user = userEvent.setup();
      render(<SignUpForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: 'signUpButton' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'signUpPending' })).toBeDisabled();
      });

      resolveAction({ success: true });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'signUpButton' })).not.toBeDisabled();
      });
    });
  });
});
