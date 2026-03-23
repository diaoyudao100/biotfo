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

          <!-- Logo 图片上传 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">品牌 Logo</label>
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div
                  v-if="form.brand_logo_url"
                  class="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-white"
                >
                  <img :src="form.brand_logo_url" alt="Logo" class="w-full h-full object-contain" />
                </div>
                <div
                  v-else
                  class="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center"
                >
                  <span class="text-white font-bold text-xl">{{ form.brand_logo_letter || 'B' }}</span>
                </div>
              </div>

              <div class="flex-1 space-y-2">
                <label
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition"
                >
                  <svg class="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ uploading ? '上传中...' : '上传图片' }}
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    :disabled="uploading"
                    @change="handleLogoUpload"
                  />
                </label>
                <button
                  v-if="form.brand_logo_url"
                  class="ml-2 text-sm text-red-500 hover:text-red-700"
                  @click="removeLogo"
                >
                  移除图片
                </button>
                <p class="text-xs text-gray-400">支持 JPG、PNG、SVG，建议正方形，不超过 2MB</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">备用 Logo 字母</label>
            <input
              v-model="form.brand_logo_letter"
              type="text"
              maxlength="2"
              placeholder="B"
              class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
            />
            <p class="mt-1 text-xs text-gray-400">未上传 Logo 图片时显示的文字，建议 1-2 个字符</p>
          </div>

          <!-- 预览 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">预览</label>
            <div class="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <div v-if="form.brand_logo_url" class="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                <img :src="form.brand_logo_url" alt="Logo" class="w-full h-full object-contain" />
              </div>
              <div v-else class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
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

const config = useRuntimeConfig()
const { api } = useApi()
const authStore = useAuthStore()
const siteStore = useSiteStore()

const form = reactive({
  brand_name: '',
  brand_logo_letter: '',
  brand_logo_url: '',
})

const saving = ref(false)
const uploading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

onMounted(async () => {
  try {
    const res = await api<{ data: Record<string, string> }>('/admin/settings')
    if (res.data) {
      form.brand_name = res.data.brand_name || ''
      form.brand_logo_letter = res.data.brand_logo_letter || ''
      form.brand_logo_url = res.data.brand_logo_url || ''
    }
  } catch (e: any) {
    message.value = '加载设置失败: ' + (e?.data?.error?.message || e?.message || String(e))
    messageType.value = 'error'
  }
})

async function handleLogoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    message.value = 'Logo 图片不能超过 2MB'
    messageType.value = 'error'
    return
  }

  uploading.value = true
  message.value = ''
  try {
    const arrayBuffer = await file.arrayBuffer()
    const res = await $fetch<{ success: boolean; data: { key: string; url: string } }>(
      '/admin/images/upload',
      {
        baseURL: config.public.apiBase,
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          Authorization: `Bearer ${authStore.token}`,
        },
        body: arrayBuffer,
      },
    )
    form.brand_logo_url = res.data.url
    message.value = 'Logo 上传成功'
    messageType.value = 'success'
  } catch (e: any) {
    message.value = 'Logo 上传失败: ' + (e?.data?.error?.message || e?.message || String(e))
    messageType.value = 'error'
  } finally {
    uploading.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

function removeLogo() {
  form.brand_logo_url = ''
}

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
        brand_logo_url: form.brand_logo_url,
      },
    })
    message.value = '保存成功'
    messageType.value = 'success'

    siteStore.brandName = form.brand_name.trim()
    siteStore.brandLogoLetter = (form.brand_logo_letter || form.brand_name.charAt(0)).trim()
    siteStore.brandLogoUrl = form.brand_logo_url
  } catch (e: any) {
    message.value = '保存失败: ' + (e?.data?.error?.message || e?.message || String(e))
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}
</script>
