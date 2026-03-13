'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  totalOrders: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  paidOrders: number
  fulfilledOrders: number
  recentOrders: any[]
  topProducts: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        📊 Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl p-4 shadow-sm">
          <p className="text-orange-100 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold">
            ₹{stats?.totalRevenue.toFixed(0) || 0}
          </p>
          <p className="text-orange-100 text-xs mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl p-4 shadow-sm">
          <p className="text-blue-100 text-sm">Total Orders</p>
          <p className="text-2xl font-bold">
            {stats?.totalOrders || 0}
          </p>
          <p className="text-blue-100 text-xs mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl p-4 shadow-sm">
          <p className="text-green-100 text-sm">Today Revenue</p>
          <p className="text-2xl font-bold">
            ₹{stats?.todayRevenue.toFixed(0) || 0}
          </p>
          <p className="text-green-100 text-xs mt-1">Today</p>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-2xl p-4 shadow-sm">
          <p className="text-purple-100 text-sm">Today Orders</p>
          <p className="text-2xl font-bold">
            {stats?.todayOrders || 0}
          </p>
          <p className="text-purple-100 text-xs mt-1">Today</p>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <h2 className="font-semibold mb-4">Order Status</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-yellow-50 rounded-xl">
            <p className="text-2xl font-bold text-yellow-600">
              {stats?.pendingOrders || 0}
            </p>
            <p className="text-xs text-yellow-600">Pending</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">
              {stats?.paidOrders || 0}
            </p>
            <p className="text-xs text-blue-600">Paid</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">
              {stats?.fulfilledOrders || 0}
            </p>
            <p className="text-xs text-green-600">Fulfilled</p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {stats?.topProducts && stats.topProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <h2 className="font-semibold mb-4">🏆 Top Products</h2>
          {stats.topProducts.map((product, index) => (
            <div 
              key={index}
              className="flex justify-between items-center py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
                <span className="font-medium">{product.name}</span>
              </div>
              <span className="text-gray-500 text-sm">
                {product.quantity} sold
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Recent Orders</h2>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="text-orange-500 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          stats.recentOrders.map((order: any) => (
            <div 
              key={order.id}
              className="flex justify-between items-center py-3 border-b last:border-0"
            >
              <div>
                <p className="font-medium text-sm">
                  {order.customerName || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-500">
                  ₹{order.totalAmount.toFixed(0)}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  order.paymentStatus === 'FULFILLED' 
                    ? 'bg-green-100 text-green-600'
                    : order.paymentStatus === 'PAID'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-2">📦</p>
            <p>No orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
