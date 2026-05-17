'use client'
import Link from 'next/link'

import { useRouter } from 'next/navigation'
import { Bell, Heart, User, LogOut, LayoutDashboard, PlusCircle, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { Button } from './ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { BackspaceLogo } from './backspace-logo'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[#031c47] shadow-md">
      <div className="mx-auto max-w-7xl px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <BackspaceLogo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link href="/favorites">
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              {user.role === 'HOST' && (
                <Link href="/spots/new">
                  <Button size="sm" className="bg-amber-400 hover:bg-amber-500 text-[#031c47] font-semibold gap-1.5 ml-1">
                    <PlusCircle className="h-4 w-4" /> Add Spot
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer h-9 w-9 ml-1 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#031c47]">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-amber-400 text-[#031c47] font-bold">{user.name[0]}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-900">{user.name}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="text-gray-700 cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="text-gray-700 cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); router.push('/') }} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-amber-400 hover:bg-amber-500 text-[#031c47] font-semibold">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#031c47] border-t border-white/10 px-4 pb-4 space-y-2">
          {user ? (
            <>
              <div className="text-white/70 text-sm pt-2">{user.name}</div>
              <Link href="/dashboard" className="block text-white py-1.5" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link href="/favorites" className="block text-white py-1.5" onClick={() => setMobileOpen(false)}>Favorites</Link>
              <Link href="/notifications" className="block text-white py-1.5" onClick={() => setMobileOpen(false)}>Notifications</Link>
              {user.role === 'HOST' && <Link href="/spots/new" className="block text-amber-400 py-1.5" onClick={() => setMobileOpen(false)}>+ Add Spot</Link>}
              <button onClick={() => { logout(); router.push('/'); setMobileOpen(false) }} className="block text-red-400 py-1.5">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-white py-1.5" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link href="/register" className="block text-amber-400 py-1.5 font-semibold" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
