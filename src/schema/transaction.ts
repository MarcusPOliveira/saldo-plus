import { z } from 'zod'

export const createTransactionSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number().positive().multipleOf(0.01),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string(),
  type: z.union([z.literal('income'), z.literal('expense')]),
  bankId: z.string().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
})

export type CreateTransactionSchemaType = z.infer<
  typeof createTransactionSchema
>
