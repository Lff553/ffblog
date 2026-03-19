import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isLocalAccess } from '../utils/permission'

// 文章接口
export interface Post {
  id: number// 文章ID
  title: string// 文章标题
  content: string// 文章内容
  excerpt: string// 文章摘要
  date: string// 文章日期
  tags: string[]// 文章标签
  author: string// 文章作者
  views: number// 文章阅读量
  likes: number// 文章点赞量
  coverImage?: string// 文章封面图片
  category?: string// 文章分类
  createdAt: string// 文章创建时间
}

export const useBlogStore = defineStore('blog', () => {
  // 状态
  const posts = ref<Post[]>([
    {
      id: 1,
      title: '欢迎来到我的博客',
      content: '# 欢迎\n\n这是我的第一篇博客文章，欢迎阅读！',
      excerpt: '这是我的第一篇博客文章，介绍了博客的基本情况',
      date: '2024-01-01',
      tags: ['欢迎', '博客'],
      author: '管理员',
      views: 156,
      likes: 12,
      coverImage: 'https://picsum.photos/600/300?random=1',
      category: '公告',
      createdAt: '2024-01-01T10:00:00'
    },
    {
      id: 2,
      title: 'Vue 3 入门指南',
      content: '# Vue 3 入门\n\nVue 3 是一个非常优秀的前端框架...',
      excerpt: '本文介绍Vue 3的基本用法和核心概念',
      date: '2024-01-02',
      tags: ['Vue', '前端', '教程'],
      author: '管理员',
      views: 234,
      likes: 45,
      coverImage: 'https://picsum.photos/600/300?random=2',
      category: '前端',
      createdAt: '2024-01-02T14:30:00'
    },
    {
      id: 3,
      title: 'TypeScript 类型系统详解',
      content: '# TypeScript 类型系统\n\nTypeScript 的类型系统是其最强大的功能之一...',
      excerpt: '深入探讨TypeScript的类型系统',
      date: '2024-01-03',
      tags: ['TypeScript', 'JavaScript'],
      author: '管理员',
      views: 189,
      likes: 28,
      coverImage: 'https://picsum.photos/600/300?random=3',
      category: '前端',
      createdAt: '2024-01-03T09:15:00'
    },
    {
      id: 4,
      title: 'Node.js 性能优化',
      content: '# Node.js 性能优化\n\nNode.js 应用的性能优化技巧...',
      excerpt: 'Node.js应用性能优化的实用技巧',
      date: '2024-01-04',
      tags: ['Node.js', '后端', '性能'],
      author: '管理员',
      views: 145,
      likes: 19,
      coverImage: 'https://picsum.photos/600/300?random=4',
      category: '后端',
      createdAt: '2024-01-04T16:45:00'
    }
  ])
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 获取所有文章的方法
  const getAllPosts = (options?: {
    includeDrafts?: boolean
    filterByCategory?: string
    filterByTag?: string
    searchKeyword?: string
    sortBy?: 'date' | 'views' | 'likes' | 'title'
    sortOrder?: 'asc' | 'desc'
  }): Post[] => {
    let filteredPosts = [...posts.value]
    
    const {
      filterByCategory,
      filterByTag,
      searchKeyword,
      sortBy = 'date',
      sortOrder = 'desc'
    } = options || {}
    
    
    // 2. 按分类过滤
    if (filterByCategory) {
      filteredPosts = filteredPosts.filter(post => 
        post.category?.toLowerCase() === filterByCategory.toLowerCase()
      )
    }
    
    // 3. 按标签过滤
    if (filterByTag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags.some(tag => 
          tag.toLowerCase().includes(filterByTag.toLowerCase())
        )
      )
    }
    
    // 4. 搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.excerpt.toLowerCase().includes(keyword) ||
        post.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
        post.author.toLowerCase().includes(keyword) ||
        post.category?.toLowerCase().includes(keyword)
      )
    }
    
    // 5. 排序
    filteredPosts.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'views':
          aValue = a.views
          bValue = b.views
          break
        case 'likes':
          aValue = a.likes
          bValue = b.likes
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        default:
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    return filteredPosts
  }

  // 获取文章数量
  const getPostCount = (options?: {
    includeDrafts?: boolean
    filterByCategory?: string
    filterByTag?: string
  }): number => {
    return getAllPosts(options).length
  }
  
  // 获取最新的文章
  const getRecentPosts = (limit: number = 5): Post[] => {
    return getAllPosts({ sortBy: 'date', sortOrder: 'desc' }).slice(0, limit)
  }
  
  // 获取热门文章
  const getPopularPosts = (limit: number = 5): Post[] => {
    return getAllPosts({ sortBy: 'views', sortOrder: 'desc' }).slice(0, limit)
  }
  
  // 获取文章的所有分类
  const getAllCategories = (): Array<{ name: string; count: number }> => {
    const categories: Record<string, number> = {}
    
    getAllPosts().forEach(post => {
      if (post.category) {
        categories[post.category] = (categories[post.category] || 0) + 1
      }
    })
    
    return Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }
  
  //  获取所有标签
  const getAllTags = (): Array<{ name: string; count: number }> => {
    const tags: Record<string, number> = {}
    
    getAllPosts().forEach(post => {
      post.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1
      })
    })
    
    return Object.entries(tags)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }
  
  // 获取文章归档
  const getArchive = (): Array<{ year: number; month: number; count: number }> => {
    const archive: Record<string, number> = {}
    
    getAllPosts().forEach(post => {
      const date = new Date(post.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const key = `${year}-${month.toString().padStart(2, '0')}`
      
      archive[key] = (archive[key] || 0) + 1
    })
    
    return Object.entries(archive)
      .map(([key, count]) => {
        const [year, month] = key.split('-')
        return {
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          count
        }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })
  }
  
  // 按ID获取文章
  const getPostById = (id: number): Post | undefined => {
    return posts.value.find(post => post.id === id)
  }
  
  //  按标签获取文章
  const getPostsByTag = (tag: string): Post[] => {
    return getAllPosts({ filterByTag: tag })
  }
  
  //  按分类获取文章
  const getPostsByCategory = (category: string): Post[] => {
    return getAllPosts({ filterByCategory: category })
  }
  
  // 搜索文章
  const searchPosts = (keyword: string): Post[] => {
    return getAllPosts({ searchKeyword: keyword })
  }
  
  // 创建文章（需要本地权限）
  const createPost = (postData: Omit<Post, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>): Post | null => {
    if (!isLocalAccess()) {
      console.error('无权限创建文章')
      return null
    }
    
    const now = new Date().toISOString()
  const nextId = posts.value.length > 0 ? Math.max(...posts.value.map(post => post.id)) + 1 : 1;
   const newPost: Post = {
  ...postData,
  id: nextId,  // 获取下一个可用ID
  views: 0,
  likes: 0,
  createdAt: now
}
    
    posts.value.unshift(newPost)
    return newPost
  }
  
  // 更新文章（需要本地权限）
  const updatePost = (id: number, updates: Partial<Omit<Post, 'id'>>): boolean => {
    if (!isLocalAccess()) {
      console.error('无权限更新文章')
      return false
    }
    
    const index = posts.value.findIndex(post => post.id === id)
    if (index === -1) {
      return false
    }
    
    posts.value[index] = { 
      ...posts.value[index], 
      ...updates
    }
    return true
  }
  
  //删除文章（需要本地权限）
  const deletePost = (id: number): boolean => {
    if (!isLocalAccess()) {
      console.error('无权限删除文章')
      return false
    }
    
    const initialLength = posts.value.length
    posts.value = posts.value.filter(post => post.id !== id)
    return posts.value.length < initialLength
  }
  
  // 增加阅读量
  const incrementViews = (id: number): void => {
    const post = getPostById(id)
    if (post) {
      post.views++
    }
  }
  
  // 点赞文章
  const likePost = (id: number): void => {
    const post = getPostById(id)
    if (post) {
      post.likes++
    }
  }
  
  // 获取统计信息
  const getStats = () => {
    const allPosts = getAllPosts()
    const publishedPosts = getAllPosts({ includeDrafts: false })

    return {
      total: allPosts.length,
      published: publishedPosts.length,
      totalViews: allPosts.reduce((sum, post) => sum + post.views, 0),
      totalLikes: allPosts.reduce((sum, post) => sum + post.likes, 0),
      categories: getAllCategories().length,
      tags: getAllTags().length
    }
  }
  

  
  return {
    // 状态
    posts,
    isLoading,
    error,
    
    // 主要方法
    getAllPosts,
    getPostCount,
    getRecentPosts,
    getPopularPosts,
    getAllCategories,
    getAllTags,
    getArchive,
    
    // 单个文章操作
    getPostById,
    getPostsByTag,
    getPostsByCategory,
    searchPosts,
    
    // 文章管理
    createPost,
    updatePost,
    deletePost,
    incrementViews,
    likePost,
    
    // 统计和工具
    getStats
  }
})