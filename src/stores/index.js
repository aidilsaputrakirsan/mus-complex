import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Main Application Store
export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  const notifications = ref([])
  const theme = ref('light')

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setLoading = (state) => {
    loading.value = state
  }

  const addNotification = (notification) => {
    const id = Date.now()
    notifications.value.push({
      id,
      ...notification,
      timestamp: new Date()
    })
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    sidebarCollapsed,
    loading,
    notifications,
    theme,
    toggleSidebar,
    setLoading,
    addNotification,
    removeNotification,
    toggleTheme
  }
})

// Products Store
export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const filteredProducts = ref([])
  const currentPage = ref(1)
  const itemsPerPage = ref(50)
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const sortBy = ref('name')
  const sortOrder = ref('asc')

  const totalPages = computed(() => 
    Math.ceil(filteredProducts.value.length / itemsPerPage.value)
  )

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredProducts.value.slice(start, end)
  })

  const loadProducts = async () => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Load from data file
    try {
      const response = await fetch('/data/products.json')
      const data = await response.json()
      products.value = data.products
      applyFilters()
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...products.value]

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory.value) {
      filtered = filtered.filter(product => 
        product.category === selectedCategory.value
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy.value]
      let bValue = b[sortBy.value]

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder.value === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    filteredProducts.value = filtered
    currentPage.value = 1
  }

  const updateProduct = (id, updates) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index > -1) {
      products.value[index] = { ...products.value[index], ...updates }
      applyFilters()
    }
  }

  const deleteProduct = (id) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index > -1) {
      products.value.splice(index, 1)
      applyFilters()
    }
  }

  return {
    products,
    filteredProducts,
    paginatedProducts,
    currentPage,
    itemsPerPage,
    totalPages,
    searchQuery,
    selectedCategory,
    sortBy,
    sortOrder,
    loadProducts,
    applyFilters,
    updateProduct,
    deleteProduct
  }
})

// Orders Store
export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const realtimeOrders = ref([])
  
  const loadOrders = async () => {
    try {
      const response = await fetch('/data/orders.json')
      const data = await response.json()
      orders.value = data.orders
    } catch (error) {
      console.error('Failed to load orders:', error)
    }
  }

  const simulateRealtimeOrders = () => {
    // Simulate real-time order updates
    const interval = setInterval(() => {
      const newOrder = {
        id: Date.now(),
        customer: `Customer ${Math.floor(Math.random() * 1000)}`,
        total: Math.floor(Math.random() * 500) + 50,
        status: ['pending', 'processing', 'shipped'][Math.floor(Math.random() * 3)],
        timestamp: new Date()
      }
      
      realtimeOrders.value.unshift(newOrder)
      
      // Keep only last 20 real-time orders
      if (realtimeOrders.value.length > 20) {
        realtimeOrders.value = realtimeOrders.value.slice(0, 20)
      }
    }, 3000)

    return interval
  }

  return {
    orders,
    realtimeOrders,
    loadOrders,
    simulateRealtimeOrders
  }
})