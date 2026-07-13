import { getTranslations } from 'next-intl/server';

import { signOutAction } from '@/lib/auth/actions';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getAuthClaims } from '@/lib/supabase/server';

import { LanguageSwitcher } from './language-switcher';

type GuestActionsProps = Readonly<{
  signInLabel: string;
  signUpLabel: string;
}>;

type AuthenticatedActionsProps = Readonly<{
  name: string | null;
  signOutLabel: string;
}>;

function GuestActions({ signInLabel, signUpLabel }: GuestActionsProps) {
  return (
    <>
      <Link className={buttonVariants({ variant: 'ghost', size: 'sm' })} href="/sign-in">
        {signInLabel}
      </Link>
      <Link className={buttonVariants({ size: 'sm' })} href="/sign-up">
        {signUpLabel}
      </Link>
    </>
  );
}

function AuthenticatedActions({ name, signOutLabel }: AuthenticatedActionsProps) {
  return (
    <>
      {name && <span className="text-muted-foreground text-sm">{name}</span>}
      <form action={signOutAction}>
        <button className={buttonVariants({ size: 'sm' })} type="submit">
          {signOutLabel}
        </button>
      </form>
    </>
  );
}

async function getHeaderAuthState() {
  const claims = await getAuthClaims();
  if (!claims) {
    return { isAuthenticated: false as const, name: null };
  }

  const name = (claims.user_metadata?.name as string | undefined) ?? claims.email ?? null;
  return { isAuthenticated: true as const, name };
}

export async function Header() {
  const navigation = await getTranslations('Navigation');
  const auth = await getTranslations('Auth');
  const { isAuthenticated, name } = await getHeaderAuthState();

  return (
    <header className="sticky-header">
      <div className="sticky-header__inner app-container flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <Link className="text-foreground text-base font-semibold tracking-tight" href="/">
            {navigation('brand')}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher label={navigation('language')} />
            {isAuthenticated ? (
              <AuthenticatedActions name={name} signOutLabel={auth('signOut')} />
            ) : (
              <GuestActions signInLabel={auth('signIn')} signUpLabel={auth('signUp')} />
            )}
          </div>
        </div>
        <nav aria-label="Primary" className="flex items-center gap-4 text-sm">
          <Link className="text-muted-foreground hover:text-foreground transition-colors" href="/">
            {navigation('main')}
          </Link>
          {isAuthenticated ? (
            <Link
              className="text-muted-foreground hover:text-foreground transition-colors"
              href="/history"
            >
              {navigation('history')}
            </Link>
          ) : null}
          <Link
            className="text-muted-foreground hover:text-foreground transition-colors"
            href="/about"
          >
            {navigation('about')}
          </Link>
        </nav>
      </div>
    </header>
  );
}
