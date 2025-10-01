<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-illustration q-mb-lg">
        <q-icon name="search_off" class="error-icon" />
        <div class="error-number">404</div>
      </div>

      <div class="error-content q-mb-xl">
        <h1 class="error-title q-mb-md">Pagina non trovata</h1>
        <p class="error-message q-mb-lg q-px-md">
          Sembra che la pagina che stai cercando non esista o sia stata spostata.
        </p>

        <div class="column items-center q-gutter-y-sm">
          <q-btn
            unelevated
            rounded
            color="primary"
            icon="home"
            label="Torna alla Home"
            no-caps
            size="lg"
            to="/"
            class="q-px-xl"
          />
          <q-btn
            flat
            rounded
            color="primary"
            icon="arrow_back"
            label="Indietro"
            no-caps
            size="lg"
            @click="goBack"
            class="q-px-xl"
          />
        </div>
      </div>

      <div class="error-suggestions q-mt-xl q-pt-xl">
        <p class="suggestions-title q-mb-md">Pagine utili:</p>
        <div class="row justify-center q-gutter-md flex-wrap">
          <router-link to="/dashboard" class="suggestion-link">
            <q-icon name="dashboard" />
            <span>Dashboard</span>
          </router-link>
          <router-link to="/expenses" class="suggestion-link">
            <q-icon name="receipt_long" />
            <span>Spese</span>
          </router-link>
          <router-link to="/spending-plans" class="suggestion-link">
            <q-icon name="event_note" />
            <span>Piani di Spesa</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
}

.error-container {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.error-illustration {
  position: relative;
}

.error-icon {
  font-size: 120px;
  color: #bae6fd;
  opacity: 0.5;

  @media (max-width: 768px) {
    font-size: 80px;
  }
}

.error-number {
  font-size: 180px;
  font-weight: 900;
  color: #0c4a6e;
  line-height: 1;
  margin-top: -60px;
  text-shadow: 0 4px 20px rgba(12, 74, 110, 0.1);

  @media (max-width: 768px) {
    font-size: 100px;
    margin-top: -40px;
  }
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #0c4a6e;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
}

.error-message {
  font-size: 1.125rem;
  color: #475569;
  line-height: 1.6;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
}

.error-suggestions {
  border-top: 2px solid #bae6fd;
}

.suggestions-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.suggestion-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: white;
  border: 2px solid #e0f2fe;
  border-radius: 12px;
  text-decoration: none;
  color: #0c4a6e;
  transition: all 0.2s ease;
  min-width: 120px;

  .q-icon {
    font-size: 32px;
    color: #0ea5e9;
  }

  span {
    font-size: 0.875rem;
    font-weight: 600;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(12, 74, 110, 0.15);
    border-color: #0ea5e9;
    background: #f0f9ff;
  }

  @media (max-width: 768px) {
    min-width: 100px;
    padding: 16px;

    .q-icon {
      font-size: 28px;
    }

    span {
      font-size: 0.8rem;
    }
  }
}
</style>
