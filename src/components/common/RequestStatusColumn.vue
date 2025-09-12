<template>
  <div class="flex flex-col bg-surface-dark rounded-lg h-full">
    <div class="p-4 border-b border-gray-700 flex items-center justify-between" :class="colorClass.border">
      <div class="flex items-center gap-3">
        <MdiIcon :path="icon" size="22" :class="colorClass.text" />
        <h3 class="font-semibold text-text-light">{{ title }}</h3>
      </div>
      <span class="px-2 py-0.5 rounded-full text-xs font-bold" :class="colorClass.bg_light + ' ' + colorClass.text">
        {{ items.length }}
      </span>
    </div>
    <div class="flex-grow p-2 space-y-2 overflow-y-auto" style="max-height: 400px;">
      <div
        v-for="item in items"
        :key="item.id"
        class="p-3 bg-background-dark rounded-lg cursor-pointer hover:bg-primary/10"
        @click="$emit('view', item)"
      >
        <p class="font-semibold text-sm text-text-light">{{ item.patientName }}</p>
        <p class="text-xs text-text-muted">{{ item.requestType || item.testType || item.xrayType }}</p>
        <p v-if="item.resultDetails" class="text-xs text-text-muted italic mt-1">
          {{ item.resultDetails }}
        </p>
        <p class="text-right text-xs text-text-muted mt-1">{{ formatTime(item.timestamp) }}</p>
      </div>
      <div v-if="items.length === 0" class="p-4 text-center text-sm text-text-muted">
        No items in this category.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import MdiIcon from '@/components/common/MdiIcon.vue';

const props = defineProps({
  title: String,
  icon: String,
  items: Array,
  color: String,
});

defineEmits(['view']);

const colorClasses = {
  blue: {
    text: 'text-blue-400',
    bg_light: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  yellow: {
    text: 'text-yellow-400',
    bg_light: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  green: {
    text: 'text-green-400',
    bg_light: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
  red: {
    text: 'text-red-400',
    bg_light: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
};

const colorClass = computed(() => colorClasses[props.color] || colorClasses.blue);

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
