'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  QrCode, 
  Settings, 
  Store,
  Plus,
  TrendingUp,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Scanner', href: '/dashboard/scanner', icon: QrCode },
  { name: 'QR Code', href: '/dashboard/qr', icon: Store },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [shop, setShop] = useState<any>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    activeShop: false
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchShopData()
  }, [session, status])

  // Refetch shop data when returning from setup page
  useEffect(() => {
    const handleRouteChange = () => {
      fetchShopData()
    }
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    // Also check if we came from setup page
    if (document.referrer.includes('/setup') || window.location.pathname === '/dashboard') {
      handleRouteChange()
    }
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  const fetchShopData = async () => {
    try {
      const response = await fetch('/api/shops')
      if (response.ok) {
        const shops = await response.json()
        if (shops.length > 0) {
          const userShop = shops[0]
          setShop(userShop)
          setStats({
            totalProducts: userShop.products?.length || 0,
            totalOrders: userShop.orders?.length || 0,
            activeShop: userShop.isActive
          })
        } else {
          // No shop found, redirect to setup
          router.replace('/dashboard/setup')
        }
      }
    } catch (error) {
      console.error('Failed to fetch shop data:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Don't show loading if we're on the setup page - let setup page handle its own loading
  if (!shop) {
    return children
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 lg:hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-indigo-900 text-xl font-bold font-heading">TP</span>
            </div>
            <span className="text-white font-bold font-heading">Troxpay</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:bg-indigo-700 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 text-white hover:bg-indigo-700 p-3 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-body">{item.name}</span>
            </Link>
          ))}
          
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex items-center gap-3 text-white hover:bg-indigo-700 p-3 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-body">Logout</span>
          </button>
        </nav>
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-gradient-to-b lg:from-indigo-900 lg:to-indigo-800">
        <div className="flex items-center gap-3 p-6 border-b border-indigo-700">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-indigo-900 text-xl font-bold font-heading">T</span>
          </div>
          <span className="text-white font-bold font-heading">Troxpay</span>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 text-white hover:bg-indigo-700 p-3 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-body">{item.name}</span>
            </Link>
          ))}
          
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex items-center gap-3 text-white hover:bg-indigo-700 p-3 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-body">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold font-heading text-gray-900">
                  Welcome back, {session.user?.name || 'User'}!
                </h1>
                <p className="text-sm text-gray-600 font-body">
                  {shop.name} • {shop.category}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <span className={`w-2 h-2 rounded-full ${stats.activeShop ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-body">
                  {stats.activeShop ? 'Shop Active' : 'Shop Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navigation.slice(0, 4).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-indigo-900 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-body">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
