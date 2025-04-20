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
import { ChevronLeft, ChevronRight, DownloadIcon } from 'lucide-react'

import { GetTransactionHistoryResponseType } from '@/app/api/transactions-history/route'
import { SkeletonWrapper } from '@/components'
import { DataTableColumnHeader } from '@/components/datatable/column_header'
import { DataTableViewOptions } from '@/components/datatable/column_toggle'
import { DataTableFacetedFilter } from '@/components/datatable/faceted_filters'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib'
import { DateToUTCDate } from '@/lib/helpers'

interface Props {
  from: Date
  to: Date
}

const emptyData: never[] = []

type TransactionHistoryRow = GetTransactionHistoryResponseType[0]

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
]

const csvConfig = mkConfig({
  fieldSeparator: ';',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
  filename: 'historico-transacoes',
})

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
  console.log('history', history.data)

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

  const handleExportCSV = (data: never[]) => {
    const csv = generateCsv(csvConfig)(data)
    download(csvConfig)(csv)
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-2 py-4">
        <div className="flex gap-2">
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
                  Descrição: row.original.description,
                  'Tipo da transação': row.original.type,
                  Valor: row.original.amount,
                  'Valor formatado': row.original.formattedAmount,
                  Data: `${formattedDate} - ${formattedTime}`,
                }
              })
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
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
                    No results.
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
