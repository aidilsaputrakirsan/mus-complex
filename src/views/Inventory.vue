<template>
  <div class="inventory">
    <!-- Header -->
    <div class="inventory-header">
      <h1>Inventory Management</h1>
      <div class="header-actions">
        <button @click="showStockAlert = !showStockAlert" class="btn btn-warning">
          ⚠️ Stock Alerts ({{ lowStockItems.length }})
        </button>
        <button @click="showBulkActions = !showBulkActions" class="btn btn-info">
          📦 Bulk Actions
        </button>
        <button @click="exportInventory" class="btn btn-success">
          📊 Export
        </button>
      </div>
    </div>

    <!-- Inventory Stats -->
    <div class="inventory-stats grid grid-cols-4">
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          📦
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalProducts }}</div>
          <div class="stat-label">Total Products</div>
          <div class="stat-detail">{{ inStockProducts }} in stock</div>
        </div>
      </div>
      
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          📉
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ lowStockItems.length }}</div>
          <div class="stat-label">Low Stock Items</div>
          <div class="stat-detail">Needs attention</div>
        </div>
      </div>
      
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
          💰
        </div>
        <div class="stat-content">
          <div class="stat-value">${{ formatNumber(totalInventoryValue) }}</div>
          <div class="stat-label">Inventory Value</div>
          <div class="stat-detail">At cost price</div>
        </div>
      </div>
      
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
          🚚
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(monthlyTurnover) }}</div>
          <div class="stat-label">Monthly Turnover</div>
          <div class="stat-detail">Inventory rotation</div>
        </div>
      </div>
    </div>

    <!-- Stock Alerts Panel -->
    <div v-if="showStockAlert" class="stock-alerts card">
      <div class="alert-header">
        <h3>🚨 Stock Alerts</h3>
        <button @click="showStockAlert = false" class="close-btn">✕</button>
      </div>
      <div class="alerts-grid">
        <div 
          v-for="item in lowStockItems" 
          :key="item.id"
          class="alert-item"
          :class="{ 'critical': item.stock === 0, 'warning': item.stock < 10 }"
        >
          <div class="alert-product">
            <div class="product-name">{{ item.name }}</div>
            <div class="product-sku">{{ item.sku }}</div>
          </div>
          <div class="alert-stock">
            <div class="stock-level" :class="{ 'critical': item.stock === 0 }">
              {{ item.stock }} units
            </div>
            <div class="reorder-point">Reorder: {{ item.reorderPoint || 20 }}</div>
          </div>
          <div class="alert-actions">
            <button @click="reorderProduct(item)" class="btn btn-sm btn-primary">
              🛒 Reorder
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Actions Panel -->
    <div v-if="showBulkActions" class="bulk-actions card">
      <div class="bulk-header">
        <h3>📦 Bulk Operations</h3>
        <button @click="showBulkActions = false" class="close-btn">✕</button>
      </div>
      <div class="bulk-controls">
        <div class="bulk-selection">
          <label>
            <input 
              type="checkbox" 
              @change="selectAll($event.target.checked)"
              :checked="selectedItems.length === inventoryItems.length"
            >
            Select All ({{ selectedItems.length }} selected)
          </label>
        </div>
        <div class="bulk-actions-buttons">
          <button 
            @click="bulkUpdateStock" 
            :disabled="!selectedItems.length"
            class="btn btn-primary"
          >
            📈 Update Stock
          </button>
          <button 
            @click="bulkUpdatePrices" 
            :disabled="!selectedItems.length"
            class="btn btn-success"
          >
            💲 Update Prices
          </button>
          <button 
            @click="bulkExport" 
            :disabled="!selectedItems.length"
            class="btn btn-info"
          >
            📤 Export Selected
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="inventory-filters card">
      <div class="filters-grid">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search inventory..." 
            v-model="searchQuery"
            @input="applyFilters"
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>

        <select v-model="categoryFilter" @change="applyFilters" class="category-filter">
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Accessories">Accessories</option>
          <option value="Office">Office</option>
        </select>

        <select v-model="stockFilter" @change="applyFilters" class="stock-filter">
          <option value="">All Stock Levels</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>

        <select v-model="sortBy" @change="applyFilters" class="sort-select">
          <option value="name">Sort by Name</option>
          <option value="stock">Sort by Stock</option>
          <option value="value">Sort by Value</option>
          <option value="turnover">Sort by Turnover</option>
        </select>

        <button @click="toggleSortOrder" class="sort-order-btn">
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </button>
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="inventory-table-container card">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading inventory...</p>
      </div>

      <div v-else-if="!paginatedItems.length" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No inventory items found</h3>
        <p>Try adjusting your search criteria.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="inventory-table">
          <thead>
            <tr>
              <th v-if="showBulkActions" width="50">
                <input 
                  type="checkbox" 
                  @change="selectAll($event.target.checked)"
                  :checked="selectedItems.length === inventoryItems.length"
                >
              </th>
              <th class="sortable" @click="sortBy = 'name'; applyFilters()">
                Product
                <span v-if="sortBy === 'name'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>SKU</th>
              <th>Category</th>
              <th class="sortable" @click="sortBy = 'stock'; applyFilters()">
                Stock Level
                <span v-if="sortBy === 'stock'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Reorder Point</th>
              <th>Cost/Unit</th>
              <th class="sortable" @click="sortBy = 'value'; applyFilters()">
                Total Value
                <span v-if="sortBy === 'value'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Turnover</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in paginatedItems" 
              :key="item.id"
              class="inventory-row"
              :class="{ 
                'low-stock': item.stock < 20 && item.stock > 0,
                'out-of-stock': item.stock === 0,
                'selected': selectedItems.includes(item.id)
              }"
            >
              <td v-if="showBulkActions">
                <input 
                  type="checkbox" 
                  :value="item.id"
                  v-model="selectedItems"
                >
              </td>
              
              <td class="product-cell">
                <div class="product-info">
                  <div class="product-name">{{ item.name }}</div>
                  <div class="product-description">{{ item.description }}</div>
                </div>
              </td>
              
              <td class="sku-cell">
                <span class="sku">{{ item.sku }}</span>
              </td>
              
              <td class="category-cell">
                <span class="category-badge" :class="item.category.toLowerCase()">
                  {{ item.category }}
                </span>
              </td>
              
              <td class="stock-cell">
                <div class="stock-info">
                  <div class="stock-value" :class="getStockClass(item.stock)">
                    {{ item.stock }}
                  </div>
                  <div class="stock-bar">
                    <div 
                      class="stock-fill" 
                      :class="getStockClass(item.stock)"
                      :style="{ width: Math.min(item.stock / 100 * 100, 100) + '%' }"
                    ></div>
                  </div>
                  <div class="stock-status">{{ getStockStatus(item.stock) }}</div>
                </div>
              </td>
              
              <td class="reorder-cell">
                <div class="reorder-point">{{ item.reorderPoint || 20 }}</div>
              </td>
              
              <td class="cost-cell">
                <div class="cost-value">${{ item.cost.toFixed(2) }}</div>
              </td>
              
              <td class="value-cell">
                <div class="total-value">${{ (item.stock * item.cost).toLocaleString() }}</div>
              </td>
              
              <td class="turnover-cell">
                <div class="turnover-rate">{{ calculateTurnover(item) }}%</div>
                <div class="turnover-frequency">{{ getTurnoverFrequency(item) }}</div>
              </td>
              
              <td class="updated-cell">
                <div class="last-updated">{{ formatDate(item.lastUpdated) }}</div>
              </td>
              
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    @click="adjustStock(item)"
                    class="btn btn-sm btn-primary"
                    title="Adjust Stock"
                  >
                    📝
                  </button>
                  <button 
                    @click="reorderProduct(item)"
                    class="btn btn-sm btn-success"
                    title="Reorder"
                  >
                    🛒
                  </button>
                  <button 
                    @click="viewHistory(item)"
                    class="btn btn-sm btn-info"
                    title="View History"
                  >
                    📊
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-container">
      <div class="pagination">
        <button @click="currentPage = 1" :disabled="currentPage === 1" class="pagination-btn">
          ⏮️
        </button>
        <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-btn">
          ◀️
        </button>
        
        <span class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-btn">
          ▶️
        </button>
        <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="pagination-btn">
          ⏭️
        </button>
      </div>
    </div>

    <!-- Stock Adjustment Modal -->
    <div v-if="showAdjustModal" class="modal-overlay" @click="closeAdjustModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Adjust Stock - {{ selectedProduct?.name }}</h3>
          <button @click="closeAdjustModal" class="modal-close">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="current-stock">
            <label>Current Stock:</label>
            <span class="stock-value">{{ selectedProduct?.stock }} units</span>
          </div>
          
          <div class="adjustment-controls">
            <div class="adjustment-type">
              <label>Adjustment Type:</label>
              <select v-model="adjustmentType" class="form-input">
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
                <option value="set">Set Stock To</option>
              </select>
            </div>
            
            <div class="adjustment-quantity">
              <label>{{ adjustmentType === 'set' ? 'New Stock Level:' : 'Quantity:' }}</label>
              <input 
                type="number" 
                v-model="adjustmentQuantity" 
                class="form-input"
                min="0"
              >
            </div>
            
            <div class="adjustment-reason">
              <label>Reason:</label>
              <select v-model="adjustmentReason" class="form-input">
                <option value="restock">Restock</option>
                <option value="sold">Sold</option>
                <option value="damaged">Damaged</option>
                <option value="returned">Returned</option>
                <option value="audit">Stock Audit</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div class="adjustment-notes">
              <label>Notes (Optional):</label>
              <textarea 
                v-model="adjustmentNotes" 
                class="form-input" 
                rows="3"
                placeholder="Additional notes about this adjustment..."
              ></textarea>
            </div>
          </div>
          
          <div class="new-stock-preview">
            <label>New Stock Level:</label>
            <span class="preview-value">{{ calculateNewStock() }} units</span>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeAdjustModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveStockAdjustment" class="btn btn-primary">
            Save Adjustment
          </button>
        </div>
      </div>
    </div>

    <!-- Product History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay" @click="closeHistoryModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Stock History - {{ selectedProduct?.name }}</h3>
          <button @click="closeHistoryModal" class="modal-close">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="history-chart">
            <canvas ref="historyChart" width="600" height="200"></canvas>
          </div>
          
          <div class="history-timeline">
            <h4>Recent Stock Movements</h4>
            <div class="timeline-list">
              <div 
                v-for="entry in stockHistory" 
                :key="entry.id"
                class="timeline-item"
                :class="entry.type"
              >
                <div class="timeline-icon">
                  {{ entry.type === 'in' ? '➕' : '➖' }}
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-action">{{ entry.action }}</span>
                    <span class="timeline-date">{{ formatDate(entry.date) }}</span>
                  </div>
                  <div class="timeline-details">
                    <span class="quantity-change">
                      {{ entry.type === 'in' ? '+' : '-' }}{{ entry.quantity }} units
                    </span>
                    <span class="stock-after">Stock: {{ entry.stockAfter }}</span>
                  </div>
                  <div v-if="entry.notes" class="timeline-notes">{{ entry.notes }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAppStore } from '../stores'

