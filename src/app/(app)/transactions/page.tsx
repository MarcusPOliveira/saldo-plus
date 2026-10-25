'use client'

import { useState } from 'react'

import { differenceInDays, startOfMonth } from 'date-fns'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants'

import { TransactionTable } from './_components/TransactionTable'
import { CreateTransactionDialog } from '../dashboard/_components/create_transaction_dialog'

function Transactions() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })

  return (
    <>
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-8">
          <div>
            <p className="text-2xl font-bold md:text-3xl">
              Histórico de transações
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <DateRangePicker
              initialDateFrom={dateRange.from}
              initialDateTo={dateRange.to}
              showCompare={false}
              onUpdate={(values) => {
                const { from, to } = values.range

                if (!from || !to) return

                if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS)
                  return toast.error(
                    `A data máxima de comparação é de ${MAX_DATE_RANGE_DAYS} dias!`
                  )

                setDateRange({ from, to })
              }}
            />
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

      <div className="container">
        <TransactionTable from={dateRange.from} to={dateRange.to} />
      </div>
    </>
  )
}

export default Transactions
