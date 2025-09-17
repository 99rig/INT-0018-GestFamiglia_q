<template>
  <q-header elevated class="mcf-header">
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
          <q-icon 
            name="account_balance_wallet" 
            size="32px" 
            class="q-mr-sm text-white"
          />
          <span class="text-h6 text-white">My Crazy Family</span>
        </div>
      </q-toolbar-title>

      <q-btn-dropdown 
        flat 
        dense 
        round 
        icon="account_circle"
        class="text-white"
      >
        <q-list>
          <q-item clickable v-close-popup @click="logout">
            <q-item-section>
              <q-item-label>Logout</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const emit = defineEmits(['toggle-sidebar'])

function toggleSidebar() {
  emit('toggle-sidebar')
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>