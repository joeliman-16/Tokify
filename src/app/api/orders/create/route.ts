import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Razorpay from 'razorpay'

export async function POST(request: NextRequest) {
  try {
    console.log('Orders create called')
    console.log('RAZORPAY_KEY_ID:', 
      process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING')
    console.log('RAZORPAY_KEY_SECRET:', 
      process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING')

    const body = await request.json()
    const { shopId, items, customerName, 
            customerPhone, customerEmail } = body

    if (!shopId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'shopId and items are required' },
        { status: 400 }
      )
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    })

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found: ' + shopId },
        { status: 404 }
      )
    }

    const totalAmount = items.reduce(
      (sum: number, item: any) => 
        sum + Number(item.price) * Number(item.quantity), 0
    )

    if (!process.env.RAZORPAY_KEY_ID || 
        !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay keys not configured' },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    })

    console.log('Razorpay order created:', razorpayOrder.id)

    const order = await prisma.order.create({
      data: {
        shopId,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        totalAmount,
        paymentStatus: 'PENDING',
        paymentId: razorpayOrder.id,
      }
    })

    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
        }
      })
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error: any) {
    console.error('Order create error:', error)
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    )
  }
}
