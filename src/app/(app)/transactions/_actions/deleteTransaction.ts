'use server'

import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DeleteTransaction(transactionId: string) {
  const user = await getCurrentUser()

  if (!user) return redirect('/sign-in')

  const transaction = await prisma.transaction.findUnique({
    where: {
      userId: user.id,
      id: transactionId,
    },
  })

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  return await prisma.$transaction([
    prisma.transaction.delete({
      where: {
        id: transactionId,
        userId: user.id,
      },
    }),
    prisma.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: transaction.date.getUTCDate(),
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === 'expense' && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === 'income' && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
    prisma.yearHistory.update({
      where: {
        month_year_userId: {
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === 'expense' && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === 'income' && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
  ])
}
