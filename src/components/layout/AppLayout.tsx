import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Heart } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent transition-colors"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">SeniorCare</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
