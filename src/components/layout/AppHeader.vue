<template>
  <q-header class="mcf-header">
    <q-toolbar class="mcf-toolbar">
      <!-- Brand Section with Clickable Icon -->
      <div class="mcf-brand">
        <q-btn
          flat
          dense
          round
          class="mcf-brand-icon-btn"
          @click="toggleSidebar"
          aria-label="Menu"
        >
          <q-icon
            name="account_balance_wallet"
            size="28px"
            class="text-white"
          />
        </q-btn>
        <div class="mcf-brand-text">
          <div class="mcf-brand-title">My Crazy Family</div>
          <div class="mcf-brand-subtitle">Gestione Spese</div>
        </div>
      </div>

      <!-- Logout Button -->
      <q-btn
        flat
        dense
        icon="logout"
        label="Logout"
        class="mcf-logout-btn"
        @click="logout"
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
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 50%, var(--mcf-tertiary) 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mcf-toolbar {
  padding: 0 16px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.mcf-brand {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;

  .mcf-brand-icon-btn {
    color: white;
    margin-right: 12px;
    border-radius: 50%;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .mcf-brand-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;

    .mcf-brand-title {
      color: white;
      font-family: var(--mcf-logo-font, 'Fredoka One'), cursive;
      font-size: 20px;
      font-weight: 400; // Fredoka One è già bold di natura
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .mcf-brand-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-family: 'Nunito', sans-serif;
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.3px;
    }
  }
}

.mcf-logout-btn {
  color: white;
  border-radius: 8px;
  transition: all 0.2s ease;
  padding: 8px 16px;
  font-weight: 500;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: none;
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
