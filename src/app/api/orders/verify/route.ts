import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const HMAC_SECRET = process.env.AUTH_SECRET || 'tokify2024secretkey32charslong!!'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      )
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shop: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Generate token
    const timestamp = Date.now()
    const tokenData = `${orderId}:${order.shopId}:${timestamp}`
    const token = crypto.createHmac('sha256', HMAC_SECRET).update(tokenData).digest('hex')

    // Save token to database
    const qrToken = await prisma.orderQRToken.create({
      data: {
        orderId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isUsed: false
      }
    })

    // Generate verification URL
    const verificationUrl = `https://tokify.vercel.app/verify/${token}`

    return NextResponse.json({
      token,
      verificationUrl,
      expiresAt: qrToken.expiresAt,
      orderId: order.id
    })
  } catch (error) {
    console.error('QR token generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
