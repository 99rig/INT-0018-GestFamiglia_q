<template>
  <q-header class="mcf-header">
    <q-toolbar class="mcf-toolbar">
      <!-- Menu Button -->
      <q-btn
        flat
        dense
        round
        icon="menu"
        class="mcf-menu-btn"
        @click="toggleSidebar"
        aria-label="Menu"
      />

      <!-- Brand Section Centered -->
      <div class="mcf-brand">
        <q-icon
          name="account_balance_wallet"
          size="28px"
          style="color: #ffffff"
        />
        <div class="mcf-brand-text">
          <div class="mcf-brand-title">My Crazy Family</div>
          <div class="mcf-brand-subtitle">Gestione Spese</div>
        </div>
      </div>

      <!-- Logout Icon Button -->
      <q-btn
        flat
        dense
        round
        icon="logout"
        class="mcf-logout-btn"
        @click="logout"
        aria-label="Logout"
      />
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

<style lang="scss" scoped>
.mcf-header {
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 16px 16px;
}

.mcf-toolbar {
  padding: 0 16px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.mcf-menu-btn {
  color: #ffffff;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.mcf-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  min-width: 0;

  .mcf-brand-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;

    .mcf-brand-title {
      color: #ffffff;
      font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.5px;
    }

    .mcf-brand-subtitle {
      color: #ffffff;
      font-family: 'Nunito', sans-serif;
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.3px;
      opacity: 0.9;
    }
  }
}

.mcf-logout-btn {
  color: #ffffff;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

// Prevent button deformation on hover
:deep(.q-btn) {
  &:hover {
    transform: none !important;
  }
}

:deep(.q-btn-dropdown) {
  &:hover {
    transform: none !important;
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .mcf-brand-subtitle {
    display: none;
  }

  .mcf-brand-title {
    font-size: 18px; // Manteniamo leggibile con Fredoka One
  }

  .mcf-brand-icon-btn {
    margin-right: 8px;
  }
}

@media (max-width: 400px) {
  .mcf-toolbar {
    padding: 0 12px;
  }

  .mcf-logout-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .mcf-brand-title {
    font-size: 16px; // Fredoka One rimane leggibile anche piccolo
  }
}

@media (max-width: 320px) {
  .mcf-toolbar {
    padding: 0 8px;
  }

  .mcf-logout-btn {
    padding: 4px 8px;
    font-size: 12px;
  }

  .mcf-brand-title {
    font-size: 15px; // Dimensione minima per Fredoka One
  }
}
</style>
