<!-- src/views/AddContent.vue -->
<template>
  <div class="add-post">
    <h2>✍️ 写新文章</h2>
    
    <!-- 表单 -->
    <form @submit.prevent="handleSubmit" class="post-form">
      <!-- 标题 -->
      <div class="form-group">
        <label for="title">标题 *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          placeholder="请输入文章标题"
          required
          :class="{ error: validationErrors.title }"
        />
        <div v-if="validationErrors.title" class="error-message">
          {{ validationErrors.title }}
        </div>
      </div>

      <!-- 分类 -->
      <div class="form-group">
        <label for="category">分类 *</label>
        <select
          id="category"
          v-model="form.category"
          required
          :class="{ error: validationErrors.category }"
        >
          <option value="" disabled>请选择分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
          <option value="custom">其他...</option>
        </select>
        <input
          v-if="form.category === 'custom'"
          v-model="form.customCategory"
          type="text"
          placeholder="输入新分类名称"
          class="custom-input"
        />
        <div v-if="validationErrors.category" class="error-message">
          {{ validationErrors.category }}
        </div>
      </div>

      <!-- 标签 -->
      <div class="form-group">
        <label for="tags">标签</label>
        <div class="tags-input-container">
          <div class="selected-tags">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="tag-badge"
              @click="removeTag(tag)"
            >
              {{ tag }} ×
            </span>
          </div>
          <input
            id="tags"
            v-model="tagInput"
            type="text"
            placeholder="输入标签，按回车或逗号添加"
            @keydown.enter.prevent="addTag"
            @keydown.188.prevent="addTag"
          />
          <button type="button" class="btn-add-tag" @click="addTag">
            添加
          </button>
        </div>
        <div class="suggested-tags" v-if="suggestedTags.length > 0">
          <span class="suggestion-label">推荐标签：</span>
          <button
            v-for="tag in suggestedTags"
            :key="tag"
            type="button"
            class="tag-suggestion"
            @click="addTag()"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- 摘要 -->
      <div class="form-group">
        <label for="excerpt">摘要</label>
        <textarea
          id="excerpt"
          v-model="form.excerpt"
          placeholder="文章摘要，不填将自动截取内容前150字"
          rows="3"
        ></textarea>
        <div class="char-count">
          {{ form.excerpt.length }}/200
        </div>
      </div>

      <!-- 编辑器标签页 -->
      <div class="editor-tabs">
        <button
          type="button"
          :class="{ active: activeTab === 'edit' }"
          @click="activeTab = 'edit'"
        >
          编辑
        </button>
        <button
          type="button"
          :class="{ active: activeTab === 'preview' }"
          @click="activeTab = 'preview'"
        >
          预览
        </button>
        <span class="char-count">字数：{{ wordCount }} 字</span>
      </div>

      <!-- 编辑器 -->
      <div class="editor-container">
        <div v-show="activeTab === 'edit'" class="editor-area">
          <div class="toolbar">
            <button
              v-for="action in toolbarActions"
              :key="action.name"
              type="button"
              class="toolbar-btn"
              :title="action.tip"
              @click="insertMarkdown(action.prefix, action.suffix)"
            >
              {{ action.icon }}
            </button>
            <button
              type="button"
              class="toolbar-btn"
              title="插入图片"
              @click="insertImage"
            >
              🖼️
            </button>
            <button
              type="button"
              class="toolbar-btn"
              title="插入代码块"
              @click="insertCodeBlock"
            >
              💻
            </button>
          </div>
          <textarea
            v-model="form.content"
            placeholder="开始写作吧！支持 Markdown 语法..."
            rows="20"
            class="markdown-editor"
            @input="updateWordCount"
          ></textarea>
        </div>

        <div v-show="activeTab === 'preview'" class="preview-area" v-html="compiledMarkdown">
        </div>
      </div>

      <!-- 表单操作 -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn-publish"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '发布中...' : '发布文章' }}
        </button>
        <button
          type="button"
          class="btn-reset"
          :disabled="isSubmitting"
          @click="resetForm"
        >
          重置
        </button>
      </div>
    </form>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-message">
      ✅ {{ successMessage }}
      <router-link v-if="createdPost" :to="`/posts/${createdPost.id}`">
        查看文章
      </router-link>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message global">
      ❌ {{ errorMessage }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed} from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import { useBlogStore } from '../stores/post'
