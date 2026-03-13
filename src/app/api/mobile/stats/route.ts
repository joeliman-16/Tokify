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
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        lowStockProducts: 0
      })
    }

    const shopIds = user.shops.map((s: any) => s.id)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        shopId: { in: shopIds },
        createdAt: { gte: today }
      }
    })

    // Get pending orders
    const pendingOrders = await prisma.order.findMany({
      where: {
        shopId: { in: shopIds },
        paymentStatus: 'PENDING'
      }
    })

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        shopId: { in: shopIds },
        stock: { lte: prisma.product.fields.minStock }
      }
    })

    const todayRevenue = todayOrders
      .filter(order => order.paymentStatus === 'PAID' || order.paymentStatus === 'FULFILLED')
      .reduce((sum: number, order: any) => sum + order.totalAmount, 0)

    return NextResponse.json({
      todayOrders: todayOrders.length,
      todayRevenue,
      pendingOrders: pendingOrders.length,
      lowStockProducts: lowStockProducts.length
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
