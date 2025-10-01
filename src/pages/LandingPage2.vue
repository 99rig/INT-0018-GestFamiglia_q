<template>
  <div class="modern-landing">
    <!-- Navigation -->
    <nav class="modern-nav" :class="{ 'nav-scrolled': isScrolled }">
      <div class="nav-container">
        <div class="nav-brand">
          <q-icon name="account_balance_wallet" size="32px" />
          <span class="brand-text">MyCrisisFamily</span>
        </div>
        <div class="nav-actions">
          <q-btn flat label="Demo" @click="goToLogin" class="nav-btn" />
          <q-btn
            unelevated
            label="Usa Gratis"
            @click="goToLogin"
            class="nav-cta-btn"
            icon="launch"
          />
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-modern">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <div class="hero-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge">
            <q-icon name="family_restroom" size="16px" />
            <span>100% Gratuito • Desktop & Mobile</span>
          </div>

          <h1 class="hero-title">
            La <span class="gradient-text">famiglia</span> al centro<br>
            delle tue <span class="gradient-text">finanze</span>
          </h1>

          <p class="hero-description">
            Trasforma il modo in cui la tua famiglia gestisce le spese.
            Pianifica, condividi e controlla il budget familiare con un'app web
            gratuita, ottimizzata per desktop e mobile. Nessun download richiesto!
          </p>

          <div class="hero-actions">
            <q-btn
              size="lg"
              unelevated
              label="Inizia Subito Gratis"
              @click="goToLogin"
              class="hero-primary-btn"
              icon="rocket_launch"
            />
            <q-btn
              size="lg"
              outline
              label="Scarica APK"
              @click="downloadApp"
              class="hero-secondary-btn"
              icon="android"
            />
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">1000+</div>
              <div class="stat-label">Famiglie</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">€50K+</div>
              <div class="stat-label">Risparmiati</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">4.8★</div>
              <div class="stat-label">Rating</div>
            </div>
          </div>

          <!-- Security Badge -->
          <div class="security-badge">
            <q-icon name="security" size="20px" />
            <div class="security-text">
              <strong>100% Sicuro e Privato</strong><br>
              <small>Crittografia end-to-end • Conforme GDPR • Zero accesso ai tuoi dati</small>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="phone-mockup">
            <div class="phone-screen">
              <div class="app-preview">
                <div class="app-header">
                  <div class="app-title">MyCrisisFamily</div>
                  <q-icon name="account_balance_wallet" size="24px" />
                </div>
                <div class="app-content">
                  <div class="expense-card">
                    <div class="expense-info">
                      <q-icon name="shopping_cart" size="20px" />
                      <span>Spesa Supermercato</span>
                    </div>
                    <div class="expense-amount">€45.50</div>
                  </div>
                  <div class="expense-card">
                    <div class="expense-info">
                      <q-icon name="local_gas_station" size="20px" />
                      <span>Benzina</span>
                    </div>
                    <div class="expense-amount">€60.00</div>
                  </div>
                  <div class="budget-progress">
                    <div class="progress-label">Budget Mensile</div>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: 65%"></div>
                    </div>
                    <div class="progress-text">€650 / €1000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-modern">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Tutto quello che serve alla tua famiglia</h2>
          <p class="section-subtitle">
            Funzionalità pensate per semplificare la gestione delle spese familiari
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.id">
            <div class="feature-icon">
              <q-icon :name="feature.icon" size="32px" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-modern">
      <div class="cta-container">
        <div class="cta-content">
          <h2 class="cta-title">Pronto per iniziare?</h2>
          <p class="cta-description">
            Unisciti alle famiglie che hanno già scelto MyCrisisFamily.<br>
            <small>App iOS in arrivo prossimamente!</small>
          </p>
          <div class="cta-buttons">
            <q-btn
              size="xl"
              unelevated
              label="Inizia Ora Gratis"
              @click="goToLogin"
              class="cta-btn"
              icon="launch"
            />
            <q-btn
              size="lg"
              outline
              label="Scarica APK Android"
              @click="downloadApp"
              class="cta-btn-secondary"
              icon="android"
            />
          </div>
          <div class="platform-info">
            <div class="platform-item">
              <q-icon name="computer" size="20px" />
              <span>Desktop</span>
            </div>
            <div class="platform-item">
              <q-icon name="smartphone" size="20px" />
              <span>Mobile Web</span>
            </div>
            <div class="platform-item">
              <q-icon name="install_mobile" size="20px" />
              <span>PWA</span>
            </div>
            <div class="platform-item">
              <q-icon name="android" size="20px" />
              <span>Android APK</span>
            </div>
            <div class="platform-item coming-soon">
              <q-icon name="phone_iphone" size="20px" />
              <span>iOS <small>(WIP)</small></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="modern-footer">
      <div class="footer-container">
        <div class="footer-content">
          <!-- Credits -->
          <div class="footer-credits">
            <div class="credits-text">
              Creato con <q-icon name="favorite" color="red" size="16px" /> da
              <a href="https://mumble.group" target="_blank" class="mumble-link">
                Mumble Group
              </a>
            </div>
          </div>

          <!-- Disclaimers -->
          <div class="footer-disclaimers">
            <div class="disclaimer-section">
              <h4 class="disclaimer-title">Informazioni Legali</h4>
              <div class="disclaimer-grid">
                <div class="disclaimer-item">
                  <strong>Privacy GDPR:</strong> Crittografia end-to-end. Noi non possiamo accedere ai contenuti dei tuoi dati personali.
                </div>
                <div class="disclaimer-item">
                  <strong>Sicurezza:</strong> Tutti i dati sono crittografati e salvati in server super-sicuri conformi alle normative europee.
                </div>
                <div class="disclaimer-item">
                  <strong>Zero Accesso:</strong> I tuoi dati finanziari sono visibili solo a te e alla tua famiglia. Nessun altro può leggerli.
                </div>
                <div class="disclaimer-item">
                  <strong>Gratuito:</strong> L'app è completamente gratuita, senza costi nascosti o abbonamenti.
                </div>
              </div>
            </div>

            <div class="disclaimer-section">
              <h4 class="disclaimer-title">Termini di Utilizzo</h4>
              <div class="disclaimer-text">
                <p>
                  Utilizzando MyCrisisFamily accetti i nostri termini di servizio.
                  L'app è fornita "così com'è" senza garanzie esplicite o implicite.
                  Non siamo responsabili per eventuali perdite di dati o danni derivanti dall'uso dell'applicazione.
                </p>
                <p>
                  I dati inseriti nell'app sono di tua esclusiva responsabilità.
                  Ti consigliamo di effettuare backup regolari delle tue informazioni importanti.
                </p>
              </div>
            </div>
          </div>

          <!-- Copyright -->
          <div class="footer-copyright">
            <div class="copyright-text">
              © {{ currentYear }} MyCrisisFamily - Tutti i diritti riservati
            </div>
            <div class="version-info">
              Versione {{ latestVersion }} • Sviluppato con Vue.js e Quasar
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Download Dialog -->
    <q-dialog v-model="showDownloadDialog" persistent>
      <q-card class="download-card">
        <q-card-section class="text-center">
          <q-icon name="download" size="64px" color="primary" />
          <div class="text-h5 q-mt-md">Scarica MyCrisisFamily</div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            Versione corrente: v{{ latestVersion }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="download-options">
            <q-btn
              class="full-width q-mb-md"
              color="primary"
              icon="launch"
              label="Usa Subito nel Browser"
              @click="goToLogin"
              no-caps
            />
            <q-btn
              class="full-width q-mb-md"
              color="green"
              icon="android"
              label="Scarica APK Android"
              @click="downloadAPK"
              :loading="downloading"
              no-caps
            />
            <q-btn
              class="full-width q-mb-sm"
              color="secondary"
              icon="install_mobile"
              label="Installa come PWA"
              @click="installPWA"
              outline
              no-caps
            />
            <div class="text-caption text-center text-grey-6 q-mt-md">
              <strong>APK Android:</strong> Migliore esperienza mobile<br>
              <strong>iOS:</strong> App nativa in arrivo prossimamente
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Chiudi" @click="showDownloadDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const showDownloadDialog = ref(false)
const downloading = ref(false)
const latestVersion = ref('1.0.17')
const isScrolled = ref(false)
const deferredPrompt = ref(null)
const currentYear = new Date().getFullYear()

const features = ref([
  {
    id: 1,
    icon: 'family_restroom',
    title: 'Gestione Familiare',
    description: 'Coinvolgi tutti i membri della famiglia nella gestione delle spese con ruoli personalizzati.'
  },
  {
    id: 2,
    icon: 'trending_up',
    title: 'Budget Intelligenti',
    description: 'Crea budget personalizzati e monitora le spese in tempo reale con analisi avanzate.'
  },
  {
    id: 3,
    icon: 'devices',
    title: 'Multi-Piattaforma',
    description: 'Desktop, mobile web, PWA e APK Android disponibili. App iOS in arrivo!'
  },
  {
    id: 4,
    icon: 'insights',
    title: 'Report Dettagliati',
    description: 'Visualizza grafici e statistiche per capire dove vanno i tuoi soldi.'
  },
  {
    id: 5,
    icon: 'security',
    title: 'Privacy e Sicurezza GDPR',
    description: 'Crittografia end-to-end, zero accesso ai tuoi dati da parte nostra. Conforme alle normative europee sulla privacy.'
  },
  {
    id: 6,
    icon: 'free_breakfast',
    title: '100% Gratuito',
    description: 'Nessun costo nascosto, nessun abbonamento. Tutte le funzionalità sempre gratuite.'
  }
])

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const installPWA = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      $q.notify({
        type: 'positive',
        message: 'PWA installata con successo!',
        caption: 'Ora puoi usare l\'app dal tuo desktop'
      })
    }
    deferredPrompt.value = null
  } else {
    $q.notify({
      type: 'info',
      message: 'PWA già installata o non supportata',
      caption: 'Usa il browser per accedere all\'app'
    })
  }
}

