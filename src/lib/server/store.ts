// in-memory data store standing in for a database in this reference app.
//
// the real fenix implementation backs plugin config + plugin-owned collections with
// mongodb. here a single process-memory store keeps the demo dependency-free. it resets
// on server restart. the public shape (collection(name) → simple crud) is all a plugin
// needs, so swapping this for a real db is a localized change.

import { randomUUID } from 'node:crypto'

export interface Doc {
  id: string
  [key: string]: unknown
}

class Collection<T extends Doc> {
  private docs = new Map<string, T>()

  all(): T[] {
    return [...this.docs.values()]
  }

  find(predicate: (doc: T) => boolean): T[] {
    return this.all().filter(predicate)
  }

  get(id: string): T | undefined {
    return this.docs.get(id)
  }

  insert(doc: Omit<T, 'id'> & { id?: string }): T {
    const id = doc.id ?? randomUUID()
    const stored = { ...doc, id } as T
    this.docs.set(id, stored)
    return stored
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const existing = this.docs.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...patch, id }
    this.docs.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.docs.delete(id)
  }
}

const collections = new Map<string, Collection<Doc>>()

export function collection<T extends Doc = Doc>(name: string): Collection<T> {
  let existing = collections.get(name)
  if (!existing) {
    existing = new Collection<Doc>()
    collections.set(name, existing)
  }
  return existing as unknown as Collection<T>
}
