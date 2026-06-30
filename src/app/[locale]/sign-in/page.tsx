import { SignInForm } from './sign-in-form';

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Sign In</h1>
      <SignInForm />
    </div>
  );
}
