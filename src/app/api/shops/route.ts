import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const shops = await prisma.shop.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
            quantity: true
          }
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            paymentStatus: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    })

    return NextResponse.json(shops)
  } catch (error) {
    console.error('Get shops error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, category, logo, upiId, phone, address } = await request.json()

    if (!name || !category || !upiId || !phone || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already has a shop
    const existingShop = await prisma.shop.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (existingShop) {
      return NextResponse.json(
        { error: 'You already have a shop' },
        { status: 400 }
      )
    }

    // Create shop
    const shop = await prisma.shop.create({
      data: {
        name,
        category,
        logo: logo || null,
        upiId,
        phone,
        address,
        ownerId: session.user.id,
        qrCode: `https://tokify.vercel.app/shop/${session.user.id}`,
        isActive: true
      }
    })

    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    console.error('Create shop error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
