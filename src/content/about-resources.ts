export type AboutResource = Readonly<{
  id: string;
  href: string;
  labelKey: string;
}>;

export const aboutResources: AboutResource[] = [
  {
    id: 'rs-school',
    href: 'https://rs.school/',
    labelKey: 'resourceRsSchool',
  },
  {
    id: 'rs-school-react',
    href: 'https://rs.school/courses/reactjs',
    labelKey: 'resourceRsSchoolReact',
  },
  {
    id: 'openapi',
    href: 'https://www.openapis.org/',
    labelKey: 'resourceOpenApi',
  },
  {
    id: 'swagger',
    href: 'https://swagger.io/tools/swagger-editor/',
    labelKey: 'resourceSwaggerEditor',
  },
];

export const technologies = [
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'next-intl',
  'shadcn/ui',
  'Supabase',
  'Monaco Editor',
  'Playwright',
  'Vitest',
] as const;
