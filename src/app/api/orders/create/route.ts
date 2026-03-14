import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { shopId, items, customerName, customerPhone } = await request.json()

    if (!shopId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        shopId,
        customerName,
        customerPhone,
        paymentStatus: 'PENDING',
        totalAmount: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      }
    })

    // Generate UPI link (simplified)
    const upiLink = `upi://pay?pa=merchant@upi&pn=Troxpay&am=${order.totalAmount}&cu=INR&tn=Order_${order.id}`

    return NextResponse.json({
      orderId: order.id,
      upiLink
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
