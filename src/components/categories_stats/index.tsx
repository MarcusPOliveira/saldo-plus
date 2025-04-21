'use client'

import { useMemo } from 'react'

import { UserSettings } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'

import { GetCategoriesStatsResponseType } from '@/app/api/stats/categories/route'
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers'
import { TransactionType } from '@/lib/types'

import { SkeletonWrapper } from '../skeleton_wrapper'
import { Card, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { ScrollArea } from '../ui/scroll-area'

interface Props {
  userSettings: UserSettings
  from: Date
  to: Date
}

export const CategoriesStats = ({ userSettings, from, to }: Props) => {
  const statsQuery = useQuery<GetCategoriesStatsResponseType>({
    queryKey: ['overview', 'stats', 'categories', from, to],
    queryFn: () =>
      fetch(
        `/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()),
  })

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings?.currency)
  }, [userSettings?.currency])

  const CategoriesCard = ({
    type,
    data,
    formatter,
  }: {
    type: TransactionType
    data: GetCategoriesStatsResponseType
    formatter: Intl.NumberFormat
  }) => {
    const filteredData = data.filter((el) => el.type === type)
    const total = filteredData.reduce((acc, el) => {
      return acc + (el._sum?.amount || 0)
    }, 0)

    return (
      <Card className="col-span-6 h-80 w-full">
        <CardHeader>
          <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
            {type === 'income' ? 'Receitas' : 'Despesas'} por categoria
          </CardTitle>
        </CardHeader>

        <div className="flex items-center justify-between gap-2">
          {filteredData.length === 0 && (
            <div className="flex h-60 w-full flex-col items-center justify-center">
              Não há dados para exibir
              <p className="px-2 text-center text-sm text-muted-foreground">
                Tente selecionar um intervalo de datas diferente ou adicionar
                uma nova {type === 'income' ? 'receita' : 'despesa'}!
              </p>
            </div>
          )}

          {filteredData.length > 0 && (
            <ScrollArea className="h-60 w-full px-4">
              <div className="flex w-full flex-col gap-4 p-4">
                {filteredData.map((item) => {
                  const amount = item._sum?.amount || 0
                  const percentage = (amount * 100) / (total || amount)
                  return (
                    <div key={item.category} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-400">
                          {item.categoryIcon} {item.category}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({percentage.toFixed(0)}%)
                          </span>
                        </span>

                        <span className="text-sm text-gray-400">
                          {formatter.format(amount)}
                        </span>
                      </div>

                      <Progress
                        value={percentage}
                        indicator={
                          type === 'income' ? 'bg-emerald-500' : 'bg-red-500'
                        }
                      />
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="income"
          data={statsQuery?.data || []}
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="expense"
          data={statsQuery?.data || []}
        />
      </SkeletonWrapper>
    </div>
  )
}
