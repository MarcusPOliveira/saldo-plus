import { currentUser } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import prisma from '@/lib/prisma'
import { createBankSchema, deleteBankSchema } from '@/schema'

export async function GET(request: Request) {
  const user = await currentUser()

  if (!user) return redirect('/sign-in')

  const banks = await prisma.bank.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return Response.json(banks)
}

export async function POST(request: Request) {
  const user = await currentUser()

  if (!user) return redirect('/sign-in')

  const body = await request.json()
  const parsedBody = createBankSchema.safeParse(body)

  if (!parsedBody.success) {
    return Response.json(parsedBody.error, { status: 400 })
  }

  const { name, cardLimit, hasCard, invoiceDueDate } = parsedBody.data

  try {
    const bank = await prisma.bank.create({
      data: {
        userId: user.id,
        name,
        cardLimit: hasCard ? cardLimit || null : null,
        hasCard,
        invoiceDueDate: hasCard ? invoiceDueDate || null : null,
      },
    })

    return Response.json(bank)
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return Response.json(
        { message: 'Já existe um banco com este nome' },
        { status: 409 }
      )
    }
    return Response.json(
      { message: 'Erro ao cadastrar banco' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const user = await currentUser()

  if (!user) return redirect('/sign-in')

  const body = await request.json()
  const parsedBody = deleteBankSchema.safeParse(body)

  if (!parsedBody.success) {
    return Response.json(parsedBody.error, { status: 400 })
  }

  const bank = await prisma.bank.findUnique({
    where: {
      name_userId: {
        name: parsedBody.data.name,
        userId: user.id,
      },
    },
  })

  if (!bank) {
    return Response.json({ message: 'Banco não encontrado' }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: {
        userId: user.id,
        bankId: bank.id,
      },
      data: {
        bankId: null,
      },
    }),
    prisma.bank.delete({
      where: {
        id: bank.id,
      },
    }),
  ])

  return Response.json({ success: true })
}
