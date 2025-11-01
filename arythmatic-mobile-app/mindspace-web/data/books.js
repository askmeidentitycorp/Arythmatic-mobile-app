export const books = [
  {
    id: 'wisdom-anthology',
    title: 'Wisdom Anthology',
    author: 'Selected Verses & Reflections',
    tagline: 'Short reflections bridging ancient wisdom and modern life.',
    mode: 'md',
    basePath: '/books/wisdom-anthology',
    toc: [
      { id: 'presence', title: 'On Presence', file: 'presence.md' },
      { id: 'duty', title: 'On Steady Action', file: 'duty.md' },
      { id: 'compassion', title: 'On Compassion', file: 'compassion.md' }
    ]
  },
  {
    id: 'bhagavad-gita',
    title: 'Bhagavad Gita (External)',
    author: 'Public translations available',
    tagline: 'Timeless dialogue on action, devotion, and wisdom.',
    mode: 'external',
    href: 'https://www.gutenberg.org/ebooks/2388'
  }
];
