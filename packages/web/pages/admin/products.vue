<template>
  <NuxtLayout name="admin">
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-gray-900">商品管理</h1>
        <button @click="showCreateModal = true" class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          + 添加商品
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm mb-4 p-4 flex flex-wrap gap-3 items-center">
        <select v-model="filters.status" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" @change="fetchProducts">
          <option value="">全部状态</option>
          <option value="on_sale">在售</option>
          <option value="off_sale">已下架</option>
          <option value="draft">草稿</option>
        </select>
        <input v-model="filters.keyword" placeholder="搜索商品名称..." class="text-sm border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]" @keyup.enter="fetchProducts" />
        <button @click="fetchProducts" class="text-sm px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">搜索</button>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th class="px-5 py-3 font-medium">商品</th>
                <th class="px-5 py-3 font-medium">价格</th>
                <th class="px-5 py-3 font-medium">库存</th>
                <th class="px-5 py-3 font-medium">销量</th>
                <th class="px-5 py-3 font-medium">状态</th>
                <th class="px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="loading" >
                <td colspan="6" class="px-5 py-10 text-center text-gray-400">加载中...</td>
              </tr>
              <tr v-else-if="!products.length">
                <td colspan="6" class="px-5 py-10 text-center text-gray-400">暂无商品</td>
              </tr>
              <tr v-for="p in products" :key="p.id" class="hover:bg-gray-50">
                <td class="px-5 py-3">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img v-if="p.main_image" :src="`${assetsUrl}/${p.main_image}`" class="w-full h-full object-cover" />
                    </div>
                    <div class="min-w-0">
                      <p class="font-medium text-gray-900 truncate">{{ p.name }}</p>
                      <p class="text-xs text-gray-400 truncate">{{ p.slug }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3 whitespace-nowrap">
                  <span class="text-red-600 font-medium">¥{{ (p.price_min / 100).toFixed(2) }}</span>
                  <span v-if="p.price_min !== p.price_max" class="text-gray-400"> ~ ¥{{ (p.price_max / 100).toFixed(2) }}</span>
                </td>
                <td class="px-5 py-3">{{ p.total_stock ?? '-' }}</td>
                <td class="px-5 py-3">{{ p.sales_count }}</td>
                <td class="px-5 py-3">
                  <span :class="productStatusClass(p.status)" class="inline-block px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ productStatusLabel(p.status) }}
                  </span>
                </td>
                <td class="px-5 py-3 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="p.status !== 'on_sale'"
                      @click="toggleStatus(p, 'on_sale')"
                      class="text-green-600 hover:text-green-700 text-xs font-medium"
                    >上架</button>
                    <button
                      v-else
                      @click="toggleStatus(p, 'off_sale')"
                      class="text-orange-600 hover:text-orange-700 text-xs font-medium"
                    >下架</button>
                    <button @click="editProduct(p)" class="text-indigo-600 hover:text-indigo-700 text-xs font-medium">编辑</button>
                    <button @click="deleteProduct(p)" class="text-red-500 hover:text-red-700 text-xs font-medium">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="total > limit" class="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>共 {{ total }} 件商品</span>
          <div class="flex space-x-1">
            <button
              v-for="p in totalPages"
              :key="p"
              @click="page = p; fetchProducts()"
              :class="p === page ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="w-8 h-8 rounded flex items-center justify-center text-xs font-medium"
            >{{ p }}</button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <div class="fixed inset-0 bg-black/40" @click="showCreateModal = false" />
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[70vh] overflow-y-auto p-6">
          <h2 class="text-lg font-bold mb-4">{{ editingProduct ? '编辑商品' : '添加商品' }}</h2>
          <form @submit.prevent="submitProduct" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">商品名称 *</label>
                <input v-model="form.name" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input v-model="form.slug" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">副标题</label>
              <input v-model="form.subtitle" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">主图 Key *</label>
              <input v-model="form.main_image" required placeholder="products/xxx.jpg" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">商品描述 (HTML)</label>
              <textarea v-model="form.description" rows="4" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none" />
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select v-model="form.category_id" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option :value="null">无</option>
                  <option v-for="c in allCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select v-model="form.status" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="draft">草稿</option>
                  <option value="on_sale">在售</option>
                  <option value="off_sale">已下架</option>
                </select>
              </div>
              <div class="flex items-end">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" v-model="form.is_featured_bool" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span class="text-sm text-gray-700">推荐商品</span>
                </label>
              </div>
            </div>

            <!-- SKU Section -->
            <div class="border-t pt-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-medium text-gray-900">SKU 规格</h3>
                <button type="button" @click="addSku" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ 添加 SKU</button>
              </div>
              <div v-for="(sku, i) in form.skus" :key="i" class="border border-gray-200 rounded-lg p-3 mb-2">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input v-model="sku.sku_code" placeholder="SKU编码" class="border border-gray-200 rounded px-2 py-1.5 text-sm" />
                  <input v-model="sku.spec_text" placeholder='规格 如: 白色/M' class="border border-gray-200 rounded px-2 py-1.5 text-sm" />
                  <input v-model.number="sku.price_yuan" type="number" step="0.01" placeholder="价格(元)" class="border border-gray-200 rounded px-2 py-1.5 text-sm" />
                  <div class="flex space-x-1">
                    <input v-model.number="sku.stock" type="number" placeholder="库存" class="border border-gray-200 rounded px-2 py-1.5 text-sm flex-1" />
                    <button type="button" @click="form.skus.splice(i, 1)" class="text-red-400 hover:text-red-600 px-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3 pt-2">
              <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button type="submit" :disabled="submitting" class="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {{ submitting ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { PRODUCT_STATUS_LABEL } from '@biotfo/shared'

definePageMeta({ layout: false })

const config = useRuntimeConfig()
const assetsUrl = config.public.assetsUrl
const { api } = useApi()

const products = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = 20
const totalPages = computed(() => Math.ceil(total.value / limit))
const allCategories = ref<any[]>([])

const filters = reactive({ status: '', keyword: '' })

const showCreateModal = ref(false)
const editingProduct = ref<any>(null)
const submitting = ref(false)

const defaultForm = () => ({
  name: '', slug: '', subtitle: '', main_image: '', description: '',
  category_id: null as number | null, status: 'draft', is_featured_bool: false,
  skus: [{ sku_code: '', spec_text: '', price_yuan: null as number | null, stock: 0 }],
})
const form = reactive(defaultForm())

onMounted(() => {
  fetchProducts()
  fetchCategories()
})

async function fetchProducts() {
  loading.value = true
  try {
    const params: any = { page: page.value, limit }
    if (filters.status) params.status = filters.status
    if (filters.keyword) params.keyword = filters.keyword
    const res = await api<any>('/admin/products', { params })
    products.value = res.data?.list ?? []
    total.value = res.data?.total ?? 0
  } catch { }
  loading.value = false
}

async function fetchCategories() {
  try {
    const res = await api<any>('/categories')
    const flat = (items: any[]): any[] => items.flatMap(c => [c, ...flat(c.children || [])])
    allCategories.value = flat(res.data ?? [])
  } catch { }
}

function editProduct(p: any) {
  editingProduct.value = p
  Object.assign(form, {
    name: p.name, slug: p.slug, subtitle: p.subtitle || '', main_image: p.main_image,
    description: p.description || '', category_id: p.category_id, status: p.status,
    is_featured_bool: !!p.is_featured, skus: [],
  })
  showCreateModal.value = true
}

function addSku() {
  form.skus.push({ sku_code: '', spec_text: '', price_yuan: null, stock: 0 })
}

async function submitProduct() {
  submitting.value = true
  try {
    const body: any = {
      name: form.name, slug: form.slug, subtitle: form.subtitle, main_image: form.main_image,
      description: form.description, category_id: form.category_id, status: form.status,
      is_featured: form.is_featured_bool ? 1 : 0,
      skus: form.skus.filter(s => s.sku_code).map(s => ({
        sku_code: s.sku_code,
        spec_desc: JSON.stringify(s.spec_text.split('/').map(v => ({ name: '规格', value: v.trim() }))),
        price: Math.round((s.price_yuan || 0) * 100),
        stock: s.stock || 0,
      })),
    }
    if (editingProduct.value) {
      await api(`/admin/products/${editingProduct.value.id}`, { method: 'PUT', body })
    } else {
      await api('/admin/products', { method: 'POST', body })
    }
    showCreateModal.value = false
    editingProduct.value = null
    Object.assign(form, defaultForm())
    await fetchProducts()
  } catch (e: any) {
    alert(e?.data?.message || '保存失败')
  }
  submitting.value = false
}

async function toggleStatus(p: any, status: string) {
  try {
    await api(`/admin/products/${p.id}/status`, { method: 'PUT', body: { status } })
    p.status = status
  } catch { }
}

async function deleteProduct(p: any) {
  if (!confirm(`确定删除「${p.name}」吗？`)) return
  try {
    await api(`/admin/products/${p.id}`, { method: 'DELETE' })
    await fetchProducts()
  } catch { }
}

function productStatusLabel(s: string) { return PRODUCT_STATUS_LABEL[s] || s }
function productStatusClass(s: string) {
  return { on_sale: 'bg-green-100 text-green-700', off_sale: 'bg-gray-100 text-gray-500', draft: 'bg-yellow-100 text-yellow-700' }[s] || 'bg-gray-100 text-gray-600'
}
</script>
