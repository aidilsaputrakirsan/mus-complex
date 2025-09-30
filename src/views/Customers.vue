<template>
  <div class="customers">
    <!-- Header -->
    <div class="customers-header">
      <h1>Customer Database</h1>
      <div class="header-actions">
        <button @click="showAddModal = true" class="btn btn-primary">
          ➕ Add Customer
        </button>
        <button @click="exportCustomers" class="btn btn-success">
          📊 Export
        </button>
      </div>
    </div>

    <!-- Customer Stats -->
    <div class="customer-stats grid grid-cols-4">
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          👥
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalCustomers }}</div>
          <div class="stat-label">Total Customers</div>
          <div class="stat-change positive">
            <span class="change-icon">↗</span>
            12% this month
          </div>
        </div>
      </div>
      
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          🆕
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ newCustomers }}</div>
          <div class="stat-label">New This Month</div>
          <div class="stat-change positive">
            <span class="change-icon">↗</span>
            18% from last month
          </div>
        </div>
      </div>
      
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
          🔄
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ returningCustomers }}</div>
          <div class="stat-label">Returning Customers</div>
          <div class="stat-change positive">
            <span class="change-icon">↗</span>
            8% retention rate
          </div>
        </div>
      </div>
      
      <div class="stat-card card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
          💰
        </div>
        <div class="stat-content">
          <div class="stat-value">${{ averageOrderValue }}</div>
          <div class="stat-label">Avg. Order Value</div>
          <div class="stat-change positive">
            <span class="change-icon">↗</span>
            5% increase
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="customers-controls card">
      <div class="controls-grid">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search customers..." 
            v-model="searchQuery"
            @input="applyFilters"
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>

        <select v-model="segmentFilter" @change="applyFilters" class="segment-filter">
          <option value="">All Segments</option>
          <option value="new">New Customers</option>
          <option value="returning">Returning</option>
          <option value="vip">VIP</option>
        </select>

        <select v-model="sortBy" @change="applyFilters" class="sort-select">
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
          <option value="orders">Sort by Orders</option>
          <option value="spent">Sort by Total Spent</option>
          <option value="lastOrder">Sort by Last Order</option>
        </select>

        <button @click="toggleSortOrder" class="sort-order-btn">
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </button>
      </div>

      <div class="customers-summary">
        <span class="summary-item">
          Showing {{ paginatedCustomers.length }} of {{ filteredCustomers.length }} customers
        </span>
        <span class="summary-item">
          Total CLV: ${{ totalCustomerValue.toLocaleString() }}
        </span>
      </div>
    </div>

    <!-- Customer Segments Chart -->
    <div class="segments-chart card">
      <div class="card-header">
        <h3>Customer Segments</h3>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color new"></span>
            New ({{ newCustomers }})
          </div>
          <div class="legend-item">
            <span class="legend-color returning"></span>
            Returning ({{ returningCustomers }})
          </div>
          <div class="legend-item">
            <span class="legend-color vip"></span>
            VIP ({{ vipCustomers }})
          </div>
        </div>
      </div>
      <div class="chart-container">
        <div class="segment-bar">
          <div 
            class="segment new" 
            :style="{ width: (newCustomers / totalCustomers * 100) + '%' }"
          ></div>
          <div 
            class="segment returning" 
            :style="{ width: (returningCustomers / totalCustomers * 100) + '%' }"
          ></div>
          <div 
            class="segment vip" 
            :style="{ width: (vipCustomers / totalCustomers * 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Customers Table -->
    <div class="customers-table-container card">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading customers...</p>
      </div>

      <div v-else-if="!paginatedCustomers.length" class="empty-state">
        <div class="empty-icon">👤</div>
        <h3>No customers found</h3>
        <p>Try adjusting your search criteria or add a new customer.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="customers-table">
          <thead>
            <tr>
              <th class="sortable" @click="sortBy = 'name'; applyFilters()">
                Customer
                <span v-if="sortBy === 'name'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Contact</th>
              <th>Segment</th>
              <th class="sortable" @click="sortBy = 'orders'; applyFilters()">
                Orders
                <span v-if="sortBy === 'orders'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy = 'spent'; applyFilters()">
                Total Spent
                <span v-if="sortBy === 'spent'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy = 'lastOrder'; applyFilters()">
                Last Order
                <span v-if="sortBy === 'lastOrder'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="customer in paginatedCustomers" 
              :key="customer.id"
              class="customer-row"
              :class="customer.segment"
            >
              <td class="customer-cell">
                <div class="customer-info">
                  <div class="customer-avatar">
                    {{ customer.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="customer-details">
                    <div class="customer-name">{{ customer.name }}</div>
                    <div class="customer-id">ID: {{ customer.id }}</div>
                  </div>
                </div>
              </td>
              
              <td class="contact-cell">
                <div class="contact-info">
                  <div class="email">{{ customer.email }}</div>
                  <div class="phone">{{ customer.phone }}</div>
                </div>
              </td>
              
              <td class="segment-cell">
                <span class="segment-badge" :class="customer.segment">
                  {{ customer.segment.toUpperCase() }}
                </span>
              </td>
              
              <td class="orders-cell">
                <div class="orders-count">{{ customer.totalOrders }}</div>
                <div class="orders-frequency">
                  {{ calculateFrequency(customer) }}
                </div>
              </td>
              
              <td class="spent-cell">
                <div class="total-spent">${{ customer.totalSpent.toLocaleString() }}</div>
                <div class="avg-order">${{ (customer.totalSpent / Math.max(customer.totalOrders, 1)).toFixed(0) }}/order</div>
              </td>
              
              <td class="last-order-cell">
                <div class="last-order-date">{{ formatDate(customer.lastOrderDate) }}</div>
                <div class="days-ago">{{ getDaysAgo(customer.lastOrderDate) }} days ago</div>
              </td>
              
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    @click="viewCustomer(customer)"
                    class="btn btn-sm btn-primary"
                    title="View Profile"
                  >
                    👁️
                  </button>
                  <button 
                    @click="editCustomer(customer)"
                    class="btn btn-sm btn-success"
                    title="Edit Customer"
                  >
                    ✏️
                  </button>
                  <button 
                    @click="deleteCustomer(customer)"
                    class="btn btn-sm btn-danger"
                    title="Delete Customer"
                  >
                    🗑️
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

    <!-- Add/Edit Customer Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingCustomer ? 'Edit Customer' : 'Add New Customer' }}</h3>
          <button @click="closeModal" class="modal-close">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" v-model="customerForm.name" class="form-input">
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="customerForm.email" class="form-input">
            </div>
            
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" v-model="customerForm.phone" class="form-input">
            </div>
            
            <div class="form-group">
              <label>Segment</label>
              <select v-model="customerForm.segment" class="form-input">
                <option value="new">New Customer</option>
                <option value="returning">Returning Customer</option>
                <option value="vip">VIP Customer</option>
              </select>
            </div>
            
            <div class="form-group full-width">
              <label>Address</label>
              <textarea v-model="customerForm.address" class="form-input" rows="3"></textarea>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveCustomer" class="btn btn-primary">
            {{ editingCustomer ? 'Update Customer' : 'Add Customer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Customer Profile Modal -->
    <div v-if="selectedCustomer" class="modal-overlay" @click="closeProfileModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Customer Profile - {{ selectedCustomer.name }}</h3>
          <button @click="closeProfileModal" class="modal-close">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="profile-grid">
            <div class="profile-info">
              <div class="profile-avatar">
                {{ selectedCustomer.name.charAt(0).toUpperCase() }}
              </div>
              <h4>{{ selectedCustomer.name }}</h4>
              <span class="profile-segment" :class="selectedCustomer.segment">
                {{ selectedCustomer.segment.toUpperCase() }} CUSTOMER
              </span>
            </div>
            
            <div class="profile-stats">
              <div class="stat-item">
                <div class="stat-value">{{ selectedCustomer.totalOrders }}</div>
                <div class="stat-label">Total Orders</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${{ selectedCustomer.totalSpent.toLocaleString() }}</div>
                <div class="stat-label">Total Spent</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${{ (selectedCustomer.totalSpent / Math.max(selectedCustomer.totalOrders, 1)).toFixed(0) }}</div>
                <div class="stat-label">Avg Order</div>
              </div>
            </div>
          </div>
          
          <div class="profile-details">
            <div class="details-section">
              <h5>Contact Information</h5>
              <div class="detail-item">
                <label>Email:</label>
                <span>{{ selectedCustomer.email }}</span>
              </div>
              <div class="detail-item">
                <label>Phone:</label>
                <span>{{ selectedCustomer.phone }}</span>
              </div>
              <div class="detail-item">
                <label>Address:</label>
                <span>{{ selectedCustomer.address }}</span>
              </div>
            </div>
            
            <div class="details-section">
              <h5>Purchase History</h5>
              <div class="detail-item">
                <label>First Order:</label>
                <span>{{ formatDate(selectedCustomer.firstOrderDate) }}</span>
              </div>
              <div class="detail-item">
                <label>Last Order:</label>
                <span>{{ formatDate(selectedCustomer.lastOrderDate) }}</span>
              </div>
              <div class="detail-item">
                <label>Frequency:</label>
                <span>{{ calculateFrequency(selectedCustomer) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores'

export default {
  name: 'Customers',
  setup() {
    const appStore = useAppStore()
    
    const loading = ref(false)
    const customers = ref([])
    const searchQuery = ref('')
    const segmentFilter = ref('')
    const sortBy = ref('name')
    const sortOrder = ref('asc')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const showAddModal = ref(false)
    const editingCustomer = ref(null)
    const selectedCustomer = ref(null)
    
    const customerForm = ref({
      name: '',
      email: '',
      phone: '',
      segment: 'new',
      address: ''
    })

    // Generate sample customers data
    const generateCustomers = () => {
      const names = [
        'John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'David Brown',
        'Emily Davis', 'James Wilson', 'Lisa Garcia', 'Robert Miller', 'Jennifer Taylor',
        'Michael Anderson', 'Jessica Thomas', 'William Jackson', 'Ashley White', 'Christopher Harris'
      ]
      
      const segments = ['new', 'returning', 'vip']
      
      return names.map((name, index) => ({
        id: `CUST-${(index + 1).toString().padStart(4, '0')}`,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
        phone: `+1234567${(890 + index).toString()}`,
        segment: segments[Math.floor(Math.random() * segments.length)],
        totalOrders: Math.floor(Math.random() * 25) + 1,
        totalSpent: Math.floor(Math.random() * 5000) + 100,
        firstOrderDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        lastOrderDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        address: `${Math.floor(Math.random() * 9999)} ${['Main St', 'Oak Ave', 'Pine Rd', 'Elm Dr'][Math.floor(Math.random() * 4)]}, City, State ${(12345 + index).toString()}`
      }))
    }

    const totalCustomers = computed(() => customers.value.length)
    const newCustomers = computed(() => 
      customers.value.filter(c => c.segment === 'new').length
    )
    const returningCustomers = computed(() => 
      customers.value.filter(c => c.segment === 'returning').length
    )
    const vipCustomers = computed(() => 
      customers.value.filter(c => c.segment === 'vip').length
    )
    const averageOrderValue = computed(() => {
      const total = customers.value.reduce((sum, c) => sum + c.totalSpent, 0)
      const orders = customers.value.reduce((sum, c) => sum + c.totalOrders, 0)
      return Math.round(total / Math.max(orders, 1))
    })

    const filteredCustomers = computed(() => {
      let filtered = [...customers.value]

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(customer => 
          customer.name.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.id.toLowerCase().includes(query)
        )
      }

      // Segment filter
      if (segmentFilter.value) {
        filtered = filtered.filter(customer => customer.segment === segmentFilter.value)
      }

      // Sorting
      filtered.sort((a, b) => {
        let aValue = a[sortBy.value]
        let bValue = b[sortBy.value]

        if (sortBy.value === 'lastOrder') {
          aValue = new Date(a.lastOrderDate)
          bValue = new Date(b.lastOrderDate)
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
      Math.ceil(filteredCustomers.value.length / itemsPerPage.value)
    )

    const paginatedCustomers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredCustomers.value.slice(start, end)
    })

    const totalCustomerValue = computed(() => 
      filteredCustomers.value.reduce((sum, customer) => sum + customer.totalSpent, 0)
    )

    const applyFilters = () => {
      currentPage.value = 1
    }

    const toggleSortOrder = () => {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      applyFilters()
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getDaysAgo = (date) => {
      const diff = new Date() - new Date(date)
      return Math.floor(diff / (1000 * 60 * 60 * 24))
    }

    const calculateFrequency = (customer) => {
      const daysSinceFirst = (new Date() - new Date(customer.firstOrderDate)) / (1000 * 60 * 60 * 24)
      const frequency = customer.totalOrders / Math.max(daysSinceFirst / 30, 1)
      
      if (frequency >= 2) return 'High'
      if (frequency >= 0.5) return 'Medium'
      return 'Low'
    }

    const viewCustomer = (customer) => {
      selectedCustomer.value = customer
    }

    const editCustomer = (customer) => {
      editingCustomer.value = customer
      customerForm.value = { ...customer }
      showAddModal.value = true
    }

    const deleteCustomer = (customer) => {
      if (confirm(`Are you sure you want to delete "${customer.name}"?`)) {
        const index = customers.value.findIndex(c => c.id === customer.id)
        if (index > -1) {
          customers.value.splice(index, 1)
          
          appStore.addNotification({
            type: 'success',
            title: 'Customer Deleted',
            message: `${customer.name} has been deleted successfully`
          })
        }
      }
    }

    const saveCustomer = () => {
      if (!customerForm.value.name || !customerForm.value.email) {
        appStore.addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Please fill in all required fields'
        })
        return
      }

      if (editingCustomer.value) {
        // Update existing customer
        const index = customers.value.findIndex(c => c.id === editingCustomer.value.id)
        if (index > -1) {
          customers.value[index] = { ...customers.value[index], ...customerForm.value }
          
          appStore.addNotification({
            type: 'success',
            title: 'Customer Updated',
            message: `${customerForm.value.name} has been updated successfully`
          })
        }
      } else {
        // Add new customer
        const newCustomer = {
          ...customerForm.value,
          id: `CUST-${(customers.value.length + 1).toString().padStart(4, '0')}`,
          totalOrders: 0,
          totalSpent: 0,
          firstOrderDate: new Date(),
          lastOrderDate: new Date()
        }
        
        customers.value.push(newCustomer)
        
        appStore.addNotification({
          type: 'success',
          title: 'Customer Added',
          message: `${customerForm.value.name} has been added successfully`
        })
      }

      closeModal()
    }

    const closeModal = () => {
      showAddModal.value = false
      editingCustomer.value = null
      customerForm.value = {
        name: '',
        email: '',
        phone: '',
        segment: 'new',
        address: ''
      }
    }

    const closeProfileModal = () => {
      selectedCustomer.value = null
    }

    const exportCustomers = () => {
      const csvContent = [
        ['ID', 'Name', 'Email', 'Phone', 'Segment', 'Orders', 'Total Spent', 'Last Order'].join(','),
        ...filteredCustomers.value.map(customer => [
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          customer.segment,
          customer.totalOrders,
          customer.totalSpent,
          formatDate(customer.lastOrderDate)
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      appStore.addNotification({
        type: 'success',
        title: 'Export Complete',
        message: 'Customer data has been exported to CSV'
      })
    }

    onMounted(() => {
      loading.value = true
      
      // Generate sample data
      customers.value = generateCustomers()
      
      setTimeout(() => {
        loading.value = false
      }, 500)
    })

    return {
      loading,
      searchQuery,
      segmentFilter,
      sortBy,
      sortOrder,
      currentPage,
      showAddModal,
      editingCustomer,
      selectedCustomer,
      customerForm,
      totalCustomers,
      newCustomers,
      returningCustomers,
      vipCustomers,
      averageOrderValue,
      filteredCustomers,
      paginatedCustomers,
      totalPages,
      totalCustomerValue,
      applyFilters,
      toggleSortOrder,
      formatDate,
      getDaysAgo,
      calculateFrequency,
      viewCustomer,
      editCustomer,
      deleteCustomer,
      saveCustomer,
      closeModal,
      closeProfileModal,
      exportCustomers
    }
  }
}
</script>

<style scoped>
.customers {
  max-width: 1400px;
  margin: 0 auto;
}

.customers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.customers-header h1 {
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.customer-stats {
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
  margin-bottom: 5px;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: var(--success-color);
}

.customers-controls {
  margin-bottom: 20px;
  padding: 20px;
}

.controls-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
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

.segment-filter,
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

.customers-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-muted);
}

.segments-chart {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.card-header h3 {
  margin: 0;
  color: var(--text-color);
}

.chart-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text-color);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.new {
  background: var(--primary-color);
}

.legend-color.returning {
  background: var(--success-color);
}

.legend-color.vip {
  background: var(--warning-color);
}

.chart-container {
  height: 60px;
  display: flex;
  align-items: center;
}

.segment-bar {
  width: 100%;
  height: 30px;
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  background: var(--border-color);
}

.segment {
  height: 100%;
  transition: width 0.3s ease;
}

.segment.new {
  background: var(--primary-color);
}

.segment.returning {
  background: var(--success-color);
}

.segment.vip {
  background: var(--warning-color);
}

.customers-table-container {
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

.customers-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.customers-table th {
  background: var(--bg-color);
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.customers-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.customers-table th.sortable:hover {
  background: var(--border-color);
}

.sort-indicator {
  margin-left: 5px;
  color: var(--primary-color);
}

.customers-table td {
  padding: 15px 12px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
}

.customer-row {
  transition: background-color 0.3s ease;
}

.customer-row:hover {
  background: var(--bg-color);
}

.customer-row.vip {
  background: rgba(255, 193, 7, 0.05);
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.125rem;
}

.customer-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
}

.customer-id {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-family: monospace;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.email {
  color: var(--text-color);
  margin-bottom: 2px;
}

.phone {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.segment-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.segment-badge.new {
  background: rgba(102, 126, 234, 0.2);
  color: var(--primary-color);
}

.segment-badge.returning {
  background: rgba(40, 167, 69, 0.2);
  color: var(--success-color);
}

.segment-badge.vip {
  background: rgba(255, 193, 7, 0.2);
  color: var(--warning-color);
}

.orders-count {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
}

.orders-frequency {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.total-spent {
  font-weight: 600;
  color: var(--success-color);
  margin-bottom: 2px;
}

.avg-order {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.last-order-date {
  color: var(--text-color);
  margin-bottom: 2px;
}

.days-ago {
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
  max-width: 800px;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.profile-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 30px;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.profile-info h4 {
  margin: 0 0 10px 0;
  color: var(--text-color);
  font-size: 1.5rem;
}

.profile-segment {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.profile-segment.new {
  background: rgba(102, 126, 234, 0.2);
  color: var(--primary-color);
}

.profile-segment.returning {
  background: rgba(40, 167, 69, 0.2);
  color: var(--success-color);
}

.profile-segment.vip {
  background: rgba(255, 193, 7, 0.2);
  color: var(--warning-color);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
}

.stat-item .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 5px;
}

.stat-item .stat-label {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.profile-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.details-section h5 {
  color: var(--text-color);
  margin: 0 0 15px 0;
  font-size: 1.125rem;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 5px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.detail-item label {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.detail-item span {
  color: var(--text-color);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .customers-summary {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .chart-legend {
    flex-direction: column;
    gap: 10px;
  }
  
  .profile-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .profile-stats {
    grid-template-columns: 1fr;
  }
  
  .profile-details {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .customers-table {
    font-size: 0.75rem;
  }
  
  .customers-table th,
  .customers-table td {
    padding: 8px 6px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>