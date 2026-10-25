import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'
import { GetFormatterForCurrency } from '@/lib/helpers'
import prisma from '@/lib/prisma'
import { OverviewQuerySchema } from '@/schema'

export async function GET(request: Request) {
  const user = await getCurrentUser()

  if (!user) return redirect('/sign-in')

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const queryParams = OverviewQuerySchema.safeParse({
    from,
    to,
  })

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    })
  }

  const transactions = await getTransactionsHistory(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  )

  return Response.json(transactions)
}

export type GetTransactionHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>

async function getTransactionsHistory(userId: string, from: Date, to: Date) {
  const [userSettings, banks, transactions] = await Promise.all([
    prisma.userSettings.findUnique({
      where: {
        userId,
      },
    }),
    prisma.bank.findMany({
      where: {
        userId,
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        date: 'desc',
      },
    }),
  ])

  if (!userSettings) {
    throw new Error('User settings not found')
  }

  const formatter = GetFormatterForCurrency(userSettings.currency)
  const bankMap = new Map(banks.map((b) => [b.id, b.name]))

  return transactions.map((transaction) => ({
    ...transaction,
    bankName: transaction.bankId
      ? bankMap.get(transaction.bankId) || null
      : null,
    formattedAmount: formatter.format(transaction.amount), // formatando o valor com a moeda do usuário.
  }))
}
