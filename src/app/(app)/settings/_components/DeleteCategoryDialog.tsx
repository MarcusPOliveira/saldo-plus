import { ReactNode, useState } from 'react'

import { Category } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { TransactionType } from '@/lib/types'

import { DeleteCategory } from '../../dashboard/_actions/categories'

interface Props {
  trigger?: ReactNode
  category?: Category
}

export const DeleteCategoryDialog = ({ trigger, category }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  const categoryIdentifier = `${category?.name}-${category?.type}`

  const deleteMutation = useMutation({
    mutationFn: DeleteCategory,
    onSuccess: async () => {
      toast.success('Categoria deletada com sucesso', {
        id: categoryIdentifier,
      })
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      })
    },
    onError: () => {
      toast.error('Erro ao deletar categoria', {
        id: categoryIdentifier,
      })
    },
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Você tem certeza que deseja deletar a categoria {category?.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Você pode criar uma nova categoria
            com o mesmo nome e ícone posteriormente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading('Deletando categoria...', {
                id: categoryIdentifier,
              })
              deleteMutation.mutate({
                name: category?.name as string,
                type: category?.type as TransactionType,
              })
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
