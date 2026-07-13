import { getTranslations, setRequestLocale } from 'next-intl/server';

import { TeamMemberCard } from '@/components/about/team-member-card';
import { aboutResources, technologies } from '@/content/about-resources';
import { teamMembers } from '@/content/team';

type AboutPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('AboutPage');

  return (
    <main className="bg-background flex flex-1 px-6 py-16">
      <section className="mx-auto w-full max-w-4xl space-y-12">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm font-medium">{t('eyebrow')}</p>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground leading-7">{t('projectDescription')}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {t('teamTitle')}
          </h2>
          <p className="text-muted-foreground text-sm leading-6">{t('teamDescription')}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                githubLabel={t('githubLink')}
                member={member}
                roleLabel={t(`roles.${member.roleKey}`)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {t('techTitle')}
          </h2>
          <p className="text-muted-foreground text-sm leading-6">{t('techDescription')}</p>
          <ul className="flex flex-wrap gap-2">
            {technologies.map((technology) => (
              <li key={technology}>
                <span className="bg-secondary text-secondary-foreground inline-flex rounded-full px-3 py-1 text-sm font-medium">
                  {technology}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {t('courseTitle')}
          </h2>
          <article className="border-border bg-card text-card-foreground rounded-xl border p-5">
            <p className="text-muted-foreground text-sm leading-6">{t('courseDescription')}</p>
            <a
              className="text-foreground mt-4 inline-flex text-sm font-medium underline-offset-4 hover:underline"
              href="https://rs.school/courses/react"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t('courseLink')}
            </a>
          </article>
        </div>

        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {t('resourcesTitle')}
          </h2>
          <ul className="border-border bg-card divide-border divide-y rounded-xl border">
            {aboutResources.map((resource) => (
              <li key={resource.id}>
                <a
                  className="text-foreground hover:bg-muted/50 flex items-center justify-between px-5 py-4 text-sm font-medium transition-colors"
                  href={resource.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t(resource.labelKey)}
                  <span aria-hidden className="text-muted-foreground">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
