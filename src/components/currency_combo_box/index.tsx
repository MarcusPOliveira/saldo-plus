'use client'

import { useCallback, useEffect, useState } from 'react'

import { UserSettings } from '@prisma/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { UpdateUserCurrency } from '@/app/(app)/wizard/_actions/userSettings'
import { SkeletonWrapper } from '@/components'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks'
import { currencies, Currency } from '@/lib'

export function CurrencyComboBox() {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [selectedOption, setSelectedOption] = useState<Currency | null>(null)

  const userSettings = useQuery<UserSettings>({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const res = await fetch('/api/user-settings')
      const data = await res.json()
      return data
    },
  })

  const mutation = useMutation({
    mutationFn: UpdateUserCurrency,
    onSuccess: (data: UserSettings) => {
      toast.success('Moeda atualizada com sucesso 🥳', {
        id: 'update-currency',
      })

      setSelectedOption(
        currencies.find((currency) => currency.value === data.currency) || null
      )
    },
    onError: (error) => {
      console.error(error)
      toast.error('Erro ao atualizar moeda. Por favor, tente novamente.', {
        id: 'update-currency',
      })
    },
  })

  const selectOption = useCallback(
    (currency: Currency | null) => {
      if (!currency) {
        toast.error('Por favor, selecione uma moeda.')
        return
      }

      toast.loading('Atualizando moeda...', {
        id: 'update-currency',
      })

      mutation.mutate(currency.value)
    },
    [mutation]
  )

  useEffect(() => {
    if (!userSettings.data) return

    const userCurrency = currencies.find(
      (currency) => currency.value === userSettings.data.currency
    )

    if (userCurrency) setSelectedOption(userCurrency)
  }, [userSettings.data])

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={userSettings.isFetching}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={mutation.isPending}
            >
              {selectedOption ? <>{selectedOption.label}</> : <>Selecionar</>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    )
  }

  return (
    <SkeletonWrapper isLoading={userSettings.isFetching}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={mutation.isPending}
          >
            {selectedOption ? <>{selectedOption.label}</> : <>Selecionar</>}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  )
}

function OptionList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void
  setSelectedOption: (value: Currency | null) => void
}) {
  return (
    <Command>
      <CommandInput placeholder="Filtrar moeda..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {currencies.map((currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={(value) => {
                setSelectedOption(
                  currencies.find((priority) => priority.value === value) ||
                    null
                )
                setOpen(false)
              }}
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
