<template>
  <div class="analytics">
    <!-- Header -->
    <div class="analytics-header">
      <h1>Analytics & Reports</h1>
      <div class="header-actions">
        <select v-model="selectedPeriod" @change="updatePeriod" class="period-selector">
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
        <button @click="refreshData" class="btn btn-primary" :disabled="loading">
          <span v-if="loading">🔄</span>
          <span v-else>↻</span>
          Refresh
        </button>
        <button @click="exportReport" class="btn btn-success">
          📊 Export Report
        </button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="key-metrics grid grid-cols-4">
      <div class="metric-card card">
        <div class="metric-header">
          <div class="metric-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            💰
          </div>
          <div class="metric-trend positive">
            <span class="trend-icon">📈</span>
            +12.5%
          </div>
        </div>
        <div class="metric-content">
          <div class="metric-value">${{ formatNumber(kpiData.revenue) }}</div>
          <div class="metric-label">Total Revenue</div>
          <div class="metric-subtitle">vs ${formatNumber(kpiData.revenue * 0.875)} last period</div>
        </div>
      </div>

      <div class="metric-card card">
        <div class="metric-header">
          <div class="metric-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            🛒
          </div>
          <div class="metric-trend positive">
            <span class="trend-icon">📈</span>
            +8.2%
          </div>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ formatNumber(kpiData.orders) }}</div>
          <div class="metric-label">Total Orders</div>
          <div class="metric-subtitle">{{ Math.round(kpiData.orders / 30) }} avg/day</div>
        </div>
      </div>

      <div class="metric-card card">
        <div class="metric-header">
          <div class="metric-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            👥
          </div>
          <div class="metric-trend negative">
            <span class="trend-icon">📉</span>
            -2.1%
          </div>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ formatNumber(kpiData.customers) }}</div>
          <div class="metric-label">Active Customers</div>
          <div class="metric-subtitle">{{ Math.round(kpiData.customers * 0.15) }} new this month</div>
        </div>
      </div>

      <div class="metric-card card">
        <div class="metric-header">
          <div class="metric-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
            💳
          </div>
          <div class="metric-trend positive">
            <span class="trend-icon">📈</span>
            +5.7%
          </div>
        </div>
        <div class="metric-content">
          <div class="metric-value">${{ Math.round(kpiData.revenue / kpiData.orders) }}</div>
          <div class="metric-label">Avg Order Value</div>
          <div class="metric-subtitle">Target: $75</div>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Revenue Trend Chart -->
      <div class="chart-section card large">
        <div class="chart-header">
          <h3>Revenue Trend</h3>
          <div class="chart-controls">
            <button 
              v-for="type in revenueChartTypes" 
              :key="type"
              @click="selectedRevenueType = type"
              class="chart-btn"
              :class="{ active: selectedRevenueType === type }"
            >
              {{ type }}
            </button>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="revenueChart" width="800" height="300"></canvas>
        </div>
      </div>

      <!-- Category Performance -->
      <div class="chart-section card">
        <div class="chart-header">
          <h3>Category Performance</h3>
        </div>
        <div class="category-performance">
          <div 
            v-for="category in categoryData" 
            :key="category.category"
            class="category-item"
          >
            <div class="category-info">
              <div class="category-name">{{ category.category }}</div>
              <div class="category-revenue">${{ formatNumber(category.revenue) }}</div>
            </div>
            <div class="category-bar">
              <div 
                class="category-fill" 
                :style="{ 
                  width: category.percentage + '%',
                  background: getCategoryColor(category.category)
                }"
              ></div>
            </div>
            <div class="category-percentage">{{ category.percentage.toFixed(1) }}%</div>
          </div>
        </div>
      </div>

      <!-- Sales Funnel -->
      <div class="chart-section card">
        <div class="chart-header">
          <h3>Sales Funnel</h3>
        </div>
        <div class="funnel-chart">
          <div 
            v-for="(stage, index) in funnelData" 
            :key="stage.stage"
            class="funnel-stage"
            :style="{ width: stage.percentage + '%' }"
          >
            <div class="stage-content">
              <div class="stage-name">{{ stage.stage }}</div>
              <div class="stage-value">{{ formatNumber(stage.value) }}</div>
              <div class="stage-percentage">{{ stage.percentage.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="chart-section card">
        <div class="chart-header">
          <h3>Top Performing Products</h3>
        </div>
        <div class="top-products">
          <div 
            v-for="(product, index) in topProducts" 
            :key="product.productId"
            class="product-item"
          >
            <div class="product-rank">{{ index + 1 }}</div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-metrics">
                <span class="product-sales">{{ product.sales }} sold</span>
                <span class="product-revenue">${{ formatNumber(product.revenue) }}</span>
              </div>
            </div>
            <div class="product-bar">
              <div 
                class="product-fill" 
                :style="{ width: (product.revenue / topProducts[0].revenue * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Traffic Sources -->
      <div class="chart-section card">
        <div class="chart-header">
          <h3>Traffic Sources</h3>
        </div>
        <div class="traffic-sources">
          <div class="pie-chart">
            <canvas ref="trafficChart" width="200" height="200"></canvas>
          </div>
          <div class="traffic-legend">
            <div 
              v-for="source in trafficData" 
              :key="source.source"
              class="legend-item"
            >
              <span 
                class="legend-color" 
                :style="{ background: getTrafficColor(source.source) }"
              ></span>
              <span class="legend-label">{{ source.source }}</span>
              <span class="legend-value">{{ formatNumber(source.visitors) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Real-time Analytics -->
      <div class="chart-section card">
        <div class="chart-header">
          <h3>Real-time Analytics</h3>
          <div class="realtime-indicator">
            <span class="realtime-dot"></span>
            Live
          </div>
        </div>
        <div class="realtime-metrics">
          <div class="realtime-metric">
            <div class="metric-label">Active Users</div>
            <div class="metric-value animated">{{ realtimeData.activeUsers }}</div>
          </div>
          <div class="realtime-metric">
            <div class="metric-label">Page Views</div>
            <div class="metric-value animated">{{ realtimeData.pageViews }}</div>
          </div>
          <div class="realtime-metric">
            <div class="metric-label">Conversion Rate</div>
            <div class="metric-value animated">{{ realtimeData.conversionRate }}%</div>
          </div>
          <div class="realtime-metric">
            <div class="metric-label">Cart Abandonment</div>
            <div class="metric-value animated">{{ realtimeData.cartAbandonment }}%</div>
          </div>
        </div>

        <div class="activity-stream">
          <h4>Recent Activity</h4>
          <div class="activity-list">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">{{ activity.icon }}</div>
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Analytics -->
    <div class="advanced-analytics">
      <h2>Advanced Insights</h2>
      
      <div class="insights-grid grid grid-cols-3">
        <!-- Cohort Analysis -->
        <div class="insight-card card">
          <div class="insight-header">
            <h3>Customer Retention</h3>
            <div class="insight-metric">68%</div>
          </div>
          <div class="cohort-heatmap">
            <div 
              v-for="(week, weekIndex) in cohortData" 
              :key="weekIndex"
              class="cohort-row"
            >
              <div class="cohort-label">Week {{ weekIndex + 1 }}</div>
              <div 
                v-for="(retention, dayIndex) in week" 
                :key="dayIndex"
                class="cohort-cell"
                :style="{ 
                  background: `rgba(102, 126, 234, ${retention / 100})`,
                  color: retention > 50 ? 'white' : '#333'
                }"
              >
                {{ retention }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Geographic Performance -->
        <div class="insight-card card">
          <div class="insight-header">
            <h3>Geographic Performance</h3>
            <div class="insight-metric">{{ formatNumber(geographicData.reduce((sum, g) => sum + g.revenue, 0)) }}</div>
          </div>
          <div class="geographic-data">
            <div 
              v-for="geo in geographicData" 
              :key="geo.region"
              class="geo-item"
            >
              <div class="geo-info">
                <div class="geo-region">{{ geo.region }}</div>
                <div class="geo-revenue">${{ formatNumber(geo.revenue) }}</div>
              </div>
              <div class="geo-bar">
                <div 
                  class="geo-fill" 
                  :style="{ 
                    width: (geo.revenue / Math.max(...geographicData.map(g => g.revenue)) * 100) + '%' 
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Predictions -->
        <div class="insight-card card">
          <div class="insight-header">
            <h3>Revenue Forecast</h3>
            <div class="insight-metric">${{ formatNumber(predictionData.nextMonth) }}</div>
          </div>
          <div class="prediction-chart">
            <div class="prediction-bar">
              <div class="prediction-actual" :style="{ width: '70%' }">
                <span>Actual</span>
              </div>
              <div class="prediction-forecast" :style="{ width: '30%' }">
                <span>Forecast</span>
              </div>
            </div>
            <div class="prediction-details">
              <div class="prediction-item">
                <span class="prediction-label">Confidence</span>
                <span class="prediction-value">{{ predictionData.confidence }}%</span>
              </div>
              <div class="prediction-item">
                <span class="prediction-label">Growth Rate</span>
                <span class="prediction-value">+{{ predictionData.growthRate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppStore } from '../stores'

export default {
  name: 'Analytics',
  setup() {
    const appStore = useAppStore()
    
    const loading = ref(false)
    const selectedPeriod = ref('30d')
    const selectedRevenueType = ref('Revenue')
    const revenueChartTypes = ['Revenue', 'Orders', 'Customers']
    
    const revenueChart = ref(null)
    const trafficChart = ref(null)
    
    const analyticsData = ref(null)
    const realtimeInterval = ref(null)

    // Real-time data
    const realtimeData = ref({
      activeUsers: 1247,
      pageViews: 8923,
      conversionRate: 3.2,
      cartAbandonment: 18.5
    })

    const recentActivity = ref([
      { id: 1, icon: '🛒', text: 'New order from California - $156.00', timestamp: new Date() },
      { id: 2, icon: '👤', text: 'User signup from New York', timestamp: new Date(Date.now() - 2 * 60000) },
      { id: 3, icon: '💳', text: 'Payment processed - $89.99', timestamp: new Date(Date.now() - 5 * 60000) },
      { id: 4, icon: '📧', text: 'Newsletter signup from Texas', timestamp: new Date(Date.now() - 8 * 60000) }
    ])

    // Sample data
    const kpiData = computed(() => ({
      revenue: 245000,
      orders: 1247,
      customers: 856,
      products: 234
    }))

    const categoryData = computed(() => 
      analyticsData.value?.categoryPerformance || []
    )

    const topProducts = computed(() => 
      analyticsData.value?.topProducts || []
    )

    const trafficData = computed(() => 
      analyticsData.value?.trafficSources || []
    )

    const funnelData = ref([
      { stage: 'Visitors', value: 10000, percentage: 100 },
      { stage: 'Product Views', value: 6500, percentage: 85 },
      { stage: 'Add to Cart', value: 3200, percentage: 70 },
      { stage: 'Checkout', value: 1600, percentage: 55 },
      { stage: 'Purchase', value: 800, percentage: 40 }
    ])

    const cohortData = ref([
      [100, 85, 72, 68, 65, 62, 58],
      [100, 82, 69, 64, 61, 57, 54],
      [100, 88, 75, 71, 67, 63, 59],
      [100, 90, 78, 74, 70, 66, 62]
    ])

    const geographicData = ref([
      { region: 'North America', revenue: 125000, percentage: 51 },
      { region: 'Europe', revenue: 78000, percentage: 32 },
      { region: 'Asia Pacific', revenue: 35000, percentage: 14 },
      { region: 'Other', revenue: 7000, percentage: 3 }
    ])

    const predictionData = ref({
      nextMonth: 287000,
      confidence: 85,
      growthRate: 12.3
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

    const formatTime = (timestamp) => {
      const now = new Date()
      const diff = now - new Date(timestamp)
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      
      const hours = Math.floor(minutes / 60)
      return `${hours}h ago`
    }

    const getCategoryColor = (category) => {
      const colors = {
        'Electronics': '#667eea',
        'Accessories': '#43e97b',
        'Office': '#ffc107'
      }
      return colors[category] || '#6c757d'
    }

    const getTrafficColor = (source) => {
      const colors = {
        'Direct': '#667eea',
        'Google': '#43e97b',
        'Social Media': '#f093fb',
        'Email': '#ffc107'
      }
      return colors[source] || '#6c757d'
    }

    const initRevenueChart = async () => {
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (!revenueChart.value || !analyticsData.value?.monthlyRevenue) {
        console.log('Revenue chart initialization skipped: missing elements or data')
        return
      }

      try {
        const ctx = revenueChart.value.getContext('2d')
        if (!ctx) {
          console.error('Cannot get 2D context from revenue canvas')
          return
        }
        
        const data = analyticsData.value.monthlyRevenue

        // Clear canvas
        ctx.clearRect(0, 0, revenueChart.value.width, revenueChart.value.height)

        // Chart dimensions
        const padding = 50
        const chartWidth = revenueChart.value.width - 2 * padding
        const chartHeight = revenueChart.value.height - 2 * padding

        // Data processing
        const revenues = data.map(d => d.revenue)
        const maxRevenue = Math.max(...revenues)
        const minRevenue = Math.min(...revenues)
        const range = maxRevenue - minRevenue || 1

        // Draw grid
        ctx.strokeStyle = '#e3e6f0'
        ctx.lineWidth = 1

        // Horizontal grid lines
        for (let i = 0; i <= 6; i++) {
          const y = padding + (i * chartHeight / 6)
          ctx.beginPath()
          ctx.moveTo(padding, y)
          ctx.lineTo(padding + chartWidth, y)
          ctx.stroke()

          // Y-axis labels
          const value = maxRevenue - (i * range / 6)
          ctx.fillStyle = '#6c757d'
          ctx.font = '12px Arial'
          ctx.textAlign = 'right'
          ctx.fillText(`${(value / 1000).toFixed(0)}K`, padding - 10, y + 4)
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
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()
        })

        // Draw labels
        ctx.fillStyle = '#6c757d'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'

        data.forEach((point, index) => {
          const x = padding + (index * chartWidth / (data.length - 1))
          ctx.fillText(point.month, x, revenueChart.value.height - 20)
        })
        
        console.log('Revenue chart rendered successfully')
        
      } catch (error) {
        console.error('Revenue chart rendering error:', error)
        
        // Fallback
        if (revenueChart.value) {
          const ctx = revenueChart.value.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#6c757d'
            ctx.font = '16px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('Grafik sedang dimuat...', revenueChart.value.width / 2, revenueChart.value.height / 2)
          }
        }
      }
    }

    const initTrafficChart = async () => {
      await nextTick()
      if (!trafficChart.value || !trafficData.value.length) return

      const ctx = trafficChart.value.getContext('2d')
      const centerX = trafficChart.value.width / 2
      const centerY = trafficChart.value.height / 2
      const radius = Math.min(centerX, centerY) - 20

      const total = trafficData.value.reduce((sum, item) => sum + item.visitors, 0)
      let currentAngle = -Math.PI / 2

      trafficData.value.forEach((item, index) => {
        const sliceAngle = (item.visitors / total) * 2 * Math.PI
        
        ctx.fillStyle = getTrafficColor(item.source)
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
        ctx.closePath()
        ctx.fill()

        // Add subtle stroke
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.stroke()

        currentAngle += sliceAngle
      })
    }

    const updatePeriod = () => {
      refreshData()
    }

    const refreshData = async () => {
      loading.value = true
      
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
        
        // Wait for data to be reactive
        await nextTick()
        
        // Initialize charts with delay
        setTimeout(async () => {
          await Promise.all([
            initRevenueChart(),
            initTrafficChart()
          ])
        }, 300)
        
        appStore.addNotification({
          type: 'success',
          title: 'Data Diperbarui',
          message: 'Data analitik telah diperbarui'
        })
      } catch (error) {
        console.error('Analytics refresh error:', error)
        
        // Use fallback data
        analyticsData.value = {
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
          categoryPerformance: [
            {"category": "Elektronik", "revenue": 856000, "percentage": 45.2},
            {"category": "Aksesoris", "revenue": 634000, "percentage": 33.5},
            {"category": "Kantor", "revenue": 403000, "percentage": 21.3}
          ],
          topProducts: [
            {"productId": 3, "name": "Kabel Charger USB-C", "sales": 892, "revenue": 17838.08},
            {"productId": 2, "name": "Case Handphone Pintar", "sales": 567, "revenue": 14165.33},
            {"productId": 6, "name": "Mouse Nirkabel", "sales": 456, "revenue": 15954.44}
          ],
          trafficSources: [
            {"source": "Langsung", "visitors": 15640, "percentage": 42.3},
            {"source": "Google", "visitors": 12890, "percentage": 34.9},
            {"source": "Media Sosial", "visitors": 5430, "percentage": 14.7},
            {"source": "Email", "visitors": 2980, "percentage": 8.1}
          ]
        }
        
        await nextTick()
        setTimeout(async () => {
          await Promise.all([
            initRevenueChart(),
            initTrafficChart()
          ])
        }, 300)
        
        appStore.addNotification({
          type: 'warning',
          title: 'Menggunakan Data Sampel',
          message: 'menggunakan data sampel'
        })
      } finally {
        loading.value = false
      }
    }

    const exportReport = () => {
      const reportData = {
        period: selectedPeriod.value,
        kpi: kpiData.value,
        categories: categoryData.value,
        topProducts: topProducts.value,
        traffic: trafficData.value,
        funnel: funnelData.value
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      appStore.addNotification({
        type: 'success',
        title: 'Report Exported',
        message: 'Analytics report has been exported successfully'
      })
    }

    const simulateRealtime = () => {
      setInterval(() => {
        // Update real-time metrics with small random changes
        realtimeData.value.activeUsers += Math.floor(Math.random() * 20 - 10)
        realtimeData.value.pageViews += Math.floor(Math.random() * 50)
        realtimeData.value.conversionRate += (Math.random() - 0.5) * 0.2
        realtimeData.value.cartAbandonment += (Math.random() - 0.5) * 1

        // Ensure values stay within reasonable bounds
        realtimeData.value.activeUsers = Math.max(1000, Math.min(2000, realtimeData.value.activeUsers))
        realtimeData.value.conversionRate = Math.max(2, Math.min(5, realtimeData.value.conversionRate))
        realtimeData.value.cartAbandonment = Math.max(15, Math.min(25, realtimeData.value.cartAbandonment))

        // Round values
        realtimeData.value.conversionRate = Math.round(realtimeData.value.conversionRate * 10) / 10
        realtimeData.value.cartAbandonment = Math.round(realtimeData.value.cartAbandonment * 10) / 10

        // Add random activity
        if (Math.random() < 0.3) {
          const activities = [
            { icon: '🛒', text: `New order from ${['California', 'Texas', 'New York', 'Florida'][Math.floor(Math.random() * 4)]} - $${(Math.random() * 200 + 50).toFixed(2)}` },
            { icon: '👤', text: `User signup from ${['London', 'Paris', 'Berlin', 'Madrid'][Math.floor(Math.random() * 4)]}` },
            { icon: '💳', text: `Payment processed - $${(Math.random() * 150 + 25).toFixed(2)}` },
            { icon: '📧', text: `Newsletter signup from ${['Canada', 'Australia', 'Japan', 'Brazil'][Math.floor(Math.random() * 4)]}` }
          ]
          
          const newActivity = {
            id: Date.now(),
            ...activities[Math.floor(Math.random() * activities.length)],
            timestamp: new Date()
          }
          
          recentActivity.value.unshift(newActivity)
          
          if (recentActivity.value.length > 6) {
            recentActivity.value = recentActivity.value.slice(0, 6)
          }
        }
      }, 3000)
    }

    onMounted(async () => {
      loading.value = true
      
      try {
        await refreshData()
        simulateRealtime()
      } catch (error) {
        console.error('Analytics initialization error:', error)
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
      selectedPeriod,
      selectedRevenueType,
      revenueChartTypes,
      revenueChart,
      trafficChart,
      kpiData,
      categoryData,
      topProducts,
      trafficData,
      funnelData,
      cohortData,
      geographicData,
      predictionData,
      realtimeData,
      recentActivity,
      formatNumber,
      formatTime,
      getCategoryColor,
      getTrafficColor,
      updatePeriod,
      refreshData,
      exportReport
    }
  }
}
</script>

<style scoped>
.analytics {
  max-width: 1600px;
  margin: 0 auto;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.analytics-header h1 {
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

.period-selector {
  padding: 10px 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-color);
  font-size: 0.875rem;
}

.key-metrics {
  margin-bottom: 30px;
}

.metric-card {
  padding: 25px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.metric-trend.positive {
  background: rgba(40, 167, 69, 0.1);
  color: var(--success-color);
}

.metric-trend.negative {
  background: rgba(220, 53, 69, 0.1);
  color: var(--danger-color);
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
  margin-bottom: 8px;
}

.metric-label {
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.metric-subtitle {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 20px;
  margin-bottom: 40px;
}

.chart-section.large {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.chart-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 600;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.chart-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.chart-btn.active,
.chart-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.chart-container {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-performance {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-item {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 15px;
  align-items: center;
}

.category-name {
  font-weight: 600;
  color: var(--text-color);
}

.category-revenue {
  color: var(--success-color);
  font-weight: 600;
  font-size: 0.9rem;
}

.category-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
}

.category-percentage {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.9rem;
  min-width: 40px;
  text-align: right;
}

.funnel-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 0;
}

.funnel-stage {
  height: 60px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin: 0 auto;
  transition: width 0.8s ease;
  min-width: 200px;
}

.stage-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: white;
}

.stage-name {
  font-weight: 600;
}

.stage-value {
  font-weight: 700;
}

.stage-percentage {
  font-size: 0.9rem;
}

.top-products {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 15px;
  align-items: center;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
}

.product-rank {
  width: 30px;
  height: 30px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.product-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
}

.product-metrics {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
}

.product-sales {
  color: var(--text-muted);
}

.product-revenue {
  color: var(--success-color);
  font-weight: 600;
}

.product-bar {
  width: 60px;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.product-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 3px;
  transition: width 0.8s ease;
}

.traffic-sources {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 25px;
  align-items: center;
}

.pie-chart {
  display: flex;
  justify-content: center;
}

.traffic-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.legend-label {
  color: var(--text-color);
  font-weight: 500;
}

.legend-value {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
}

.realtime-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--success-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.realtime-dot {
  width: 8px;
  height: 8px;
  background: var(--success-color);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.realtime-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.realtime-metric {
  text-align: center;
  padding: 20px;
  background: var(--bg-color);
  border-radius: 8px;
}

.realtime-metric .metric-label {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.realtime-metric .metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-color);
}

.realtime-metric .metric-value.animated {
  transition: all 0.5s ease;
}

.activity-stream h4 {
  color: var(--text-color);
  margin: 0 0 15px 0;
  font-size: 1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-color);
  border-radius: 8px;
  font-size: 0.85rem;
}

.activity-icon {
  font-size: 1.2rem;
  width: 32px;
  text-align: center;
}

.activity-text {
  flex: 1;
  color: var(--text-color);
}

.activity-time {
  color: var(--text-muted);
  font-size: 0.75rem;
  white-space: nowrap;
}

.advanced-analytics {
  margin-top: 40px;
}

.advanced-analytics h2 {
  color: var(--text-color);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 25px 0;
}

.insights-grid {
  gap: 25px;
}

.insight-card {
  padding: 25px;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.insight-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.125rem;
}

.insight-metric {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.cohort-heatmap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cohort-row {
  display: grid;
  grid-template-columns: auto repeat(7, 1fr);
  gap: 4px;
  align-items: center;
}

.cohort-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
  width: 60px;
}

.cohort-cell {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.geographic-data {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.geo-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 15px;
  align-items: center;
}

.geo-region {
  font-weight: 600;
  color: var(--text-color);
}

.geo-revenue {
  color: var(--success-color);
  font-weight: 600;
  font-size: 0.9rem;
}

.geo-bar {
  width: 100px;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.geo-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 4px;
  transition: width 0.8s ease;
}

.prediction-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.prediction-bar {
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  background: var(--border-color);
}

.prediction-actual {
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.prediction-forecast {
  background: var(--warning-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.prediction-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prediction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prediction-label {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.prediction-value {
  color: var(--text-color);
  font-weight: 600;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .analytics-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-section.large {
    grid-column: 1;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .realtime-metrics {
    grid-template-columns: 1fr;
  }

  .traffic-sources {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .cohort-row {
    grid-template-columns: auto repeat(4, 1fr);
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>