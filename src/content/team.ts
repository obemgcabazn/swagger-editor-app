export type TeamMember = Readonly<{
  id: string;
  name: string;
  roleKey: 'teamLead' | 'developer';
  github?: string;
  email?: string;
  image: string;
}>;

export const teamMembers: TeamMember[] = [
  {
    id: 'aleksandr-khokhryakov',
    name: 'Aleksandr Khokhryakov',
    roleKey: 'developer',
    github: 'https://github.com/obemgcabazn',
    image: '/team/aleksandr.jpg',
  },
  {
    id: 'palina',
    name: 'Palina Yarkevich',
    roleKey: 'developer',
    github: 'https://github.com/ypaN73',
    image: '/team/polina.jpg',
  },
  {
    id: 'alex-freen',
    name: 'Alex Freen',
    roleKey: 'teamLead',
    github: 'https://github.com/freennnn',
    image: '/team/alex.jpg',
  },
];
