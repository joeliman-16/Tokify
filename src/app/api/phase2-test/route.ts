import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const shops = await prisma.shop.findMany({
      take: 5,
      include: {
        products: {
          take: 3,
          where: { isAvailable: true }
        },
        _count: {
          select: { products: true }
        }
      }
    })

    const products = await prisma.product.count({
      where: { isAvailable: true }
    })

    return NextResponse.json({
      status: 'Phase 2 Ready',
      database: 'Connected',
      shops: shops.length,
      products,
      sampleShop: shops[0] ? {
        id: shops[0].id,
        name: shops[0].name,
        category: shops[0].category,
        productCount: shops[0]._count.products,
        hasProducts: shops[0].products.length > 0
      } : null
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { 
        status: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