const downloadApp = () => {
  showDownloadDialog.value = true
}

const downloadAPK = async () => {
  downloading.value = true
  try {
    // Usa lo stesso endpoint del SettingsPage
    const apkUrl = '/api/updates/latest/download/'

    // Apri il link di download in una nuova finestra
    window.open(apkUrl, '_blank')

    $q.notify({
      type: 'positive',
      message: 'Download APK avviato!',
      caption: 'Installa l\'app per una migliore esperienza mobile'
    })

    showDownloadDialog.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel download',
      caption: 'Riprova più tardi'
    })
  } finally {
    downloading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
  })

  // Animazioni di entrata
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
      }
    })
  })

  document.querySelectorAll('.feature-card').forEach((el) => {
    observer.observe(el)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.modern-landing {
  min-height: 100vh;
  overflow-x: hidden;
  background: #fafbfc;
}

// === NAVIGATION ===
.modern-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &.nav-scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--mcf-primary);
  font-weight: 700;
  font-size: 20px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  color: #64748b;
  font-weight: 500;

  &:hover {
    color: var(--mcf-primary);
  }
}

.nav-cta-btn {
  background: linear-gradient(135deg, var(--mcf-primary), var(--mcf-secondary));
  color: white;
  font-weight: 600;
  border-radius: 12px;
  padding: 8px 20px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(var(--mcf-primary-rgb), 0.3);
  }
}

