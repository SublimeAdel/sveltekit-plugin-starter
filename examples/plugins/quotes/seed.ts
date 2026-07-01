// demo seed data. called once at startup so the browse page isn't empty on first run.
// only inserts when the store is empty (in-memory store resets each restart).

import { Authors, Quotes } from './collections'

export function seedQuotes(): void {
  if (Authors.all().length) return

  const seed: Array<{ name: string; slug: string; bio: string; accentColor: string; quotes: string[] }> = [
    {
      name: 'Ada Lovelace',
      slug: 'ada-lovelace',
      bio: 'Mathematician, first computer programmer.',
      accentColor: '#8b5cf6',
      quotes: [
        'That brain of mine is something more than merely mortal, as time will show.',
        'The Analytical Engine weaves algebraic patterns.',
      ],
    },
    {
      name: 'Grace Hopper',
      slug: 'grace-hopper',
      bio: 'Computer scientist, coined the term "debugging".',
      accentColor: '#0ea5e9',
      quotes: [
        'The most dangerous phrase in the language is "we\'ve always done it this way".',
        'A ship in port is safe, but that is not what ships are built for.',
      ],
    },
    {
      name: 'Alan Turing',
      slug: 'alan-turing',
      bio: 'Founder of theoretical computer science.',
      accentColor: '#10b981',
      quotes: ['We can only see a short distance ahead, but we can see plenty there that needs to be done.'],
    },
  ]

  for (const { quotes, ...author } of seed) {
    const created = Authors.insert(author)
    for (const text of quotes) Quotes.insert({ authorId: created.id, text })
  }
}
