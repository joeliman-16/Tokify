'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import QRCode from 'qrcode'
import { 
  Download, 
  Printer, 
  Share2, 
  Store,
  QrCode,
  Copy,
  Check
} from 'lucide-react'

export default function QRCodePage() {
  const [shop, setShop] = useState<any>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [shopUrl, setShopUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetchShopData()
  }, [])

  useEffect(() => {
    if (shop && canvasRef.current) {
      generateQRCode()
    }
  }, [shop])

  const fetchShopData = async () => {
    try {
      const response = await fetch('/api/shops')
      if (response.ok) {
        const shops = await response.json()
        if (shops.length > 0) {
          const userShop = shops[0]
          setShop(userShop)
          setShopUrl(`https://tokify.vercel.app/shop/${userShop.id}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch shop data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRCode = async () => {
    if (!shop || !canvasRef.current) return

    try {
      const canvas = canvasRef.current
      await QRCode.toCanvas(canvas, shopUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff'
        }
      })
      
      // Convert canvas to data URL for download
      const dataUrl = canvas.toDataURL('image/png')
      setQrCodeUrl(dataUrl)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `${shop.name.replace(/\s+/g, '-').toLowerCase()}-qrcode.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printQRCode = () => {
    if (!qrCodeUrl) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${shop.name} QR Code</title>
            <style>
              body {
                font-family: 'Inter', sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .shop-name {
                font-size: 24px;
                font-weight: bold;
                color: #1e1b4b;
                margin-bottom: 10px;
              }
              .instructions {
                font-size: 16px;
                color: #666;
                margin-bottom: 20px;
              }
              .qr-container {
                border: 2px solid #1e1b4b;
                padding: 20px;
                border-radius: 10px;
                background: white;
              }
              .qr-image {
                max-width: 300px;
                height: auto;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="shop-name">${shop.name}</div>
              <div class="instructions">Scan to order from ${shop.name}</div>
            </div>
            <div class="qr-container">
              <img src="${qrCodeUrl}" alt="QR Code" class="qr-image" />
            </div>
            <div class="footer">
              Powered by Tokify • Scan. Pay. Trust.
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const shareQRCode = async () => {
    if (navigator.share && shopUrl) {
      try {
        await navigator.share({
          title: `${shop.name} - Order Online`,
          text: `Scan to order from ${shop.name}`,
          url: shopUrl
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard()
    }
  }

  const copyToClipboard = async () => {
    if (shopUrl) {
      try {
        await navigator.clipboard.writeText(shopUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="text-center py-12">
        <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium font-heading text-gray-900 mb-2">
          No shop found
        </h3>
        <p className="text-gray-600 font-body">
          Please set up your shop first
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold font-heading text-gray-900 mb-2">Shop QR Code</h1>
        <p className="text-gray-600 font-body">
          Display this QR code at your shop counter for easy ordering
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Display */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
        >
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-xl font-bold font-heading text-gray-900 mb-2">
                {shop.name}
              </h2>
              <p className="text-gray-600 font-body">{shop.category}</p>
            </div>
            
            {/* QR Code Canvas */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-2 border-indigo-900 rounded-lg">
                <canvas
                  ref={canvasRef}
                  className="block"
                  width={300}
                  height={300}
                />
              </div>
            </div>

            {/* Shop URL */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 font-body truncate max-w-xs">
                  {shopUrl}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="p-1 text-gray-500 hover:text-indigo-900 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={downloadQRCode}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-lg font-body hover:from-indigo-800 hover:to-indigo-600 transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              
              <button
                onClick={printQRCode}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-body hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Instructions Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-orange-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold font-heading text-gray-900 mb-4">
              How to Use Your QR Code
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-900 text-white rounded-full flex items-center justify-center text-sm font-body flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700 font-body">
                  Download and print the QR code in a visible size
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-900 text-white rounded-full flex items-center justify-center text-sm font-body flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700 font-body">
                  Display it at your shop counter or entrance
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-900 text-white rounded-full flex items-center justify-center text-sm font-body flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700 font-body">
                  Customers can scan to browse and order products
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-900 text-white rounded-full flex items-center justify-center text-sm font-body flex-shrink-0">
                  4
                </div>
                <p className="text-gray-700 font-body">
                  Receive instant notifications for new orders
                </p>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold font-heading text-gray-900 mb-4">
              Share Your Shop
            </h3>
            <div className="space-y-3">
              <button
                onClick={shareQRCode}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-orange-50 text-orange-600 rounded-lg font-body hover:bg-orange-100 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share QR Code
              </button>
              
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg font-body hover:bg-gray-100 transition-colors"
              >
                <Copy className="w-5 h-5" />
                Copy Shop Link
              </button>
            </div>
          </div>

          {/* Shop Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold font-heading text-gray-900 mb-4">
              Shop Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 font-body">Shop Name</p>
                <p className="font-medium font-heading text-gray-900">{shop.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-body">Category</p>
                <p className="font-medium font-heading text-gray-900">{shop.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-body">UPI ID</p>
                <p className="font-medium font-heading text-gray-900">{shop.upiId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-body">Phone</p>
                <p className="font-medium font-heading text-gray-900">{shop.phone}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
