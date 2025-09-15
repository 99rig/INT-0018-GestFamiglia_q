<template>
  <q-page class="flex flex-center mumble-page-container">
    <div class="text-center q-pa-lg">
      <div class="mumble-card q-pa-xl">
        <img
          alt="Mumble logo"
          src="/mumble-logo.svg"
          style="width: 250px; height: auto; margin-bottom: 2rem"
        />
        <h4 class="text-h4 q-mt-md q-mb-sm text-mumble-primary">Mumble App</h4>
        <p class="text-subtitle1 text-mumble-accent q-mb-lg">
          Powered by Mumble Projects
        </p>
        <div class="q-mt-lg">
          <q-btn 
            class="mumble-btn-primary" 
            label="Get Started" 
            size="lg"
            unelevated
            rounded
            style="padding: 12px 48px"
          />
        </div>
        <div class="q-mt-md">
          <q-btn 
            class="mumble-btn-accent" 
            label="Learn More" 
            size="md"
            outline
            rounded
            style="padding: 8px 32px"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
//
</script>

<style scoped>
.flex-center {
  min-height: 100vh;
}
</style>