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
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        paidOrders: 0,
        fulfilledOrders: 0,
        cancelledOrders: 0,
        todayOrders: 0,
        todayRevenue: 0,
        averageOrderValue: 0,
      })
    }

    const shopIds = user.shops.map(s => s.id)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      allOrders,
      todayOrders,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { shopId: { in: shopIds } }
      }),
      prisma.order.findMany({
        where: {
          shopId: { in: shopIds },
          createdAt: { gte: today }
        }
      }),
    ])

    const paidOrders = allOrders.filter(
      o => o.paymentStatus === 'PAID' || o.paymentStatus === 'FULFILLED'
    )

    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + o.totalAmount, 0
    )
    const todayRevenue = todayOrders
      .filter(o => 
        o.paymentStatus === 'PAID' || 
        o.paymentStatus === 'FULFILLED'
      )
      .reduce((sum, o) => sum + o.totalAmount, 0)

    const averageOrderValue = allOrders.length > 0 
      ? totalRevenue / allOrders.length 
      : 0

    return NextResponse.json({
      totalOrders: allOrders.length,
      totalRevenue,
      pendingOrders: allOrders.filter(o => o.paymentStatus === 'PENDING').length,
      paidOrders: allOrders.filter(o => o.paymentStatus === 'PAID').length,
      fulfilledOrders: allOrders.filter(o => o.paymentStatus === 'FULFILLED').length,
      cancelledOrders: allOrders.filter(o => o.paymentStatus === 'CANCELLED').length,
      todayOrders: todayOrders.length,
      todayRevenue,
      averageOrderValue,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
