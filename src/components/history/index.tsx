'use client'

import { useMemo, useState } from 'react'

import { UserSettings } from '@prisma/client'

import { HistoryPeriodSelector } from '@/app/(app)/dashboard/_components/history_period_selector'
import { GetFormatterForCurrency } from '@/lib/helpers'
import { Period, Timeframe } from '@/lib/types'

import { Badge } from '../ui/badge'
import { Card, CardHeader, CardTitle } from '../ui/card'

interface Props {
  userSettings: UserSettings
}

export const History = ({ userSettings }: Props) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('month')
  const [period, setPeriod] = useState<Period>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  })

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings?.currency)
  }, [userSettings?.currency])

  return (
    <div className="container">
      <h2 className="mt-12 text-3xl font-bold">Histórico</h2>

      <Card className="col-span-12 mt-2 w-full">
        <CardHeader className="gap-2">
          <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
            <HistoryPeriodSelector
              period={period}
              setPeriod={setPeriod}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />

            <div className="flex h-10 gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-2 text-sm"
              >
                <div className="h-4 w-4 rounded-full bg-emerald-500" />
                Receitas
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-2 text-sm"
              >
                <div className="h-4 w-4 rounded-full bg-red-500" />
                Despesas
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
