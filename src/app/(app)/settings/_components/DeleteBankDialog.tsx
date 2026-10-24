'use client'

import { ReactNode } from 'react'

import { Bank } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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

interface Props {
  trigger: ReactNode
  bank: Bank
}

export const DeleteBankDialog = ({ trigger, bank }: Props) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/banks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: bank.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Erro ao deletar banco')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Banco deletado com sucesso', {
        id: bank.id,
      })

      queryClient.invalidateQueries({
        queryKey: ['banks'],
      })
      queryClient.invalidateQueries({
        queryKey: ['transactions'],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao deletar banco', {
        id: bank.id,
      })
    },
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá deletar permanentemente o
            banco <span className="font-bold">{bank.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading('Deletando banco...', {
                id: bank.id,
              })
              deleteMutation.mutate()
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
