'use client'
import { useState } from 'react'

import { UserButton } from '@clerk/nextjs'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Logo, ThemeSwitch } from '@/components'
import { cn } from '@/lib/utils'

import { Button, buttonVariants } from '../ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet'

const items = [
  {
    id: '1',
    label: 'Dashboard',
    link: '/dashboard',
  },
  {
    id: '2',
    label: 'Transações',
    link: '/transactions',
  },
  {
    id: '3',
    label: 'Configurações',
    link: '/settings',
  },
]

export const Navbar = () => {
  const NavBarItem = ({
    label,
    link,
    onClickCallback,
  }: {
    label: string
    link: string
    onClickCallback?: () => void
  }) => {
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
          onClick={() => {
            onClickCallback && onClickCallback()
          }}
        >
          {label}
        </Link>
        {isActive && (
          <div className="roudend-xl absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 bg-primary-foreground md:block" />
        )}
      </div>
    )
  }

  const DesktopNavbar = () => {
    return (
      <div className="hidden border-b border-separate bg-background md:block">
        <nav className="container flex items-center justify-between px-8">
          <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
            <Logo />
            <div className="flex h-full">
              {items.map((item) => (
                <NavBarItem key={item.id} label={item.label} link={item.link} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </nav>
      </div>
    )
  }

  const MobileNavbar = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="block border-separate bg-background md:hidden">
        <nav className="container flex items-center justify-between px-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[350px] pr-10 sm:w-[540px]" side="left">
              <SheetTitle className="flex items-start pl-3">
                <Logo />
              </SheetTitle>
              <div className="flex flex-col gap-1 pt-4">
                {items.map((item) => (
                  <NavBarItem
                    key={item.label}
                    label={item.label}
                    link={item.link}
                    onClickCallback={() => setIsOpen((prev) => !prev)}
                  />
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
            <Logo />
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </nav>
      </div>
    )
  }

  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  )
}
