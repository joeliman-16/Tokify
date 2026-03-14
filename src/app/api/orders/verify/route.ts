import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await request.json()

    console.log('Verifying payment:', {
      orderId, razorpayOrderId, razorpayPaymentId
    })

    if (!orderId || !razorpayOrderId || 
        !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Update order to PAID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        paymentId: razorpayPaymentId,
      }
    })

    // Generate HMAC token
    const tokenData = `${orderId}:${razorpayPaymentId}:${Date.now()}` 
    const token = crypto
      .createHmac('sha256', 
        process.env.HMAC_SECRET || 'tokify_hmac_secret_2024'
      )
      .update(tokenData)
      .digest('hex')

    // Save QR token
    await prisma.orderQRToken.create({
      data: {
        orderId,
        token,
        isUsed: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    })

    console.log('Payment verified, token generated:', 
      token.slice(0, 8))

    return NextResponse.json({ token, orderId })

  } catch (error: any) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    )
  }
}
