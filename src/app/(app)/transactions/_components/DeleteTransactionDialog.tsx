'use client'

import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'

import { DeleteTransaction } from '../_actions/deleteTransaction'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  transactionId: string
}

export const DeleteTransactionDialog = ({
  open,
  setOpen,
  transactionId,
}: Props) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: DeleteTransaction,
    onSuccess: async () => {
      toast.success('Transação deletada com sucesso', {
        id: transactionId,
      })
      await queryClient.invalidateQueries({
        queryKey: ['transactions'],
      })
    },
    onError: () => {
      toast.error('Erro ao deletar transação', {
        id: transactionId,
      })
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Você tem certeza que deseja deletar a transação?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Você pode criar uma nova transação
            com o mesmo nome e tipo posteriormente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading('Deletando transação...', {
                id: transactionId,
              })
              deleteMutation.mutate(transactionId)
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
