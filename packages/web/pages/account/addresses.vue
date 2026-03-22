<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">地址管理</h1>
      <button
        class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        @click="openForm()"
      >
        + 新增地址
      </button>
    </div>

    <!-- Address List -->
    <div v-if="addresses.length" class="space-y-4">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="bg-white rounded-xl shadow-sm p-5"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-gray-900">{{ addr.name }}</span>
              <span class="text-sm text-gray-500">{{ addr.phone }}</span>
              <span
                v-if="addr.is_default"
                class="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full"
              >
                默认
              </span>
            </div>
            <p class="text-sm text-gray-600">
              {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
            </p>
          </div>
          <div class="flex items-center gap-3 text-sm ml-4">
            <button
              v-if="!addr.is_default"
              class="text-gray-500 hover:text-primary-600 transition-colors"
              @click="setDefault(addr.id)"
            >
              设为默认
            </button>
            <button
              class="text-gray-500 hover:text-primary-600 transition-colors"
              @click="openForm(addr)"
            >
              编辑
            </button>
            <button
              class="text-gray-500 hover:text-red-500 transition-colors"
              @click="handleDelete(addr.id)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="text-center py-20 text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p>暂无收货地址</p>
    </div>

    <!-- Address Form Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showForm = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingId ? '编辑地址' : '新增地址' }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">收货人</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入收货人姓名"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">手机号</label>
            <input
              v-model="form.phone"
              type="text"
              placeholder="请输入手机号"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm text-gray-600 mb-1">省</label>
              <input
                v-model="form.province"
                type="text"
                placeholder="省"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">市</label>
              <input
                v-model="form.city"
                type="text"
                placeholder="市"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">区</label>
              <input
                v-model="form.district"
                type="text"
                placeholder="区"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">详细地址</label>
            <input
              v-model="form.detail"
              type="text"
              placeholder="街道、楼栋、门牌号等"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.is_default" type="checkbox" class="accent-primary-600" />
            <span class="text-sm text-gray-600">设为默认地址</span>
          </label>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            @click="showForm = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            :disabled="saving"
            @click="saveAddress"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { api } = useApi()

const addresses = ref<any[]>([])
const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  is_default: false,
})

onMounted(() => {
  loadAddresses()
})

async function loadAddresses() {
  try {
    const data = await api<any>('/addresses')
    addresses.value = data.data || data.items || data
  } catch {
    addresses.value = []
  }
}

function openForm(addr?: any) {
  if (addr) {
    editingId.value = addr.id
    Object.assign(form, {
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      is_default: addr.is_default,
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      is_default: false,
    })
  }
  showForm.value = true
}

async function saveAddress() {
  if (!form.name || !form.phone || !form.detail) {
    alert('请填写完整地址信息')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await api(`/addresses/${editingId.value}`, {
        method: 'PUT',
        body: form,
      })
    } else {
      await api('/addresses', {
        method: 'POST',
        body: form,
      })
    }
    showForm.value = false
    await loadAddresses()
  } catch {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

async function setDefault(id: number) {
  try {
    await api(`/addresses/${id}`, {
      method: 'PUT',
      body: { is_default: true },
    })
    await loadAddresses()
  } catch {
    alert('操作失败')
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定要删除该地址吗？')) return
  try {
    await api(`/addresses/${id}`, { method: 'DELETE' })
    await loadAddresses()
  } catch {
    alert('删除失败')
  }
}
</script>