import { isLocalAccess } from '../utils/permission'

const router = useRouter()
const blogStore = useBlogStore()

// 表单数据
const form = ref({
  title: '',
  content: '',
  excerpt: '',
  category: '',
  customCategory: '',
  tags: [] as string[],
  coverImage: ''
})

const tagInput = ref('')
const activeTab = ref<'edit' | 'preview'>('edit')
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const createdPost = ref<any>(null)
const wordCount = ref(0)

// 验证错误
const validationErrors = ref({
  title: '',
  category: ''
})

// 分类选项
const categories = computed(() => {
  return ['前端', '后端', '全栈', '数据库', '运维', '设计', '生活', '随笔']
})

// 推荐标签
const suggestedTags = computed(() => {
  const allTags = blogStore.getAllTags().map(tag => tag.name)
  return allTags.slice(0, 5) // 只显示前5个
})

// Markdown 工具栏动作
const toolbarActions = [
  { name: 'h1', icon: 'H1', prefix: '# ', suffix: '', tip: '一级标题' },
  { name: 'h2', icon: 'H2', prefix: '## ', suffix: '', tip: '二级标题' },
  { name: 'bold', icon: 'B', prefix: '**', suffix: '**', tip: '加粗' },
  { name: 'italic', icon: 'I', prefix: '*', suffix: '*', tip: '斜体' },
  { name: 'link', icon: '🔗', prefix: '[', suffix: '](https://)', tip: '链接' },
  { name: 'quote', icon: '❝', prefix: '> ', suffix: '', tip: '引用' },
  { name: 'list', icon: '•', prefix: '- ', suffix: '', tip: '无序列表' },
  { name: 'list-ol', icon: '1.', prefix: '1. ', suffix: '', tip: '有序列表' },
  { name: 'code', icon: '</>', prefix: '`', suffix: '`', tip: '行内代码' }
]

// 计算属性
const compiledMarkdown = computed(() => {
  return marked.parse(form.value.content || '*暂无内容*')
})


