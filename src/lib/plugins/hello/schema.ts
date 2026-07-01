import { z } from 'zod'

export const helloSettingsSchema = z.object({
  greeting: z.string().min(1, 'greeting is required'),
})

export type HelloSettings = z.infer<typeof helloSettingsSchema>

export const defaultHelloSettings: HelloSettings = {
  greeting: 'Hello from a plugin 👋',
}
