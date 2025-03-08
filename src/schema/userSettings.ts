import { z } from 'zod'

import { currencies } from '@/lib'

export const updateUserCurrencySchema = z.object({
  currency: z.custom((value) => {
    const found = currencies.some((c) => c.value === value)

    if (!found) {
      throw new Error(`Moeda inválida: ${value}`)
    }

    return value
  }),
})
