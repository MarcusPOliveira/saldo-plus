'use server'

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import prisma from '@/lib/prisma'
import { CreateCategorySchema, CreateCategorySchemaType } from '@/schema'

export async function CreateCategory(form: CreateCategorySchemaType) {
  const parsedBody = CreateCategorySchema.safeParse(form)
  if (!parsedBody.success) throw new Error('Bad request')

  const user = await currentUser()
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
