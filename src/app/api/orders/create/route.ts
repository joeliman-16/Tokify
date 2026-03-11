import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shopId, items, customerName, customerPhone, totalAmount } = body

    if (!shopId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      )
    }

    // Validate shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId, isActive: true }
    })

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found or inactive' },
        { status: 404 }
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        shopId,
        customerName: customerName || 'Customer',
        customerPhone: customerPhone || '0000000000',
        totalAmount: parseFloat(totalAmount),
        paymentStatus: 'pending',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({
      orderId: order.id,
      shopId: order.shopId,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      items: order.items
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
