import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 文章接口
export interface Post {
  id: number
  title: string
  content: string
  excerpt: string
  date: string
  tags: string[]
  author: string
  views: number
  likes: number
  category?: string
  createdAt: string
  updatedAt?: string
  state: 'open' | 'closed'
}

export const useBlogStore = defineStore('github', () => {
  // 配置信息
  const config = ref({
    owner: 'Lff553',
    repo: 'ffblog',
    issueLabel: 'blog',
    token: import.meta.env.VITE_GITHUB_TOKEN || '' 
  })

  // 状态
  const posts = ref<Post[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 从 GitHub 获取所有文章
  const fetchPosts = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { owner, repo, token, issueLabel } = config.value
      const url = `https://api.github.com/repos/${owner}/${repo}/issues?labels=${issueLabel}&per_page=100&state=all`
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': token ? `token ${token}` : '',
          'User-Agent': 'GitHub-Blog-Client'
        }
      })

      if (!response.ok) {
        throw new Error('获取文章失败')
      }

      const issues = await response.json()
      const openIssues = issues.filter((issue: any) => issue.state === 'open')
      
      // 转换为 Post 格式
      posts.value = openIssues.map((issue: any) => ({
        id: issue.number,
        title: issue.title,
        content: issue.body || '',
        excerpt: (issue.body || '').substring(0, 150) + '...',
        date: issue.created_at,
        tags: issue.labels.map((label: any) => label.name),
        author: issue.user.login,
        views: issue.reactions?.['+1'] || 0,
        likes: issue.reactions?.['heart'] || 0,
        category: issue.labels.find((label: any) => label.name !== 'blog')?.name,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        state: issue.state
      }))

      return posts.value
      
    } catch (err) {
      error.value = '获取文章失败'
      console.error('获取文章失败:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 计算属性：获取最新文章
  const getRecentPosts = computed(() => (limit: number = 7) => {
    return [...posts.value]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  })

  // 计算属性：获取文章归档
  const getArchive = computed(() => {
    const archiveMap: Record<string, number> = {}
    
    posts.value.forEach(post => {
      const date = new Date(post.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const key = `${year}-${month}`
      
      archiveMap[key] = (archiveMap[key] || 0) + 1
    })
    
    return Object.entries(archiveMap)
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
  })

  // 搜索文章
  const searchPosts = (keyword: string): Post[] => {
    if (!keyword.trim()) return posts.value
    
    const searchTerm = keyword.toLowerCase()
    return posts.value.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  // 获取单篇文章
  const getPostById = (id: number): Post | undefined => {
    return posts.value.find(post => post.id === id)
  }

  // 创建文章
  const createPost = async (postData: {
    title: string
    content: string
    tags?: string[]
    category?: string
  }): Promise<Post | null> => {
    const { owner, repo, token, issueLabel } = config.value
    
    try {
      const labels = [issueLabel]
      if (postData.category) labels.push(postData.category)
      if (postData.tags) labels.push(...postData.tags)
      
      // 修正URL
      const url = `https://api.github.com/repos/${owner}/${repo}/issues`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'Authorization': `token ${token}`
        },
        body: JSON.stringify({
          title: postData.title,
          body: postData.content,
          labels: Array.from(new Set(labels))
        })
      })
      
      if (!response.ok) {
        throw new Error('创建文章失败')
      }
      
      const issue = await response.json()
      const newPost: Post = {
        id: issue.number,
        title: issue.title,
        content: issue.body || '',
        excerpt: (issue.body || '').substring(0, 150) + '...',
        date: issue.created_at,
        tags: issue.labels.map((label: any) => label.name),
        author: issue.user.login,
        views: 0,
        likes: 0,
        category: issue.labels.find((label: any) => label.name !== 'blog')?.name,
        createdAt: issue.created_at,
        state: issue.state
      }
      
      posts.value.unshift(newPost)
      return newPost
      
    } catch (err) {
      error.value = '创建文章失败'
      console.error('创建文章失败:', err)
      return null
    }
  }

  // 更新文章
  const updatePost = async (id: number, updates: {
    title?: string
    content?: string
    tags?: string[]
    category?: string
    state?: 'open' | 'closed'
  }): Promise<boolean> => {
    const { owner, repo, token, issueLabel } = config.value
    const post = getPostById(id)
    
    if (!post) return false
    
    try {
      const currentLabels = post.tags.filter(tag => tag !== issueLabel)
      const labels = [issueLabel]
      if (updates.category) labels.push(updates.category)
      if (updates.tags) labels.push(...updates.tags)
      else labels.push(...currentLabels)
      
      // 修正URL
      const url = `https://api.github.com/repos/${owner}/${repo}/issues/${id}`
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'Authorization': `token ${token}`
        },
        body: JSON.stringify({
          title: updates.title || post.title,
          body: updates.content || post.content,
          labels: Array.from(new Set(labels)),
          state: updates.state || post.state
        })
      })
      
      if (!response.ok) {
        throw new Error('更新文章失败')
      }
      
      await fetchPosts() // 重新获取最新数据
      return true
      
    } catch (err) {
      error.value = '更新文章失败'
      console.error('更新文章失败:', err)
      return false
    }
  }

  // 删除文章
  const deletePost = async (id: number): Promise<boolean> => {
    const { owner, repo, token } = config.value
    
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/issues/${id}`
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'Authorization': `token ${token}`
        },
        body: JSON.stringify({
          state: 'closed'
        })
      })
      
      if (!response.ok) {
        throw new Error('删除文章失败')
      }
      
      posts.value = posts.value.filter(post => post.id !== id)
      return true
      
    } catch (err) {
      error.value = '删除文章失败'
      console.error('删除文章失败:', err)
      return false
    }
  }

  return {
    // 状态
    posts,
    isLoading,
    error,
    config,
    
    // 基本操作
    fetchPosts,
    getPostById,
    searchPosts,
    createPost,
    updatePost,
    deletePost,
    
    // 新增的侧边栏需要的方法
    getRecentPosts: getRecentPosts.value, // 计算属性值
    getArchive: getArchive.value // 计算属性值
  }
})