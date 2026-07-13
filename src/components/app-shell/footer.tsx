import { getTranslations } from 'next-intl/server';

import { FooterNav } from './footer-nav';

export async function Footer() {
  const navigation = await getTranslations('Navigation');
  const footer = await getTranslations('Footer');

  return (
    <footer className="border-border/60 bg-muted/30 border-t">
      <div className="app-container text-muted-foreground flex flex-col gap-4 py-6 text-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <FooterNav aboutLabel={navigation('about')} mainLabel={navigation('main')} />
          <p>{footer('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
