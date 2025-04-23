'use client'

import { useCallback, useEffect, useState } from 'react'

import { Category } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib'
import { TransactionType } from '@/lib/types'

import { CreateCategoryDialog } from './create_category_dialog'

interface Props {
  type: TransactionType
  onChange: (value: string) => void
}

export const CategoryPicker = ({ type, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')

  const categoriesQuery = useQuery({
    queryKey: ['categories', type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((res) => res.json()),
  })

  const selectedCategory = categoriesQuery.data?.find(
    (category: Category) => category.name === value
  )

  const successCallback = useCallback(
    (category: Category) => {
      setValue(category.name)
      setIsOpen((prev) => !prev)
    },
    [setValue, setIsOpen]
  )

  useEffect(() => {
    if (!value) return
    onChange(value)
  }, [onChange, value])

  const CategoryRow = ({ category }: { category: Category }) => (
    <div className="flex items-center gap-2">
      <span role="img"> {category.icon} </span>
      <span>{category.name}</span>
    </div>
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="min-w-[200px] justify-between"
        >
          {selectedCategory ? (
            <CategoryRow category={selectedCategory} />
          ) : (
            'Selecione uma categoria'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command onSubmit={(e) => e.preventDefault()}>
          <CommandInput placeholder="Pesquisar categoria..." />
          <CreateCategoryDialog type={type} successCallback={successCallback} />
          <CommandEmpty>
            <p>Categoria não encontrada</p>
            <p className="text-xs text-muted-foreground">
              Dica: crie uma nova categoria
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {categoriesQuery.data &&
                categoriesQuery.data.map((category: Category) => (
                  <CommandItem
                    key={category.name}
                    onSelect={() => {
                      setValue(category.name)
                      setIsOpen((prev) => !prev)
                    }}
                  >
                    <CategoryRow category={category} />
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 opacity-0',
                        value === category.name && 'opacity-100'
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
