'use client'

import { useEffect, useState, use } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, Download, QrCode, ArrowLeft, ShoppingBag } from 'lucide-react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function SuccessPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const orderId = searchParams.get('orderId')
  const token = searchParams.get('token')

  useEffect(() => {
    if (orderId && token) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Fetch order details
      fetchOrderDetails()
    }
  }, [orderId, token])

  const fetchOrderDetails = async () => {
    try {
      // For now, we'll use the data from URL params
      // In a real app, you'd fetch from API
      setOrderData({
        orderId,
        verificationUrl: `https://tokify.vercel.app/verify/${token}`
      })
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToShop = () => {
    router.push(`/shop/${shopId}`)
  }

  const handleDownloadQR = () => {
    // Create a temporary link to download the QR code
    const link = document.createElement('a')
    link.download = `order-${orderId}-qr.png`
    link.href = `/api/qr/${token}` // We'll need to create this endpoint
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-800">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-800">Order not found</p>
          <button
            onClick={handleBackToShop}
            className="mt-4 text-red-600 hover:text-red-700"
          >
            Back to Shop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToShop}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Payment Success</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Success Message */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-green-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-green-600">
              Your order has been placed successfully
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Order ID: {orderId}
            </p>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-3">
              <QrCode className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Important Instructions</h3>
            </div>
            <p className="text-blue-700">
              Show this QR code to the shopkeeper to complete your order. 
              The shopkeeper will scan it to verify your payment and hand over your items.
            </p>
          </motion.div>

          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <h3 className="text-lg font-semibold mb-4">Order QR Code</h3>
            
            {/* QR Code Placeholder - In a real app, generate actual QR */}
            <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">QR Code</p>
                <p className="text-gray-400 text-xs mt-1">{token?.slice(0, 8)}...</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadQR}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Save QR Code</span>
              </button>
              
              <p className="text-xs text-gray-500">
                Verification URL: {orderData.verificationUrl}
              </p>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-orange-600" />
              Order Summary
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-medium">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className="font-medium text-green-600">Paid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status</span>
                <span className="font-medium text-blue-600">Pending</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <button
              onClick={handleBackToShop}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Shop
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