// 验证表单
const validateForm = () => {
  validationErrors.value = { title: '', category: '' }
  let isValid = true

  if (!form.value.title.trim()) {
    validationErrors.value.title = '标题不能为空'
    isValid = false
  }

  if (!form.value.category) {
    validationErrors.value.category = '请选择分类'
    isValid = false
  } else if (form.value.category === 'custom' && !form.value.customCategory.trim()) {
    validationErrors.value.category = '请输入自定义分类名称'
    isValid = false
  }

  return isValid
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    errorMessage.value = '请填写必填项'
    return
  }

  if (!isLocalAccess()) {
    errorMessage.value = '无权限发布文章'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // 确定最终分类
    const finalCategory = form.value.category === 'custom' 
      ? form.value.customCategory 
      : form.value.category

    // 生成摘要
    const finalExcerpt = form.value.excerpt || 
      form.value.content.replace(/[#*`]/g, '').substring(0, 150) + '...'

    // 创建文章
    const newPost = blogStore.createPost({
      title: form.value.title,
      content: form.value.content,
      excerpt: finalExcerpt,
      date: new Date().toISOString().split('T')[0],
      tags: form.value.tags,
      author: '管理员',
      coverImage: form.value.coverImage || undefined,
      category: finalCategory
    })

    if (newPost) {
      createdPost.value = newPost
      successMessage.value = '文章发布成功！'
      
      // 3秒后跳转到文章页面
      setTimeout(() => {
        router.push(`/posts/${newPost.id}`)
      }, 3000)
      
      resetForm()
    } else {
      errorMessage.value = '发布失败，请重试'
    }
  } catch (error) {
    errorMessage.value = '发布失败：' + (error as Error).message
  } finally {
    isSubmitting.value = false
  }
}


// 重置表单
const resetForm = () => {
  if (confirm('确定要重置表单吗？未保存的内容将丢失。')) {
    form.value = {
      title: '',
      content: '',
      excerpt: '',
      category: '',
      customCategory: '',
      tags: [],
      coverImage: ''
    }
    tagInput.value = ''
    activeTab.value = 'edit'
    validationErrors.value = { title: '', category: '' }
    errorMessage.value = ''
  }
}

// 标签管理函数
const addTag = () => {
  try {
    const inputValue = tagInput.value
    
    // 安全检查
    if (inputValue == null || inputValue === undefined) {
      return
    }
    
    // 转换为字符串
    const tagStr = String(inputValue).trim()
    if (!tagStr) {
      return
    }
    
    // 清理标签
    const cleanTag = tagStr.replace(/,+$/, '').trim()
    if (!cleanTag) {
      return
    }
    
    // 避免重复
    if (!form.value.tags.includes(cleanTag)) {
      form.value.tags.push(cleanTag)
    }
    
    // 清空输入框
    tagInput.value = ''
  } catch (error) {
    console.error('添加标签时出错:', error)
  }
}


const removeTag = (tag: string) => {
  try {
    if (typeof tag !== 'string') {
      console.error('要删除的标签不是字符串:', tag)
      return
    }
    
    form.value.tags = form.value.tags.filter(t => t !== tag)
  } catch (error) {
    console.error('删除标签时出错:', error)
  }
}

// 编辑器工具
const insertMarkdown = (prefix: string, suffix: string) => {
  const textarea = document.querySelector('.markdown-editor') as HTMLTextAreaElement
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = form.value.content.substring(start, end)
  const newText = prefix + selectedText + suffix
  
  form.value.content = 
    form.value.content.substring(0, start) + 
    newText + 
    form.value.content.substring(end)
  
  // 恢复光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(
      start + prefix.length,
      start + prefix.length + selectedText.length
    )
  }, 0)
}

const insertImage = () => {
  const url = prompt('请输入图片URL：')
  if (url) {
    const textarea = document.querySelector('.markdown-editor') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const markdown = `![图片描述](${url})`
    
    form.value.content = 
      form.value.content.substring(0, start) + 
      markdown + 
      form.value.content.substring(textarea.selectionEnd)
  }
}

const insertCodeBlock = () => {
  const textarea = document.querySelector('.markdown-editor') as HTMLTextAreaElement
  const start = textarea.selectionStart
  const selectedText = form.value.content.substring(start, textarea.selectionEnd)
  const language = prompt('编程语言（可选）：') || ''
  const codeBlock = `\`\`\`${language}\n${selectedText}\n\`\`\``
  
  form.value.content = 
    form.value.content.substring(0, start) + 
    codeBlock + 
    form.value.content.substring(textarea.selectionEnd)
}

// 字数统计
const updateWordCount = () => {
  const text = form.value.content
  // 中文算1个字，英文单词算1个字
  const chinese = text.match(/[\u4e00-\u9fa5]/g) || []
  const english = text.match(/\b[a-zA-Z]+\b/g) || []
  wordCount.value = chinese.length + english.length
}

</script>

<style scoped>
.add-post {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #1890ff;
}

/* 表单样式 */
.post-form {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

input, select, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

input.error, select.error {
  border-color: #f5222d;
}

.custom-input {
  margin-top: 10px;
}

.error-message {
  color: #f5222d;
  font-size: 12px;
  margin-top: 4px;
}

.error-message.global {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  padding: 12px;
  margin: 20px 0;
  font-size: 14px;
}

/* 标签输入 */
.tags-input-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background: #fff;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.tag-badge {
  background: #e6f7ff;
  color: #1890ff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-badge:hover {
  background: #bae7ff;
}

.tags-input-container input {
  flex: 1;
  min-width: 100px;
  border: none;
  padding: 6px;
  font-size: 14px;
}

.tags-input-container input:focus {
  outline: none;
  box-shadow: none;
}

.btn-add-tag {
  background: #1890ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
}

.btn-add-tag:hover {
  background: #096dd9;
}

