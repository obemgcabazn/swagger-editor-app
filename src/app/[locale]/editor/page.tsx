import { setRequestLocale } from 'next-intl/server';

import { SwaggerSection } from '@/components/swagger/swagger-section';

type EditorPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function EditorPage({ params }: EditorPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <SwaggerSection />;
}
