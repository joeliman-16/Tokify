'use client'
import { use, useState } from 'react'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'

export default function CheckoutPage({ 
  params 
}: { 
  params: Promise<{ shopId: string }> 
}) {
  const { shopId } = use(params)
  const { items, clearCart } = useCartStore()
  const router = useRouter()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')
  const [upiLink, setUpiLink] = useState('')
  const [step, setStep] = useState<'details' | 'payment' | 'confirming'>('details')
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes

  const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

  const handleCreateOrder = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/orders/create', {
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
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to create order')
        return
      }
      setOrderId(data.orderId)
      setUpiLink(data.upiLink)
      setStep('payment')

      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setError('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpiPayment = (app: string) => {
    // Open UPI deep link
    window.location.href = upiLink
  }

  const handleConfirmPayment = async () => {
    setConfirmLoading(true)
    setError('')
    try {
      const response = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to confirm payment')
        return
      }
      clearCart()
      router.push(
        `/shop/${shopId}/success?orderId=${orderId}&token=${data.token}` 
      )
    } catch (err) {
      setError('Failed to confirm. Please try again.')
    } finally {
      setConfirmLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}` 
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push(`/shop/${shopId}`)}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg"
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
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-600">
            ← Back
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>

        {step === 'details' && (
          <>
            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <h2 className="font-semibold mb-3">Order Summary</h2>
              {items.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                  <span className="text-gray-700">{item.name} x{item.quantity}</span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-500">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <h2 className="font-semibold mb-3">Your Details (Optional)</h2>
              <input
                type="text"
                placeholder="Your name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
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

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'Creating Order...' : `Proceed to Pay ₹${total.toFixed(2)}`}
            </button>
          </>
        )}

        {step === 'payment' && (
          <>
            {/* Timer */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 text-center">
              <p className="text-orange-600 font-medium">Complete payment within</p>
              <p className="text-3xl font-bold text-orange-500">{formatTime(timeLeft)}</p>
              {timeLeft === 0 && (
                <p className="text-red-500 text-sm mt-1">Order expired! Please go back and try again.</p>
              )}
            </div>

            {/* Order amount */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm text-center">
              <p className="text-gray-500">Amount to pay</p>
              <p className="text-4xl font-bold text-orange-500">₹{total.toFixed(2)}</p>
            </div>

            {/* UPI Payment buttons */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <h2 className="font-semibold mb-4 text-center">Pay with UPI</h2>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => handleUpiPayment('phonepe')}
                  disabled={timeLeft === 0}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-purple-200 rounded-2xl hover:bg-purple-50 disabled:opacity-50"
                >
                  <span className="text-2xl">💜</span>
                  <span className="font-medium text-purple-700">PhonePe</span>
                </button>

                <button
                  onClick={() => handleUpiPayment('gpay')}
                  disabled={timeLeft === 0}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 rounded-2xl hover:bg-blue-50 disabled:opacity-50"
                >
                  <span className="text-2xl">🔵</span>
                  <span className="font-medium text-blue-700">Google Pay</span>
                </button>

                <button
                  onClick={() => handleUpiPayment('paytm')}
                  disabled={timeLeft === 0}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 rounded-2xl hover:bg-blue-50 disabled:opacity-50"
                >
                  <span className="text-2xl">💙</span>
                  <span className="font-medium text-blue-600">Paytm</span>
                </button>

                <button
                  onClick={() => handleUpiPayment('upi')}
                  disabled={timeLeft === 0}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-green-200 rounded-2xl hover:bg-green-50 disabled:opacity-50"
                >
                  <span className="text-2xl">💚</span>
                  <span className="font-medium text-green-700">Other UPI</span>
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                All buttons open your UPI app to complete payment
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-2xl p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">📱 How to pay:</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Click any UPI button above</li>
                <li>2. Complete payment in your UPI app</li>
                <li>3. Return to this page</li>
                <li>4. Click "I Have Paid" below</li>
              </ol>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleConfirmPayment}
              disabled={confirmLoading || timeLeft === 0}
              className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 mb-3"
            >
              {confirmLoading ? 'Confirming...' : '✅ I Have Paid'}
            </button>

            <button
              onClick={() => router.back()}
              className="w-full border border-gray-300 text-gray-600 py-3 rounded-2xl"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
