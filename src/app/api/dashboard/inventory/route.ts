import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

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
      include: { shops: true }
    })

    if (!user || user.shops.length === 0) {
      return NextResponse.json([])
    }

    const shopIds = user.shops.map((s: any) => s.id)

    const products = await prisma.product.findMany({
      where: { shopId: { in: shopIds } },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
