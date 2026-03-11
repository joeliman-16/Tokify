import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Phase 2 test data...')

  // Create a test user first
  const user = await prisma.user.upsert({
    where: { email: 'testshop@tokify.com' },
    update: {},
    create: {
      email: 'testshop@tokify.com',
      name: 'Test Shop Owner',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrDjm', // password123
    },
  })

  console.log('✅ Created test user:', user.email)

  // Create a test shop
  let shop = await prisma.shop.findFirst({
    where: { ownerId: user.id }
  })

  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        name: 'Tokify Test Store',
        category: 'Electronics',
        upiId: 'tokifytest@paytm',
        phone: '+919876543210',
        address: '123 Test Street, Bangalore, Karnataka 560001',
        ownerId: user.id,
        qrCode: `https://tokify.vercel.app/shop/${user.id}`,
        isActive: true,
      },
    })
  }

  console.log('✅ Created test shop:', shop.name)

  // Create test products
  const products = [
    {
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
      price: 2999.00,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      quantity: 10,
      isAvailable: true,
      shopId: shop.id,
    },
    {
      name: 'Smart Watch',
      description: 'Fitness tracker with heart rate monitor and GPS',
      price: 4999.00,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      quantity: 5,
      isAvailable: true,
      shopId: shop.id,
    },
    {
      name: 'Laptop Stand',
      description: 'Adjustable aluminum laptop stand for better ergonomics',
      price: 899.00,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1527864550419-7fd403945f4d?w=400',
      quantity: 0, // Out of stock
      isAvailable: true,
      shopId: shop.id,
    },
    {
      name: 'USB-C Cable',
      description: 'Fast charging USB-C cable, 2 meters length',
      price: 299.00,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      quantity: 25,
      isAvailable: true,
      shopId: shop.id,
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Portable waterproof speaker with 12-hour battery',
      price: 1999.00,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
      quantity: 8,
      isAvailable: true,
      shopId: shop.id,
    }
  ]

  for (const product of products) {
    // Check if product already exists
    const existing = await prisma.product.findFirst({
      where: { 
        name: product.name,
        shopId: shop.id
      }
    })

    if (!existing) {
      await prisma.product.create({
        data: product,
      })
    }
  }

  console.log(`✅ Created ${products.length} test products`)

  // Test the shop API
  const shopData = await prisma.shop.findUnique({
    where: { id: shop.id },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  console.log('🏪 Shop URL for testing:')
  console.log(`http://localhost:3000/shop/${shop.id}`)
  console.log(`📱 Products available: ${shopData?.products.length || 0}`)

  console.log('🎉 Phase 2 seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
