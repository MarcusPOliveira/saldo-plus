'use client'

import { ReactNode, useCallback, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { createBankSchema, CreateBankSchemaType } from '@/schema'

interface Props {
  trigger: ReactNode
  successCallback: () => void
}

export const CreateBankDialog = ({ trigger, successCallback }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CreateBankSchemaType>({
    resolver: zodResolver(createBankSchema),
    defaultValues: {
      name: '',
      cardLimit: undefined,
      hasCard: false,
      invoiceDueDate: undefined,
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateBankSchemaType) => {
      const response = await fetch('/api/banks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Erro ao criar banco')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Banco criado com sucesso 🎉', {
        id: 'create-bank',
      })

      form.reset({
        name: '',
        cardLimit: undefined,
        hasCard: false,
        invoiceDueDate: undefined,
      })

      queryClient.invalidateQueries({
        queryKey: ['banks'],
      })

      successCallback()
      setIsOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar banco', {
        id: 'create-bank',
      })
    },
  })

  const onSubmit = useCallback(
    (values: CreateBankSchemaType) => {
      toast.loading('Criando banco...', { id: 'create-bank' })
      mutate(values)
    },
    [mutate]
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="w-11/12 max-w-md rounded-lg p-4 md:w-full md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar novo banco</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do banco</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nubank" {...field} />
                  </FormControl>
                  <FormDescription>Nome do banco (obrigatório)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="hasCard"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (!checked) {
                          form.setValue('cardLimit', undefined)
                          form.setValue('invoiceDueDate', undefined)
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Possui cartão de crédito</FormLabel>
                    <FormDescription>
                      Marque se este banco possui cartão de crédito
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('hasCard') && (
              <>
                <FormField
                  name="cardLimit"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite do cartão</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 5000.00"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? undefined : e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Limite do cartão de crédito (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="invoiceDueDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia de vencimento da fatura</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="Ex: 15"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? undefined : e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Dia do mês em que a fatura vence (1-31)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
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
