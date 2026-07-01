import { z } from 'zod'

export const announcementSettingsSchema = z.object({
  heading: z.string().min(1, 'heading is required'),
  body: z.string().default(''),
})

export type AnnouncementSettings = z.infer<typeof announcementSettingsSchema>

export const defaultAnnouncementSettings: AnnouncementSettings = {
  heading: 'Welcome 👋',
  body: 'This banner is rendered by the announcement plugin. Edit it in the admin console.',
}
