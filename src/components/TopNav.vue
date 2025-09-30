<template>
  <header class="topnav">
    <div class="topnav-left">
      <button 
        class="sidebar-toggle"
        @click="appStore.toggleSidebar"
      >
        <span class="hamburger"></span>
      </button>

      <div class="breadcrumb">
        <span class="breadcrumb-item">{{ currentPageTitle }}</span>
      </div>
    </div>

    <div class="topnav-center">
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Cari produk, pesanan, pelanggan..." 
          v-model="searchQuery"
          @input="onSearch"
          class="search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <div class="topnav-right">
      <!-- Performance Indicator -->
      <div class="performance-indicator" :class="performanceStatus">
        <span class="perf-icon">⚡</span>
        <span class="perf-text">{{ performanceText }}</span>
      </div>

      <!-- Notifications -->
      <div class="notification-dropdown">
        <button class="notification-btn" @click="toggleNotifications">
          <span class="notification-icon">🔔</span>
          <span v-if="appStore.notifications.length" class="notification-badge">
            {{ appStore.notifications.length }}
          </span>
        </button>
        
        <div v-if="showNotifications" class="notification-panel">
          <div class="notification-header">
            <h4>Notifikasi</h4>
            <button @click="clearAllNotifications" class="clear-btn">Bersihkan Semua</button>
          </div>
          <div class="notification-list">
            <div 
              v-for="notification in appStore.notifications" 
              :key="notification.id"
              class="notification-item"
              :class="notification.type"
            >
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
              </div>
              <button 
                @click="appStore.removeNotification(notification.id)"
                class="notification-close"
              >
                ✕
              </button>
            </div>
            <div v-if="!appStore.notifications.length" class="no-notifications">
              Tidak ada notifikasi baru
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Toggle -->
      <button 
        class="theme-toggle"
        @click="appStore.toggleTheme"
        :title="appStore.theme === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang'"
      >
        <span v-if="appStore.theme === 'light'">🌙</span>
        <span v-else>☀️</span>
      </button>

      <!-- User Menu -->
      <div class="user-menu">
        <button class="user-btn" @click="toggleUserMenu">
          <div class="user-avatar">👤</div>
          <span class="user-name">Admin</span>
          <span class="dropdown-arrow">▼</span>
        </button>
        
        <div v-if="showUserMenu" class="user-dropdown">
          <a href="#" class="dropdown-item">Profil</a>
          <a href="#" class="dropdown-item">Pengaturan</a>
          <hr class="dropdown-divider">
          <a href="#" class="dropdown-item">Keluar</a>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores'

export default {
  name: 'TopNav',
  setup() {
    const route = useRoute()
    const appStore = useAppStore()
    
    const searchQuery = ref('')
    const showNotifications = ref(false)
    const showUserMenu = ref(false)
    const performanceMetrics = ref({
      fps: 60,
      memory: 0,
      loadTime: 0
    })

    const currentPageTitle = computed(() => {
      return route.meta.title || route.name || 'Dashboard'
    })

    const performanceStatus = computed(() => {
      const fps = performanceMetrics.value.fps
      if (fps >= 55) return 'good'
      if (fps >= 30) return 'fair'
      return 'poor'
    })

    const performanceText = computed(() => {
      const fps = performanceMetrics.value.fps
      return `${Math.round(fps)} FPS`
    })

    const onSearch = () => {
      // Debounced search functionality
      clearTimeout(onSearch.timeout)
      onSearch.timeout = setTimeout(() => {
        if (searchQuery.value.length >= 2) {
          console.log('Searching for:', searchQuery.value)
          // Implement search logic here
        }
      }, 300)
    }

    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
      showUserMenu.value = false
    }

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
      showNotifications.value = false
    }

    const clearAllNotifications = () => {
      appStore.notifications.splice(0)
      showNotifications.value = false
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

    // Performance monitoring
    let frameCount = 0
    let lastTime = performance.now()
    
    const measurePerformance = () => {
      const now = performance.now()
      frameCount++
      
      if (now - lastTime >= 1000) {
        performanceMetrics.value.fps = (frameCount * 1000) / (now - lastTime)
        frameCount = 0
        lastTime = now
      }
      
      // Memory usage (if available)
      if (performance.memory) {
        performanceMetrics.value.memory = performance.memory.usedJSHeapSize / 1048576 // MB
      }
      
      requestAnimationFrame(measurePerformance)
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        showNotifications.value = false
      }
      if (!event.target.closest('.user-menu')) {
        showUserMenu.value = false
      }
    }

    onMounted(() => {
      requestAnimationFrame(measurePerformance)
      document.addEventListener('click', handleClickOutside)
      
      // Add some sample notifications
      setTimeout(() => {
        appStore.addNotification({
          type: 'info',
          title: 'Pesanan Baru',
          message: 'Pesanan #PES-123 telah diterima'
        })
      }, 2000)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      appStore,
      searchQuery,
      showNotifications,
      showUserMenu,
      currentPageTitle,
      performanceStatus,
      performanceText,
      onSearch,
      toggleNotifications,
      toggleUserMenu,
      clearAllNotifications,
      formatTime
    }
  }
}
</script>

<style scoped>
.topnav {
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  height: var(--topnav-height);
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 999;
  box-shadow: var(--shadow-sm);
  transition: left 0.3s ease;
}

.topnav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sidebar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.sidebar-toggle:hover {
  background: var(--border-color);
}

.hamburger {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--text-color);
  position: relative;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 2px;
  background: var(--text-color);
  transition: all 0.3s ease;
}

.hamburger::before {
  top: -6px;
}

.hamburger::after {
  bottom: -6px;
}

.breadcrumb-item {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.topnav-center {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0 20px;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.topnav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.performance-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.performance-indicator.good {
  background: rgba(40, 167, 69, 0.1);
  color: var(--success-color);
}

.performance-indicator.fair {
  background: rgba(255, 193, 7, 0.1);
  color: var(--warning-color);
}

.performance-indicator.poor {
  background: rgba(220, 53, 69, 0.1);
  color: var(--danger-color);
}

.notification-dropdown,
.user-menu {
  position: relative;
}

.notification-btn,
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  position: relative;
  color: var(--text-color);
}

.notification-btn:hover,
.theme-toggle:hover {
  background: var(--border-color);
}

.notification-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: var(--danger-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  margin-top: 5px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.notification-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.875rem;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.notification-item:hover {
  background: var(--bg-color);
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-color);
}

.notification-message {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-notifications {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  color: var(--text-color);
}

.user-btn:hover {
  background: var(--border-color);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.user-name {
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  margin-top: 5px;
  min-width: 150px;
}

.dropdown-item {
  display: block;
  padding: 12px 16px;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background: var(--bg-color);
}

.dropdown-divider {
  margin: 0;
  border: none;
  border-top: 1px solid var(--border-color);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .topnav {
    left: 0;
    padding: 0 15px;
  }
  
  .topnav-center {
    margin: 0 10px;
  }
  
  .search-box {
    max-width: 200px;
  }
  
  .user-name {
    display: none;
  }
  
  .performance-indicator {
    display: none;
  }
}
</style>