'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, ShoppingCart, Phone, MapPin, Star, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import CartDrawer from '@/components/CartDrawer'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  quantity: number
  isAvailable: boolean
}

interface Shop {
  id: string
  name: string
  category: string
  logo?: string
  upiId: string
  phone: string
  address: string
}

interface ShopData {
  shop: Shop
  products: Product[]
}

export default function ShopPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params)
  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const { items, addItem, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCartStore()

  useEffect(() => {
    fetchShopData()
  }, [shopId])

  const fetchShopData = async () => {
    try {
      const response = await fetch(`/api/shop/${shopId}`)
      if (!response.ok) {
        throw new Error('Shop not found')
      }
      const data = await response.json()
      setShopData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shop')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      shopId: shopId
    })
  }

  const getItemQuantity = (productId: string) => {
    const item = items.find(item => item.id === productId)
    return item?.quantity || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !shopData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Found</h1>
          <p className="text-gray-600">{error || 'This shop does not exist or is not available.'}</p>
        </div>
      </div>
    )
  }

  const { shop, products } = shopData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              {shop.logo ? (
                <Image src={shop.logo} alt={shop.name} width={64} height={64} className="rounded-full" />
              ) : (
                <Store className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {shop.category}
                </span>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-1" />
                  {shop.phone}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {shop.address}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-bold text-gray-900 mb-6"
        >
          Available Products
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                  !product.isAvailable || product.quantity === 0 ? 'opacity-60' : ''
                }`}
              >
                <div className="relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  {!product.isAvailable || product.quantity === 0 ? (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Unavailable
                    </div>
                  ) : null}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-orange-600">
                      ₹{product.price.toFixed(2)}
                    </div>
                    
                    {product.isAvailable && product.quantity > 0 ? (
                      <div className="flex items-center space-x-2">
                        {getItemQuantity(product.id) > 0 ? (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => updateQuantity(product.id, getItemQuantity(product.id) - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{getItemQuantity(product.id)}</span>
                            <button
                              onClick={() => updateQuantity(product.id, getItemQuantity(product.id) + 1)}
                              className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-500 text-sm font-medium">Out of Stock</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {getTotalItems()}
          </span>
        </motion.button>
      )}

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        shopId={shopId}
        shopName={shop.name}
      />
    </div>
  )
}
