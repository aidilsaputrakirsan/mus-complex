<template>
  <div class="settings">
    <!-- Header -->
    <div class="settings-header">
      <h1>System Settings</h1>
      <div class="header-actions">
        <button @click="resetToDefaults" class="btn btn-warning">
          🔄 Reset to Defaults
        </button>
        <button @click="exportSettings" class="btn btn-success">
          📤 Export Settings
        </button>
        <button @click="saveAllSettings" class="btn btn-primary" :disabled="!hasChanges">
          💾 Save All Changes
        </button>
      </div>
    </div>

    <!-- Settings Navigation -->
    <div class="settings-nav card">
      <div class="nav-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="nav-tab"
          :class="{ active: activeTab === tab.id }"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- General Settings -->
    <div v-if="activeTab === 'general'" class="settings-section">
      <div class="settings-grid">
        <div class="settings-group card">
          <h3>🏢 Company Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Company Name</label>
              <input 
                type="text" 
                v-model="settings.general.companyName" 
                class="form-input"
                @input="markChanged"
              >
            </div>
            
            <div class="form-group">
              <label>Contact Email</label>
              <input 
                type="email" 
                v-model="settings.general.contactEmail" 
                class="form-input"
                @input="markChanged"
              >
            </div>
            
            <div class="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                v-model="settings.general.phone" 
                class="form-input"
                @input="markChanged"
              >
            </div>
            
            <div class="form-group">
              <label>Time Zone</label>
              <select v-model="settings.general.timezone" class="form-input" @change="markChanged">
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Asia/Jakarta">Jakarta Time</option>
              </select>
            </div>
            
            <div class="form-group full-width">
              <label>Company Address</label>
              <textarea 
                v-model="settings.general.address" 
                class="form-input" 
                rows="3"
                @input="markChanged"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="settings-group card">
          <h3>🎨 Appearance</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Theme</label>
              <div class="theme-selector">
                <label class="theme-option">
                  <input 
                    type="radio" 
                    value="light" 
                    v-model="settings.general.theme"
                    @change="markChanged"
                  >
                  <span class="theme-preview light">
                    <span class="theme-name">Light</span>
                  </span>
                </label>
                <label class="theme-option">
                  <input 
                    type="radio" 
                    value="dark" 
                    v-model="settings.general.theme"
                    @change="markChanged"
                  >
                  <span class="theme-preview dark">
                    <span class="theme-name">Dark</span>
                  </span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label>Language</label>
              <select v-model="settings.general.language" class="form-input" @change="markChanged">
                <option value="en">English</option>
                <option value="id">Bahasa Indonesia</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Currency</label>
              <select v-model="settings.general.currency" class="form-input" @change="markChanged">
                <option value="USD">USD ($)</option>
                <option value="IDR">IDR (Rp)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Date Format</label>
              <select v-model="settings.general.dateFormat" class="form-input" @change="markChanged">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Settings -->
    <div v-if="activeTab === 'notifications'" class="settings-section">
      <div class="settings-grid">
        <div class="settings-group card">
          <h3>📧 Email Notifications</h3>
          <div class="notification-settings">
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-title">Order Notifications</div>
                <div class="notification-desc">Get notified when new orders are placed</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.notifications.orders"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-title">Low Stock Alerts</div>
                <div class="notification-desc">Get alerted when inventory is running low</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.notifications.lowStock"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-title">Customer Updates</div>
                <div class="notification-desc">Notifications about new customers and updates</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.notifications.customers"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-title">System Updates</div>
                <div class="notification-desc">Important system maintenance and updates</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.notifications.system"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="settings-group card">
          <h3>🔔 Push Notifications</h3>
          <div class="notification-settings">
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-title">Browser Notifications</div>
                <div class="notification-desc">Show notifications in your browser</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.notifications.browser"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-title">Sound Alerts</div>
                <div class="notification-desc">Play sound when notifications arrive</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.notifications.sound"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="notification-frequency">
              <label>Notification Frequency</label>
              <select v-model="settings.notifications.frequency" class="form-input" @change="markChanged">
                <option value="instant">Instant</option>
                <option value="hourly">Hourly Summary</option>
                <option value="daily">Daily Summary</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Security Settings -->
    <div v-if="activeTab === 'security'" class="settings-section">
      <div class="settings-grid">
        <div class="settings-group card">
          <h3>🔐 Authentication</h3>
          <div class="security-settings">
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">Two-Factor Authentication</div>
                <div class="security-desc">Add an extra layer of security to your account</div>
              </div>
              <button class="btn btn-primary">Enable 2FA</button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">Password Requirements</div>
                <div class="security-desc">Set minimum password complexity requirements</div>
              </div>
              <button class="btn btn-secondary">Configure</button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">Session Timeout</div>
                <div class="security-desc">Automatically log out inactive users</div>
              </div>
              <select v-model="settings.security.sessionTimeout" class="form-input" @change="markChanged">
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
                <option value="480">8 hours</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-group card">
          <h3>📋 Audit & Logs</h3>
          <div class="audit-settings">
            <div class="audit-item">
              <div class="audit-info">
                <div class="audit-title">Login Attempts</div>
                <div class="audit-desc">Track and log all login attempts</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.security.logLogins"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="audit-item">
              <div class="audit-info">
                <div class="audit-title">Data Changes</div>
                <div class="audit-desc">Log all data modifications and deletions</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.security.logChanges"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="audit-item">
              <div class="audit-info">
                <div class="audit-title">Log Retention</div>
                <div class="audit-desc">How long to keep audit logs</div>
              </div>
              <select v-model="settings.security.logRetention" class="form-input" @change="markChanged">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
                <option value="365">1 year</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Settings -->
    <div v-if="activeTab === 'performance'" class="settings-section">
      <div class="settings-grid">
        <div class="settings-group card">
          <h3>⚡ Performance Optimization</h3>
          <div class="performance-settings">
            <div class="performance-item">
              <label>Items per Page</label>
              <select v-model="settings.performance.itemsPerPage" class="form-input" @change="markChanged">
                <option value="10">10 items</option>
                <option value="25">25 items</option>
                <option value="50">50 items</option>
                <option value="100">100 items</option>
              </select>
            </div>
            
            <div class="performance-item">
              <label>Auto-refresh Interval</label>
              <select v-model="settings.performance.autoRefresh" class="form-input" @change="markChanged">
                <option value="0">Disabled</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
                <option value="600">10 minutes</option>
              </select>
            </div>
            
            <div class="performance-toggle">
              <div class="toggle-info">
                <div class="toggle-title">Enable Animations</div>
                <div class="toggle-desc">Show smooth transitions and animations</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.performance.animations"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="performance-toggle">
              <div class="toggle-info">
                <div class="toggle-title">Lazy Loading</div>
                <div class="toggle-desc">Load images and content only when needed</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.performance.lazyLoading"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="settings-group card">
          <h3>📊 System Monitoring</h3>
          <div class="monitoring-settings">
            <div class="monitor-item">
              <div class="monitor-label">CPU Usage Threshold</div>
              <div class="slider-container">
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  v-model="settings.performance.cpuThreshold"
                  class="range-slider"
                  @input="markChanged"
                >
                <span class="slider-value">{{ settings.performance.cpuThreshold }}%</span>
              </div>
            </div>
            
            <div class="monitor-item">
              <div class="monitor-label">Memory Usage Threshold</div>
              <div class="slider-container">
                <input 
                  type="range" 
                  min="60" 
                  max="95" 
                  v-model="settings.performance.memoryThreshold"
                  class="range-slider"
                  @input="markChanged"
                >
                <span class="slider-value">{{ settings.performance.memoryThreshold }}%</span>
              </div>
            </div>
            
            <div class="performance-toggle">
              <div class="toggle-info">
                <div class="toggle-title">Performance Monitoring</div>
                <div class="toggle-desc">Track system performance metrics</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.performance.monitoring"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- API Settings -->
    <div v-if="activeTab === 'api'" class="settings-section">
      <div class="settings-grid">
        <div class="settings-group card">
          <h3>🔑 API Configuration</h3>
          <div class="api-settings">
            <div class="api-item">
              <label>API Rate Limit (requests per minute)</label>
              <input 
                type="number" 
                v-model="settings.api.rateLimit" 
                class="form-input"
                min="10"
                max="1000"
                @input="markChanged"
              >
            </div>
            
            <div class="api-item">
              <label>API Version</label>
              <select v-model="settings.api.version" class="form-input" @change="markChanged">
                <option value="v1">Version 1.0</option>
                <option value="v2">Version 2.0</option>
                <option value="v3">Version 3.0 (Beta)</option>
              </select>
            </div>
            
            <div class="api-toggle">
              <div class="toggle-info">
                <div class="toggle-title">API Logging</div>
                <div class="toggle-desc">Log all API requests and responses</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.api.logging"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="api-toggle">
              <div class="toggle-info">
                <div class="toggle-title">CORS Enabled</div>
                <div class="toggle-desc">Allow cross-origin requests</div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="settings.api.cors"
                  @change="markChanged"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="settings-group card">
          <h3>🔐 API Keys</h3>
          <div class="api-keys">
            <div class="api-key-item">
              <div class="key-info">
                <div class="key-name">Production API Key</div>
                <div class="key-value">sk_prod_••••••••••••••••••••••••</div>
              </div>
              <div class="key-actions">
                <button class="btn btn-sm btn-secondary">Copy</button>
                <button class="btn btn-sm btn-warning">Regenerate</button>
              </div>
            </div>
            
            <div class="api-key-item">
              <div class="key-info">
                <div class="key-name">Development API Key</div>
                <div class="key-value">sk_dev_••••••••••••••••••••••••</div>
              </div>
              <div class="key-actions">
                <button class="btn btn-sm btn-secondary">Copy</button>
                <button class="btn btn-sm btn-warning">Regenerate</button>
              </div>
            </div>
            
            <button class="btn btn-primary">Generate New Key</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Changes Summary -->
    <div v-if="hasChanges" class="changes-summary">
      <div class="summary-content">
        <span class="summary-icon">⚠️</span>
        <span class="summary-text">You have unsaved changes</span>
        <div class="summary-actions">
          <button @click="discardChanges" class="btn btn-sm btn-secondary">Discard</button>
          <button @click="saveAllSettings" class="btn btn-sm btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores'

