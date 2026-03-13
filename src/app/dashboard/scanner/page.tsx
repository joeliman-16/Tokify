'use client'
import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface OrderDetails {
  id: string
  customerName: string | null
  customerPhone: string | null
  totalAmount: number
  paymentStatus: string
  paymentId: string | null
  orderItems: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      image: string | null
    }
  }[]
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [fulfillLoading, setFulfillLoading] = useState(false)
  const [scannedToken, setScannedToken] = useState('')
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const startScanner = () => {
    setScanning(true)
    setOrder(null)
    setError('')
    setSuccess(false)
    setScannedToken('')

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )

      scanner.render(
        async (decodedText) => {
          scanner.clear()
          setScanning(false)
          await handleScan(decodedText)
        },
        (err) => {
          console.log('Scan error:', err)
        }
      )

      scannerRef.current = scanner
    }, 100)
  }

  const handleScan = async (text: string) => {
    try {
      // Extract token from URL or use directly
      let token = text
      if (text.includes('/verify/')) {
        token = text.split('/verify/')[1]
      }
      setScannedToken(token)

      const response = await fetch(`/api/verify/${token}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid QR code')
        return
      }

      setOrder(data.order)
    } catch (err) {
      setError('Failed to verify QR code')
    }
  }

  const handleFulfill = async () => {
    if (!order || !scannedToken) return
    setFulfillLoading(true)

    try {
      const response = await fetch(`/api/verify/${scannedToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fulfill order')
        return
      }

      setSuccess(true)
      setOrder(null)
      setScannedToken('')
    } catch (err) {
      setError('Failed to fulfill order')
    } finally {
      setFulfillLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-indigo-900 mb-6">
          📷 Order Scanner
        </h1>

        {!scanning && !order && !success && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-lg font-semibold mb-2">Scan Customer QR</h2>
            <p className="text-gray-500 mb-6">
              Ask customer to show their Order QR code
            </p>
            <button
              onClick={startScanner}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg"
            >
              Start Scanning
            </button>
          </div>
        )}

        {scanning && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div id="qr-reader" className="w-full"></div>
            <button
              onClick={() => {
                scannerRef.current?.clear()
                setScanning(false)
              }}
              className="w-full mt-4 border border-gray-300 text-gray-600 py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-red-600 font-medium">❌ {error}</p>
            <button
              onClick={() => {
                setError('')
                startScanner()
              }}
              className="mt-3 w-full bg-red-500 text-white py-2 rounded-xl"
            >
              Try Again
            </button>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-500 text-xl">✅</span>
              <h2 className="font-bold text-lg">Valid Order!</h2>
            </div>

            {order.customerName && (
              <p className="text-gray-600 mb-1">
                Customer: <strong>{order.customerName}</strong>
              </p>
            )}
            {order.customerPhone && (
              <p className="text-gray-600 mb-1">
                Phone: <strong>{order.customerPhone}</strong>
              </p>
            )}
            {order.paymentId && (
              <p className="text-gray-600 mb-3">
                UTR: <strong className="font-mono">{order.paymentId}</strong>
              </p>
            )}

            <div className="border-t pt-3 mb-3">
              <h3 className="font-semibold mb-2">Items to give:</h3>
              {order.orderItems.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span className="text-orange-500 font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total Paid</span>
              <span className="text-green-600">₹{order.totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleFulfill}
              disabled={fulfillLoading}
              className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50"
            >
              {fulfillLoading ? 'Processing...' : '✅ Hand Over Items & Complete'}
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Order Fulfilled!</h2>
            <p className="text-green-600 mb-4">Items handed over successfully</p>
            <button
              onClick={() => {
                setSuccess(false)
                startScanner()
              }}
              className="w-full bg-green-500 text-white py-3 rounded-2xl font-bold"
            >
              Scan Next Order
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
