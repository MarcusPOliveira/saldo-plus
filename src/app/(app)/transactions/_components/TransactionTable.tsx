'use client'

import { useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'

import { GetTransactionHistoryResponseType } from '@/app/api/transactions-history/route'
import { SkeletonWrapper } from '@/components'
import { DataTableColumnHeader } from '@/components/datatable/column_header'
import { DataTableFacetedFilter } from '@/components/datatable/faceted_filters'
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

export const columns: ColumnDef<TransactionHistoryRow>[] = [
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
      </SkeletonWrapper>
    </div>
  )
}
