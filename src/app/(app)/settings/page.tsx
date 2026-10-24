'use client'
import { useMemo } from 'react'

import { Bank, Category, UserSettings } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  PlusSquare,
  TrashIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { CurrencyComboBox, SkeletonWrapper } from '@/components'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib'
import { GetFormatterForCurrency } from '@/lib/helpers'
import { TransactionType } from '@/lib/types'

import { CreateBankDialog } from './_components/CreateBankDialog'
import { DeleteBankDialog } from './_components/DeleteBankDialog'
import { DeleteCategoryDialog } from './_components/DeleteCategoryDialog'
import { CreateCategoryDialog } from '../dashboard/_components/create_category_dialog'

function Settings() {
  const userSettingsQuery = useQuery<UserSettings>({
    queryKey: ['userSettings'],
    queryFn: () => fetch('/api/user-settings').then((res) => res.json()),
  })

  const currencyFormatter = useMemo(() => {
    return GetFormatterForCurrency(userSettingsQuery.data?.currency || 'BRL')
  }, [userSettingsQuery.data?.currency])

  const CategoryList = ({ type }: { type: TransactionType }) => {
    const categoriesQuery = useQuery({
      queryKey: ['categories', type],
      queryFn: () =>
        fetch(`/api/categories?type=${type}`).then((res) => res.json()),
    })

    const dataAvailable =
      categoriesQuery.data && categoriesQuery.data?.length > 0

    return (
      <SkeletonWrapper isLoading={categoriesQuery.isLoading}>
        <Card>
          <CardHeader className="px-1 md:px-6">
            <CardTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {type === 'expense' ? (
                  <TrendingDown className="h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500" />
                ) : (
                  <TrendingUp className="h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500" />
                )}

                <div>
                  Categorias de {type === 'expense' ? 'despesas' : 'receitas'}
                  <div className="text-xs text-muted-foreground">
                    Ordenadas por nome
                  </div>
                </div>
              </div>

              <CreateCategoryDialog
                type={type}
                successCallback={() => categoriesQuery.refetch()}
                trigger={
                  <Button className="gap-2 text-sm">
                    <PlusSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Nova categoria</span>
                    <span className="sm:hidden">Nova</span>
                  </Button>
                }
              />
            </CardTitle>
          </CardHeader>
          <Separator />

          {dataAvailable && (
            <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categoriesQuery?.data?.map((category: Category) => (
                <CategoryCard key={category.name} category={category} />
              ))}
            </div>
          )}

          {!dataAvailable && (
            <div className="flex h-40 w-full flex-col items-center justify-center">
              <p>
                Nenhuma categoria de
                <span
                  className={cn(
                    'm-1',
                    type === 'expense' ? 'text-red-500' : 'text-emerald-500'
                  )}
                >
                  {type === 'expense' ? 'despesa' : 'receita'}
                </span>
                cadastrada
              </p>
              <p className="text-sm text-muted-foreground">
                Crie uma nova categoria para começar
              </p>
            </div>
          )}
        </Card>
      </SkeletonWrapper>
    )
  }

  const CategoryCard = ({ category }: { category: Category }) => {
    return (
      <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1]">
        <div className="flex flex-col items-center gap-2 p-4">
          <span className="text-3xl" role="img">
            {category.icon}
          </span>

          <span>{category.name}</span>
        </div>
        <DeleteCategoryDialog
          category={category}
          trigger={
            <Button
              className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20"
              variant="secondary"
            >
              <TrashIcon className="h-4 w-4" />
              Excluir
            </Button>
          }
        />
      </div>
    )
  }

  const BankList = () => {
    const banksQuery = useQuery({
      queryKey: ['banks'],
      queryFn: () => fetch('/api/banks').then((res) => res.json()),
    })

    const dataAvailable = banksQuery.data && banksQuery.data?.length > 0

    return (
      <SkeletonWrapper isLoading={banksQuery.isLoading}>
        <Card>
          <CardHeader className="px-1 md:px-6">
            <CardTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-12 w-12 items-center rounded-lg bg-blue-400/10 p-2 text-blue-500" />

                <div>
                  Bancos
                  <div className="text-xs text-muted-foreground">
                    Ordenados por nome
                  </div>
                </div>
              </div>

              <CreateBankDialog
                successCallback={() => banksQuery.refetch()}
                trigger={
                  <Button className="gap-2 text-sm">
                    <PlusSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Novo banco</span>
                    <span className="sm:hidden">Novo</span>
                  </Button>
                }
              />
            </CardTitle>
          </CardHeader>
          <Separator />

          {dataAvailable && (
            <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {banksQuery?.data?.map((bank: Bank) => (
                <BankCard key={bank.id} bank={bank} />
              ))}
            </div>
          )}

          {!dataAvailable && (
            <div className="flex h-40 w-full flex-col items-center justify-center">
              <p>Nenhum banco cadastrado</p>
              <p className="text-sm text-muted-foreground">
                Crie um novo banco para começar
              </p>
            </div>
          )}
        </Card>
      </SkeletonWrapper>
    )
  }

  const BankCard = ({ bank }: { bank: Bank }) => {
    return (
      <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1]">
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            <span className="font-semibold">{bank.name}</span>
          </div>

          {bank.hasCard && (
            <div className="space-y-1 text-sm text-muted-foreground">
              {bank.cardLimit && (
                <p>Limite: {currencyFormatter.format(bank.cardLimit)}</p>
              )}
              {bank.invoiceDueDate && (
                <p>Vencimento: Dia {bank.invoiceDueDate}</p>
              )}
            </div>
          )}
        </div>
        <DeleteBankDialog
          bank={bank}
          trigger={
            <Button
              className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20"
              variant="secondary"
            >
              <TrashIcon className="h-4 w-4" />
              Excluir
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <>
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-8">
          <div>
            <p className="text-2xl font-bold md:text-3xl">Configurações</p>
            <p className="text-sm text-muted-foreground md:text-base">
              Gerencie as configurações da sua conta e suas categorias
            </p>
          </div>
        </div>
      </div>

      <div className="container flex flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Moeda padrão</CardTitle>
            <CardDescription>
              A moeda padrão utilizada para registrar as transações e gerar
              relatórios
            </CardDescription>
          </CardHeader>

          <CardContent>
            <CurrencyComboBox />
          </CardContent>
        </Card>

        <BankList />
        <CategoryList type="income" />
        <CategoryList type="expense" />
      </div>
    </>
  )
}

export default Settings
