// data model + typed store access for the quotes plugin.
// authors are the parent records; quotes reference an author by id (one author → many quotes).

import { collection, type Doc } from '$lib/server/store'

export interface Author extends Doc {
  name: string
  slug: string
  bio: string
  accentColor: string
}

export interface Quote extends Doc {
  authorId: string
  text: string
}

export const Authors = collection<Author>('quotesAuthors')
export const Quotes = collection<Quote>('quotesQuotes')
