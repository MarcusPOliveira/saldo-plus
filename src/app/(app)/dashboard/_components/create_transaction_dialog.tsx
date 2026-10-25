'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Bank } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib'
import { PAYMENT_METHODS } from '@/lib/constants'
import { DateToUTCDate } from '@/lib/helpers'
import { TransactionType } from '@/lib/types'
import { createTransactionSchema, CreateTransactionSchemaType } from '@/schema'

import { CategoryPicker } from './category_picker'
import { CreateTransaction, EditTransaction } from '../_actions/transactions'

interface Props {
  trigger: ReactNode
  type: TransactionType
  isEditing?: boolean
  transaction?: CreateTransactionSchemaType
}

export const CreateTransactionDialog = ({
  trigger,
  type,
  isEditing = false,
  transaction,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  // Fetch banks for expense transactions
  const banksQuery = useQuery<Bank[]>({
    queryKey: ['banks'],
    queryFn: () => fetch('/api/banks').then((res) => res.json()),
    enabled: type === 'expense',
  })

  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: isEditing ? transaction?.amount : 0,
      description: isEditing ? transaction?.description || '' : '',
      date:
        isEditing && transaction?.date
          ? new Date(transaction.date)
          : new Date(),
      category: isEditing ? transaction?.category : '',
      type: isEditing ? transaction?.type : type,
      bankId: isEditing ? transaction?.bankId : undefined,
      paymentMethod: isEditing ? transaction?.paymentMethod : undefined,
    },
  })

  const handleCategoryChange = useCallback(
    (value: string) => {
      form.setValue('category', value)
    },
    [form]
  )

  const mutationFn = isEditing ? EditTransaction : CreateTransaction

  const { mutate, isPending } = useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(
        isEditing
          ? 'Transação editada com sucesso ✏️'
          : 'Transação criada com sucesso 🎉',
        {
          id: 'create-transaction',
        }
      )
      form.reset({
        amount: 0,
        description: '',
        date: new Date(),
        category: undefined,
        type,
        bankId: undefined,
        paymentMethod: undefined,
      })

      // Invalidate all related queries to update the UI
      queryClient.invalidateQueries({
        queryKey: ['overview'],
      })
      queryClient.invalidateQueries({
        queryKey: ['transactions'],
      })

      setIsOpen(false)
    },
  })

  const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
      toast.loading(
        isEditing ? 'Editando transação...' : 'Salvando transação...',
        { id: 'create-transaction' }
      )

      mutate({
        ...values,
        date: DateToUTCDate(values.date),
        id: transaction?.id,
      })
    },
    [mutate, isEditing, transaction?.id]
  )

  useEffect(() => {
    if (isEditing && transaction && isOpen) {
      form.reset({
        amount: transaction.amount,
        description: transaction.description || '',
        date: new Date(transaction.date),
        category: transaction.category,
        type: transaction.type,
        bankId: transaction.bankId || undefined,
        paymentMethod: transaction.paymentMethod || undefined,
      })
    }
  }, [isEditing, transaction, isOpen, form])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          form.reset({
            amount: 0,
            description: '',
            date: new Date(),
            category: undefined,
            type,
            bankId: undefined,
            paymentMethod: undefined,
          })
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        onOpenAutoFocus={isEditing ? (e) => e.preventDefault() : undefined}
        className="w-11/12 max-w-md rounded-lg p-4 md:w-full md:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar' : 'Criar uma nova'}
            <span
              className={cn(
                'm-1',
                type === 'income' ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {type === 'income' ? 'receita' : 'despesa'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="min-w-full max-w-fit space-y-6 overflow-x-hidden md:space-y-4 md:overflow-x-visible"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Descrição da transação (opcional)
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              name="amount"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      onFocus={() => {
                        if (field.value === 0) {
                          field.onChange('')
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Valor da transação (obrigatório)
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:gap-2">
              <FormField
                name="category"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <CategoryPicker
                        type={type}
                        value={field.value}
                        onChange={handleCategoryChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Selecione a categoria da transação (obrigatório)
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                name="date"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-[200px] pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(value) => {
                              if (!value) return
                              field.onChange(value)
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription>
                      Data da transação (obrigatório)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {type === 'expense' && (
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:gap-2">
                <FormField
                  name="paymentMethod"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Método de pagamento</FormLabel>
                      <Select
                        onValueChange={(val) =>
                          field.onChange(val === 'none' ? null : val)
                        }
                        value={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Como você pagou? (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="bankId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Banco</FormLabel>
                      <Select
                        onValueChange={(val) =>
                          field.onChange(val === 'none' ? null : val)
                        }
                        value={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {banksQuery.data?.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecione o banco (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </form>
        </Form>
        <DialogFooter className="mt-4 gap-2 md:mt-0 md:gap-0">
          <DialogClose asChild>
            <Button
              variant="secondary"
              type="button"
              onClick={() => form.reset()}
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
