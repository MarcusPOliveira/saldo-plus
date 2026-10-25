'use server'

import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
  DeleteCategorySchema,
  DeleteCategorySchemaType,
} from '@/schema'

export async function CreateCategory(form: CreateCategorySchemaType) {
  const parsedBody = CreateCategorySchema.safeParse(form)
  if (!parsedBody.success) throw new Error('Bad request')

  const user = await getCurrentUser()
  if (!user) return redirect('/sign-in')

  const { name, icon, type } = parsedBody.data
  return await prisma.category.create({
    data: {
      userId: user.id,
      name,
      icon,
      type,
    },
  })
}

export async function DeleteCategory(form: DeleteCategorySchemaType) {
  const parsedBody = DeleteCategorySchema.safeParse(form)
  if (!parsedBody.success) throw new Error('Bad request')

  const user = await getCurrentUser()
  if (!user) return redirect('/sign-in')

  return await prisma.category.delete({
    where: {
      name_userId_type: {
        userId: user.id,
        name: parsedBody.data.name,
        type: parsedBody.data.type,
      },
    },
  })
}
