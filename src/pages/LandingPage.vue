<template>
  <q-page class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <!-- Logo e titolo principale -->
        <div class="hero-header">
          <div class="app-icon">
            <q-icon name="account_balance_wallet" size="80px" color="white" />
          </div>
          <h1 class="hero-title">My Crazy Family</h1>
          <p class="hero-subtitle">La gestione delle spese familiari non è mai stata così semplice</p>
        </div>

        <!-- CTA principale -->
        <div class="hero-cta">
          <q-btn
            size="lg"
            class="download-btn primary-btn"
            icon="download"
            label="Scarica l'App"
            @click="downloadApp"
            no-caps
          />
          <q-btn
            size="lg"
            class="demo-btn secondary-btn"
            icon="login"
            label="Prova la Demo"
            @click="goToLogin"
            outline
            no-caps
          />
        </div>

        <!-- Features preview -->
        <div class="hero-features">
          <div class="feature-badge">
            <q-icon name="family_restroom" size="20px" />
            <span>Condividi con la famiglia</span>
          </div>
          <div class="feature-badge">
            <q-icon name="trending_up" size="20px" />
            <span>Budget intelligenti</span>
          </div>
          <div class="feature-badge">
            <q-icon name="schedule" size="20px" />
            <span>Spese ricorrenti</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-container">
        <h2 class="section-title">Perché scegliere My Crazy Family?</h2>

        <div class="features-grid">
          <!-- Feature 1: Gestione Familiare -->
          <div class="feature-card mcf-feature-family">
            <div class="feature-badge">Famiglia</div>
            <div class="feature-header">
              <div class="feature-icon-container">
                <div class="feature-icon">
                  <q-icon name="family_restroom" size="56px" />
                </div>
              </div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Gestione Familiare</h3>
              <p class="feature-description">
                Coinvolgi tutti i membri della famiglia. Condividi spese, budget e pianificazioni in tempo reale con ruoli personalizzati.
              </p>
              <div class="feature-highlights">
                <div class="highlight-item">
                  <q-icon name="person_add" size="16px" />
                  <span>Profili multipli per ogni membro</span>
                </div>
                <div class="highlight-item">
                  <q-icon name="sync" size="16px" />
                  <span>Sincronizzazione istantanea</span>
                </div>
                <div class="highlight-item">
                  <q-icon name="admin_panel_settings" size="16px" />
                  <span>Sistema ruoli e permessi</span>
                </div>
              </div>
            </div>
            <div class="feature-stats">
              <div class="stat-mini">
                <span class="stat-number">∞</span>
                <span class="stat-label">Membri</span>
              </div>
              <div class="stat-mini">
                <span class="stat-number">100%</span>
                <span class="stat-label">Condiviso</span>
              </div>
            </div>
          </div>

          <!-- Feature 2: Budget Intelligenti -->
          <div class="feature-card mcf-feature-budget">
            <div class="feature-badge">Smart</div>
            <div class="feature-header">
              <div class="feature-icon-container">
                <div class="feature-icon">
                  <q-icon name="insights" size="56px" />
                </div>
              </div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Budget Intelligenti</h3>
              <p class="feature-description">
                Sistema completo di categorizzazione con 15 categorie principali e 93 sottocategorie per una gestione precisa e dettagliata.
              </p>
              <div class="feature-highlights">
                <div class="highlight-item">
                  <q-icon name="category" size="16px" />
                  <span>15 categorie + 93 sottocategorie</span>
                </div>
                <div class="highlight-item">
                  <q-icon name="auto_graph" size="16px" />
                  <span>Monitoraggio automatico progressi</span>
                </div>
                <div class="highlight-item">
                  <q-icon name="assessment" size="16px" />
                  <span>Report e analytics avanzati</span>
                </div>
              </div>
            </div>
            <div class="feature-stats">
              <div class="stat-mini">
                <span class="stat-number">15</span>
                <span class="stat-label">Categorie</span>
              </div>
              <div class="stat-mini">
                <span class="stat-number">93</span>
                <span class="stat-label">Sottocategorie</span>
              </div>
            </div>
          </div>

          <!-- Feature 3: Spese Ricorrenti -->
          <div class="feature-card mcf-feature-recurring">
            <div class="feature-badge">Auto</div>
            <div class="feature-header">
              <div class="feature-icon-container">
                <div class="feature-icon">
                  <q-icon name="event_repeat" size="56px" />
                </div>
              </div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Spese Ricorrenti</h3>
              <p class="feature-description">
                Automatizza completamente bollette, rate e abbonamenti. Il sistema genera automaticamente le scadenze e ti avvisa in tempo.
              </p>
              <div class="feature-highlights">
                <div class="highlight-item">
                  <q-icon name="auto_awesome" size="16px" />
                  <span>Generazione automatica pianificata</span>
                </div>
                <div class="highlight-item">
                  <q-icon name="notifications_active" size="16px" />
                  <span>Notifiche e promemoria integrati</span>
                </div>
                <div class="highlight-item">
                  <q-icon name="payments" size="16px" />
                  <span>Gestione rate multiple e dilazioni</span>
                </div>
              </div>
            </div>
            <div class="feature-stats">
              <div class="stat-mini">
                <span class="stat-number">7</span>
                <span class="stat-label">Frequenze</span>
              </div>
              <div class="stat-mini">
                <span class="stat-number">∞</span>
                <span class="stat-label">Rate</span>
              </div>
            </div>
          </div>

          <!-- Feature 4: Mobile First -->
          <div class="feature-card mcf-feature-mobile">
            <div class="feature-badge">Mobile</div>
            <div class="feature-header">
              <div class="feature-icon-container">
                <div class="feature-icon">
                  <q-icon name="phone_android" size="56px" />
                </div>
              </div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Mobile First</h3>
              <p class="feature-description">
                App nativa Android con scanner ricevute, OCR avanzato e aggiornamenti automatici OTA. Tutto sempre a portata di mano.
              </p>
              <div class="feature-highlights">
                <div class="highlight-item">
                  <q-icon name="document_scanner" size="16px" />
                  <span>Scanner ricevute con AI integrata</span>
                </div>
                <div class="highlight-item">
                  <q-icon name="text_fields" size="16px" />
                  <span>OCR automatico per digitazione</span>
                </div>
                <div class="highlight-item">
                  <q-icon name="system_update_alt" size="16px" />
                  <span>Aggiornamenti OTA automatici</span>
                </div>
              </div>
            </div>
            <div class="feature-stats">
              <div class="stat-mini">
                <span class="stat-number">APK</span>
                <span class="stat-label">Nativo</span>
              </div>
              <div class="stat-mini">
                <span class="stat-number">OTA</span>
                <span class="stat-label">Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="stats-section">
      <div class="section-container">
        <h2 class="section-title white">La famiglia ideale per le tue finanze</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">15+</div>
            <div class="stat-label">Categorie Predefinite</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">100%</div>
            <div class="stat-label">Condivisione Familiare</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Sincronizzazione</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">∞</div>
            <div class="stat-label">Spese Tracciabili</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-content">
          <h2 class="cta-title">Pronto per iniziare?</h2>
          <p class="cta-description">
            Unisciti alle famiglie che hanno già scelto My Crazy Family per organizzare le loro finanze.
          </p>
          <div class="cta-buttons">
            <q-btn
              size="xl"
              class="download-btn-large primary-btn"
              icon="download"
              label="Scarica Ora Gratis"
              @click="downloadApp"
              no-caps
            />
            <div class="cta-note">
              <q-icon name="info" size="16px" />
              <span>Disponibile per Android • Aggiornamenti automatici</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Download Dialog -->
    <q-dialog v-model="showDownloadDialog" persistent>
      <q-card class="download-card">
        <q-card-section class="text-center">
          <q-icon name="download" size="64px" color="primary" />
          <div class="text-h5 q-mt-md">Scarica My Crazy Family</div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            Versione corrente: v{{ latestVersion }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="download-options">
            <q-btn
              class="full-width q-mb-sm"
              color="primary"
              icon="android"
              label="Download APK"
              @click="downloadAPK"
              :loading="downloading"
              no-caps
            />
            <div class="text-caption text-center text-grey-6">
              File APK per dispositivi Android<br>
              Dimensione: ~15MB
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Chiudi" @click="showDownloadDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const showDownloadDialog = ref(false)
const downloading = ref(false)
const latestVersion = ref('1.0.17')

const downloadApp = () => {
  showDownloadDialog.value = true
}

const downloadAPK = async () => {
  downloading.value = true
  try {
    // Simula il download dell'APK
    const link = document.createElement('a')
    link.href = '/api/updates/latest/download/'
    link.download = `MyCrazyFamily-v${latestVersion.value}.apk`
    link.click()

    $q.notify({
      type: 'positive',
      message: 'Download avviato!',
      caption: 'Controlla la cartella Download'
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
  // Animazioni di entrata
  const elements = document.querySelectorAll('.feature-card, .stat-item')
  elements.forEach((el, index) => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(30px)'
    setTimeout(() => {
      el.style.transition = 'all 0.6s ease'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, index * 100)
  })
})
</script>

<style lang="scss" scoped>
.landing-page {
  min-height: 100vh;
  overflow-x: hidden;
}

// === HERO SECTION ===
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-tertiary) 50%, var(--mcf-secondary) 100%);
  position: relative;

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

.hero-content {
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 0 20px;
  z-index: 1;
  position: relative;
}

.hero-header {
  margin-bottom: 40px;
}

.app-icon {
  margin-bottom: 20px;

  .q-icon {
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  }
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.hero-subtitle {
  font-size: 1.25rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

.hero-cta {
  margin-bottom: 48px;
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn {
  background: var(--mcf-accent) !important;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;

  &:hover {
    background: var(--mcf-accent-hover) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
  }
}

.secondary-btn {
  border: 2px solid white;
  color: white !important;

  &:hover {
    background: rgba(255,255,255,0.1);
    transform: translateY(-2px);
  }
}

.hero-features {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 500;
}

// === FEATURES SECTION ===
.features-section {
  padding: 120px 0;
  background: var(--mcf-bg-primary);
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 64px;
  color: var(--mcf-text-primary);

  &.white {
    color: white;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  align-items: start;
}

.feature-card {
  background: var(--mcf-bg-surface);
  border: 2px solid var(--mcf-border-light);
  border-radius: var(--mcf-radius-2xl);
  box-shadow: var(--mcf-shadow-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  position: relative;
  height: auto;

  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--mcf-shadow-xl);
    border-color: var(--mcf-primary);
  }
}

// Colori specifici per ogni card
.mcf-feature-family {
  &:hover {
    border-color: var(--mcf-primary);
    .feature-icon { color: var(--mcf-primary); }
  }
  .feature-icon { color: var(--mcf-primary); }
  .feature-badge {
    background: var(--mcf-primary) !important;
    color: white !important;
  }
}

.mcf-feature-budget {
  &:hover {
    border-color: var(--mcf-secondary);
    .feature-icon { color: var(--mcf-secondary); }
  }
  .feature-icon { color: var(--mcf-secondary); }
  .feature-badge {
    background: var(--mcf-secondary) !important;
    color: white !important;
  }
}

.mcf-feature-recurring {
  &:hover {
    border-color: var(--mcf-accent);
    .feature-icon { color: var(--mcf-accent); }
  }
  .feature-icon { color: var(--mcf-accent); }
  .feature-badge {
    background: var(--mcf-accent) !important;
    color: white !important;
  }
}

.mcf-feature-mobile {
  &:hover {
    border-color: var(--mcf-tertiary);
    .feature-icon { color: var(--mcf-tertiary); }
  }
  .feature-icon { color: var(--mcf-tertiary); }
  .feature-badge {
    background: var(--mcf-tertiary) !important;
    color: white !important;
  }
}

.feature-header {
  padding: 32px 32px 24px 32px;
  text-align: center;
  position: relative;
}

.feature-icon-container {
  position: relative;
  display: inline-block;
  z-index: 2;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  margin: 0 auto 16px auto;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.feature-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 100;
  border: 2px solid rgba(255,255,255,0.2);
}

.feature-content {
  padding: 0 32px 24px 32px;
  text-align: left;
}

.feature-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--mcf-text-primary);
  text-align: center;
}

.feature-description {
  color: var(--mcf-text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
  font-size: 15px;
}

.feature-highlights {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--mcf-text-primary);
  font-size: 14px;
  font-weight: 500;

  .q-icon {
    color: var(--mcf-text-muted);
    flex-shrink: 0;
  }

  span {
    line-height: 1.4;
  }
}

.feature-stats {
  display: flex;
  gap: 16px;
  padding: 16px 32px;
  background: var(--mcf-bg-primary);
  border-top: 1px solid var(--mcf-border-light);
}

.stat-mini {
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--mcf-text-primary);
  display: block;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: var(--mcf-text-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

// === STATS SECTION ===
.stats-section {
  padding: 120px 0;
  background: linear-gradient(45deg, var(--mcf-secondary) 0%, var(--mcf-tertiary) 100%);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-top: 64px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(45deg, var(--mcf-accent) 0%, var(--mcf-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.9;
}

// === CTA SECTION ===
.cta-section {
  padding: 120px 0;
  background: var(--mcf-text-primary);
  color: white;
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 24px;
}

.cta-description {
  font-size: 1.25rem;
  opacity: 0.8;
  margin-bottom: 48px;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.download-btn-large {
  padding: 16px 48px !important;
  font-size: 1.1rem !important;
}

.cta-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.7;
}

// === DOWNLOAD DIALOG ===
.download-card {
  min-width: 400px;

  @media (max-width: 500px) {
    min-width: 90vw;
  }
}

.download-options {
  padding: 16px 0;
}

// === RESPONSIVE ===
@media (max-width: 768px) {
  .hero-cta {
    flex-direction: column;
    align-items: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .feature-card {
    margin: 0 auto;
    max-width: 100%;
  }

  .feature-badge {
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    font-size: 10px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }

  .section-title {
    font-size: 2rem;
  }

  .stat-number {
    font-size: 3rem;
  }
}

// === ANIMATIONS ===
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card,
.stat-item {
  animation: fadeInUp 0.6s ease forwards;
}
</style>