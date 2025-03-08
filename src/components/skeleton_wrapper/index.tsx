import { ReactNode } from 'react'

import { cn } from '@/lib'

import { Skeleton } from '../ui/skeleton'

interface Props {
  children: ReactNode
  isLoading: boolean
  fullWidth?: boolean
}

export const SkeletonWrapper = ({ children, isLoading, fullWidth }: Props) => {
  if (!isLoading) return children

  return (
    <Skeleton className={cn(fullWidth && 'w-full')}>
      <div className="opacity-0">{children}</div>
    </Skeleton>
  )
}