.suggested-tags {
  margin-top: 8px;
  font-size: 12px;
}

.suggestion-label {
  color: #666;
  margin-right: 8px;
}

.tag-suggestion {
  background: #f0f0f0;
  border: none;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  margin: 0 4px 4px 0;
  cursor: pointer;
  transition: background 0.3s;
}

.tag-suggestion:hover {
  background: #e0e0e0;
}

/* 封面图片 */
.cover-preview {
  position: relative;
  margin-top: 10px;
  width: 200px;
  height: 120px;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #eee;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.cover-options {
  margin-top: 10px;
}

.btn-cover-option {
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cover-option:hover {
  background: #e6e6e6;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 编辑器标签页 */
.editor-tabs {
  display: flex;
  border-bottom: 1px solid #dcdfe6;
  margin-bottom: 0;
  align-items: center;
}

.editor-tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.editor-tabs button.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  font-weight: 600;
}

.editor-tabs button:hover:not(.active) {
  color: #333;
  background: #f5f5f5;
}

.editor-tabs .char-count {
  margin-left: auto;
  padding: 0 20px;
  color: #666;
  font-size: 12px;
}

/* 编辑器容器 */
.editor-container {
  border: 1px solid #dcdfe6;
  border-top: none;
  border-radius: 0 0 4px 4px;
  min-height: 400px;
  margin-bottom: 20px;
}

/* 编辑区域 */
.editor-area {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  padding: 10px;
  background: #f8f9fa;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.toolbar-btn:hover {
  background: #f0f0f0;
  border-color: #1890ff;
  color: #1890ff;
}

.markdown-editor {
  flex: 1;
  padding: 20px;
  border: none;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  min-height: 300px;
}

.markdown-editor:focus {
  outline: none;
  box-shadow: none;
}

/* 预览区域 */
.preview-area {
  padding: 20px;
  min-height: 300px;
  overflow-y: auto;
  line-height: 1.8;
  color: #333;
}

.preview-area h1,
.preview-area h2,
.preview-area h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #333;
}

.preview-area h1 { border-bottom: 2px solid #f0f0f0; padding-bottom: 0.3em; }
.preview-area h2 { border-bottom: 1px solid #f0f0f0; padding-bottom: 0.3em; }

.preview-area p {
  margin: 1em 0;
}

.preview-area ul,
.preview-area ol {
  padding-left: 2em;
  margin: 1em 0;
}

.preview-area blockquote {
  border-left: 4px solid #1890ff;
  margin: 1em 0;
  padding-left: 1em;
  color: #666;
  background: #f8f9fa;
  padding: 1em;
  border-radius: 4px;
}

.preview-area pre {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  margin: 1em 0;
}

.preview-area code {
  background: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.preview-area a {
  color: #1890ff;
  text-decoration: none;
}

.preview-area a:hover {
  text-decoration: underline;
}

.preview-area img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-actions button {
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.btn-save-draft {
  background: #f5f5f5;
  color: #666;
  border-color: #d9d9d9;
}

.btn-save-draft:hover:not(:disabled) {
  background: #e6e6e6;
  border-color: #bfbfbf;
}

.btn-publish {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.btn-publish:hover:not(:disabled) {
  background: #096dd9;
  border-color: #096dd9;
}

.btn-reset {
  background: white;
  color: #f5222d;
  border-color: #ff4d4f;
}

.btn-reset:hover:not(:disabled) {
  background: #fff2f0;
  border-color: #f5222d;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 成功消息 */
.success-message {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  padding: 12px 20px;
  margin: 20px 0;
  color: #52c41a;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.success-message a {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
}

.success-message a:hover {
  text-decoration: underline;
}

/* 草稿箱 */
.drafts-section {
  margin-top: 40px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.drafts-section h3 {
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.drafts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.draft-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s;
}

.draft-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateX(4px);
}

.draft-title {
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
}

.draft-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #666;
}

.btn-delete-draft {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #ff4d4f;
  color: white;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.btn-delete-draft:hover {
  background: #f5222d;
}
</style>