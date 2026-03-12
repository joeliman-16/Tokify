import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { shopId, items, customerName, customerPhone } = await request.json()

    if (!shopId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Shop ID and items are required' },
        { status: 400 }
      )
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    })

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity, 0
    )

    const upiNote = `Tokify-${Date.now()}` 

    const order = await prisma.order.create({
      data: {
        shopId,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        totalAmount,
        paymentStatus: 'PENDING',
        upiTransactionNote: upiNote,
      }
    })

    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }
      })
    }

    // Generate UPI deep link
    const upiLink = `upi://pay?pa=${encodeURIComponent(shop.upiId)}&pn=${encodeURIComponent(shop.name)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${upiNote}` 

    // Schedule order expiry (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    return NextResponse.json({
      orderId: order.id,
      upiLink,
      totalAmount,
      shopName: shop.name,
      upiId: shop.upiId,
      expiresAt,
    })
  } catch (error) {
    console.error('Order create error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
