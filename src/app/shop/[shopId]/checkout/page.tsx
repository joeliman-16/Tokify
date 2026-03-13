'use client'
import { use, useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage({ 
  params 
}: { 
  params: Promise<{ shopId: string }> 
}) {
  const { shopId } = use(params)
  const { items, clearCart, getTotalPrice } = useCartStore()
  const router = useRouter()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = getTotalPrice ? getTotalPrice() : 
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError('')

    try {
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          customerName: customerName || null,
          customerPhone: customerPhone || null,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        setError(orderData.error || 'Failed to create order')
        setLoading(false)
        return
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Tokify',
        description: 'Order Payment',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: customerName || '',
          email: customerEmail || '',
          contact: customerPhone || '',
        },
        theme: {
          color: '#f97316',
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/orders/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) {
              setError(verifyData.error || 'Payment verification failed')
              return
            }
            clearCart()
            router.push(
              `/shop/${shopId}/success?orderId=${orderData.orderId}&token=${verifyData.token}` 
            )
          } catch (err) {
            setError('Payment verification failed')
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setError('Payment cancelled')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      setLoading(false)

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push(`/shop/${shopId}`)}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Back to Shop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-6">
        
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => router.back()} 
            className="text-gray-600 text-lg"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          {items.map(item => (
            <div 
              key={item.id} 
              className="flex justify-between py-2 border-b last:border-0"
            >
              <span className="text-gray-700">
                {item.name} x{item.quantity}
              </span>
              <span className="font-medium">
                ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-500">
              ₹{Number(total).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold mb-3">
            Your Details (Optional)
          </h2>
          <input
            type="text"
            placeholder="Your name"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="email"
            placeholder="Email address"
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Accepted Payments */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-sm text-gray-500 text-center mb-2">
            Accepted Payment Methods
          </p>
          <div className="flex justify-center gap-4 text-2xl">
            <span title="UPI">📱</span>
            <span title="Cards">💳</span>
            <span title="NetBanking">🏦</span>
            <span title="Wallets">👛</span>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            UPI • Cards • Net Banking • Wallets
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 shadow-lg"
        >
          {loading 
            ? 'Opening Payment...' 
            : `Pay ₹${Number(total).toFixed(2)}` 
          }
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          🔒 Secured by Razorpay
        </p>
      </div>
    </div>
  )
}
