<template>
  <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
    <button
      class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="modelValue <= min"
      @click="decrease"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
    </button>
    <input
      :value="modelValue"
      type="number"
      class="w-12 h-8 text-center text-sm border-x border-gray-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      :min="min"
      :max="max"
      @change="handleInput"
    />
    <button
      class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="modelValue >= max"
      @click="increase"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
  }>(),
  {
    min: 1,
    max: 99,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function decrease() {
  if (props.modelValue > props.min) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

function increase() {
  if (props.modelValue < props.max) {
    emit('update:modelValue', props.modelValue + 1)
  }
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  let val = parseInt(target.value, 10)
  if (isNaN(val) || val < props.min) val = props.min
  if (val > props.max) val = props.max
  emit('update:modelValue', val)
}
</script>
