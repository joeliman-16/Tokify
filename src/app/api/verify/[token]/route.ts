import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const qrToken = await prisma.orderQRToken.findUnique({
      where: { token },
      include: {
        order: {
          include: {
            orderItems: {
              include: { product: true }
            }
          }
        }
      }
    })

    if (!qrToken) {
      return NextResponse.json(
        { error: 'Invalid QR code' },
        { status: 404 }
      )
    }

    if (qrToken.isUsed) {
      return NextResponse.json(
        { error: 'QR code already used', isUsed: true },
        { status: 400 }
      )
    }

    if (new Date() > qrToken.expiresAt) {
      return NextResponse.json(
        { error: 'QR code expired', isExpired: true },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      order: qrToken.order,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const qrToken = await prisma.orderQRToken.findUnique({
      where: { token },
      include: { order: true }
    })

    if (!qrToken || qrToken.isUsed) {
      return NextResponse.json(
        { error: 'Invalid or already used QR' },
        { status: 400 }
      )
    }

    // Mark token as used
    await prisma.orderQRToken.update({
      where: { token },
      data: { isUsed: true }
    })

    // Mark order as fulfilled
    await prisma.order.update({
      where: { id: qrToken.orderId },
      data: { paymentStatus: 'FULFILLED' }
    })

    return NextResponse.json({
      success: true,
      message: 'Order fulfilled successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
