'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Users,
  Users2,
  FileText,
  Send,
  Clock,
  History,
  Settings,
  Menu,
  X,
  Smartphone,
  Zap,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { href: '/dashboard', label: 'Gösterge Paneli', icon: Menu },
  { href: '/dashboard/kisiler', label: 'Kişiler', icon: Users },
  { href: '/dashboard/gruplar', label: 'Gruplar', icon: Users2 },
  { href: '/dashboard/sablonlar', label: 'Şablonlar', icon: FileText },
  { href: '/dashboard/mesaj-gonder', label: 'Mesaj Gönder', icon: Send },
  { href: '/dashboard/kuyruk', label: 'Kuyruk', icon: Clock },
  { href: '/dashboard/gecmis', label: 'Geçmiş', icon: History },
  { href: '/dashboard/wa-web-session', label: 'WA Web Oturumu', icon: Smartphone },
  { href: '/dashboard/coklu-session', label: 'Çoklu WhatsApp', icon: Smartphone, badge: 'YENİ' },
  { href: '/dashboard/campaigns', label: 'Kampanyalar', icon: Zap },
  { href: '/dashboard/reports', label: 'Raporlar', icon: BarChart3 },
  { href: '/dashboard/ayarlar', label: 'Ayarlar', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-white shadow-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold">Yoncu Panel</h1>
                <p className="text-xs text-muted-foreground">WhatsApp Yönetimi</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {(item as any).badge && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">
                      {(item as any).badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Login kaldırıldı: Çıkış butonu kaldırıldı */}
        </div>
      </aside>
    </>
  )
}

