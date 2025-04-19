'use client'
import { useCallback, useMemo } from 'react'

import { UserSettings } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import CountUp from 'react-countup'

import { GetBalanceStatsResponseType } from '@/app/api/stats/balance/route'
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers'

import { SkeletonWrapper } from '../skeleton_wrapper'
import { Card } from '../ui/card'

interface Props {
  userSettings: UserSettings
  from: Date
  to: Date
}

export const StatsCards = ({ userSettings, from, to }: Props) => {
  const statsQuery = useQuery<GetBalanceStatsResponseType>({
    queryKey: ['overview', 'stats', from, to],
    queryFn: async () =>
      fetch(
        `/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()),
  })

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings?.currency || 'BRL')
  }, [userSettings?.currency])

  const income = statsQuery.data?.income || 0
  const expense = statsQuery.data?.expense || 0
  const balance = income - expense

  const StatCard = ({
    title,
    value,
    icon,
    formatter,
  }: {
    title: string
    value: number
    icon: React.ReactNode
    formatter: Intl.NumberFormat
  }) => {
    const formatFn = useCallback(
      (value: number) => {
        return formatter.format(value)
      },
      [formatter]
    )
    return (
      <Card className="flex h-24 w-full items-center gap-2 p-4">
        {icon}
        <div className="flex flex-col items-center gap-0">
          <p className="text-muted-foreground">{title}</p>
          <CountUp
            preserveValue
            redraw={false}
            end={value}
            decimals={2}
            formattingFn={formatFn}
            className="text-2xl"
          />
        </div>
      </Card>
    )
  }

  return (
    <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={income}
          title="Receitas"
          icon={
            <TrendingUp className="h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500" />
          }
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={expense}
          title="Despesas"
          icon={
            <TrendingDown className="h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500" />
          }
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={balance}
          title="Saldo"
          icon={
            <Wallet className="h-12 w-12 items-center rounded-lg bg-violet-400/10 p-2 text-violet-500" />
          }
        />
      </SkeletonWrapper>
    </div>
  )
}
