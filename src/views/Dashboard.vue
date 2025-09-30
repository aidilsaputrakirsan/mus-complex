<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>Ringkasan Dasbor</h1>
      <div class="header-actions">
        <button @click="refreshData" class="btn btn-primary" :disabled="loading">
          <span v-if="loading">🔄</span>
          <span v-else>↻</span>
          Perbarui
        </button>
        <select v-model="dateRange" @change="onDateRangeChange" class="date-selector">
          <option value="today">Hari Ini</option>
          <option value="week">Minggu Ini</option>
          <option value="month">Bulan Ini</option>
          <option value="year">Tahun Ini</option>
        </select>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid grid grid-cols-4">
      <div v-for="stat in dashboardStats" :key="stat.label" class="stat-card card">
        <div class="stat-icon" :style="{ background: stat.color }">
          {{ stat.icon }}
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stat.value) }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-change" :class="stat.change >= 0 ? 'positive' : 'negative'">
            <span class="change-icon">{{ stat.change >= 0 ? '↗' : '↘' }}</span>
            {{ Math.abs(stat.change) }}% from last period
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Revenue Chart -->
      <div class="chart-container card">
        <div class="card-header">
          <h3>Revenue Trend</h3>
          <div class="chart-controls">
            <button 
              v-for="period in chartPeriods" 
              :key="period"
              @click="selectedChartPeriod = period"
              class="chart-btn"
              :class="{ active: selectedChartPeriod === period }"
            >
              {{ period }}
            </button>
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas ref="revenueChart" width="400" height="200"></canvas>
        </div>
      </div>

      <!-- Real-time Orders -->
      <div class="realtime-orders card">
        <div class="card-header">
          <h3>Pesanan Real-time</h3>
          <div class="status-indicator">
            <span class="status-dot live"></span>
            Langsung
          </div>
        </div>
        <div class="orders-list">
          <div 
            v-for="order in realtimeOrders.slice(0, 6)" 
            :key="order.id"
            class="order-item"
          >
            <div class="order-info">
              <div class="order-id">#{{ order.id.toString().slice(-6) }}</div>
              <div class="order-customer">{{ order.customer }}</div>
            </div>
            <div class="order-details">
              <div class="order-amount">${{ order.total.toFixed(2) }}</div>
              <div class="order-status" :class="order.status">{{ order.status }}</div>
            </div>
            <div class="order-time">{{ formatRelativeTime(order.timestamp) }}</div>
          </div>
          <div v-if="!realtimeOrders.length" class="no-orders">
            Menunggu pesanan baru...
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="top-products card">
        <div class="card-header">
          <h3>Produk Terlaris</h3>
        </div>
        <div class="products-list">
          <div 
            v-for="(product, index) in topProducts" 
            :key="product.productId"
            class="product-item"
          >
            <div class="product-rank">{{ index + 1 }}</div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-sales">{{ product.sales }} sold</div>
            </div>
            <div class="product-revenue">${{ formatNumber(product.revenue) }}</div>
          </div>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="activity-feed card">
        <div class="card-header">
          <h3>Aktivitas Terbaru</h3>
        </div>
        <div class="activity-list">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon" :class="activity.type">
              {{ activity.icon }}
            </div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="performance-metrics card">
        <div class="card-header">
          <h3>Performa Sistem</h3>
        </div>
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-label">CPU Usage</div>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: systemMetrics.cpu + '%' }"></div>
            </div>
            <div class="metric-value">{{ systemMetrics.cpu }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Memory</div>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: systemMetrics.memory + '%' }"></div>
            </div>
            <div class="metric-value">{{ systemMetrics.memory }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Load Time</div>
            <div class="metric-bar">
              <div class="metric-fill good" :style="{ width: Math.min(systemMetrics.loadTime * 10, 100) + '%' }"></div>
            </div>
            <div class="metric-value">{{ systemMetrics.loadTime }}ms</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppStore, useOrdersStore } from '../stores'

