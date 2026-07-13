import { getTranslations } from 'next-intl/server';

import { signOutAction } from '@/lib/auth/actions';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getAuthClaims } from '@/lib/supabase/server';

import { HistoryNavButton } from './history-nav-button';
import { LanguageSwitcher } from './language-switcher';
import { HeaderNav } from './header-nav';

type GuestActionsProps = Readonly<{
  signInLabel: string;
  signUpLabel: string;
}>;

type AuthenticatedActionsProps = Readonly<{
  historyLabel: string;
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

function AuthenticatedActions({ historyLabel, name, signOutLabel }: AuthenticatedActionsProps) {
  return (
    <>
      {name && <span className="text-muted-foreground text-sm">{name}</span>}
      <HistoryNavButton label={historyLabel} />
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
              <AuthenticatedActions
                historyLabel={navigation('history')}
                name={name}
                signOutLabel={auth('signOut')}
              />
            ) : (
              <GuestActions signInLabel={auth('signIn')} signUpLabel={auth('signUp')} />
            )}
          </div>
        </div>
        <HeaderNav aboutLabel={navigation('about')} mainLabel={navigation('main')} />
      </div>
    </header>
  );
}
