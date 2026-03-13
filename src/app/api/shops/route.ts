import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    console.log('SHOP API SESSION:', JSON.stringify(session))

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user by email since ID might be missing
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    const body = await request.json()
    console.log('SHOP BODY:', JSON.stringify(body))

    const shop = await prisma.shop.create({
      data: {
        name: body.name,
        category: body.category,
        upiId: body.upiId,
        phone: body.phone,
        address: body.address,
        logo: body.logo || null,
        ownerId: user.id,
        isActive: true,
      }
    })

    console.log('SHOP CREATED:', shop.id)
    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    console.error('SHOP CREATE ERROR:', String(error))
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
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json([], { status: 200 })
    }

    const shops = await prisma.shop.findMany({
      where: { ownerId: user.id },
      include: { products: true }
    })

    return NextResponse.json(shops)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