export default {
  name: 'Dashboard',
  setup() {
    const appStore = useAppStore()
    const ordersStore = useOrdersStore()
    
    const loading = ref(false)
    const dateRange = ref('month')
    const selectedChartPeriod = ref('Month')
    const chartPeriods = ['Minggu', 'Bulan', 'Kuartal', 'Tahun']
    const revenueChart = ref(null)
    
    const analyticsData = ref(null)
    const realtimeInterval = ref(null)
    const systemMetrics = ref({
      cpu: 45,
      memory: 62,
      loadTime: 150
    })

    const dashboardStats = computed(() => [
      {
        label: 'Total Pendapatan',
        value: analyticsData.value?.dailyStats.revenue || 0,
        icon: '💰',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        change: 12.5
      },
      {
        label: 'Pesanan Hari Ini',
        value: analyticsData.value?.dailyStats.orders || 0,
        icon: '📦',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        change: 8.2
      },
      {
        label: 'Pelanggan Baru',
        value: analyticsData.value?.dailyStats.customers || 0,
        icon: '👥',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        change: -2.4
      },
      {
        label: 'Produk',
        value: analyticsData.value?.dailyStats.products || 0,
        icon: '🏷️',
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        change: 5.7
      }
    ])

    const topProducts = computed(() => {
      return analyticsData.value?.topProducts || []
    })

    const realtimeOrders = computed(() => {
      return ordersStore.realtimeOrders
    })

    const recentActivities = ref([
      {
        id: 1,
        type: 'order',
        icon: '🛒',
        text: 'Pesanan baru #PES-1234 diterima',
        timestamp: new Date(Date.now() - 2 * 60 * 1000)
      },
      {
        id: 2,
        type: 'product',
        icon: '📦',
        text: 'Produk "Headphone Nirkabel" diperbarui',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: 3,
        type: 'customer',
        icon: '👤',
        text: 'Pelanggan baru terdaftar',
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 4,
        type: 'system',
        icon: '⚙️',
        text: 'Backup sistem selesai',
        timestamp: new Date(Date.now() - 45 * 60 * 1000)
      }
    ])

    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    }

    const formatRelativeTime = (timestamp) => {
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

    const loadAnalyticsData = async () => {
      try {
        // Try multiple paths for production compatibility
        let response
        try {
          response = await fetch('/data/analytics.json')
        } catch {
          response = await fetch('./data/analytics.json')
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        analyticsData.value = await response.json()
      } catch (error) {
        console.error('Failed to load analytics data:', error)
        
        // Fallback with sample data if fetch fails
        analyticsData.value = {
          dailyStats: {
            revenue: 12450.75,
            orders: 47,
            customers: 23,
            products: 156
          },
          monthlyRevenue: [
            {"month": "Jan", "revenue": 125000, "orders": 450},
            {"month": "Feb", "revenue": 145000, "orders": 523},
            {"month": "Mar", "revenue": 135000, "orders": 489},
            {"month": "Apr", "revenue": 155000, "orders": 567},
            {"month": "Mei", "revenue": 175000, "orders": 634},
            {"month": "Jun", "revenue": 165000, "orders": 598},
            {"month": "Jul", "revenue": 185000, "orders": 672},
            {"month": "Agu", "revenue": 195000, "orders": 701},
            {"month": "Sep", "revenue": 205000, "orders": 734},
            {"month": "Okt", "revenue": 215000, "orders": 789},
            {"month": "Nov", "revenue": 225000, "orders": 823},
            {"month": "Des", "revenue": 245000, "orders": 876}
          ],
          topProducts: [
            {"productId": 3, "name": "Kabel Charger USB-C", "sales": 892, "revenue": 17838.08},
            {"productId": 2, "name": "Case Handphone Pintar", "sales": 567, "revenue": 14165.33},
            {"productId": 6, "name": "Mouse Nirkabel", "sales": 456, "revenue": 15954.44},
            {"productId": 4, "name": "Power Bank Portabel", "sales": 345, "revenue": 17246.55},
            {"productId": 7, "name": "Keyboard Mekanik", "sales": 267, "revenue": 42717.33}
          ]
        }
        
        appStore.addNotification({
          type: 'warning',
          title: 'Menggunakan Data Sampel',
          message: 'Menggunakan data sampel untuk demo'
        })
      }
    }

    const initChart = async () => {
      await nextTick()
      if (!revenueChart.value || !analyticsData.value) return

      const ctx = revenueChart.value.getContext('2d')
      const data = analyticsData.value.monthlyRevenue

      // Clear canvas
      ctx.clearRect(0, 0, revenueChart.value.width, revenueChart.value.height)

      // Chart dimensions
      const padding = 40
      const chartWidth = revenueChart.value.width - 2 * padding
      const chartHeight = revenueChart.value.height - 2 * padding

      // Data processing
      const maxRevenue = Math.max(...data.map(d => d.revenue))
      const minRevenue = Math.min(...data.map(d => d.revenue))
      const range = maxRevenue - minRevenue

      // Draw grid
      ctx.strokeStyle = '#e3e6f0'
      ctx.lineWidth = 1

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (i * chartHeight / 5)
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(padding + chartWidth, y)
        ctx.stroke()
      }

      // Draw line chart
      ctx.strokeStyle = '#667eea'
      ctx.lineWidth = 3
      ctx.beginPath()

      data.forEach((point, index) => {
        const x = padding + (index * chartWidth / (data.length - 1))
        const y = padding + chartHeight - ((point.revenue - minRevenue) / range) * chartHeight
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Draw points
      ctx.fillStyle = '#667eea'
      data.forEach((point, index) => {
        const x = padding + (index * chartWidth / (data.length - 1))
        const y = padding + chartHeight - ((point.revenue - minRevenue) / range) * chartHeight
        
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw labels
      ctx.fillStyle = '#6c757d'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'

      data.forEach((point, index) => {
        const x = padding + (index * chartWidth / (data.length - 1))
        ctx.fillText(point.month, x, revenueChart.value.height - 10)
      })
    }

    const refreshData = async () => {
      loading.value = true
      
      try {
        await Promise.all([
          loadAnalyticsData(),
          ordersStore.loadOrders()
        ])
        
        // Wait for data to be reactive
        await nextTick()
        
        // Initialize chart after data is loaded
        setTimeout(async () => {
          await initChart()
        }, 200)
        
        appStore.addNotification({
          type: 'success',
          title: 'Data Diperbarui',
          message: 'Data dasbor telah diperbarui'
        })
      } catch (error) {
        console.error('Refresh error:', error)
        appStore.addNotification({
          type: 'error',
          title: 'Perbarui Gagal',
          message: 'Gagal memperbarui data dasbor'
        })
      } finally {
        loading.value = false
      }
    }

    const onDateRangeChange = () => {
      refreshData()
    }

    const simulateSystemMetrics = () => {
      setInterval(() => {
        systemMetrics.value = {
          cpu: Math.max(20, Math.min(80, systemMetrics.value.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(30, Math.min(85, systemMetrics.value.memory + (Math.random() - 0.5) * 8)),
          loadTime: Math.max(50, Math.min(300, systemMetrics.value.loadTime + (Math.random() - 0.5) * 20))
        }
      }, 2000)
    }

    onMounted(async () => {
      console.log('Dashboard mounting...')
      appStore.setLoading(true)
      
      try {
        // Load data first
        await loadAnalyticsData()
        await ordersStore.loadOrders()
        
        // Start real-time order simulation
        realtimeInterval.value = ordersStore.simulateRealtimeOrders()
        
        // Wait for DOM to be fully ready
        await nextTick()
        
        // Initialize chart with delay to ensure canvas is ready
        setTimeout(async () => {
          try {
            await initChart()
            console.log('Chart initialized successfully')
          } catch (error) {
            console.error('Chart initialization failed:', error)
          }
        }, 500)
        
        // Start system metrics simulation
        simulateSystemMetrics()
        
        console.log('Dashboard mounted successfully')
        
      } catch (error) {
        console.error('Dashboard initialization error:', error)
        appStore.addNotification({
          type: 'error',
          title: 'Gagal Memuat',
          message: 'Terjadi kesalahan saat memuat dashboard'
        })
      } finally {
        appStore.setLoading(false)
      }
    })

    onUnmounted(() => {
      if (realtimeInterval.value) {
        clearInterval(realtimeInterval.value)
      }
    })

    return {
      appStore,
      loading,
      dateRange,
      selectedChartPeriod,
      chartPeriods,
      revenueChart,
      dashboardStats,
      topProducts,
      realtimeOrders,
      recentActivities,
      systemMetrics,
      formatNumber,
      formatRelativeTime,
      refreshData,
      onDateRangeChange
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.date-selector {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface-color);
  color: var(--text-color);
  font-size: 0.875rem;
}

.stats-grid {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  gap: 15px;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
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
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
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

.stat-change.negative {
  color: var(--danger-color);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 20px;
}

.chart-container {
  grid-column: 1;
  grid-row: 1;
}

.realtime-orders {
  grid-column: 2;
  grid-row: 1;
}

.top-products {
  grid-column: 1;
  grid-row: 2;
}

.activity-feed {
  grid-column: 2;
  grid-row: 2;
}

.performance-metrics {
  grid-column: 1 / -1;
  grid-row: 3;
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
  font-size: 1.125rem;
  font-weight: 600;
}

.chart-controls {
  display: flex;
  gap: 5px;
}

.chart-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.chart-btn.active,
.chart-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.chart-wrapper {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
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

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.orders-list,
.products-list,
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-color);
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.order-item:hover {
  transform: translateX(5px);
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

.order-details {
  text-align: right;
}

.order-amount {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.order-status {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.order-status.pending {
  background: rgba(255, 193, 7, 0.2);
  color: var(--warning-color);
}

.order-status.processing {
  background: rgba(23, 162, 184, 0.2);
  color: var(--info-color);
}

.order-status.shipped {
  background: rgba(40, 167, 69, 0.2);
  color: var(--success-color);
}

.order-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-color);
  border-radius: 8px;
}

.product-rank {
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
  margin-bottom: 2px;
}

.product-sales {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.product-revenue {
  font-weight: 600;
  color: var(--success-color);
  font-size: 0.875rem;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-color);
  border-radius: 8px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.activity-icon.order {
  background: rgba(102, 126, 234, 0.2);
}

.activity-icon.product {
  background: rgba(40, 167, 69, 0.2);
}

.activity-icon.customer {
  background: rgba(23, 162, 184, 0.2);
}

.activity-icon.system {
  background: rgba(108, 117, 125, 0.2);
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: var(--text-color);
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.activity-time {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-item {
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.metric-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.metric-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.metric-fill.good {
  background: var(--success-color);
}

.metric-value {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.no-orders {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 20px;
  font-style: italic;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .chart-container,
  .realtime-orders,
  .top-products,
  .activity-feed,
  .performance-metrics {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>