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

    // Get user's shop
    const shop = await prisma.shop.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!shop) {
      return NextResponse.json([])
    }

    const products = await prisma.product.findMany({
      where: {
        shopId: shop.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('✅ PRODUCTS FETCHED SUCCESSFULLY:', products.length)
    console.log('=== PRODUCTS API GET END ===')
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('❌ PRODUCTS ERROR:', String(error))
    console.error('❌ PRODUCTS ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace')
    console.log('=== PRODUCTS API GET END ===')
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('=== PRODUCTS API POST START ===')
  
  try {
    const session = await auth()
    console.log('PRODUCTS SESSION:', JSON.stringify(session, null, 2))
    
    if (!session?.user?.id) {
      console.log('❌ NO USER ID IN PRODUCTS SESSION')
      return NextResponse.json(
        { error: 'Unauthorized - no session' },
        { status: 401 }
      )
    }

    console.log('✅ PRODUCTS USER ID FOUND:', session.user.id)

    const body = await request.json()
    console.log('PRODUCTS REQUEST BODY:', JSON.stringify(body, null, 2))

    const { name, description, price, category, image } = body

    console.log('PRODUCTS FIELDS:', { name, description, price, category, hasImage: !!image })

    if (!name || !price || !category) {
      console.log('❌ MISSING REQUIRED PRODUCT FIELDS')
      return NextResponse.json(
        { error: 'Missing required fields: name, price, category are required', missing: { name, price, category } },
        { status: 400 }
      )
    }

    console.log('✅ ALL PRODUCT FIELDS VALID')

    // Get user's shop
    const shop = await prisma.shop.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!shop) {
      console.log('❌ NO SHOP FOUND FOR USER:', session.user.id)
      return NextResponse.json(
        { error: 'Please set up your shop first' },
        { status: 404 }
      )
    }

    console.log('✅ SHOP FOUND:', shop.id)

    // Create product with default quantity 0
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        category,
        quantity: 0, // Default to 0 for small shops
        image: image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae78?w=400', // Placeholder image
        shopId: shop.id,
        isAvailable: true
      }
    })

    console.log('✅ PRODUCT CREATED SUCCESSFULLY:', product.id)
    console.log('=== PRODUCTS API POST END ===')
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('❌ PRODUCTS ERROR:', String(error))
    console.error('❌ PRODUCTS ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace')
    console.log('=== PRODUCTS API POST END ===')
    
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
