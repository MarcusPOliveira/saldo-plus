'use client'
import { useState } from 'react'

import { UserSettings } from '@prisma/client'
import { differenceInDays, startOfMonth } from 'date-fns'
import { toast } from 'sonner'

import { StatsCards } from '@/components'
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants'

import { DateRangePicker } from '../ui/date-range-picker'

interface Props {
  userSettings: UserSettings
}

export const Overview = ({ userSettings }: Props) => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })

  return (
    <>
      <div className="container flex flex-wrap items-end justify-between gap-2 py-6">
        <h2 className="text-3xl font-bold">Visão geral</h2>
        <div className="flex items-center gap-3">
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
        </div>
      </div>
      <div className="container flex w-full flex-col gap-2">
        <StatsCards
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />
      </div>
    </>
  )
}
