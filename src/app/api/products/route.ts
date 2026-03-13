import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Get user's shop
    const shop = await prisma.shop.findFirst({
      where: { ownerId: user.id }
    })

    if (!shop) {
      return NextResponse.json(
        { error: 'Please create a shop first' },
        { status: 404 }
      )
    }

    const product = await prisma.product.create({
      data: {
        shopId: body.shopId || shop.id,
        name: body.name,
        description: body.description || null,
        price: Number(body.price),
        category: body.category,
        image: body.image || null,
        isAvailable: body.isAvailable ?? true,
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product error:', String(error))
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        shops: {
          include: { products: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json([], { status: 200 })
    }

    const allProducts = user.shops.flatMap(shop => shop.products)
    return NextResponse.json(allProducts)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
