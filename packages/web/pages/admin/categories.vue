<template>
  <NuxtLayout name="admin">
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-gray-900">分类管理</h1>
        <button @click="openCreate()" class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          + 添加分类
        </button>
      </div>

      <!-- Categories List -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th class="px-5 py-3 font-medium">分类名称</th>
                <th class="px-5 py-3 font-medium">Slug</th>
                <th class="px-5 py-3 font-medium">图标</th>
                <th class="px-5 py-3 font-medium">排序</th>
                <th class="px-5 py-3 font-medium">显示</th>
                <th class="px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="!categories.length">
                <td colspan="6" class="px-5 py-10 text-center text-gray-400">暂无分类</td>
              </tr>
              <template v-for="cat in flatCategories" :key="cat.id">
                <tr class="hover:bg-gray-50">
                  <td class="px-5 py-3">
                    <span :style="{ paddingLeft: (cat.depth * 20) + 'px' }" class="flex items-center">
                      <span v-if="cat.depth > 0" class="text-gray-300 mr-2">└</span>
                      <span class="font-medium text-gray-900">{{ cat.name }}</span>
                    </span>
                  </td>
                  <td class="px-5 py-3 text-gray-500 font-mono text-xs">{{ cat.slug }}</td>
                  <td class="px-5 py-3">{{ cat.icon || '-' }}</td>
                  <td class="px-5 py-3">{{ cat.sort_order }}</td>
                  <td class="px-5 py-3">
                    <span :class="cat.is_visible ? 'text-green-600' : 'text-gray-400'">
                      {{ cat.is_visible ? '显示' : '隐藏' }}
                    </span>
                  </td>
                  <td class="px-5 py-3 whitespace-nowrap">
                    <button @click="openEdit(cat)" class="text-indigo-600 hover:text-indigo-700 text-xs font-medium mr-2">编辑</button>
                    <button @click="deleteCategory(cat)" class="text-red-500 hover:text-red-700 text-xs font-medium">删除</button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="fixed inset-0 bg-black/40" @click="showModal = false" />
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <h2 class="text-lg font-bold mb-4">{{ editing ? '编辑分类' : '添加分类' }}</h2>
          <form @submit.prevent="submitCategory" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">分类名称 *</label>
              <input v-model="form.name" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input v-model="form.slug" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">图标</label>
                <input v-model="form.icon" placeholder="emoji 或图标" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input v-model.number="form.sort_order" type="number" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">父分类</label>
              <select v-model="form.parent_id" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option :value="null">无（顶级分类）</option>
                <option v-for="c in topCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" v-model="form.is_visible_bool" class="rounded border-gray-300 text-indigo-600" />
              <span class="text-sm text-gray-700">前台显示</span>
            </label>
            <div class="flex justify-end space-x-3 pt-2">
              <button type="button" @click="showModal = false" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button type="submit" class="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { api } = useApi()
const categories = ref<any[]>([])
const showModal = ref(false)
const editing = ref<any>(null)

const form = reactive({
  name: '', slug: '', icon: '', sort_order: 0,
  parent_id: null as number | null, is_visible_bool: true,
})

const topCategories = computed(() => categories.value.filter(c => !c.parent_id))

interface FlatCategory {
  id: number; name: string; slug: string; icon: string; sort_order: number;
  is_visible: number; parent_id: number | null; depth: number; children?: any[];
}

const flatCategories = computed(() => {
  const result: FlatCategory[] = []
  function walk(items: any[], depth: number) {
    for (const item of items) {
      result.push({ ...item, depth })
      if (item.children?.length) walk(item.children, depth + 1)
    }
  }
  walk(categories.value, 0)
  return result
})

onMounted(fetchCategories)

async function fetchCategories() {
  try {
    const res = await api<any>('/categories')
    categories.value = res.data ?? []
  } catch { }
}

function openCreate() {
  editing.value = null
  Object.assign(form, { name: '', slug: '', icon: '', sort_order: 0, parent_id: null, is_visible_bool: true })
  showModal.value = true
}

function openEdit(cat: any) {
  editing.value = cat
  Object.assign(form, { name: cat.name, slug: cat.slug, icon: cat.icon || '', sort_order: cat.sort_order, parent_id: cat.parent_id, is_visible_bool: !!cat.is_visible })
  showModal.value = true
}

async function submitCategory() {
  const body = { ...form, is_visible: form.is_visible_bool ? 1 : 0 }
  try {
    if (editing.value) {
      await api(`/admin/categories/${editing.value.id}`, { method: 'PUT', body })
    } else {
      await api('/admin/categories', { method: 'POST', body })
    }
    showModal.value = false
    await fetchCategories()
  } catch (e: any) {
    alert(e?.data?.message || '保存失败')
  }
}

async function deleteCategory(cat: any) {
  if (!confirm(`确定删除「${cat.name}」吗？`)) return
  try {
    await api(`/admin/categories/${cat.id}`, { method: 'DELETE' })
    await fetchCategories()
  } catch { }
}
</script>
