<template>
  <teleport to="body">
    <div class="notification-container">
      <transition-group name="notification" tag="div">
        <div
          v-for="notification in appStore.notifications"
          :key="notification.id"
          class="notification-toast"
          :class="notification.type"
        >
          <div class="notification-icon">
            <span v-if="notification.type === 'success'">✅</span>
            <span v-else-if="notification.type === 'error'">❌</span>
            <span v-else-if="notification.type === 'warning'">⚠️</span>
            <span v-else>ℹ️</span>
          </div>
          
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div v-if="notification.message" class="notification-message">
              {{ notification.message }}
            </div>
          </div>
          
          <button 
            @click="appStore.removeNotification(notification.id)"
            class="notification-close"
          >
            ✕
          </button>
          
          <div 
            class="notification-progress"
            :style="{ animationDuration: '5s' }"
          ></div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script>
import { useAppStore } from '../stores'

export default {
  name: 'NotificationContainer',
  setup() {
    const appStore = useAppStore()

    return {
      appStore
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 90px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--surface-color);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  min-width: 300px;
  max-width: 400px;
  position: relative;
  overflow: hidden;
}

.notification-toast.success {
  border-left: 4px solid var(--success-color);
}

.notification-toast.error {
  border-left: 4px solid var(--danger-color);
}

.notification-toast.warning {
  border-left: 4px solid var(--warning-color);
}

.notification-toast.info {
  border-left: 4px solid var(--info-color);
}

.notification-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
  font-size: 0.875rem;
}

.notification-message {
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 1rem;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: var(--border-color);
  color: var(--text-color);
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  width: 100%;
  animation: progress 5s linear forwards;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Transition animations */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .notification-container {
    right: 10px;
    left: 10px;
  }
  
  .notification-toast {
    min-width: auto;
    max-width: none;
  }
}
</style>