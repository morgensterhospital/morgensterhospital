<template>
  <div class="auth-layout">
    <router-view />
  </div>
</template>

<script setup>
// This is a simple layout for authentication pages like login, register, etc.
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
