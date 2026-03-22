<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="text-xl font-bold text-gray-900 mb-6">站点设置</h1>

      <div class="bg-white rounded-xl shadow-sm max-w-2xl">
        <!-- 品牌设置 -->
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-900">品牌信息</h2>
          <p class="text-sm text-gray-500 mt-0.5">设置站点名称和品牌标识</p>
        </div>

        <div class="p-5 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">品牌名称</label>
            <input
              v-model="form.brand_name"
              type="text"
              placeholder="例如：我的品牌"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
            />
            <p class="mt-1 text-xs text-gray-400">显示在导航栏、页脚等位置</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Logo 字母</label>
            <input
              v-model="form.brand_logo_letter"
              type="text"
              maxlength="2"
              placeholder="B"
              class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
            />
            <p class="mt-1 text-xs text-gray-400">Logo 方块中显示的文字，建议 1-2 个字符</p>
          </div>

          <!-- 预览 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">预览</label>
            <div class="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">{{ form.brand_logo_letter || 'B' }}</span>
              </div>
              <span class="text-xl font-bold text-gray-900">{{ form.brand_name || 'BrandStore' }}</span>
            </div>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-gray-100 flex justify-end">
          <button
            :disabled="saving"
            class="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            @click="handleSave"
          >
            {{ saving ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>

      <!-- 保存提示 -->
      <div
        v-if="message"
        class="mt-4 max-w-2xl px-4 py-3 rounded-lg text-sm"
        :class="messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
      >
        {{ message }}
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { api } = useApi()
const siteStore = useSiteStore()

const form = reactive({
  brand_name: '',
  brand_logo_letter: '',
})

const saving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

onMounted(async () => {
  try {
    const res = await api<{ data: Record<string, string> }>('/admin/settings')
    if (res.data) {
      form.brand_name = res.data.brand_name || ''
      form.brand_logo_letter = res.data.brand_logo_letter || ''
    }
  } catch {}
})

async function handleSave() {
  if (!form.brand_name.trim()) {
    message.value = '品牌名称不能为空'
    messageType.value = 'error'
    return
  }

  saving.value = true
  message.value = ''
  try {
    await api('/admin/settings', {
      method: 'PUT',
      body: {
        brand_name: form.brand_name.trim(),
        brand_logo_letter: (form.brand_logo_letter || form.brand_name.charAt(0)).trim(),
      },
    })
    message.value = '保存成功'
    messageType.value = 'success'

    // 更新全局 store
    siteStore.brandName = form.brand_name.trim()
    siteStore.brandLogoLetter = (form.brand_logo_letter || form.brand_name.charAt(0)).trim()
  } catch {
    message.value = '保存失败，请重试'
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}
</script>
