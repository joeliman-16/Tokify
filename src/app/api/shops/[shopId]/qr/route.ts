import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await context.params

    const shop = await prisma.shop.findUnique({
      where: {
        id: shopId
      },
      include: {
        owner: {
          select: {
            name: true
          }
        },
        products: {
          where: {
            isAvailable: true,
            quantity: {
              gt: 0
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
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
        address: shop.address,
        owner: shop.owner.name
      },
      products: shop.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: product.quantity
      }))
    })
  } catch (error) {
    console.error('Get shop QR data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
