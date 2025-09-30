<template>
  <aside class="sidebar" :class="{ 'collapsed': appStore.sidebarCollapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">🛍️</span>
        <span v-if="!appStore.sidebarCollapsed" class="logo-text">ShopAdmin Pro</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="item in navigationItems" :key="item.name" class="nav-item">
          <router-link 
            :to="item.path" 
            class="nav-link"
            :class="{ 'active': $route.name === item.name }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span v-if="!appStore.sidebarCollapsed" class="nav-text">{{ item.label }}</span>
            <span 
              v-if="item.badge && !appStore.sidebarCollapsed" 
              class="nav-badge"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info" v-if="!appStore.sidebarCollapsed">
        <div class="user-avatar">👤</div>
        <div class="user-details">
          <div class="user-name">Admin User</div>
          <div class="user-role">Administrator</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { computed } from 'vue'
import { useAppStore, useOrdersStore } from '../stores'

export default {
  name: 'Sidebar',
  setup() {
    const appStore = useAppStore()
    const ordersStore = useOrdersStore()

    const navigationItems = computed(() => [
      {
        name: 'Dashboard',
        path: '/dashboard',
        label: 'Dashboard',
        icon: '📊'
      },
      {
        name: 'Products',
        path: '/products',
        label: 'Products',
        icon: '📦'
      },
      {
        name: 'Orders',
        path: '/orders',
        label: 'Orders',
        icon: '🛒',
        badge: ordersStore.realtimeOrders.length || null
      },
      {
        name: 'Customers',
        path: '/customers',
        label: 'Customers',
        icon: '👥'
      },
      {
        name: 'Analytics',
        path: '/analytics',
        label: 'Analytics',
        icon: '📈'
      },
      {
        name: 'Inventory',
        path: '/inventory',
        label: 'Inventory',
        icon: '📋'
      },
      {
        name: 'Settings',
        path: '/settings',
        label: 'Settings',
        icon: '⚙️'
      }
    ])

    return {
      appStore,
      navigationItems
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background: var(--surface-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 1000;
  box-shadow: var(--shadow);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 2rem;
  min-width: 30px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-bottom: 5px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 0 25px 25px 0;
  margin-right: 10px;
}

.nav-link:hover {
  background: linear-gradient(90deg, var(--primary-color) 0%, transparent 100%);
  color: white;
  transform: translateX(5px);
}

.nav-link.active {
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.nav-icon {
  font-size: 1.25rem;
  min-width: 24px;
  text-align: center;
}

.nav-text {
  margin-left: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.nav-badge {
  margin-left: auto;
  background: var(--danger-color);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.collapsed {
    width: var(--sidebar-width);
    transform: translateX(-100%);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
}

/* Animation for collapsing */
.sidebar.collapsed .nav-text,
.sidebar.collapsed .nav-badge,
.sidebar.collapsed .logo-text,
.sidebar.collapsed .user-info {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sidebar:not(.collapsed) .nav-text,
.sidebar:not(.collapsed) .nav-badge,
.sidebar:not(.collapsed) .logo-text,
.sidebar:not(.collapsed) .user-info {
  opacity: 1;
  transition: opacity 0.3s ease 0.1s;
}
</style>