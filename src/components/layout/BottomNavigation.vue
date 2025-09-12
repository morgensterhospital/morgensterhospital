<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-surface-dark border-t border-gray-700 md:hidden">
    <div class="flex justify-around">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        class="flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors"
        :class="{
          'text-primary': $route.path === item.path,
          'text-text-muted hover:text-primary': $route.path !== item.path,
        }"
      >
        <MdiIcon :path="item.icon" size="24" />
        <span class="mt-1">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import MdiIcon from '@/components/common/MdiIcon.vue';

defineProps({
  navigationItems: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
/* Scoped styles can be added here if needed */
</style>
