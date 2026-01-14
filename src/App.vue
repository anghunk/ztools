<template>
  <div class="app-container">
    <AppAside />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import AppAside from '@/components/AppAside.vue'

export default {
  name: 'App',
  components: { AppAside }
}
</script>
