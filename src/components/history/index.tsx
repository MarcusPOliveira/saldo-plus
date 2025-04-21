'use client'

import { useCallback, useMemo, useState } from 'react'

import { UserSettings } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import CountUp from 'react-countup'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { HistoryPeriodSelector } from '@/app/(app)/dashboard/_components/history_period_selector'
import { GetHistoryDataResponseType } from '@/app/api/history-data/route'
import { useMediaQuery } from '@/hooks'
import { cn } from '@/lib'
import { GetFormatterForCurrency } from '@/lib/helpers'
import { Period, Timeframe } from '@/lib/types'

import { SkeletonWrapper } from '../skeleton_wrapper'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface Props {
  userSettings: UserSettings
}

export const History = ({ userSettings }: Props) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('month')
  const [period, setPeriod] = useState<Period>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  })

  const isMobile = useMediaQuery('(max-width: 768px)')

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings?.currency)
  }, [userSettings?.currency])

  const historyDataQuery = useQuery<GetHistoryDataResponseType>({
    queryKey: ['overview', 'history', period, timeframe],
    queryFn: () =>
      fetch(
        `/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`
      ).then((res) => res.json()),
  })

  const dataAvailable =
    historyDataQuery.data &&
    historyDataQuery.data?.length > 0 &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    !historyDataQuery?.data?.includes('"code"')

  const TooltipRow = ({
    label,
    value,
    bgColor,
    textColor,
    numberFormatter,
  }: {
    label: string
    value: number
    bgColor: string
    textColor: string
    numberFormatter: Intl.NumberFormat
  }) => {
    const formattingFn = useCallback(
      (value: number) => {
        return numberFormatter.format(value)
      },
      [numberFormatter]
    )

    return (
      <div className="flex items-center gap-2">
        <div className={cn('h-4 w-4 rounded-full', bgColor)} />

        <div className="flex w-full justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>

          <div className={cn('text-sm font-bold', textColor)}>
            <CountUp
              duration={0.5}
              preserveValue
              end={value}
              decimals={2}
              formattingFn={formattingFn}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({
    active,
    payload,
    numberFormatter,
  }: {
    active: boolean
    payload: { payload: { income: number; expense: number } }[]
    numberFormatter: Intl.NumberFormat
  }) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload
    const { income, expense } = data

    return (
      <div className="min-w-[300px] rounded border bg-background p-4">
        <TooltipRow
          numberFormatter={numberFormatter}
          label="Despesa"
          value={expense}
          bgColor="bg-red-500"
          textColor="text-red-500"
        />

        <TooltipRow
          numberFormatter={numberFormatter}
          label="Receita"
          value={income}
          bgColor="bg-emerald-500"
          textColor="text-emerald-500"
        />

        <TooltipRow
          numberFormatter={numberFormatter}
          label="Saldo"
          value={income - expense}
          bgColor="bg-gray-500"
          textColor="text-foreground"
        />
      </div>
    )
  }

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
        <CardContent className="flex flex-col items-center justify-center p-0">
          <SkeletonWrapper isLoading={historyDataQuery.isFetching}>
            {dataAvailable && (
              <ResponsiveContainer
                width="100%"
                // className="bg-red-500"
                height={300}
              >
                <BarChart
                  height={300}
                  data={historyDataQuery.data}
                  barCategoryGap={isMobile ? 0 : 5}
                >
                  <defs>
                    <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#10B981" stopOpacity="1" />

                      <stop offset="1" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#ef4444" stopOpacity="1" />

                      <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="5 5"
                    strokeOpacity="0.2"
                    vertical={false}
                  />

                  <XAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 0, right: 0 }}
                    dataKey={(data) => {
                      const { year, month, day } = data
                      const date = new Date(year, month, day || 1)
                      if (timeframe === 'year') {
                        return date.toLocaleDateString('pt-BR', {
                          month: 'long',
                        })
                      }

                      return date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                      })
                    }}
                  />

                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Bar
                    dataKey="income"
                    label="Receitas"
                    fill="url(#incomeBar)"
                    radius={4}
                    className="cursor-pointer"
                    barSize={20}
                  />

                  <Bar
                    dataKey="expense"
                    label="Despesas"
                    fill="url(#expenseBar)"
                    radius={4}
                    className="cursor-pointer"
                    barSize={20}
                  />

                  <Tooltip
                    cursor={{ opacity: 0.1 }}
                    content={(props) => (
                      <CustomTooltip
                        numberFormatter={formatter}
                        active={!!props.active}
                        payload={(props.payload || []).filter(
                          (
                            item
                          ): item is {
                            payload: { income: number; expense: number }
                          } => item.payload !== undefined
                        )}
                      />
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

            {!dataAvailable && (
              <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                Nenhum dado disponível para o período selecionado.
                <p className="text-sm text-muted-foreground">
                  Tente selecionar um período diferente, ou adicione uma nova
                  transação.
                </p>
              </Card>
            )}
          </SkeletonWrapper>
        </CardContent>
      </Card>
    </div>
  )
}
