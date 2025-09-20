<template>
  <q-layout view="lHh Lpr lFf" class="landing-layout">
    <q-page-container class="landing-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// Layout pulito senza header, sidebar o menu per la landing page
</script>

<style lang="scss" scoped>
.landing-layout {
  background: var(--mcf-bg-primary);
  min-height: 100vh;
}

.landing-page-container {
  background: transparent;
  padding: 0;
  margin: 0;
}
</style>