// === HERO SECTION ===
.hero-modern {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  padding-top: 70px;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(var(--mcf-primary-rgb), 0.05) 0%,
    rgba(var(--mcf-secondary-rgb), 0.05) 50%,
    rgba(var(--mcf-tertiary-rgb), 0.05) 100%);
}

.hero-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mcf-primary), var(--mcf-secondary));
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;

  &.shape-1 {
    width: 300px;
    height: 300px;
    top: 10%;
    right: 10%;
    animation-delay: 0s;
  }

  &.shape-2 {
    width: 200px;
    height: 200px;
    bottom: 20%;
    left: 5%;
    animation-delay: 2s;
  }

  &.shape-3 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 30%;
    animation-delay: 4s;
  }
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  max-width: 600px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(var(--mcf-primary-rgb), 0.1);
  color: var(--mcf-primary);
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: #1e293b;
  margin-bottom: 24px;

  .gradient-text {
    background: linear-gradient(135deg, var(--mcf-primary), var(--mcf-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.hero-primary-btn {
  background: linear-gradient(135deg, var(--mcf-primary), var(--mcf-secondary));
  color: white;
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 32px;
  font-size: 16px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(var(--mcf-primary-rgb), 0.4);
  }
}

.hero-secondary-btn {
  border: 2px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 32px;
  font-size: 16px;

  &:hover {
    border-color: var(--mcf-primary);
    color: var(--mcf-primary);
    transform: translateY(-2px);
  }
}

.hero-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--mcf-primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  margin-top: 4px;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 16px;
  padding: 16px 20px;
  margin-top: 32px;
  color: #059669;
}

.security-text {
  flex: 1;

  strong {
    font-size: 14px;
    font-weight: 700;
    color: #047857;
  }

  small {
    font-size: 12px;
    color: #065f46;
    opacity: 0.9;
    line-height: 1.4;
  }
}

// === PHONE MOCKUP ===
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-mockup {
  width: 280px;
  height: 560px;
  background: #1e293b;
  border-radius: 40px;
  padding: 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: #64748b;
    border-radius: 2px;
  }
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 30px;
  overflow: hidden;
}

