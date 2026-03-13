import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find first user
  const user = await prisma.user.findFirst()
  if (!user) {
    console.log('No user found. Please register first.')
    return
  }

  // Create test shop
  const shop = await prisma.shop.upsert({
    where: { id: 'test-shop-001' },
    update: {},
    create: {
      id: 'test-shop-001',
      name: 'Tokify Test Store',
      category: 'Electronics',
      upiId: 'joeliman.work@gmail.com',
      phone: '+919876543210',
      address: '123 Test Street, Bangalore, Karnataka 560001',
      ownerId: user.id,
      isActive: true,
    }
  })

  console.log('Shop created:', shop.id)

  // Create test products
  const products = [
    {
      name: 'Bluetooth Speaker',
      description: 'Portable waterproof speaker with 12-hour battery',
      price: 1999,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
      quantity: 100,
      isAvailable: true,
    },
    {
      name: 'USB-C Cable',
      description: 'Fast charging USB-C cable, 2 meters length',
      price: 299,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      quantity: 50,
      isAvailable: true,
    },
    {
      name: 'Wireless Headphones',
      description: 'Over-ear noise cancelling headphones',
      price: 2499,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      quantity: 25,
      isAvailable: true,
    },
    {
      name: 'Smart Watch',
      description: 'Fitness tracker with heart rate monitor',
      price: 3999,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      quantity: 30,
      isAvailable: true,
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        shopId: shop.id,
      }
    })
  }

  console.log('Products created!')
  console.log('Test shop URL: http://localhost:3005/shop/' + shop.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
