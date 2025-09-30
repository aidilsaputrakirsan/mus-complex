import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

// Views
import Dashboard from './views/Dashboard.vue'
import Products from './views/Products.vue'
import Orders from './views/Orders.vue'
import Customers from './views/Customers.vue'
import Analytics from './views/Analytics.vue'
import Inventory from './views/Inventory.vue'
import Settings from './views/Settings.vue'

const routes = [
  { 
    path: '/', 
    redirect: '/dashboard' 
  },
  { 
    path: '/dashboard', 
    component: Dashboard, 
    name: 'Dashboard',
    meta: { title: 'Dasbor' }
  },
  { 
    path: '/products', 
    component: Products, 
    name: 'Products',
    meta: { title: 'Manajemen Produk' }
  },
  { 
    path: '/orders', 
    component: Orders, 
    name: 'Orders',
    meta: { title: 'Manajemen Pesanan' }
  },
  { 
    path: '/customers', 
    component: Customers, 
    name: 'Customers',
    meta: { title: 'Database Pelanggan' }
  },
  { 
    path: '/analytics', 
    component: Analytics, 
    name: 'Analytics',
    meta: { title: 'Analitik & Laporan' }
  },
  { 
    path: '/inventory', 
    component: Inventory, 
    name: 'Inventory',
    meta: { title: 'Manajemen Inventori' }
  },
  { 
    path: '/settings', 
    component: Settings, 
    name: 'Settings',
    meta: { title: 'Pengaturan Sistem' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard for performance tracking
router.beforeEach((to, from, next) => {
  // Track route change performance
  const startTime = performance.now()
  
  // Update document title
  document.title = to.meta.title ? `${to.meta.title} - TokoAdmin Pro` : 'TokoAdmin Pro'
  
  // Store navigation timing
  sessionStorage.setItem('lastNavigationTime', startTime.toString())
  
  next()
})

router.afterEach(() => {
  // Calculate navigation time
  const startTime = parseFloat(sessionStorage.getItem('lastNavigationTime') || '0')
  const endTime = performance.now()
  const navigationTime = endTime - startTime
  
  console.log(`Navigation completed in ${navigationTime.toFixed(2)}ms`)
})

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
}

// Performance observer for monitoring
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime)
      }
    })
  })
  
  observer.observe({ entryTypes: ['largest-contentful-paint'] })
}

app.mount('#app')