import { currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  let userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  })

  if (!userSettings) {
    userSettings = await prisma.userSettings.create({
      data: {
        currency: 'BRL',
        userId: user.id,
      },
    })
  }

  // Revalidate the dashboard page that uses the user currency
  revalidatePath('/dashboard')

  return Response.json(userSettings)
}
