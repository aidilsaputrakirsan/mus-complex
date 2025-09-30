<template>
  <div id="app" :class="{ 'dark-theme': appStore.theme === 'dark' }">
    <!-- Loading Overlay -->
    <div v-if="appStore.loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="main-wrapper" :class="{ 'collapsed': appStore.sidebarCollapsed }">
      <!-- Top Navigation -->
      <TopNav />
      
      <!-- Page Content -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Notifications -->
    <NotificationContainer />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useAppStore } from './stores'
import Sidebar from './components/Sidebar.vue'
import TopNav from './components/TopNav.vue'
import NotificationContainer from './components/NotificationContainer.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    TopNav,
    NotificationContainer
  },
  setup() {
    const appStore = useAppStore()

    onMounted(() => {
      // Hide initial loading screen
      setTimeout(() => {
        const loadingContainer = document.querySelector('.loading-container')
        if (loadingContainer) {
          loadingContainer.style.display = 'none'
        }
      }, 1000)

      // Performance monitoring
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`)
          })
        })
        
        observer.observe({ entryTypes: ['measure', 'navigation'] })
      }
    })

    return {
      appStore
    }
  }
}
</script>

<style>
#app {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* CSS Variables for theming */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;
  
  --bg-color: #f8f9fc;
  --surface-color: #ffffff;
  --text-color: #333333;
  --text-muted: #6c757d;
  --border-color: #e3e6f0;
  
  --sidebar-width: 250px;
  --topnav-height: 70px;
  
  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);
}

.dark-theme {
  --bg-color: #1a202c;
  --surface-color: #2d3748;
  --text-color: #f7fafc;
  --text-muted: #a0aec0;
  --border-color: #4a5568;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.main-wrapper {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.main-wrapper.collapsed {
  margin-left: 70px;
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-top: var(--topnav-height);
  background-color: var(--bg-color);
  min-height: calc(100vh - var(--topnav-height));
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
  }
  
  .main-wrapper.collapsed {
    margin-left: 0;
  }
  
  .main-content {
    padding: 15px;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-color);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Utility classes */
.card {
  background: var(--surface-color);
  border-radius: 10px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.grid {
  display: grid;
  gap: 20px;
}

.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}
</style>