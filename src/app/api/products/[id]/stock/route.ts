import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json(
        { error: 'No shop found' },
        { status: 404 }
      )
    }

    const shopIds = user.shops.map((s: any) => s.id)
    const body = await request.json()

    // Check if product belongs to user's shop
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        shopId: { in: shopIds }
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        stock: body.stock,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
