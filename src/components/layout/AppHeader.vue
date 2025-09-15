<template>
  <q-header elevated class="mumble-header">
    <q-toolbar>
      <q-btn 
        flat 
        dense 
        round 
        icon="menu" 
        aria-label="Menu" 
        @click="toggleSidebar" 
      />

      <q-toolbar-title> 
        <div class="row items-center">
          <img 
            src="/mumble-logo-white.svg" 
            alt="Mumble" 
            style="height: 32px; margin-right: 12px" 
          />
        </div>
      </q-toolbar-title>

      <div>v1.0.0</div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
const emit = defineEmits(['toggle-sidebar'])

function toggleSidebar() {
  emit('toggle-sidebar')
}
</script>