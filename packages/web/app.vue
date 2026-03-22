<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const siteStore = useSiteStore()
siteStore.fetchSettings()
</script>