.app-preview {
  padding: 20px;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.app-title {
  font-weight: 700;
  color: var(--mcf-primary);
  font-size: 18px;
}

.expense-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.expense-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-weight: 500;
}

.expense-amount {
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
}

.budget-progress {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.progress-label {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--mcf-primary), var(--mcf-secondary));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

// === FEATURES SECTION ===
.features-modern {
  padding: 120px 0;
  background: white;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(30px);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: rgba(var(--mcf-primary-rgb), 0.2);
  }

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(var(--mcf-primary-rgb), 0.1), rgba(var(--mcf-secondary-rgb), 0.1));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: var(--mcf-primary);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.feature-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #64748b;
}

// === CTA SECTION ===
.cta-modern {
  padding: 120px 0;
  background: linear-gradient(135deg, var(--mcf-primary), var(--mcf-secondary));
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 50%);
  }
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.cta-content {
  color: white;
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 24px;
}

.cta-description {
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
}

.cta-btn {
  background: white;
  color: var(--mcf-primary);
  font-weight: 700;
  border-radius: 16px;
  padding: 16px 40px;
  font-size: 18px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  }
}

.cta-btn-secondary {
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 16px;

  &:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
}

.platform-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  opacity: 0.9;
}

.platform-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;

  &.coming-soon {
    opacity: 0.6;

    small {
      font-size: 11px;
      opacity: 0.8;
    }
  }
}

// === FOOTER ===
.modern-footer {
  background: #1e293b;
  color: white;
  padding: 60px 0 30px;
  margin-top: 80px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.footer-credits {
  text-align: center;
  padding-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.credits-text {
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mumble-link {
  color: var(--mcf-primary);
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;

  &:hover {
    color: var(--mcf-secondary);
    text-decoration: underline;
  }
}

.footer-disclaimers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

.disclaimer-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.disclaimer-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--mcf-primary);
}

.disclaimer-grid {
  display: grid;
  gap: 12px;
}

.disclaimer-item {
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;

  strong {
    color: white;
    font-weight: 600;
  }
}

.disclaimer-text {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.9;

  p {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.footer-copyright {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.copyright-text {
  font-size: 16px;
  font-weight: 600;
}

.version-info {
  font-size: 14px;
  opacity: 0.7;
}

// === DOWNLOAD DIALOG ===
.download-card {
  min-width: 400px;
  border-radius: 20px;

  @media (max-width: 500px) {
    min-width: 90vw;
  }
}

.download-options {
  padding: 16px 0;
}

// === ANIMATIONS ===
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

// === RESPONSIVE ===
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 60px;
    text-align: center;
  }

  .hero-title {
    font-size: 3rem;
  }

  .phone-mockup {
    width: 240px;
    height: 480px;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }

  .nav-actions {
    gap: 8px;
  }

  .nav-cta-btn {
    padding: 6px 16px;
    font-size: 14px;
  }

  .hero-container {
    padding: 0 16px;
    gap: 40px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-stats {
    gap: 20px;
  }

  .section-container {
    padding: 0 16px;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .feature-card {
    padding: 32px 24px;
  }

  .cta-container {
    padding: 0 16px;
  }

  .cta-title {
    font-size: 2.5rem;
  }

  .phone-mockup {
    width: 200px;
    height: 400px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .nav-brand {
    font-size: 18px;
  }
}
</style>
