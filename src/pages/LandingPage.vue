<template>
  <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-logo">
            <div class="logo-circle">
              <q-icon name="account_balance_wallet" size="60px" color="white" />
            </div>
          </div>
          <h1 class="hero-title">My Crazy Family</h1>
          <p class="hero-subtitle">Gestisci le spese familiari in modo semplice e divertente</p>
          <div class="hero-buttons">
            <q-btn
              label="Inizia Gratis"
              @click="goToRegister"
              class="primary-btn"
              size="lg"
              no-caps
            />
            <q-btn
              label="Accedi"
              @click="goToLogin"
              flat
              class="secondary-btn"
              size="lg"
              no-caps
            />
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="container">
          <h2 class="section-title">Perché scegliere My Crazy Family?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <q-icon name="receipt_long" size="48px" color="primary" />
              <h3>Traccia le Spese</h3>
              <p>Registra facilmente tutte le spese familiari con pochi tap</p>
            </div>
            <div class="feature-card">
              <q-icon name="camera_alt" size="48px" color="primary" />
              <h3>Scansiona Scontrini</h3>
              <p>Fotografa gli scontrini e l'app estrae automaticamente i dati</p>
            </div>
            <div class="feature-card">
              <q-icon name="pie_chart" size="48px" color="primary" />
              <h3>Budget Intelligente</h3>
              <p>Imposta budget mensili e ricevi avvisi quando ti avvicini al limite</p>
            </div>
            <div class="feature-card">
              <q-icon name="group" size="48px" color="primary" />
              <h3>Condividi in Famiglia</h3>
              <p>Tutti i membri della famiglia possono vedere e gestire le spese</p>
            </div>
            <div class="feature-card">
              <q-icon name="lock" size="48px" color="primary" />
              <h3>Sicuro e Privato</h3>
              <p>I tuoi dati sono protetti e accessibili solo con PIN personale</p>
            </div>
            <div class="feature-card">
              <q-icon name="trending_up" size="48px" color="primary" />
              <h3>Report Dettagliati</h3>
              <p>Visualizza statistiche e trend delle spese nel tempo</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works-section">
        <div class="container">
          <h2 class="section-title">Come funziona?</h2>
          <div class="steps-container">
            <div class="step">
              <div class="step-number">1</div>
              <h3>Crea un Account</h3>
              <p>Registrati gratuitamente in pochi secondi</p>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <h3>Invita la Famiglia</h3>
              <p>Condividi il codice invito con i tuoi familiari</p>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <h3>Inizia a Tracciare</h3>
              <p>Aggiungi spese manualmente o scansiona gli scontrini</p>
            </div>
            <div class="step">
              <div class="step-number">4</div>
              <h3>Monitora e Risparmia</h3>
              <p>Tieni sotto controllo il budget familiare</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <h2>Pronto a gestire meglio le spese familiari?</h2>
          <p>Unisciti a migliaia di famiglie che già usano My Crazy Family</p>
          <q-btn
            label="Registrati Ora"
            @click="goToRegister"
            class="cta-btn"
            size="lg"
            no-caps
          />
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 My Crazy Family. Tutti i diritti riservati.</p>
        </div>
      </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style lang="scss" scoped>
.landing-page {
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.hero-content {
  max-width: 600px;
}

.hero-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.logo-circle {
  width: 120px;
  height: 120px;
  background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.1) 25%,
    var(--mcf-primary) 50%,
    var(--mcf-secondary) 75%,
    rgba(0, 0, 0, 0.1) 100%
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 2px 8px rgba(255, 255, 255, 0.3),
    inset 0 -2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(15px);
}

.hero-title {
  font-family: 'Fredoka One', cursive;
  font-size: 48px;
  color: white;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  @media (max-width: 600px) {
    font-size: 36px;
  }
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.6;

  @media (max-width: 600px) {
    font-size: 18px;
  }
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn {
  background: white !important;
  color: var(--mcf-primary) !important;
  padding: 12px 32px;
  font-weight: 600;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
}

.secondary-btn {
  color: white !important;
  padding: 12px 32px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;

  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(255, 255, 255, 0.5);
  }
}

/* Features Section */
.features-section {
  padding: 80px 20px;
  background: #f8f9fa;
}

.section-title {
  font-size: 36px;
  text-align: center;
  margin-bottom: 60px;
  color: #333;
  font-weight: 600;

  @media (max-width: 600px) {
    font-size: 28px;
    margin-bottom: 40px;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  h3 {
    font-size: 22px;
    margin: 20px 0 15px 0;
    color: #333;
  }

  p {
    font-size: 16px;
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
}

/* How It Works Section */
.how-it-works-section {
  padding: 80px 20px;
  background: white;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.step {
  text-align: center;
  padding: 20px;

  .step-number {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px auto;
    font-size: 24px;
    font-weight: bold;
    color: white;
    box-shadow: 0 4px 15px rgba(35, 157, 176, 0.3);
  }

  h3 {
    font-size: 20px;
    margin-bottom: 10px;
    color: #333;
  }

  p {
    font-size: 16px;
    color: #666;
    line-height: 1.6;
  }
}

/* CTA Section */
.cta-section {
  padding: 100px 20px;
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 100%);
  text-align: center;
  color: white;

  h2 {
    font-size: 36px;
    margin-bottom: 20px;

    @media (max-width: 600px) {
      font-size: 28px;
    }
  }

  p {
    font-size: 20px;
    margin-bottom: 40px;
    opacity: 0.9;

    @media (max-width: 600px) {
      font-size: 18px;
    }
  }
}

.cta-btn {
  background: white !important;
  color: var(--mcf-primary) !important;
  padding: 16px 48px;
  font-weight: 600;
  font-size: 18px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
}

/* Footer */
.footer {
  padding: 40px 20px;
  background: #333;
  color: #999;
  text-align: center;

  p {
    margin: 0;
    font-size: 14px;
  }
}
</style>