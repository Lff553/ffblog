/**
 * 最简单的权限检测工具
 * 基于域名/IP判断是否是本地访问
 */
import { ref, onMounted } from 'vue'

// 检查是否是本地访问
export function isLocalAccess(): boolean {
  const hostname = window.location.hostname
  
  // 本地开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('🔧 检测到本地开发环境')
    return true
  }
  return false
}

// 检查是否有管理权限
export function canEdit(): boolean {
  return isLocalAccess()
}

// 获取当前访问类型
export function getAccessType(): 'local' | 'remote' {
  return isLocalAccess() ? 'local' : 'remote'
}

// 权限守卫
export function requireLocal<T extends (...args: any[]) => any>(
  fn: T,
  fallback?: () => void
): (...args: Parameters<T>) => ReturnType<T> | void {
  return (...args: Parameters<T>) => {
    if (isLocalAccess()) {
      return fn(...args)
    } else {
      if (fallback) {
        fallback()
      } else {
        console.warn('无权限执行此操作')
      }
    }
  }
}

export function usePermission() {
  const isAdmin = ref(false)
  const isLoading = ref(true)
  const hostname = ref('')
  
  const checkPermission = () => {
    hostname.value = window.location.hostname
    
    isAdmin.value = 
      hostname.value === 'localhost' ||
      hostname.value === '127.0.0.1'
    isLoading.value = false
    
    console.log('🔍 权限检查结果:', {
      hostname: hostname.value,
      isAdmin: isAdmin.value,
      userAgent: navigator.userAgent
    })
  }
  
  onMounted(() => {
    checkPermission()
  })
  
  return {
    isAdmin,
    isLoading,
    hostname,
    checkPermission
  }
}