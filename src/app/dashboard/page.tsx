'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [shop, setShop] = useState<any>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    activeShop: false,
    recentOrders: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
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
            activeShop: userShop.isActive,
            recentOrders: userShop.orders || []
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold font-heading mb-2">
          Welcome to {shop?.name || 'Your Shop'}!
        </h1>
        <p className="text-indigo-100 font-body">
          Manage your products, track orders, and grow your business with Tokify
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold font-heading text-gray-900">
              {stats.totalProducts}
            </span>
          </div>
          <h3 className="text-gray-600 font-body">Total Products</h3>
          <p className="text-sm text-gray-500 font-body mt-1">
            Active items in your catalog
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold font-heading text-gray-900">
              {stats.totalOrders}
            </span>
          </div>
          <h3 className="text-gray-600 font-body">Total Orders</h3>
          <p className="text-sm text-gray-500 font-body mt-1">
            All-time customer orders
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className={`text-sm font-semibold font-body px-2 py-1 rounded-full ${
              stats.activeShop 
                ? 'text-green-600 bg-green-50' 
                : 'text-red-600 bg-red-50'
            }`}>
              {stats.activeShop ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h3 className="text-gray-600 font-body">Shop Status</h3>
          <p className="text-sm text-gray-500 font-body mt-1">
            Your shop is {stats.activeShop ? 'live' : 'offline'}
          </p>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-heading text-gray-900">
              Recent Orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-indigo-600 hover:text-indigo-700 font-body text-sm font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium font-heading text-gray-900">
                        {order.customerName}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-body mt-1">
                      {order.customerPhone} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold font-heading text-gray-900">
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {getPaymentStatusIcon(order.paymentStatus)}
                      <span className="text-xs text-gray-500 font-body capitalize">
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium font-heading text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-600 font-body mb-4">
                Start by adding products and sharing your QR code
              </p>
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 bg-indigo-900 text-white px-4 py-2 rounded-lg font-body hover:bg-indigo-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Products
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Link
          href="/dashboard/products/new"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium font-heading text-gray-900">Add Product</h3>
              <p className="text-sm text-gray-600 font-body">New item</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/qr"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium font-heading text-gray-900">View QR</h3>
              <p className="text-sm text-gray-600 font-body">Shop code</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/orders"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium font-heading text-gray-900">Orders</h3>
              <p className="text-sm text-gray-600 font-body">View all</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/settings"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium font-heading text-gray-900">Settings</h3>
              <p className="text-sm text-gray-600 font-body">Configure</p>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
