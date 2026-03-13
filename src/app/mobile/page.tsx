'use client'

import { useState, useEffect } from 'react'
import { 
  QrCode, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Search,
  Plus,
  Bell,
  User,
  Home,
  TrendingUp
} from 'lucide-react'

interface MobileStats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  lowStockProducts: number
}

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<MobileStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMobileStats()
  }, [])

  const fetchMobileStats = async () => {
    try {
      const response = await fetch('/api/mobile/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching mobile stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigation = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'scanner', name: 'Scanner', icon: QrCode },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView stats={stats} loading={loading} />
      case 'orders':
        return <OrdersView />
      case 'products':
        return <ProductsView />
      case 'analytics':
        return <AnalyticsView />
      case 'scanner':
        return <ScannerView />
      case 'settings':
        return <SettingsView />
      default:
        return <HomeView stats={stats} loading={loading} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">TP</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Troxpay</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                {stats?.pendingOrders && stats.pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {stats.pendingOrders}
                  </span>
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative bg-white w-64 h-full shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          {navigation.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

// Home View Component
function HomeView({ stats, loading }: { stats: MobileStats | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4">
        <h2 className="text-lg font-bold mb-2">Welcome back!</h2>
        <p className="text-blue-100">Here's your business overview for today</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.todayOrders || 0}</p>
          <p className="text-sm text-gray-600">Today's Orders</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{stats?.todayRevenue || 0}</p>
          <p className="text-sm text-gray-600">Today's Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-8 h-8 text-yellow-600" />
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              {stats?.pendingOrders || 0}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
          <p className="text-sm text-gray-600">Pending Orders</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-orange-600" />
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              {stats?.lowStockProducts || 0}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.lowStockProducts || 0}</p>
          <p className="text-sm text-gray-600">Low Stock</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <QrCode className="w-5 h-5" />
            <span className="text-sm font-medium">Scan QR</span>
          </button>
          <button className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">New Order</span>
          </button>
          <button className="flex items-center gap-2 p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
            <Package className="w-5 h-5" />
            <span className="text-sm font-medium">Add Product</span>
          </button>
          <button className="flex items-center gap-2 p-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">View Stats</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Orders View Component
function OrdersView() {
  return (
    <div className="p-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Order #{1000 + i}</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Pending
                </span>
              </div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="font-semibold text-gray-900">₹{(i * 150 + 50)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Products View Component
function ProductsView() {
  return (
    <div className="p-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Products</h2>
          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Product {i}</h3>
                  <p className="text-sm text-gray-600">Stock: {10 - i * 2}</p>
                </div>
                <p className="font-semibold text-gray-900">₹{(i * 100 + 50)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Analytics View Component
function AnalyticsView() {
  return (
    <div className="p-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Analytics</h2>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-900">₹12,450</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-green-900">48</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm text-purple-600 mb-1">Avg Order Value</p>
            <p className="text-2xl font-bold text-purple-900">₹259</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Scanner View Component
function ScannerView() {
  return (
    <div className="p-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center">
          <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">QR Scanner</h2>
          <p className="text-gray-600 mb-4">Scan customer QR codes to verify orders</p>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Start Scanning
          </button>
        </div>
      </div>
    </div>
  )
}

// Settings View Component
function SettingsView() {
  return (
    <div className="p-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Settings</h2>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <span className="text-gray-900">Profile</span>
            <User className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <span className="text-gray-900">Notifications</span>
            <Bell className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <span className="text-gray-900">Shop Settings</span>
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <span className="text-gray-900">Help & Support</span>
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
