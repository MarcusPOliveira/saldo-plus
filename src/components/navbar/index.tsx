'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Logo } from '@/components'
import { cn } from '@/lib/utils'

import { buttonVariants } from '../ui/button'

const items = [
  {
    id: '1',
    label: 'Dashboard',
    link: '/',
  },
  {
    id: '2',
    label: 'Transactions',
    link: '/transactions',
  },
  {
    id: '3',
    label: 'Manage',
    link: '/manage',
  },
]

export const Navbar = () => {
  const NavBarItem = ({ label, link }: { label: string; link: string }) => {
    const pathname = usePathname()
    const isActive = pathname === link

    return (
      <div className="relative flex items-center">
        <Link
          href={link}
          className={cn(
            buttonVariants({
              variant: 'ghost',
            }),
            'w-full justify-start text-lg text-muted-foreground hover:text-foreground',
            isActive && 'text-foreground'
          )}
        >
          {label}
        </Link>
      </div>
    )
  }

  const DesktopNavbar = () => {
    return (
      <div className="hidden border-separate border-b bg-background md:block">
        <nav className="container flex items-center justify-between px-8">
          <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
            <Logo />
            <div className="flex h-full">
              {items.map((item) => (
                <NavBarItem key={item.id} label={item.label} link={item.link} />
              ))}
            </div>
          </div>
        </nav>
      </div>
    )
  }

  return (
    <>
      <DesktopNavbar />
    </>
  )
}
