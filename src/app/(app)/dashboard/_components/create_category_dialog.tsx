import { ReactNode, useCallback, useState } from 'react'

import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Category } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CircleOff, Loader2, PlusSquare } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TransactionType } from '@/lib/types'
import { CreateCategorySchema, CreateCategorySchemaType } from '@/schema'

import { CreateCategory } from '../_actions/categories'

interface Props {
  type: TransactionType
  successCallback: (category: Category) => void
  trigger?: ReactNode
}

export const CreateCategoryDialog = ({
  type,
  successCallback,
  trigger,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()
  const theme = useTheme()

  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: '',
      icon: '',
      type,
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: CreateCategory,
    onSuccess: async (data: Category) => {
      form.reset({
        name: '',
        icon: '',
        type,
      })

      toast.success(`Categoria ${data.name} criada com sucesso! 🎉`, {
        id: 'create-category',
      })

      successCallback(data)

      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      })

      setIsOpen((prev) => !prev)
    },
    onError: (error) => {
      console.error(error)
      toast.error('Erro ao criar categoria. Tente novamente.', {
        id: 'create-category',
      })
    },
  })

  const onSubmit = useCallback(
    (values: CreateCategorySchemaType) => {
      toast.loading('Criando categoria...', {
        id: 'create-category',
      })

      mutate(values)
    },
    [mutate]
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Nova categoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Criar uma nova
            <span
              className={`m-1 ${type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}
            >
              categoria
            </span>
          </DialogTitle>
          <DialogDescription>
            Categorias são usadas para agrupar suas transações
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Categoria" {...field} />
                  </FormControl>
                  <FormDescription>
                    É como a categoria aparecerá pelo app (obrigatório)
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              name="icon"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-[100px] w-full">
                          {form.watch('icon') ? (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-4xl" role="img">
                                {field.value}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Ícone selecionado. Clique para alterar
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <CircleOff className="h-[48px] w-[48px]" />
                              <p className="text-xs text-muted-foreground">
                                Nenhum ícone selecionado. Clique para escolher
                              </p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full">
                        <Picker
                          data={data}
                          theme={theme.resolvedTheme}
                          onEmojiSelect={(emoji: { native: string }) =>
                            field.onChange(emoji.native)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    Ícone da categoria, por exemplo: 🍔, 🚗, etc. (opcional)
                  </FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
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
