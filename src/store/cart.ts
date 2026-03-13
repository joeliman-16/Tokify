import { create } from 'zustand'

interface CartItem {
  id: string
  productId?: string
  name: string
  price: number
  quantity: number
  image: string | null
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    const newItem = { 
      ...item, 
      price: Number(item.price),
      quantity: Number(item.quantity) || 1
    }
    const existing = get().items.find(i => i.id === item.id)
    if (existing) {
      set(state => ({
        items: state.items.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }))
    } else {
      set(state => ({ items: [...state.items, newItem] }))
    }
  },
  removeItem: (id) =>
    set(state => ({ items: state.items.filter(i => i.id !== id) })),
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }
    set(state => ({
      items: state.items.map(i =>
        i.id === id ? { ...i, quantity } : i
      )
    }))
  },
  clearCart: () => set({ items: [] }),
  getTotalItems: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
  getTotalPrice: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  total: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}))
