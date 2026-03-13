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
        revenue: [],
        orders: [],
        topProducts: [],
        customerStats: {
          total: 0,
          new: 0,
          returning: 0,
          averageOrderValue: 0
        },
        categoryBreakdown: [],
        timeStats: {
          peakHours: [],
          bestDay: '',
          averageOrdersPerDay: 0
        }
      })
    }

    const shopIds = user.shops.map((s: any) => s.id)
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let dateFormat: string

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFormat = 'MM/dd'
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFormat = 'MM/dd'
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        dateFormat = 'MM/dd'
        break
      case '365d':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        dateFormat = 'MM/dd'
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFormat = 'MM/dd'
    }

    // Get orders in date range
    const orders = await prisma.order.findMany({
      where: {
        shopId: { in: shopIds },
        createdAt: { gte: startDate },
        paymentStatus: { in: ['PAID', 'FULFILLED'] }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Group by date for revenue and orders charts
    const revenueByDate = new Map<string, number>()
    const ordersByDate = new Map<string, number>()

    orders.forEach(order => {
      const dateKey = order.createdAt.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit' 
      })
      
      revenueByDate.set(dateKey, (revenueByDate.get(dateKey) || 0) + order.totalAmount)
      ordersByDate.set(dateKey, (ordersByDate.get(dateKey) || 0) + 1)
    })

    // Generate date range arrays
    const revenueData = []
    const ordersData = []
    const currentDate = new Date(startDate)

    while (currentDate <= now) {
      const dateKey = currentDate.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit' 
      })
      
      revenueData.push({
        date: dateKey,
        amount: revenueByDate.get(dateKey) || 0
      })
      
      ordersData.push({
        date: dateKey,
        count: ordersByDate.get(dateKey) || 0
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Calculate top products
    const productSales = new Map()
    orders.forEach(order => {
      // This would need to be implemented based on your actual order items structure
      // For now, using placeholder data
    })

    const topProducts = Array.from(productSales.entries())
      .map(([name, data]: any) => ({ name, ...data }))
      .sort((a: any, b: any) => b.sales - a.sales)
      .slice(0, 10)

    // Customer stats
    const uniqueCustomers = new Set(orders.map((o: any) => o.customerEmail || o.customerPhone))
    const totalCustomers = uniqueCustomers.size

    // Category breakdown (placeholder)
    const categoryBreakdown = [
      { name: 'Food', value: 45000, percentage: 45 },
      { name: 'Beverages', value: 25000, percentage: 25 },
      { name: 'Snacks', value: 20000, percentage: 20 },
      { name: 'Other', value: 10000, percentage: 10 }
    ]

    // Time stats
    const peakHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      orders: Math.floor(Math.random() * 20) + 5 // Placeholder data
    }))

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const bestDay = daysOfWeek[Math.floor(Math.random() * 7)]

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return NextResponse.json({
      revenue: revenueData,
      orders: ordersData,
      topProducts,
      customerStats: {
        total: totalCustomers,
        new: Math.floor(totalCustomers * 0.7), // Placeholder
        returning: Math.floor(totalCustomers * 0.3), // Placeholder
        averageOrderValue
      },
      categoryBreakdown,
      timeStats: {
        peakHours,
        bestDay,
        averageOrdersPerDay: totalOrders / 7 // Placeholder
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
