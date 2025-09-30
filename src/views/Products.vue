<template>
  <div class="products">
    <!-- Header -->
    <div class="products-header">
      <h1>Products Management</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        ➕ Add Product
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="products-controls card">
      <div class="controls-grid">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search products..." 
            v-model="productsStore.searchQuery"
            @input="productsStore.applyFilters"
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>

        <select 
          v-model="productsStore.selectedCategory" 
          @change="productsStore.applyFilters"
          class="category-filter"
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Accessories">Accessories</option>
          <option value="Office">Office</option>
        </select>

        <select 
          v-model="productsStore.sortBy" 
          @change="productsStore.applyFilters"
          class="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="stock">Sort by Stock</option>
          <option value="sales">Sort by Sales</option>
        </select>

        <button 
          @click="toggleSortOrder"
          class="sort-order-btn"
          :title="productsStore.sortOrder === 'asc' ? 'Ascending' : 'Descending'"
        >
          {{ productsStore.sortOrder === 'asc' ? '↑' : '↓' }}
        </button>

        <select 
          v-model="productsStore.itemsPerPage" 
          @change="productsStore.applyFilters"
          class="items-per-page"
        >
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </select>
      </div>

      <div class="products-stats">
        <span class="stat">
          Showing {{ productsStore.paginatedProducts.length }} of {{ productsStore.filteredProducts.length }} products
        </span>
        <span class="stat">
          Total Value: ${{ totalValue.toLocaleString() }}
        </span>
      </div>
    </div>

    <!-- Products Table -->
    <div class="products-table-container card">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading products...</p>
      </div>

      <div v-else-if="!productsStore.paginatedProducts.length" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No products found</h3>
        <p>Try adjusting your search criteria or add a new product.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="products-table">
          <thead>
            <tr>
              <th class="sortable" @click="sortBy('name')">
                Product Name
                <span class="sort-indicator" v-if="productsStore.sortBy === 'name'">
                  {{ productsStore.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Image</th>
              <th>SKU</th>
              <th>Category</th>
              <th class="sortable" @click="sortBy('price')">
                Price
                <span class="sort-indicator" v-if="productsStore.sortBy === 'price'">
                  {{ productsStore.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('stock')">
                Stock
                <span class="sort-indicator" v-if="productsStore.sortBy === 'stock'">
                  {{ productsStore.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Status</th>
              <th class="sortable" @click="sortBy('sales')">
                Sales
                <span class="sort-indicator" v-if="productsStore.sortBy === 'sales'">
                  {{ productsStore.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="product in productsStore.paginatedProducts" 
              :key="product.id"
              class="product-row"
              :class="{ 'low-stock': product.stock < 20 }"
            >
              <td class="product-name-cell">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-description">{{ product.description }}</div>
              </td>
              <td class="product-image-cell">
                <img :src="product.image" :alt="product.name" class="product-image">
              </td>
              <td class="sku-cell">{{ product.sku }}</td>
              <td class="category-cell">
                <span class="category-badge" :class="product.category.toLowerCase()">
                  {{ product.category }}
                </span>
              </td>
              <td class="price-cell">
                <div class="price">${{ product.price.toFixed(2) }}</div>
                <div class="cost">Cost: ${{ product.cost.toFixed(2) }}</div>
              </td>
              <td class="stock-cell">
                <div class="stock-value" :class="{ 'low': product.stock < 20, 'out': product.stock === 0 }">
                  {{ product.stock }}
                </div>
                <div class="stock-indicator">
                  <div 
                    class="stock-bar" 
                    :style="{ width: Math.min(product.stock / 100 * 100, 100) + '%' }"
                    :class="{ 'low': product.stock < 20, 'out': product.stock === 0 }"
                  ></div>
                </div>
              </td>
              <td class="status-cell">
                <span class="status-badge" :class="product.status">
                  {{ product.status }}
                </span>
              </td>
              <td class="sales-cell">
                <div class="sales-count">{{ product.sales }} sold</div>
                <div class="rating">
                  <span class="stars">⭐</span>
                  {{ product.rating.toFixed(1) }}
                </div>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    @click="editProduct(product)"
                    class="btn btn-sm btn-primary"
                    title="Edit Product"
                  >
                    ✏️
                  </button>
                  <button 
                    @click="duplicateProduct(product)"
                    class="btn btn-sm btn-success"
                    title="Duplicate Product"
                  >
                    📋
                  </button>
                  <button 
                    @click="deleteProduct(product)"
                    class="btn btn-sm btn-danger"
                    title="Delete Product"
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
    <div v-if="productsStore.totalPages > 1" class="pagination-container">
      <div class="pagination">
        <button 
          @click="goToPage(1)" 
          :disabled="productsStore.currentPage === 1"
          class="pagination-btn"
        >
          ⏮️
        </button>
        <button 
          @click="goToPage(productsStore.currentPage - 1)" 
          :disabled="productsStore.currentPage === 1"
          class="pagination-btn"
        >
          ◀️
        </button>
        
        <span class="pagination-info">
          Page {{ productsStore.currentPage }} of {{ productsStore.totalPages }}
        </span>
        
        <button 
          @click="goToPage(productsStore.currentPage + 1)" 
          :disabled="productsStore.currentPage === productsStore.totalPages"
          class="pagination-btn"
        >
          ▶️
        </button>
        <button 
          @click="goToPage(productsStore.totalPages)" 
          :disabled="productsStore.currentPage === productsStore.totalPages"
          class="pagination-btn"
        >
          ⏭️
        </button>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
          <button @click="closeModal" class="modal-close">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Product Name</label>
              <input type="text" v-model="productForm.name" class="form-input">
            </div>
            
            <div class="form-group">
              <label>SKU</label>
              <input type="text" v-model="productForm.sku" class="form-input">
            </div>
            
            <div class="form-group">
              <label>Category</label>
              <select v-model="productForm.category" class="form-input">
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Office">Office</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Price ($)</label>
              <input type="number" step="0.01" v-model="productForm.price" class="form-input">
            </div>
            
            <div class="form-group">
              <label>Cost ($)</label>
              <input type="number" step="0.01" v-model="productForm.cost" class="form-input">
            </div>
            
            <div class="form-group">
              <label>Stock</label>
              <input type="number" v-model="productForm.stock" class="form-input">
            </div>
            
            <div class="form-group full-width">
              <label>Description</label>
              <textarea v-model="productForm.description" class="form-input" rows="3"></textarea>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveProduct" class="btn btn-primary">
            {{ editingProduct ? 'Update Product' : 'Add Product' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useProductsStore, useAppStore } from '../stores'

export default {
  name: 'Products',
  setup() {
    const productsStore = useProductsStore()
    const appStore = useAppStore()
    
    const loading = ref(false)
    const showAddModal = ref(false)
    const editingProduct = ref(null)
    
    const productForm = ref({
      name: '',
      sku: '',
      category: 'Electronics',
      price: 0,
      cost: 0,
      stock: 0,
      description: ''
    })

    const totalValue = computed(() => {
      return productsStore.filteredProducts.reduce((sum, product) => {
        return sum + (product.price * product.stock)
      }, 0)
    })

    const toggleSortOrder = () => {
      productsStore.sortOrder = productsStore.sortOrder === 'asc' ? 'desc' : 'asc'
      productsStore.applyFilters()
    }

    const sortBy = (field) => {
      if (productsStore.sortBy === field) {
        toggleSortOrder()
      } else {
        productsStore.sortBy = field
        productsStore.sortOrder = 'asc'
        productsStore.applyFilters()
      }
    }

    const goToPage = (page) => {
      productsStore.currentPage = page
    }

    const editProduct = (product) => {
      editingProduct.value = product
      productForm.value = { ...product }
      showAddModal.value = true
    }

    const duplicateProduct = (product) => {
      const newProduct = {
        ...product,
        id: Date.now(),
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-COPY`,
        sales: 0
      }
      
      productsStore.products.push(newProduct)
      productsStore.applyFilters()
      
      appStore.addNotification({
        type: 'success',
        title: 'Product Duplicated',
        message: `${product.name} has been duplicated successfully`
      })
    }

    const deleteProduct = (product) => {
      if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
        productsStore.deleteProduct(product.id)
        
        appStore.addNotification({
          type: 'success',
          title: 'Product Deleted',
          message: `${product.name} has been deleted successfully`
        })
      }
    }

    const saveProduct = () => {
      if (!productForm.value.name || !productForm.value.sku) {
        appStore.addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Please fill in all required fields'
        })
        return
      }

      if (editingProduct.value) {
        // Update existing product
        productsStore.updateProduct(editingProduct.value.id, productForm.value)
        
        appStore.addNotification({
          type: 'success',
          title: 'Product Updated',
          message: `${productForm.value.name} has been updated successfully`
        })
      } else {
        // Add new product
        const newProduct = {
          ...productForm.value,
          id: Date.now(),
          image: 'https://via.placeholder.com/150/666/white?text=New',
          status: 'active',
          rating: 0,
          sales: 0
        }
        
        productsStore.products.push(newProduct)
        productsStore.applyFilters()
        
        appStore.addNotification({
          type: 'success',
          title: 'Product Added',
          message: `${productForm.value.name} has been added successfully`
        })
      }

      closeModal()
    }

    const closeModal = () => {
      showAddModal.value = false
      editingProduct.value = null
      productForm.value = {
        name: '',
        sku: '',
        category: 'Electronics',
        price: 0,
        cost: 0,
        stock: 0,
        description: ''
      }
    }

    // Watch for search query changes to add debouncing
    watch(() => productsStore.searchQuery, () => {
      clearTimeout(watch.searchTimeout)
      watch.searchTimeout = setTimeout(() => {
        productsStore.applyFilters()
      }, 300)
    })

    onMounted(async () => {
      loading.value = true
      
      try {
        await productsStore.loadProducts()
      } catch (error) {
        appStore.addNotification({
          type: 'error',
          title: 'Load Error',
          message: 'Failed to load products data'
        })
      } finally {
        loading.value = false
      }
    })

    return {
      productsStore,
      loading,
      showAddModal,
      editingProduct,
      productForm,
      totalValue,
      toggleSortOrder,
      sortBy,
      goToPage,
      editProduct,
      duplicateProduct,
      deleteProduct,
      saveProduct,
      closeModal
    }
  }
}
</script>

<style scoped>
.products {
  max-width: 1400px;
  margin: 0 auto;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.products-header h1 {
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.products-controls {
  margin-bottom: 20px;
  padding: 20px;
}

.controls-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto auto;
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
  transition: border-color 0.3s ease;
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
.sort-select,
.items-per-page {
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

.products-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-muted);
}

.stat {
  font-weight: 500;
}

.products-table-container {
  margin-bottom: 20px;
  overflow: hidden;
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

.empty-state h3 {
  color: var(--text-color);
  margin-bottom: 10px;
}

.table-wrapper {
  overflow-x: auto;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.products-table th {
  background: var(--bg-color);
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.products-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.products-table th.sortable:hover {
  background: var(--border-color);
}

.sort-indicator {
  margin-left: 5px;
  color: var(--primary-color);
}

.products-table td {
  padding: 15px 12px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
}

.product-row {
  transition: background-color 0.3s ease;
}

.product-row:hover {
  background: var(--bg-color);
}

.product-row.low-stock {
  background: rgba(255, 193, 7, 0.1);
}

.product-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
}

.product-description {
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.3;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}

.sku-cell {
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

.price {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
}

.cost {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.stock-value {
  font-weight: 600;
  margin-bottom: 4px;
}

.stock-value.low {
  color: var(--warning-color);
}

.stock-value.out {
  color: var(--danger-color);
}

.stock-indicator {
  width: 60px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.stock-bar {
  height: 100%;
  background: var(--success-color);
  transition: width 0.3s ease;
}

.stock-bar.low {
  background: var(--warning-color);
}

.stock-bar.out {
  background: var(--danger-color);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.active {
  background: rgba(40, 167, 69, 0.2);
  color: var(--success-color);
}

.status-badge.inactive {
  background: rgba(220, 53, 69, 0.2);
  color: var(--danger-color);
}

.sales-count {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.stars {
  color: #ffc107;
}

.action-buttons {
  display: flex;
  gap: 8px;
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

/* Mobile responsiveness */
@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .products-stats {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .products-table {
    font-size: 0.75rem;
  }
  
  .products-table th,
  .products-table td {
    padding: 8px 6px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>