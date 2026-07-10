import { setRequestLocale } from 'next-intl/server';

import { SwaggerSection } from '@/components/swagger/swagger-section';

type HomeProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <SwaggerSection />;
}
