'use server'

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import prisma from '@/lib/prisma'
import { CreateCategorySchemaType, createTransactionSchema } from '@/schema'

export async function CreateTransaction(form: CreateCategorySchemaType) {
  const parsedBody = createTransactionSchema.safeParse(form)

  if (!parsedBody.success) throw new Error(parsedBody.error.message)

  const user = await currentUser()
  if (!user) return redirect('/sign-in')

  const { amount, category, date, description, type } = parsedBody.data
  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  })

  if (!categoryRow) {
    throw new Error('Categoria não encontrada')
  }

  await prisma.$transaction([
    // create user transaction
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        date,
        description: description || '',
        type,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
      },
    }),

    // update month aggregates table
    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === 'expense' ? amount : 0,
        income: type === 'income' ? amount : 0,
      },
      update: {
        expense: {
          increment: type === 'expense' ? amount : 0,
        },
        income: {
          increment: type === 'income' ? amount : 0,
        },
      },
    }),

    // update year aggregates table
    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === 'expense' ? amount : 0,
        income: type === 'income' ? amount : 0,
      },
      update: {
        expense: {
          increment: type === 'expense' ? amount : 0,
        },
        income: {
          increment: type === 'income' ? amount : 0,
        },
      },
    }),
  ])
}

export async function EditTransaction(form: CreateCategorySchemaType) {
  const parsedBody = createTransactionSchema.safeParse(form)

  if (!parsedBody.success) throw new Error(parsedBody.error.message)

  const user = await currentUser()
  if (!user) return redirect('/sign-in')

  const { id, amount, category, date, description, type } = parsedBody.data

  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  })

  if (!categoryRow) {
    throw new Error('Categoria não encontrada')
  }

  const oldTransaction = await prisma.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!oldTransaction) {
    throw new Error('Transação não encontrada')
  }

  await prisma.$transaction([
    // Atualiza a transação
    prisma.transaction.update({
      where: { id },
      data: {
        amount,
        date,
        description: description || '',
        type,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
      },
    }),

    // Remover valores antigos dos agregados (na data antiga)
    prisma.monthHistory.updateMany({
      where: {
        userId: user.id,
        day: oldTransaction.date.getUTCDate(),
        month: oldTransaction.date.getUTCMonth(),
        year: oldTransaction.date.getUTCFullYear(),
      },
      data: {
        [oldTransaction.type]: {
          decrement: oldTransaction.amount,
        },
      },
    }),
    prisma.yearHistory.updateMany({
      where: {
        userId: user.id,
        month: oldTransaction.date.getUTCMonth(),
        year: oldTransaction.date.getUTCFullYear(),
      },
      data: {
        [oldTransaction.type]: {
          decrement: oldTransaction.amount,
        },
      },
    }),

    // Adicionar novos valores dos agregados (na data nova)
    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === 'expense' ? amount : 0,
        income: type === 'income' ? amount : 0,
      },
      update: {
        expense: {
          increment: type === 'expense' ? amount : 0,
        },
        income: {
          increment: type === 'income' ? amount : 0,
        },
      },
    }),

    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === 'expense' ? amount : 0,
        income: type === 'income' ? amount : 0,
      },
      update: {
        expense: {
          increment: type === 'expense' ? amount : 0,
        },
        income: {
          increment: type === 'income' ? amount : 0,
        },
      },
    }),
  ])
}
