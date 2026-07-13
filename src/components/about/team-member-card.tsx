import Image from 'next/image';
import { Mail } from 'lucide-react';

import type { TeamMember } from '@/content/team';

type TeamMemberCardProps = Readonly<{
  member: TeamMember;
  roleLabel: string;
  githubLabel: string;
}>;

export function TeamMemberCard({ member, roleLabel, githubLabel }: TeamMemberCardProps) {
  return (
    <article className="border-border bg-card text-card-foreground flex flex-col items-center rounded-xl border p-6 text-center">
      <Image
        alt={member.name}
        className="bg-muted size-24 rounded-full object-cover"
        height={96}
        src={member.image}
        width={96}
      />
      <h3 className="mt-4 text-lg font-semibold">{member.name}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{roleLabel}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {member.github ? (
          <a
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            href={member.github}
            rel="noopener noreferrer"
            target="_blank"
          >
            {githubLabel}
          </a>
        ) : null}
        {member.email ? (
          <a
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
            href={`mailto:${member.email}`}
          >
            <Mail aria-hidden className="size-4" />
            {member.email}
          </a>
        ) : null}
      </div>
    </article>
  );
}
