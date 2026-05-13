<script setup>
import Cabecera from "./Cabecera.vue";
import Footer from "./Footer.vue";
</script>

<template>
  <div id="mis-reservas-app">
    <Cabecera />
    <main class="mis-reservas-main"></main>
    <Footer />
  </div>
</template>

<style scoped>
#mis-reservas-app {
  --cream: #f5f0e8;
  --dark: #1a1410;
  --gold: #c9963a;

  min-height: 100vh;
  background: var(--cream);
}

.mis-reservas-main {
  min-height: calc(100vh - 72px);
  padding-top: 72px;
}
</style>
