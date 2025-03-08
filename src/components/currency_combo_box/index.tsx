'use client'

import { useEffect, useState } from 'react'

import { UserSettings } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'

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

  useEffect(() => {
    if (!userSettings.data) return

    const userCurrency = currencies.find(
      (currency) => currency.value === userSettings.data.currency
    )

    if (userCurrency) setSelectedOption(userCurrency)
  }, [userSettings.data])

  console.log('userSettings', userSettings)

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={userSettings.isFetching}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {selectedOption ? <>{selectedOption.label}</> : <>Selecionar</>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionList
              setOpen={setOpen}
              setSelectedOption={setSelectedOption}
            />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    )
  }

  return (
    <SkeletonWrapper isLoading={userSettings.isFetching}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {selectedOption ? <>{selectedOption.label}</> : <>Selecionar</>}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <OptionList
              setOpen={setOpen}
              setSelectedOption={setSelectedOption}
            />
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
  setSelectedOption: (status: Currency | null) => void
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
