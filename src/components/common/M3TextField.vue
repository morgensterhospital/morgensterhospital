<template>
  <div class="m3-text-field" :class="fieldClass">
    <div class="m3-text-field__container">
      <input
        v-if="type !== 'textarea'"
        :id="fieldId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        class="m3-text-field__input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        v-bind="$attrs"
      />
      <textarea
        v-else
        :id="fieldId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        class="m3-text-field__input m3-text-field__textarea"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        v-bind="$attrs"
      />
      
      <label v-if="label" :for="fieldId" class="m3-text-field__label">
        {{ label }}
        <span v-if="required" class="m3-text-field__required">*</span>
      </label>
      
      <div class="m3-text-field__outline">
        <div class="m3-text-field__leading"></div>
        <div class="m3-text-field__notch">
          <div class="m3-text-field__notch-leading"></div>
          <div class="m3-text-field__notch-middle"></div>
          <div class="m3-text-field__notch-trailing"></div>
        </div>
        <div class="m3-text-field__trailing"></div>
      </div>
    </div>
    
    <div v-if="helperText || error" class="m3-text-field__supporting-text">
      <span v-if="error" class="m3-text-field__error">{{ error }}</span>
      <span v-else-if="helperText" class="m3-text-field__helper">{{ helperText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  variant: {
    type: String,
    default: 'outlined', // filled, outlined
    validator: (value) => ['filled', 'outlined'].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 4
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input'])

const focused = ref(false)
const fieldId = ref(`m3-text-field-${Math.random().toString(36).substr(2, 9)}`)

const fieldClass = computed(() => {
  return [
    `m3-text-field--${props.variant}`,
    `m3-text-field--${props.size}`,
    {
      'm3-text-field--focused': focused.value,
      'm3-text-field--disabled': props.disabled,
      'm3-text-field--error': props.error,
      'm3-text-field--filled': props.modelValue && props.modelValue.toString().length > 0
    }
  ]
})

const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  emit('input', event)
}

const handleFocus = (event) => {
  focused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  focused.value = false
  emit('blur', event)
}
</script>

<style scoped>
.m3-text-field {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  font-family: 'Roboto', sans-serif;
}

.m3-text-field__container {
  position: relative;
  display: flex;
  align-items: center;
}

.m3-text-field__input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: #1F2937;
  z-index: 1;
}

.m3-text-field__textarea {
  resize: vertical;
  min-height: 80px;
}

.m3-text-field__label {
  position: absolute;
  left: 16px;
  color: #6B7280;
  font-size: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 2;
  background: white;
  padding: 0 4px;
}

.m3-text-field__required {
  color: #DC2626;
}

/* Outlined variant */
.m3-text-field--outlined .m3-text-field__input {
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #D1D5DB;
  transition: border-color 0.2s ease;
}

.m3-text-field--outlined .m3-text-field__label {
  top: -8px;
  font-size: 12px;
  transform: translateY(0);
}

.m3-text-field--outlined:not(.m3-text-field--filled):not(.m3-text-field--focused) .m3-text-field__label {
  top: 16px;
  font-size: 16px;
  background: transparent;
  padding: 0;
}

/* Filled variant */
.m3-text-field--filled .m3-text-field__input {
  padding: 20px 16px 8px;
  border-radius: 4px 4px 0 0;
  background: #F3F4F6;
  border-bottom: 2px solid #D1D5DB;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.m3-text-field--filled .m3-text-field__label {
  top: 8px;
  font-size: 12px;
}

.m3-text-field--filled:not(.m3-text-field--filled):not(.m3-text-field--focused) .m3-text-field__label {
  top: 20px;
  font-size: 16px;
}

/* Sizes */
.m3-text-field--small .m3-text-field__input {
  padding: 12px;
  font-size: 14px;
}

.m3-text-field--small .m3-text-field__label {
  font-size: 14px;
}

.m3-text-field--small.m3-text-field--outlined:not(.m3-text-field--filled):not(.m3-text-field--focused) .m3-text-field__label {
  top: 12px;
}

.m3-text-field--large .m3-text-field__input {
  padding: 20px 16px;
  font-size: 18px;
}

.m3-text-field--large .m3-text-field__label {
  font-size: 18px;
}

.m3-text-field--large.m3-text-field--outlined:not(.m3-text-field--filled):not(.m3-text-field--focused) .m3-text-field__label {
  top: 20px;
}

/* Focus states */
.m3-text-field--focused .m3-text-field__input {
  border-color: #0066B2;
}

.m3-text-field--focused .m3-text-field__label {
  color: #0066B2;
}

.m3-text-field--filled.m3-text-field--focused .m3-text-field__input {
  background: #EBF8FF;
  border-bottom-color: #0066B2;
}

/* Error states */
.m3-text-field--error .m3-text-field__input {
  border-color: #DC2626;
}

.m3-text-field--error .m3-text-field__label {
  color: #DC2626;
}

.m3-text-field--filled.m3-text-field--error .m3-text-field__input {
  background: #FEF2F2;
  border-bottom-color: #DC2626;
}

/* Disabled state */
.m3-text-field--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.m3-text-field--disabled .m3-text-field__input {
  background: #F9FAFB;
  color: #9CA3AF;
}

/* Supporting text */
.m3-text-field__supporting-text {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  padding: 0 16px;
}

.m3-text-field__error {
  color: #DC2626;
}

.m3-text-field__helper {
  color: #6B7280;
}
</style>