import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
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
  console.log('=== SHOPS API POST START ===')
  
  try {
    const session = await auth()
    console.log('SESSION:', JSON.stringify(session, null, 2))
    
    if (!session?.user?.id) {
      console.log('❌ NO USER ID IN SESSION')
      return NextResponse.json(
        { error: 'Not authenticated - session: ' + JSON.stringify(session) },
        { status: 401 }
      )
    }

    console.log('✅ USER ID FOUND:', session.user.id)

    const body = await request.json()
    console.log('REQUEST BODY:', JSON.stringify(body, null, 2))

    const { name, category, logo, upiId, phone, address } = body

    if (!name || !category || !upiId || !phone || !address) {
      console.log('❌ MISSING REQUIRED FIELDS')
      return NextResponse.json(
        { error: 'Missing required fields', missing: { name, category, upiId, phone, address } },
        { status: 400 }
      )
    }

    console.log('✅ ALL FIELDS VALID')

    // Check if user already has a shop
    const existingShop = await prisma.shop.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (existingShop) {
      console.log('❌ USER ALREADY HAS SHOP:', existingShop.id)
      return NextResponse.json(
        { error: 'You already have a shop', shopId: existingShop.id },
        { status: 400 }
      )
    }

    console.log('✅ CREATING NEW SHOP...')

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

    console.log('✅ SHOP CREATED SUCCESSFULLY:', shop.id)
    console.log('=== SHOPS API POST END ===')
    
    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    console.error('❌ SHOP ERROR:', String(error))
    console.error('❌ ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace')
    console.log('=== SHOPS API POST END ===')
    
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
