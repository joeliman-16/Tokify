import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    
    // Fetch shop details
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    if (!shop.isActive) {
      return NextResponse.json(
        { error: 'Shop is not active' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      shop: {
        id: shop.id,
        name: shop.name,
        category: shop.category,
        logo: shop.logo,
        upiId: shop.upiId,
        phone: shop.phone,
        address: shop.address
      },
      products: shop.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        quantity: product.quantity,
        isAvailable: product.isAvailable
      }))
    })
  } catch (error) {
    console.error('Shop fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
