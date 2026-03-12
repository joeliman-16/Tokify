import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.paymentStatus === 'PAID') {
      // Already confirmed - return existing token
      const existingToken = await prisma.orderQRToken.findFirst({
        where: { orderId }
      })
      if (existingToken) {
        return NextResponse.json({ 
          token: existingToken.token, 
          orderId 
        })
      }
    }

    // Check if order expired (15 minutes)
    const orderAge = Date.now() - new Date(order.createdAt).getTime()
    if (orderAge > 15 * 60 * 1000 && order.paymentStatus === 'PENDING') {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'EXPIRED' }
      })
      return NextResponse.json(
        { error: 'Order expired. Please create a new order.' },
        { status: 400 }
      )
    }

    // Mark as PAID
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID' }
    })

    // Generate HMAC signed token
    const tokenData = `${orderId}:${Date.now()}:${crypto.randomUUID()}` 
    const token = crypto
      .createHmac('sha256', process.env.HMAC_SECRET || 'tokify_hmac_secret_2024')
      .update(tokenData)
      .digest('hex')

    // Save token
    await prisma.orderQRToken.create({
      data: {
        orderId,
        token,
        isUsed: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    })

    return NextResponse.json({ token, orderId })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
