// The local profile record shared by Messenger, Zune and People.
export const profile = {
  name: 'Alexander Forbes-Reed',
  initials: 'AF',
  location: 'Amsterdam, NL',
  role: 'Founding Engineer',
  company: {name: 'langwatch', url: 'https://langwatch.ai'},
  bio: 'i love working with and on apis, reverse engineering, observability, event-driven systems, and also ai is okay too i guess.',
  stack: 'TypeScript · React · Go · Claude (lol) · Postgres · MongoDB · ClickHouse',
  socials: [
    {label: 'GitHub', icon: 'gh', href: 'https://github.com/0xdeafcafe'},
    {label: 'LinkedIn', icon: 'in', href: 'https://linkedin.com/in/0xdeafcafe'},
    {label: 'Twitter / X', icon: '𝕏', href: 'https://twitter.com/0xdeafcafe'},
  ],
  sections: [
    {title: 'at work', text: 'the langwatch platform and its open-source sdks — typescript, python, go.', links: [
      {label: 'langwatch platform', href: 'https://langwatch.ai'},
      {label: 'open-source sdks', href: 'https://github.com/langwatch'},
    ]},
    {title: 'off-hours', text: 'bloefish — a local AI assistant. and beak — an API crafting tool.', links: [
      {label: 'bloefish', href: 'https://github.com/0xdeafcafe/bloefish'},
      {label: 'beak', href: 'https://github.com/getbeak/beak'},
    ]},
  ],
};
