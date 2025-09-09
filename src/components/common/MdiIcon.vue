<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" :fill="color">
    <path :d="path" />
  </svg>
</template>

<script setup>
defineProps({
  path: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})
</script>