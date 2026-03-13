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
      return NextResponse.json([])
    }

    const shopIds = user.shops.map((s: any) => s.id)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get recent orders as notifications
    const recentOrders = await prisma.order.findMany({
      where: { shopId: { in: shopIds } },
      include: {
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const notifications = recentOrders.map(order => ({
      id: order.id,
      type: order.paymentStatus === 'PENDING' ? 'ORDER_PLACED' :
            order.paymentStatus === 'PAID' ? 'ORDER_PAID' :
            order.paymentStatus === 'FULFILLED' ? 'ORDER_FULFILLED' :
            'ORDER_CANCELLED',
      title: `Order ${order.paymentStatus.toLowerCase()}`,
      message: `Order #${order.id.slice(-8)} from ${order.customerName} for ₹${order.totalAmount}`,
      timestamp: order.createdAt,
      read: false,
      data: {
        orderId: order.id,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        items: order.orderItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      }
    }))

    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'No shop found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { type, title, message, data } = body

    // Here you could store notifications in a database
    // For now, we'll just return success
    return NextResponse.json({ success: true, notification: { type, title, message, data } })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
