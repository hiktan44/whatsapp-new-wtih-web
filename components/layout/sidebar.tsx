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
  LogOut,
  Menu,
  X,
  Smartphone,
  Zap,
  BarChart3,
  Phone,
  User,
  Crown,
} from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { href: '/dashboard', label: 'Gösterge Paneli', icon: Menu },
  { href: '/dashboard/kisiler', label: 'Kişiler', icon: Users },
  { href: '/dashboard/gruplar', label: 'Gruplar', icon: Users2 },
  { href: '/dashboard/wa-contacts', label: 'WA Kişileri', icon: Phone },
  { href: '/dashboard/wa-groups', label: 'WA Grupları', icon: Crown },
  { href: '/dashboard/sablonlar', label: 'Şablonlar', icon: FileText },
  { href: '/dashboard/mesaj-gonder', label: 'Mesaj Gönder', icon: Send },
  { href: '/dashboard/kuyruk', label: 'Kuyruk', icon: Clock },
  { href: '/dashboard/gecmis', label: 'Geçmiş', icon: History },
  { href: '/dashboard/wa-web-session', label: 'WA Web Oturumu', icon: Smartphone },
  { href: '/dashboard/campaigns', label: 'Kampanyalar', icon: Zap },
  { href: '/dashboard/reports', label: 'Raporlar', icon: BarChart3 },
  { href: '/dashboard/ayarlar', label: 'Ayarlar', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast({
        title: 'Çıkış yapıldı',
        description: 'Başarıyla çıkış yaptınız.',
      })
      router.push('/login')
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Çıkış yapılırken bir hata oluştu.',
        variant: 'destructive',
      })
    }
  }

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
                <h1 className="text-lg font-bold">HT Panel</h1>
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
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut size={20} className="mr-3" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

