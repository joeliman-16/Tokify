'use client'
import { useEffect, useState } from 'react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/dashboard/orders')
      .then(r => r.json())
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'ALL' 
    ? orders 
    : orders.filter((o: any) => o.paymentStatus === filter)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📦 Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['ALL', 'PENDING', 'PAID', 'FULFILLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
              filter === status
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-3">📭</p>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any) => (
            <div 
              key={order.id}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">
                    {order.customerName || 'Anonymous Customer'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.customerPhone || 'No phone'} • {' '}
                    {new Date(order.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  order.paymentStatus === 'FULFILLED'
                    ? 'bg-green-100 text-green-700'
                    : order.paymentStatus === 'PAID'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <p className="text-sm text-gray-500">
                  {order.orderItems?.length || 0} items
                </p>
                <p className="font-bold text-orange-500">
                  ₹{order.totalAmount.toFixed(0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
