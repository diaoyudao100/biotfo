<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const siteStore = useSiteStore()
const authStore = useAuthStore()

siteStore.fetchSettings()
authStore.fetchMe()
</script>
