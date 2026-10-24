'use client'

import { useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { download, generateCsv, mkConfig } from 'export-to-csv'
import {
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  Edit,
  MoreHorizontal,
  TrashIcon,
} from 'lucide-react'

import { GetTransactionHistoryResponseType } from '@/app/api/transactions-history/route'
import { SkeletonWrapper } from '@/components'
import { DataTableColumnHeader } from '@/components/datatable/column_header'
import { DataTableViewOptions } from '@/components/datatable/column_toggle'
import { DataTableFacetedFilter } from '@/components/datatable/faceted_filters'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib'
import { PAYMENT_METHODS } from '@/lib/constants'
import { DateToUTCDate } from '@/lib/helpers'

import { DeleteTransactionDialog } from './DeleteTransactionDialog'
import { CreateTransactionDialog } from '../../dashboard/_components/create_transaction_dialog'

interface Props {
  from: Date
  to: Date
}

const emptyData: never[] = []

export type TransactionHistoryRow = GetTransactionHistoryResponseType[0]

const PAYMENT_METHOD_MAP = new Map<string, string>(
  PAYMENT_METHODS.map((method) => [method.value, method.label])
)

const columns: ColumnDef<TransactionHistoryRow>[] = [
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoria" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    cell: ({ row }) => (
      <div className="flex gap-2 capitalize">
        {row.original.categoryIcon}
        <div className="capitalize">{row.original.category}</div>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descrição" />
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.original.description}</div>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Data',
    cell: ({ row }) => {
      const date = new Date(row.original.date)
      const formattedDate = date.toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      return <div className="text-muted-foreground">{formattedDate}</div>
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    cell: ({ row }) => {
      const typeColor =
        row.original.type === 'income'
          ? 'bg-emerald-400/10 text-emerald-500'
          : 'bg-red-400/10 text-red-500'
      const translatedType =
        row.original.type === 'income' ? 'Receita' : 'Despesa'
      return (
        <div className={cn('rounded-lg p-2 text-center capitalize', typeColor)}>
          {translatedType}
        </div>
      )
    },
  },
  {
    accessorKey: 'bankName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Banco" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.bankName || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pagamento" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    cell: ({ row }) => {
      const paymentMethod = row.original.paymentMethod
      if (!paymentMethod) {
        return <div className="text-muted-foreground">-</div>
      }
      return (
        <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">
          {PAYMENT_METHOD_MAP.get(paymentMethod) || paymentMethod}
        </span>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    cell: ({ row }) => (
      <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">
        {row.original.formattedAmount}
      </p>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <RowActions transaction={row.original} />,
  },
]

const csvConfig = mkConfig({
  fieldSeparator: ';',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
  filename: 'historico-transacoes',
})

const RowActions = ({
  transaction,
}: {
  transaction: TransactionHistoryRow
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <DeleteTransactionDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        transactionId={transaction.id}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <CreateTransactionDialog
            isEditing
            transaction={{
              id: transaction.id,
              amount: transaction.amount,
              description: transaction.description || undefined,
              date: new Date(transaction.date),
              category: transaction.category,
              type: transaction.type as 'income' | 'expense',
              bankId: transaction.bankId,
              paymentMethod: transaction.paymentMethod,
            }}
            trigger={
              <DropdownMenuItem
                className="flex items-center gap-2"
                onSelect={(e) => {
                  e.preventDefault()
                }}
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
                Editar
              </DropdownMenuItem>
            }
            type={transaction.type === 'income' ? 'income' : 'expense'}
          />

          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => {
              setShowDeleteDialog((prev) => !prev)
            }}
          >
            <TrashIcon className="h-4 w-4 text-muted-foreground" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export const TransactionTable = ({ from, to }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const history = useQuery<GetTransactionHistoryResponseType>({
    queryKey: ['transactions', 'history', from, to],
    queryFn: () =>
      fetch(
        `/api/transactions-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()),
  })

  const table = useReactTable({
    data: history.data || emptyData,
    columns,
    getCoreRowModel: getCoreRowModel(),

    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const categoriesOptions = useMemo(() => {
    const categoriesMap = new Map()
    history?.data?.forEach((transaction) => {
      categoriesMap.set(transaction.category, {
        value: transaction.category,
        label: `${transaction.categoryIcon} ${transaction.category}`,
      })
    })

    const uniqueCategories = new Set(categoriesMap.values())
    return Array.from(uniqueCategories)
  }, [history?.data])

  const banksOptions = useMemo(() => {
    const banksMap = new Map()
    history?.data?.forEach((transaction) => {
      if (transaction.bankName) {
        banksMap.set(transaction.bankName, {
          value: transaction.bankName,
          label: transaction.bankName,
        })
      }
    })

    return Array.from(banksMap.values())
  }, [history?.data])

  const paymentMethodsOptions = useMemo(() => {
    const methodsMap = new Map()
    history?.data?.forEach((transaction) => {
      if (transaction.paymentMethod) {
        methodsMap.set(transaction.paymentMethod, {
          value: transaction.paymentMethod,
          label:
            PAYMENT_METHOD_MAP.get(transaction.paymentMethod) ||
            transaction.paymentMethod,
        })
      }
    })

    return Array.from(methodsMap.values())
  }, [history?.data])

  const handleExportCSV = (data: Record<string, string | number>[]) => {
    const csv = generateCsv(csvConfig)(data)
    download(csvConfig)(csv)
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-2 py-4">
        <div className="flex flex-wrap gap-2">
          {table.getColumn('category') && (
            <DataTableFacetedFilter
              title="Categoria"
              column={table.getColumn('category')}
              options={categoriesOptions}
            />
          )}

          {table.getColumn('type') && (
            <DataTableFacetedFilter
              title="Tipo de Transação"
              column={table.getColumn('type')}
              options={[
                { label: 'Receita', value: 'income' },
                { label: 'Despesa', value: 'expense' },
              ]}
            />
          )}

          {table.getColumn('bankName') && banksOptions.length > 0 && (
            <DataTableFacetedFilter
              title="Banco"
              column={table.getColumn('bankName')}
              options={banksOptions}
            />
          )}

          {table.getColumn('paymentMethod') &&
            paymentMethodsOptions.length > 0 && (
              <DataTableFacetedFilter
                title="Pagamento"
                column={table.getColumn('paymentMethod')}
                options={paymentMethodsOptions}
              />
            )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-8 lg:flex"
            onClick={() => {
              const data = table.getFilteredRowModel().rows.map((row) => {
                const date = new Date(row.original.date)
                const formattedDate = date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
                const formattedTime = date.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
                return {
                  Categoria: row.original.category,
                  'Ícone da categoria': row.original.categoryIcon,
                  Descrição: row.original.description || '',
                  'Tipo da transação': row.original.type,
                  Valor: row.original.amount,
                  'Valor formatado': row.original.formattedAmount,
                  Banco: row.original.bankName || '',
                  'Método de pagamento': row.original.paymentMethod
                    ? PAYMENT_METHOD_MAP.get(row.original.paymentMethod) ||
                      row.original.paymentMethod
                    : '',
                  Data: `${formattedDate} - ${formattedTime}`,
                }
              })
              handleExportCSV(data)
            }}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <SkeletonWrapper isLoading={history.isFetching}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhum dado encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </SkeletonWrapper>
    </div>
  )
}