export default {
  name: 'Settings',
  setup() {
    const appStore = useAppStore()
    
    const activeTab = ref('general')
    const hasChanges = ref(false)
    const originalSettings = ref(null)
    
    const tabs = [
      { id: 'general', label: 'General', icon: '⚙️' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
      { id: 'security', label: 'Security', icon: '🔐' },
      { id: 'performance', label: 'Performance', icon: '⚡' },
      { id: 'api', label: 'API', icon: '🔑' }
    ]

    const settings = ref({
      general: {
        companyName: 'ShopAdmin Pro',
        contactEmail: 'admin@shopadmin.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business St, Suite 100\nTech City, TC 12345',
        timezone: 'America/New_York',
        theme: 'light',
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY'
      },
      notifications: {
        orders: true,
        lowStock: true,
        customers: true,
        system: true,
        browser: false,
        sound: true,
        frequency: 'instant'
      },
      security: {
        sessionTimeout: 60,
        logLogins: true,
        logChanges: true,
        logRetention: 90
      },
      performance: {
        itemsPerPage: 25,
        autoRefresh: 300,
        animations: true,
        lazyLoading: true,
        cpuThreshold: 80,
        memoryThreshold: 85,
        monitoring: true
      },
      api: {
        rateLimit: 100,
        version: 'v2',
        logging: true,
        cors: true
      }
    })

    const markChanged = () => {
      hasChanges.value = true
    }

    const saveAllSettings = () => {
      // Simulate saving settings
      originalSettings.value = JSON.parse(JSON.stringify(settings.value))
      hasChanges.value = false
      
      // Apply theme change
      if (settings.value.general.theme !== appStore.theme) {
        appStore.theme = settings.value.general.theme
      }
      
      appStore.addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'All settings have been saved successfully'
      })
    }

    const discardChanges = () => {
      if (originalSettings.value) {
        settings.value = JSON.parse(JSON.stringify(originalSettings.value))
        hasChanges.value = false
        
        appStore.addNotification({
          type: 'info',
          title: 'Changes Discarded',
          message: 'All unsaved changes have been discarded'
        })
      }
    }

    const resetToDefaults = () => {
      if (confirm('Are you sure you want to reset all settings to their default values?')) {
        settings.value = {
          general: {
            companyName: 'ShopAdmin Pro',
            contactEmail: 'admin@shopadmin.com',
            phone: '+1 (555) 123-4567',
            address: '123 Business St, Suite 100\nTech City, TC 12345',
            timezone: 'America/New_York',
            theme: 'light',
            language: 'en',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY'
          },
          notifications: {
            orders: true,
            lowStock: true,
            customers: true,
            system: true,
            browser: false,
            sound: true,
            frequency: 'instant'
          },
          security: {
            sessionTimeout: 60,
            logLogins: true,
            logChanges: true,
            logRetention: 90
          },
          performance: {
            itemsPerPage: 25,
            autoRefresh: 300,
            animations: true,
            lazyLoading: true,
            cpuThreshold: 80,
            memoryThreshold: 85,
            monitoring: true
          },
          api: {
            rateLimit: 100,
            version: 'v2',
            logging: true,
            cors: true
          }
        }
        
        markChanged()
        
        appStore.addNotification({
          type: 'warning',
          title: 'Settings Reset',
          message: 'All settings have been reset to default values. Click Save to apply changes.'
        })
      }
    }

    const exportSettings = () => {
      const settingsData = JSON.stringify(settings.value, null, 2)
      const blob = new Blob([settingsData], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `settings_backup_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      appStore.addNotification({
        type: 'success',
        title: 'Settings Exported',
        message: 'Settings have been exported to a JSON file'
      })
    }

    onMounted(() => {
      // Store original settings for comparison
      originalSettings.value = JSON.parse(JSON.stringify(settings.value))
    })

    return {
      activeTab,
      hasChanges,
      tabs,
      settings,
      markChanged,
      saveAllSettings,
      discardChanges,
      resetToDefaults,
      exportSettings
    }
  }
}
</script>

<style scoped>
.settings {
  max-width: 1400px;
  margin: 0 auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.settings-header h1 {
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.settings-nav {
  margin-bottom: 30px;
  padding: 20px;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.nav-tab:hover {
  background: var(--border-color);
}

.nav-tab.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.tab-icon {
  font-size: 1.125rem;
}

.settings-section {
  margin-bottom: 30px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 25px;
}

.settings-group {
  padding: 25px;
}

.settings-group h3 {
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
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

.theme-selector {
  display: flex;
  gap: 15px;
}

.theme-option {
  cursor: pointer;
}

.theme-option input {
  display: none;
}

.theme-preview {
  display: block;
  width: 120px;
  height: 80px;
  border: 3px solid var(--border-color);
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.theme-preview.light {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #333;
}

.theme-preview.dark {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: #f7fafc;
}

.theme-option input:checked + .theme-preview {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.theme-name {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.notification-settings,
.security-settings,
.audit-settings,
.performance-settings,
.api-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notification-item,
.security-item,
.audit-item,
.performance-toggle,
.api-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.notification-info,
.security-info,
.audit-info,
.toggle-info {
  flex: 1;
}

.notification-title,
.security-title,
.audit-title,
.toggle-title {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
}

.notification-desc,
.security-desc,
.audit-desc,
.toggle-desc {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  margin-left: 15px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: 0.3s;
  border-radius: 28px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.notification-frequency {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-frequency label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.performance-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.performance-item label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.monitoring-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.monitor-item {
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.monitor-label {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 10px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.range-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--border-color);
  outline: none;
  -webkit-appearance: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
}

.range-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
}

.slider-value {
  font-weight: 600;
  color: var(--primary-color);
  min-width: 40px;
}

.api-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.api-item label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.api-keys {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.api-key-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.key-info {
  flex: 1;
}

.key-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
}

.key-value {
  font-family: monospace;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.key-actions {
  display: flex;
  gap: 8px;
}

.changes-summary {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 25px;
  background: var(--surface-color);
  border: 2px solid var(--warning-color);
  border-radius: 25px;
  box-shadow: var(--shadow-lg);
}

.summary-icon {
  font-size: 1.25rem;
}

.summary-text {
  color: var(--text-color);
  font-weight: 600;
}

.summary-actions {
  display: flex;
  gap: 10px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .settings-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .nav-tabs {
    flex-direction: column;
  }

  .nav-tab {
    justify-content: center;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .theme-selector {
    justify-content: space-between;
  }

  .theme-preview {
    width: 100px;
    height: 60px;
  }

  .notification-item,
  .security-item,
  .audit-item,
  .performance-toggle,
  .api-toggle {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .toggle-switch {
    margin-left: 0;
    align-self: flex-start;
  }

  .api-key-item {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .changes-summary {
    left: 20px;
    right: 20px;
    transform: none;
  }

  .summary-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>