import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { History, Overview } from '@/components'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'

import { CreateTransactionDialog } from './_components/create_transaction_dialog'

export default async function Page() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  })

  if (!userSettings) {
    redirect('/wizard')
  }

  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="container flex w-full flex-wrap items-center justify-between gap-4 py-8">
          <p className="text-xl font-bold md:text-2xl">
            Olá, {user.firstName}! 👋
          </p>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <CreateTransactionDialog
              trigger={
                <Button
                  variant="outline"
                  className="flex-1 border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white sm:flex-none"
                >
                  <span className="hidden sm:inline">Nova receita 🤑</span>
                  <span className="sm:hidden">Receita 🤑</span>
                </Button>
              }
              type="income"
            />

            <CreateTransactionDialog
              trigger={
                <Button
                  variant="outline"
                  className="flex-1 border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white sm:flex-none"
                >
                  <span className="hidden sm:inline">Nova despesa 💸</span>
                  <span className="sm:hidden">Despesa 💸</span>
                </Button>
              }
              type="expense"
            />
          </div>
        </div>
      </div>
      <Overview userSettings={userSettings} />
      <History userSettings={userSettings} />
    </div>
  )
}
