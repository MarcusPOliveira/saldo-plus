import { z } from 'zod'

export const createBankSchema = z.object({
  name: z.string().min(1, { message: 'Nome do banco é obrigatório' }),
  cardLimit: z.preprocess(
    (val) =>
      val === '' || val === null || val === undefined ? undefined : val,
    z.coerce
      .number()
      .positive({ message: 'Limite deve ser um valor positivo' })
      .optional()
  ),
  hasCard: z.boolean().default(false),
  invoiceDueDate: z.preprocess(
    (val) =>
      val === '' || val === null || val === undefined ? undefined : val,
    z.coerce
      .number()
      .min(1, { message: 'Dia de vencimento deve ser entre 1 e 31' })
      .max(31, { message: 'Dia de vencimento deve ser entre 1 e 31' })
      .optional()
  ),
})

export type CreateBankSchemaType = z.infer<typeof createBankSchema>

export const deleteBankSchema = z.object({
  name: z.string().min(1),
})

export type DeleteBankSchemaType = z.infer<typeof deleteBankSchema>
