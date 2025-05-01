import { contactTypeSchema } from '@/server/db/schema'
import { z } from 'zod'


export const contactSchema = z.object({
  data: z.string()
    .min(1, 'Contact information is required')
    .refine((val) => {
      if (val.includes('@')) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      }
      return /^\+?[\d\s-]{7,}$/.test(val)
    }, 'Invalid contact format'),
  type: contactTypeSchema,
  isPrimary: z.boolean()
})

export const contactsArraySchema = z.array(contactSchema)
  .min(1, 'At least one contact is required')
  .refine(
    (contacts) => contacts.some((contact) => contact.isPrimary),
    'At least one contact must be primary'
  )

export type ContactValidationType = z.infer<typeof contactSchema>
