<template>
  <button
    :class="buttonClass"
    :disabled="disabled"
    @click="handleClick"
    v-bind="$attrs"
  >
    <mdi-icon v-if="icon" :path="icon" :size="iconSize" />
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import MdiIcon from './MdiIcon.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'filled', // filled, outlined, text
    validator: (value) => ['filled', 'outlined', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  color: {
    type: String,
    default: 'primary' // primary, secondary, error, success
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: null
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClass = computed(() => {
  return [
    'm3-button',
    `m3-button--${props.variant}`,
    `m3-button--${props.size}`,
    `m3-button--${props.color}`,
    {
      'm3-button--disabled': props.disabled,
      'm3-button--full-width': props.fullWidth,
      'm3-button--icon': props.icon && !$slots.default
    }
  ]
})

const iconSize = computed(() => {
  const sizes = {
    small: 16,
    medium: 20,
    large: 24
  }
  return sizes[props.size] || 20
})

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.m3-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 24px;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  overflow: hidden;
}

.m3-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: inherit;
}

.m3-button:hover:before {
  opacity: 0.08;
}

.m3-button:focus:before {
  opacity: 0.12;
}

.m3-button:active:before {
  opacity: 0.16;
}

/* Sizes */
.m3-button--small {
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  min-width: 64px;
}

.m3-button--medium {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  min-width: 80px;
}

.m3-button--large {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
  min-width: 96px;
}

/* Variants */
.m3-button--filled {
  background-color: #0066B2;
  color: white;
}

.m3-button--outlined {
  background-color: transparent;
  color: #0066B2;
  border: 1px solid #0066B2;
}

.m3-button--text {
  background-color: transparent;
  color: #0066B2;
}

/* Color variations */
.m3-button--secondary.m3-button--filled {
  background-color: #14B8A6;
  color: white;
}

.m3-button--secondary.m3-button--outlined {
  border-color: #14B8A6;
  color: #14B8A6;
}

.m3-button--secondary.m3-button--text {
  color: #14B8A6;
}

.m3-button--error.m3-button--filled {
  background-color: #DC2626;
  color: white;
}

.m3-button--error.m3-button--outlined {
  border-color: #DC2626;
  color: #DC2626;
}

.m3-button--error.m3-button--text {
  color: #DC2626;
}

.m3-button--success.m3-button--filled {
  background-color: #16A34A;
  color: white;
}

.m3-button--success.m3-button--outlined {
  border-color: #16A34A;
  color: #16A34A;
}

.m3-button--success.m3-button--text {
  color: #16A34A;
}

/* Full width */
.m3-button--full-width {
  width: 100%;
}

/* Icon only */
.m3-button--icon {
  width: 40px;
  min-width: 40px;
  padding: 0;
  border-radius: 50%;
}

.m3-button--icon.m3-button--small {
  width: 32px;
  min-width: 32px;
}

.m3-button--icon.m3-button--large {
  width: 48px;
  min-width: 48px;
}

/* Disabled state */
.m3-button--disabled {
  opacity: 0.38;
  cursor: not-allowed;
  pointer-events: none;
}

.m3-button--disabled:before {
  display: none;
}
</style>