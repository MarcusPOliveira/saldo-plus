'use server'

import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { updateUserCurrencySchema } from '@/schema'

export async function UpdateUserCurrency(currency: string) {
  const parsedBody = updateUserCurrencySchema.safeParse({
    currency,
  })

  if (!parsedBody.success) {
    throw parsedBody.error
  }

  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  const userSettings = await prisma.userSettings.update({
    where: {
      userId: user.id,
    },
    data: {
      currency,
    },
  })

  return userSettings
}
