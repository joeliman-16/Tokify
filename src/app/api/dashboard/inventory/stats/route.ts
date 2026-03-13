import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { shops: true }
    })

    if (!user || user.shops.length === 0) {
      return NextResponse.json({
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalValue: 0,
        totalRevenue: 0,
        topSellingProducts: [],
        categories: []
      })
    }

    const shopIds = user.shops.map((s: any) => s.id)

    const products = await prisma.product.findMany({
      where: { shopId: { in: shopIds } }
    })

    // Calculate stats
    const totalProducts = products.length
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length
    const outOfStockProducts = products.filter(p => p.stock === 0).length
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

    // Get order data for revenue and top products
    const orders = await prisma.order.findMany({
      where: { 
        shopId: { in: shopIds },
        paymentStatus: { in: ['PAID', 'FULFILLED'] }
      },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    })

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Calculate product sales
    const productSales = new Map()
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const current = productSales.get(item.productId) || { count: 0, revenue: 0 }
        productSales.set(item.productId, {
          count: current.count + item.quantity,
          revenue: current.revenue + (item.product.price * item.quantity)
        })
      })
    })

    // Add sales data to products
    const productsWithSales = products.map(product => ({
      ...product,
      salesCount: productSales.get(product.id)?.count || 0,
      revenue: productSales.get(product.id)?.revenue || 0
    }))

    // Top selling products
    const topSellingProducts = productsWithSales
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 5)

    // Categories breakdown
    const categories = new Map()
    products.forEach(product => {
      const current = categories.get(product.category) || { count: 0, value: 0 }
      categories.set(product.category, {
        count: current.count + 1,
        value: current.value + (product.price * product.stock)
      })
    })

    return NextResponse.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      totalRevenue,
      topSellingProducts,
      categories: Array.from(categories.entries()).map(([name, data]) => ({ name, ...data }))
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
