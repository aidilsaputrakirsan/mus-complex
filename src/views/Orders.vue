<template>
  <div class="orders">
    <!-- Header -->
    <div class="orders-header">
      <h1>Orders Management</h1>
      <div class="header-actions">
        <button @click="refreshOrders" class="btn btn-primary" :disabled="loading">
          <span v-if="loading">🔄</span>
          <span v-else">↻</span>
          Refresh
        </button>
        <button @click="exportOrders" class="btn btn-success">
          📊 Export
        </button>
      </div>
    </div>

    <!-- Order Stats -->
    <div class="order-stats grid grid-cols-4">
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          🛒
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalOrders }}</div>
          <div class="stat-label">Total Orders</div>
        </div>
      </div>
      
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          ⏳
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ pendingOrders }}</div>
          <div class="stat-label">Pending Orders</div>
        </div>
      </div>
      
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
          🚚
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ shippedOrders }}</div>
          <div class="stat-label">Shipped Orders</div>
        </div>
      </div>
      
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
          💰
        </div>
        <div class="stat-content">
          <div class="stat-value">${{ totalRevenue.toLocaleString() }}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="orders-filters card">
      <div class="filters-grid">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search orders..." 
            v-model="searchQuery"
            @input="applyFilters"
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>

        <select v-model="statusFilter" @change="applyFilters" class="status-filter">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input 
          type="date" 
          v-model="dateFrom" 
          @change="applyFilters"
          class="date-input"
          placeholder="From Date"
        >

        <input 
          type="date" 
          v-model="dateTo" 
          @change="applyFilters"
          class="date-input"
          placeholder="To Date"
        >
      </div>
    </div>

    <!-- Real-time Orders Stream -->
    <div class="realtime-stream card">
      <div class="stream-header">
        <h3>Live Order Stream</h3>
        <div class="stream-controls">
          <div class="status-indicator">
            <span class="status-dot live"></span>
            Connected
          </div>
          <button @click="toggleStream" class="stream-toggle">
            {{ streamActive ? '⏸️ Pause' : '▶️ Start' }}
          </button>
        </div>
      </div>
      
      <div class="stream-container">
        <div 
          v-for="order in realtimeOrders" 
          :key="order.id"
          class="stream-item"
          :class="order.status"
        >
          <div class="order-indicator">
            <span class="order-icon">📦</span>
          </div>
          <div class="order-info">
            <div class="order-id">#{{ order.id.toString().slice(-6) }}</div>
            <div class="order-customer">{{ order.customer }}</div>
          </div>
          <div class="order-amount">${{ order.total.toFixed(2) }}</div>
          <div class="order-status">{{ order.status }}</div>
          <div class="order-time">{{ formatTime(order.timestamp) }}</div>
        </div>
        
        <div v-if="!realtimeOrders.length" class="stream-empty">
          Waiting for new orders...
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="orders-table-container card">
      <div class="table-header">
        <h3>Order History</h3>
        <div class="table-controls">
          <span class="results-count">
            Showing {{ filteredOrders.length }} orders
          </span>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>

      <div v-else-if="!filteredOrders.length" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No orders found</h3>
        <p>Try adjusting your search criteria.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="order in paginatedOrders" 
              :key="order.id"
              class="order-row"
              :class="order.status"
            >
              <td class="order-id-cell">
                <div class="order-id">{{ order.id }}</div>
              </td>
              
              <td class="customer-cell">
                <div class="customer-info">
                  <div class="customer-name">{{ order.customer.name }}</div>
                  <div class="customer-email">{{ order.customer.email }}</div>
                </div>
              </td>
              
              <td class="items-cell">
                <div class="items-summary">
                  <div class="items-count">{{ order.items.length }} items</div>
                  <div class="items-preview">
                    <span 
                      v-for="(item, index) in order.items.slice(0, 2)" 
                      :key="index"
                      class="item-badge"
                    >
                      {{ item.quantity }}x
                    </span>
                    <span v-if="order.items.length > 2" class="more-items">
                      +{{ order.items.length - 2 }}
                    </span>
                  </div>
                </div>
              </td>
              
              <td class="total-cell">
                <div class="order-total">${{ order.total.toFixed(2) }}</div>
              </td>
              
              <td class="status-cell">
                <select 
                  :value="order.status" 
                  @change="updateOrderStatus(order, $event.target.value)"
                  class="status-select"
                  :class="order.status"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              
              <td class="payment-cell">
                <div class="payment-method">{{ order.paymentMethod }}</div>
              </td>
              
              <td class="date-cell">
                <div class="order-date">{{ formatDate(order.orderDate) }}</div>
                <div v-if="order.deliveryDate" class="delivery-date">
                  Delivered: {{ formatDate(order.deliveryDate) }}
                </div>
              </td>
              
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    @click="viewOrder(order)"
                    class="btn btn-sm btn-primary"
                    title="View Details"
                  >
                    👁️
                  </button>
                  <button 
                    @click="printOrder(order)"
                    class="btn btn-sm btn-success"
                    title="Print Order"
                  >
                    🖨️
                  </button>
                  <button 
                    v-if="order.status !== 'cancelled'"
                    @click="cancelOrder(order)"
                    class="btn btn-sm btn-danger"
                    title="Cancel Order"
                  >
                    ❌
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
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ⏮️
        </button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ◀️
        </button>
        
        <span class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          ▶️
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          ⏭️
        </button>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeOrderModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Order Details - {{ selectedOrder.id }}</h3>
          <button @click="closeOrderModal" class="modal-close">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="order-details-grid">
            <div class="customer-section">
              <h4>Customer Information</h4>
              <div class="detail-item">
                <label>Name:</label>
                <span>{{ selectedOrder.customer.name }}</span>
              </div>
              <div class="detail-item">
                <label>Email:</label>
                <span>{{ selectedOrder.customer.email }}</span>
              </div>
              <div class="detail-item">
                <label>Phone:</label>
                <span>{{ selectedOrder.customer.phone }}</span>
              </div>
              <div class="detail-item">
                <label>Shipping Address:</label>
                <span>{{ selectedOrder.shippingAddress }}</span>
              </div>
            </div>
            
            <div class="order-section">
              <h4>Order Information</h4>
              <div class="detail-item">
                <label>Order Date:</label>
                <span>{{ formatDate(selectedOrder.orderDate) }}</span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span class="status-badge" :class="selectedOrder.status">
                  {{ selectedOrder.status }}
                </span>
              </div>
              <div class="detail-item">
                <label>Payment Method:</label>
                <span>{{ selectedOrder.paymentMethod }}</span>
              </div>
              <div class="detail-item">
                <label>Total Amount:</label>
                <span class="total-amount">${{ selectedOrder.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <div class="items-section">
            <h4>Order Items</h4>
            <div class="items-table">
              <div class="items-header">
                <span>Product</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              <div 
                v-for="item in selectedOrder.items" 
                :key="item.productId"
                class="item-row"
              >
                <span>Product #{{ item.productId }}</span>
                <span>{{ item.quantity }}</span>
                <span>${{ item.price.toFixed(2) }}</span>
                <span>${{ (item.quantity * item.price).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOrdersStore, useAppStore } from '../stores'

export default {
  name: 'Orders',
  setup() {
    const ordersStore = useOrdersStore()
    const appStore = useAppStore()
    
    const loading = ref(false)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const dateFrom = ref('')
    const dateTo = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const selectedOrder = ref(null)
    const streamActive = ref(true)
    const realtimeInterval = ref(null)

    const totalOrders = computed(() => ordersStore.orders.length)
    const pendingOrders = computed(() => 
      ordersStore.orders.filter(order => order.status === 'pending').length
    )
    const shippedOrders = computed(() => 
      ordersStore.orders.filter(order => order.status === 'shipped').length
    )
    const totalRevenue = computed(() => 
      ordersStore.orders.reduce((sum, order) => sum + order.total, 0)
    )

    const filteredOrders = computed(() => {
      let filtered = [...ordersStore.orders]

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order => 
          order.id.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.email.toLowerCase().includes(query)
        )
      }

      // Status filter
      if (statusFilter.value) {
        filtered = filtered.filter(order => order.status === statusFilter.value)
      }

      // Date range filter
      if (dateFrom.value) {
        filtered = filtered.filter(order => 
          new Date(order.orderDate) >= new Date(dateFrom.value)
        )
      }
      
      if (dateTo.value) {
        filtered = filtered.filter(order => 
          new Date(order.orderDate) <= new Date(dateTo.value + 'T23:59:59')
        )
      }

      return filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    })

    const totalPages = computed(() => 
      Math.ceil(filteredOrders.value.length / itemsPerPage.value)
    )

    const paginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredOrders.value.slice(start, end)
    })

    const realtimeOrders = computed(() => ordersStore.realtimeOrders)

    const applyFilters = () => {
      currentPage.value = 1
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const diff = now - new Date(timestamp)
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    }

    const updateOrderStatus = (order, newStatus) => {
      // Update order status in store
      const orderIndex = ordersStore.orders.findIndex(o => o.id === order.id)
      if (orderIndex > -1) {
        ordersStore.orders[orderIndex].status = newStatus
        
        // Update delivery date if delivered
        if (newStatus === 'delivered' && !order.deliveryDate) {
          ordersStore.orders[orderIndex].deliveryDate = new Date().toISOString()
        }
        
        appStore.addNotification({
          type: 'success',
          title: 'Status Updated',
          message: `Order ${order.id} status changed to ${newStatus}`
        })
      }
    }

    const viewOrder = (order) => {
      selectedOrder.value = order
    }

    const printOrder = (order) => {
      appStore.addNotification({
        type: 'info',
        title: 'Print Order',
        message: `Printing order ${order.id}...`
      })
      
      // Simulate printing
      setTimeout(() => {
        appStore.addNotification({
          type: 'success',
          title: 'Print Complete',
          message: `Order ${order.id} has been printed successfully`
        })
      }, 2000)
    }

    const cancelOrder = (order) => {
      if (confirm(`Are you sure you want to cancel order ${order.id}?`)) {
        updateOrderStatus(order, 'cancelled')
      }
    }

    const closeOrderModal = () => {
      selectedOrder.value = null
    }

    const refreshOrders = async () => {
      loading.value = true
      
      try {
        await ordersStore.loadOrders()
        
        appStore.addNotification({
          type: 'success',
          title: 'Orders Refreshed',
          message: 'Order data has been updated'
        })
      } catch (error) {
        appStore.addNotification({
          type: 'error',
          title: 'Refresh Failed',
          message: 'Failed to refresh order data'
        })
      } finally {
        loading.value = false
      }
    }

    const exportOrders = () => {
      const csvContent = [
        ['Order ID', 'Customer', 'Total', 'Status', 'Date'].join(','),
        ...filteredOrders.value.map(order => [
          order.id,
          order.customer.name,
          order.total,
          order.status,
          formatDate(order.orderDate)
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      appStore.addNotification({
        type: 'success',
        title: 'Export Complete',
        message: 'Orders data has been exported to CSV'
      })
    }

    const toggleStream = () => {
      streamActive.value = !streamActive.value
      
      if (streamActive.value) {
        realtimeInterval.value = ordersStore.simulateRealtimeOrders()
      } else {
        if (realtimeInterval.value) {
          clearInterval(realtimeInterval.value)
        }
      }
    }

    onMounted(async () => {
      loading.value = true
      
      try {
        await ordersStore.loadOrders()
        
        // Start real-time order simulation
        if (streamActive.value) {
          realtimeInterval.value = ordersStore.simulateRealtimeOrders()
        }
      } catch (error) {
        appStore.addNotification({
          type: 'error',
          title: 'Load Error',
          message: 'Failed to load orders data'
        })
      } finally {
        loading.value = false
      }
    })

    onUnmounted(() => {
      if (realtimeInterval.value) {
        clearInterval(realtimeInterval.value)
      }
    })

    return {
      loading,
      searchQuery,
      statusFilter,
      dateFrom,
      dateTo,
      currentPage,
      selectedOrder,
      streamActive,
      totalOrders,
      pendingOrders,
      shippedOrders,
      totalRevenue,
      filteredOrders,
      paginatedOrders,
      totalPages,
      realtimeOrders,
      applyFilters,
      formatDate,
      formatTime,
      updateOrderStatus,
      viewOrder,
      printOrder,
      cancelOrder,
      closeOrderModal,
      refreshOrders,
      exportOrders,
      toggleStream
    }
  }
}
</script>

<style scoped>
.orders {
  max-width: 1400px;
  margin: 0 auto;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.orders-header h1 {
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.order-stats {
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
}

.orders-filters {
  margin-bottom: 20px;
  padding: 20px;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
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

.status-filter,
.date-input {
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-color);
  font-size: 0.875rem;
}

.realtime-stream {
  margin-bottom: 30px;
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.stream-header h3 {
  margin: 0;
  color: var(--text-color);
}

.stream-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--success-color);
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success-color);
}

.status-dot.live {
  animation: pulse 2s infinite;
}

.stream-toggle {
  padding: 6px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background-color 0.3s ease;
}

.stream-toggle:hover {
  background: #5a6fd8;
}

.stream-container {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stream-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-color);
  border-radius: 8px;
  border-left: 4px solid var(--border-color);
  transition: all 0.3s ease;
}

.stream-item.pending {
  border-left-color: var(--warning-color);
}

.stream-item.processing {
  border-left-color: var(--info-color);
}

.stream-item.shipped {
  border-left-color: var(--success-color);
}

.order-indicator {
  width: 36px;
  height: 36px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
}

.order-info {
  flex: 1;
}

.order-id {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.order-customer {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.order-amount {
  font-weight: 600;
  color: var(--success-color);
  margin-right: 15px;
}

.order-status {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: capitalize;
  background: var(--border-color);
  margin-right: 15px;
}

.order-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.stream-empty {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 20px;
  font-style: italic;
}

.orders-table-container {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.table-header h3 {
  margin: 0;
  color: var(--text-color);
}

.results-count {
  color: var(--text-muted);
  font-size: 0.875rem;
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

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.orders-table th {
  background: var(--bg-color);
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.orders-table td {
  padding: 15px 12px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
}

.order-row {
  transition: background-color 0.3s ease;
}

.order-row:hover {
  background: var(--bg-color);
}

.order-row.cancelled {
  opacity: 0.6;
}

.order-id {
  font-family: monospace;
  font-weight: 600;
  color: var(--primary-color);
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
}

.customer-email {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.items-summary {
  display: flex;
  flex-direction: column;
}

.items-count {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
}

.items-preview {
  display: flex;
  gap: 4px;
}

.item-badge {
  background: var(--primary-color);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
}

.more-items {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.order-total {
  font-weight: 700;
  color: var(--success-color);
  font-size: 1rem;
}

.status-select {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface-color);
  color: var(--text-color);
  font-size: 0.8rem;
  cursor: pointer;
}

.status-select.pending {
  border-color: var(--warning-color);
  background: rgba(255, 193, 7, 0.1);
}

.status-select.processing {
  border-color: var(--info-color);
  background: rgba(23, 162, 184, 0.1);
}

.status-select.shipped {
  border-color: var(--success-color);
  background: rgba(40, 167, 69, 0.1);
}

.status-select.delivered {
  border-color: var(--success-color);
  background: rgba(40, 167, 69, 0.2);
}

.status-select.cancelled {
  border-color: var(--danger-color);
  background: rgba(220, 53, 69, 0.1);
}

.payment-method {
  color: var(--text-color);
  font-weight: 500;
}

.order-date {
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 2px;
}

.delivery-date {
  color: var(--success-color);
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 1000px;
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

.order-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.customer-section,
.order-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.customer-section h4,
.order-section h4 {
  color: var(--text-color);
  margin: 0 0 10px 0;
  font-size: 1.125rem;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 5px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.detail-item span {
  color: var(--text-color);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  width: fit-content;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: var(--warning-color);
}

.status-badge.processing {
  background: rgba(23, 162, 184, 0.2);
  color: var(--info-color);
}

.status-badge.shipped {
  background: rgba(40, 167, 69, 0.2);
  color: var(--success-color);
}

.status-badge.delivered {
  background: rgba(40, 167, 69, 0.3);
  color: var(--success-color);
}

.status-badge.cancelled {
  background: rgba(220, 53, 69, 0.2);
  color: var(--danger-color);
}

.total-amount {
  font-weight: 700;
  color: var(--success-color);
  font-size: 1.125rem;
}

.items-section h4 {
  color: var(--text-color);
  margin: 0 0 15px 0;
  font-size: 1.125rem;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 5px;
}

.items-table {
  background: var(--bg-color);
  border-radius: 8px;
  overflow: hidden;
}

.items-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px;
  background: var(--border-color);
  font-weight: 600;
  color: var(--text-color);
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

.item-row:last-child {
  border-bottom: none;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .order-details-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .items-header,
  .item-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .stream-item {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .orders-table {
    font-size: 0.75rem;
  }
  
  .orders-table th,
  .orders-table td {
    padding: 8px 6px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>