export default {
  name: 'Inventory',
  setup() {
    const appStore = useAppStore()
    
    const loading = ref(false)
    const inventoryItems = ref([])
    const searchQuery = ref('')
    const categoryFilter = ref('')
    const stockFilter = ref('')
    const sortBy = ref('name')
    const sortOrder = ref('asc')
    const currentPage = ref(1)
    const itemsPerPage = ref(15)
    const selectedItems = ref([])
    
    const showStockAlert = ref(false)
    const showBulkActions = ref(false)
    const showAdjustModal = ref(false)
    const showHistoryModal = ref(false)
    const selectedProduct = ref(null)
    
    const adjustmentType = ref('add')
    const adjustmentQuantity = ref(0)
    const adjustmentReason = ref('restock')
    const adjustmentNotes = ref('')
    
    const historyChart = ref(null)
    const stockHistory = ref([])

    // Generate sample inventory data
    const generateInventoryData = () => {
      const products = [
        { name: 'Wireless Bluetooth Headphones', sku: 'WBH-001', category: 'Electronics', cost: 65.00 },
        { name: 'Smart Phone Case', sku: 'SPC-002', category: 'Accessories', cost: 8.50 },
        { name: 'USB-C Charging Cable', sku: 'UCC-003', category: 'Accessories', cost: 5.25 },
        { name: 'Portable Power Bank', sku: 'PPB-004', category: 'Electronics', cost: 22.50 },
        { name: 'Laptop Stand Adjustable', sku: 'LSA-005', category: 'Office', cost: 35.00 },
        { name: 'Wireless Mouse', sku: 'WM-006', category: 'Electronics', cost: 15.75 },
        { name: 'Mechanical Keyboard', sku: 'MK-007', category: 'Electronics', cost: 75.50 },
        { name: 'Desk Organizer', sku: 'DO-008', category: 'Office', cost: 12.25 },
        { name: 'HD Webcam', sku: 'HDW-009', category: 'Electronics', cost: 35.25 },
        { name: 'Monitor Stand', sku: 'MS-010', category: 'Office', cost: 28.50 }
      ]

      return products.map((product, index) => ({
        id: index + 1,
        ...product,
        description: `High-quality ${product.name.toLowerCase()}`,
        stock: Math.floor(Math.random() * 150),
        reorderPoint: Math.floor(Math.random() * 30) + 10,
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        salesThisMonth: Math.floor(Math.random() * 50) + 10
      }))
    }

    const totalProducts = computed(() => inventoryItems.value.length)
    const inStockProducts = computed(() => 
      inventoryItems.value.filter(item => item.stock > 0).length
    )
    const lowStockItems = computed(() => 
      inventoryItems.value.filter(item => item.stock <= (item.reorderPoint || 20))
    )
    const totalInventoryValue = computed(() => 
      inventoryItems.value.reduce((sum, item) => sum + (item.stock * item.cost), 0)
    )
    const monthlyTurnover = computed(() => 
      inventoryItems.value.reduce((sum, item) => sum + item.salesThisMonth, 0)
    )

    const filteredItems = computed(() => {
      let filtered = [...inventoryItems.value]

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        )
      }

      // Category filter
      if (categoryFilter.value) {
        filtered = filtered.filter(item => item.category === categoryFilter.value)
      }

      // Stock filter
      if (stockFilter.value) {
        switch (stockFilter.value) {
          case 'in-stock':
            filtered = filtered.filter(item => item.stock > 20)
            break
          case 'low-stock':
            filtered = filtered.filter(item => item.stock > 0 && item.stock <= 20)
            break
          case 'out-of-stock':
            filtered = filtered.filter(item => item.stock === 0)
            break
        }
      }

      // Sorting
      filtered.sort((a, b) => {
        let aValue = a[sortBy.value]
        let bValue = b[sortBy.value]

        if (sortBy.value === 'value') {
          aValue = a.stock * a.cost
          bValue = b.stock * b.cost
        } else if (sortBy.value === 'turnover') {
          aValue = a.salesThisMonth
          bValue = b.salesThisMonth
        }

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

      return filtered
    })

    const totalPages = computed(() => 
      Math.ceil(filteredItems.value.length / itemsPerPage.value)
    )

    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredItems.value.slice(start, end)
    })

    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getStockClass = (stock) => {
      if (stock === 0) return 'out'
      if (stock < 20) return 'low'
      return 'good'
    }

    const getStockStatus = (stock) => {
      if (stock === 0) return 'Out of Stock'
      if (stock < 10) return 'Critical'
      if (stock < 20) return 'Low Stock'
      return 'In Stock'
    }

    const calculateTurnover = (item) => {
      return Math.round((item.salesThisMonth / Math.max(item.stock, 1)) * 100)
    }

    const getTurnoverFrequency = (item) => {
      const turnover = calculateTurnover(item)
      if (turnover >= 80) return 'High'
      if (turnover >= 40) return 'Medium'
      return 'Low'
    }

    const applyFilters = () => {
      currentPage.value = 1
    }

    const toggleSortOrder = () => {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      applyFilters()
    }

    const selectAll = (checked) => {
      selectedItems.value = checked ? inventoryItems.value.map(item => item.id) : []
    }

    const adjustStock = (product) => {
      selectedProduct.value = product
      adjustmentType.value = 'add'
      adjustmentQuantity.value = 0
      adjustmentReason.value = 'restock'
      adjustmentNotes.value = ''
      showAdjustModal.value = true
    }

    const calculateNewStock = () => {
      if (!selectedProduct.value) return 0
      
      const currentStock = selectedProduct.value.stock
      const quantity = parseInt(adjustmentQuantity.value) || 0
      
      switch (adjustmentType.value) {
        case 'add':
          return currentStock + quantity
        case 'remove':
          return Math.max(0, currentStock - quantity)
        case 'set':
          return quantity
        default:
          return currentStock
      }
    }

    const saveStockAdjustment = () => {
      if (!selectedProduct.value) return

      const newStock = calculateNewStock()
      const oldStock = selectedProduct.value.stock
      
      // Update the product stock
      const productIndex = inventoryItems.value.findIndex(p => p.id === selectedProduct.value.id)
      if (productIndex > -1) {
        inventoryItems.value[productIndex].stock = newStock
        inventoryItems.value[productIndex].lastUpdated = new Date()
        
        // Add to stock history
        const historyEntry = {
          id: Date.now(),
          date: new Date(),
          type: newStock > oldStock ? 'in' : 'out',
          action: adjustmentReason.value,
          quantity: Math.abs(newStock - oldStock),
          stockAfter: newStock,
          notes: adjustmentNotes.value
        }
        
        if (!stockHistory.value) {
          stockHistory.value = []
        }
        stockHistory.value.unshift(historyEntry)
        
        appStore.addNotification({
          type: 'success',
          title: 'Stock Updated',
          message: `${selectedProduct.value.name} stock adjusted to ${newStock} units`
        })
      }

      closeAdjustModal()
    }

    const closeAdjustModal = () => {
      showAdjustModal.value = false
      selectedProduct.value = null
    }

    const reorderProduct = (product) => {
      const reorderQuantity = Math.max(50, (product.reorderPoint || 20) * 2)
      
      appStore.addNotification({
        type: 'info',
        title: 'Reorder Initiated',
        message: `Reorder request for ${reorderQuantity} units of ${product.name} has been submitted`
      })
    }

    const viewHistory = (product) => {
      selectedProduct.value = product
      
      // Generate sample history
      stockHistory.value = [
        { id: 1, date: new Date(), type: 'in', action: 'restock', quantity: 50, stockAfter: product.stock, notes: 'Monthly restock' },
        { id: 2, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), type: 'out', action: 'sold', quantity: 15, stockAfter: product.stock - 50, notes: 'Bulk order' },
        { id: 3, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), type: 'out', action: 'damaged', quantity: 3, stockAfter: product.stock - 35, notes: 'Damaged in transit' }
      ]
      
      showHistoryModal.value = true
      
      setTimeout(() => {
        initHistoryChart()
      }, 100)
    }

    const closeHistoryModal = () => {
      showHistoryModal.value = false
      selectedProduct.value = null
    }

    const initHistoryChart = async () => {
      await nextTick()
      if (!historyChart.value) return

      const ctx = historyChart.value.getContext('2d')
      ctx.clearRect(0, 0, historyChart.value.width, historyChart.value.height)

      // Sample data for the last 30 days
      const data = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        stock: Math.max(0, selectedProduct.value.stock + Math.floor(Math.random() * 40 - 20))
      }))

      const padding = 40
      const chartWidth = historyChart.value.width - 2 * padding
      const chartHeight = historyChart.value.height - 2 * padding

      const maxStock = Math.max(...data.map(d => d.stock))
      const minStock = Math.min(...data.map(d => d.stock))
      const range = maxStock - minStock || 1

      // Draw grid
      ctx.strokeStyle = '#e3e6f0'
      ctx.lineWidth = 1

      for (let i = 0; i <= 5; i++) {
        const y = padding + (i * chartHeight / 5)
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(padding + chartWidth, y)
        ctx.stroke()
      }

      // Draw line
      ctx.strokeStyle = '#667eea'
      ctx.lineWidth = 2
      ctx.beginPath()

      data.forEach((point, index) => {
        const x = padding + (index * chartWidth / (data.length - 1))
        const y = padding + chartHeight - ((point.stock - minStock) / range) * chartHeight
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }

    const bulkUpdateStock = () => {
      const quantity = prompt('Enter stock adjustment quantity:')
      if (quantity && !isNaN(quantity)) {
        selectedItems.value.forEach(itemId => {
          const item = inventoryItems.value.find(i => i.id === itemId)
          if (item) {
            item.stock += parseInt(quantity)
            item.lastUpdated = new Date()
          }
        })
        
        appStore.addNotification({
          type: 'success',
          title: 'Bulk Update Complete',
          message: `Updated stock for ${selectedItems.value.length} items`
        })
        
        selectedItems.value = []
      }
    }

    const bulkUpdatePrices = () => {
      const percentage = prompt('Enter price adjustment percentage (e.g., 10 for +10%, -5 for -5%):')
      if (percentage && !isNaN(percentage)) {
        selectedItems.value.forEach(itemId => {
          const item = inventoryItems.value.find(i => i.id === itemId)
          if (item) {
            item.cost *= (1 + parseFloat(percentage) / 100)
            item.lastUpdated = new Date()
          }
        })
        
        appStore.addNotification({
          type: 'success',
          title: 'Bulk Price Update Complete',
          message: `Updated prices for ${selectedItems.value.length} items`
        })
        
        selectedItems.value = []
      }
    }

    const bulkExport = () => {
      const selectedData = inventoryItems.value.filter(item => selectedItems.value.includes(item.id))
      
      const csvContent = [
        ['Name', 'SKU', 'Category', 'Stock', 'Cost', 'Total Value'].join(','),
        ...selectedData.map(item => [
          item.name,
          item.sku,
          item.category,
          item.stock,
          item.cost.toFixed(2),
          (item.stock * item.cost).toFixed(2)
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `selected_inventory_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      appStore.addNotification({
        type: 'success',
        title: 'Export Complete',
        message: `Exported ${selectedData.length} selected items`
      })
    }

    const exportInventory = () => {
      const csvContent = [
        ['Name', 'SKU', 'Category', 'Stock', 'Reorder Point', 'Cost', 'Total Value', 'Turnover'].join(','),
        ...filteredItems.value.map(item => [
          item.name,
          item.sku,
          item.category,
          item.stock,
          item.reorderPoint || 20,
          item.cost.toFixed(2),
          (item.stock * item.cost).toFixed(2),
          calculateTurnover(item) + '%'
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      appStore.addNotification({
        type: 'success',
        title: 'Export Complete',
        message: 'Inventory data has been exported to CSV'
      })
    }

    onMounted(() => {
      loading.value = true
      
      // Generate sample data
      inventoryItems.value = generateInventoryData()
      
      setTimeout(() => {
        loading.value = false
      }, 500)
    })

    return {
      loading,
      searchQuery,
      categoryFilter,
      stockFilter,
      sortBy,
      sortOrder,
      currentPage,
      selectedItems,
      showStockAlert,
      showBulkActions,
      showAdjustModal,
      showHistoryModal,
      selectedProduct,
      adjustmentType,
      adjustmentQuantity,
      adjustmentReason,
      adjustmentNotes,
      historyChart,
      stockHistory,
      totalProducts,
      inStockProducts,
      lowStockItems,
      totalInventoryValue,
      monthlyTurnover,
      filteredItems,
      paginatedItems,
      totalPages,
      formatNumber,
      formatDate,
      getStockClass,
      getStockStatus,
      calculateTurnover,
      getTurnoverFrequency,
      applyFilters,
      toggleSortOrder,
      selectAll,
      adjustStock,
      calculateNewStock,
      saveStockAdjustment,
      closeAdjustModal,
      reorderProduct,
      viewHistory,
      closeHistoryModal,
      bulkUpdateStock,
      bulkUpdatePrices,
      bulkExport,
      exportInventory
    }
  }
}
</script>

<style scoped>
.inventory {
  max-width: 1600px;
  margin: 0 auto;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.inventory-header h1 {
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.inventory-stats {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  gap: 15px;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.stat-detail {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.stock-alerts,
.bulk-actions {
  margin-bottom: 20px;
  background: var(--surface-color);
  border-left: 4px solid var(--warning-color);
}

.alert-header,
.bulk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.alert-header h3,
.bulk-header h3 {
  margin: 0;
  color: var(--text-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: var(--border-color);
}

.alerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 15px;
}

.alert-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 15px;
  align-items: center;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  border-left: 4px solid var(--warning-color);
}

.alert-item.critical {
  border-left-color: var(--danger-color);
  background: rgba(220, 53, 69, 0.05);
}

.product-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
}

.product-sku {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-family: monospace;
}

.stock-level {
  font-weight: 600;
  margin-bottom: 2px;
}

.stock-level.critical {
  color: var(--danger-color);
}

.reorder-point {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.bulk-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.bulk-selection label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-weight: 500;
}

.bulk-actions-buttons {
  display: flex;
  gap: 10px;
}

.inventory-filters {
  margin-bottom: 20px;
  padding: 20px;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 15px;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-color);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.category-filter,
.stock-filter,
.sort-select {
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-color);
  font-size: 0.875rem;
}

.sort-order-btn {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.sort-order-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.inventory-table-container {
  margin-bottom: 20px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.table-wrapper {
  overflow-x: auto;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.inventory-table th {
  background: var(--bg-color);
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.inventory-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.inventory-table th.sortable:hover {
  background: var(--border-color);
}

.sort-indicator {
  margin-left: 5px;
  color: var(--primary-color);
}

.inventory-table td {
  padding: 15px 12px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
}

.inventory-row {
  transition: background-color 0.3s ease;
}

.inventory-row:hover {
  background: var(--bg-color);
}

.inventory-row.low-stock {
  background: rgba(255, 193, 7, 0.1);
}

.inventory-row.out-of-stock {
  background: rgba(220, 53, 69, 0.1);
  opacity: 0.7;
}

.inventory-row.selected {
  background: rgba(102, 126, 234, 0.1);
}

.product-info .product-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
}

.product-description {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.sku {
  font-family: monospace;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.category-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.category-badge.electronics {
  background: rgba(102, 126, 234, 0.2);
  color: var(--primary-color);
}

.category-badge.accessories {
  background: rgba(40, 167, 69, 0.2);
  color: var(--success-color);
}

.category-badge.office {
  background: rgba(255, 193, 7, 0.2);
  color: var(--warning-color);
}

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stock-value {
  font-weight: 600;
  font-size: 1rem;
}

.stock-value.good {
  color: var(--success-color);
}

.stock-value.low {
  color: var(--warning-color);
}

.stock-value.out {
  color: var(--danger-color);
}

.stock-bar {
  width: 60px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.stock-fill.good {
  background: var(--success-color);
}

.stock-fill.low {
  background: var(--warning-color);
}

.stock-fill.out {
  background: var(--danger-color);
}

.stock-status {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.reorder-point {
  font-weight: 500;
  color: var(--text-color);
}

.cost-value {
  font-weight: 600;
  color: var(--text-color);
}

.total-value {
  font-weight: 600;
  color: var(--success-color);
}

.turnover-rate {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
}

.turnover-frequency {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.last-updated {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-color);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  padding: 0 15px;
  font-weight: 600;
  color: var(--text-color);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: var(--surface-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-color);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.modal-close:hover {
  background: var(--border-color);
}

.modal-body {
  padding: 20px;
}

.current-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  margin-bottom: 20px;
}

.current-stock label {
  font-weight: 600;
  color: var(--text-color);
}

.current-stock .stock-value {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1.125rem;
}

.adjustment-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.adjustment-type,
.adjustment-quantity,
.adjustment-reason {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.adjustment-type label,
.adjustment-quantity label,
.adjustment-reason label,
.adjustment-notes label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.form-input {
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 0.875rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.adjustment-notes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.new-stock-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  border: 2px solid var(--primary-color);
}

.new-stock-preview label {
  font-weight: 600;
  color: var(--text-color);
}

.preview-value {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.history-chart {
  margin-bottom: 30px;
  text-align: center;
}

.history-timeline h4 {
  color: var(--text-color);
  margin: 0 0 20px 0;
  font-size: 1.125rem;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.timeline-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  border-left: 4px solid var(--border-color);
}

.timeline-item.in {
  border-left-color: var(--success-color);
}

.timeline-item.out {
  border-left-color: var(--danger-color);
}

.timeline-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-action {
  font-weight: 600;
  color: var(--text-color);
  text-transform: capitalize;
}

.timeline-date {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.timeline-details {
  display: flex;
  gap: 15px;
  margin-bottom: 4px;
}

.quantity-change {
  font-weight: 600;
  color: var(--primary-color);
}

.stock-after {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.timeline-notes {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-style: italic;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .inventory-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .filters-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .alerts-grid {
    grid-template-columns: 1fr;
  }

  .bulk-controls {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .bulk-actions-buttons {
    justify-content: space-between;
  }

  .inventory-table {
    font-size: 0.75rem;
  }

  .inventory-table th,
  .inventory-table td {
    padding: 8px 6px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>