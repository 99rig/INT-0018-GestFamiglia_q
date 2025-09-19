<template>
  <q-page class="mcf-page-container-fullwidth">
    <div class="mcf-settings-page-content">
      <!-- Modern Header -->
      <div class="mcf-settings-header">
        <div class="mcf-settings-illustration">
          <div class="mcf-settings-icon-container">
            <q-icon name="settings" class="mcf-settings-icon" />
            <div class="mcf-settings-gears">
              <div class="mcf-gear mcf-gear-1"></div>
              <div class="mcf-gear mcf-gear-2"></div>
            </div>
          </div>
        </div>

        <div class="mcf-settings-content">
          <h2 class="mcf-settings-title">Impostazioni</h2>
          <p class="mcf-settings-description">
            Configura l'app, visualizza informazioni di sistema e gestisci le preferenze.
          </p>
        </div>
      </div>

      <!-- Settings Sections -->
      <div class="mcf-settings-sections">

        <!-- Family Management -->
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="family_restroom" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Gestione Famiglia</h3>
          </div>

          <div class="mcf-family-section">
            <!-- Current Family Info -->
            <div v-if="currentFamily" class="mcf-family-info">
              <div class="mcf-family-header">
                <div class="mcf-family-main">
                  <div class="mcf-family-name">{{ currentFamily.name }}</div>
                  <div class="mcf-family-members">{{ currentFamily.members?.length || 0 }} membri</div>
                </div>
                <q-chip
                  color="primary"
                  text-color="white"
                  icon="shield"
                  :label="currentFamily.created_by === authStore.user?.id ? 'Amministratore' : 'Membro'"
                />
              </div>

              <!-- Family Members -->
              <div class="mcf-family-members-list">
                <div class="mcf-members-header">
                  <span>Membri della famiglia</span>
                </div>
                <div
                  v-for="member in currentFamily.members_detail"
                  :key="member.id"
                  class="mcf-member-item"
                >
                  <q-avatar size="32px" class="mcf-member-avatar">
                    <q-icon name="person" />
                  </q-avatar>
                  <div class="mcf-member-info">
                    <div class="mcf-member-name">{{ member.first_name }} {{ member.last_name }}</div>
                    <div class="mcf-member-email">{{ member.email }}</div>
                  </div>
                  <q-chip
                    v-if="member.id === currentFamily.created_by"
                    size="sm"
                    color="orange"
                    text-color="white"
                    icon="star"
                    label="Admin"
                  />
                </div>
              </div>

              <!-- Family Actions -->
              <div class="mcf-family-actions">
                <q-btn
                  class="mcf-btn-primary"
                  icon="person_add"
                  label="Invita Membro"
                  @click="showInviteDialog = true"
                  no-caps
                  unelevated
                />
                <q-btn
                  class="mcf-btn-secondary"
                  icon="mail"
                  label="Inviti Inviati"
                  @click="loadFamilyInvitations"
                  no-caps
                  outline
                />
                <q-btn
                  v-if="currentFamily.created_by === authStore.user?.id"
                  class="mcf-btn-secondary"
                  icon="settings"
                  label="Gestisci Famiglia"
                  @click="showManageFamilyDialog = true"
                  no-caps
                  outline
                />
              </div>

              <!-- Invitations List -->
              <div v-if="familyInvitations && familyInvitations.length > 0" class="mcf-invitations-section">
                <div class="mcf-invitations-header">
                  <span>Inviti inviati</span>
                  <q-btn
                    flat
                    round
                    dense
                    icon="refresh"
                    @click="loadFamilyInvitations"
                    :loading="invitationsLoading"
                  >
                    <q-tooltip>Aggiorna inviti</q-tooltip>
                  </q-btn>
                </div>
                <div class="mcf-invitations-list">
                  <div
                    v-for="invitation in familyInvitations"
                    :key="invitation.id"
                    class="mcf-invitation-item"
                  >
                    <div class="mcf-invitation-info">
                      <div class="mcf-invitation-email">{{ invitation.email }}</div>
                      <div class="mcf-invitation-details">
                        <span class="mcf-invitation-role">{{ invitation.family_role }}</span>
                        <span class="mcf-invitation-date">{{ formatDate(invitation.created_at) }}</span>
                      </div>
                    </div>
                    <div class="mcf-invitation-status">
                      <q-chip
                        :color="getStatusColor(invitation.status)"
                        text-color="white"
                        :label="getStatusLabel(invitation.status)"
                        size="sm"
                      />
                      <div v-if="invitation.status === 'pending'" class="mcf-invitation-expires">
                        Scade: {{ formatDate(invitation.expires_at) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Family State -->
            <div v-else class="mcf-no-family">
              <!-- Received Invitations -->
              <div v-if="receivedInvitations && receivedInvitations.length > 0" class="mcf-received-invitations">
                <div class="mcf-invitations-header">
                  <q-icon name="mail" class="mcf-section-icon" />
                  <span class="mcf-section-title">Inviti Ricevuti</span>
                  <q-btn
                    flat
                    round
                    dense
                    icon="refresh"
                    @click="loadReceivedInvitations"
                    :loading="receivedInvitationsLoading"
                  >
                    <q-tooltip>Aggiorna inviti ricevuti</q-tooltip>
                  </q-btn>
                </div>
                <div class="mcf-received-invitations-list">
                  <div
                    v-for="invitation in receivedInvitations"
                    :key="invitation.id"
                    class="mcf-received-invitation-item"
                  >
                    <div class="mcf-invitation-info">
                      <div class="mcf-invitation-family">
                        <q-icon name="family_restroom" class="text-primary" />
                        <div class="mcf-invitation-family-info">
                          <span class="mcf-invitation-family-name">{{ invitation.family.name }}</span>
                          <span class="mcf-invitation-invited-by">
                            Invitato da {{ invitation.invited_by_first_name }} {{ invitation.invited_by_last_name }}
                          </span>
                        </div>
                      </div>
                      <div class="mcf-invitation-details">
                        <span class="mcf-invitation-role">
                          <strong>Ruolo:</strong> {{ invitation.family_role }}
                        </span>
                        <span class="mcf-invitation-from-detail">
                          <strong>Da:</strong> {{ invitation.invited_by_first_name }} {{ invitation.invited_by_last_name }}
                        </span>
                        <span class="mcf-invitation-code">Codice: {{ invitation.token }}</span>
                      </div>
                    </div>
                    <div class="mcf-invitation-actions">
                      <q-btn
                        class="mcf-btn-primary"
                        icon="check"
                        label="Accetta"
                        @click="acceptInvitation(invitation)"
                        :loading="acceptingInvitation === invitation.id"
                        no-caps
                        unelevated
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="mcf-no-family-icon">
                <q-icon name="family_restroom" size="48px" class="text-grey-4" />
              </div>
              <div class="mcf-no-family-content">
                <h4 class="mcf-no-family-title">Non fai parte di nessuna famiglia</h4>
                <p class="mcf-no-family-description">
                  Crea una nuova famiglia o unisciti a una esistente usando un codice invito.
                </p>
                <div class="mcf-no-family-actions">
                  <q-btn
                    class="mcf-btn-primary"
                    icon="add"
                    label="Crea Famiglia"
                    @click="showCreateFamilyDialog = true"
                    no-caps
                    unelevated
                  />
                  <q-btn
                    class="mcf-btn-secondary"
                    icon="vpn_key"
                    label="Unisciti con Codice"
                    @click="showJoinFamilyDialog = true"
                    no-caps
                    outline
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Information -->
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="info" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Informazioni Sistema</h3>
          </div>

          <div class="mcf-info-grid">
            <div class="mcf-info-card">
              <div class="mcf-info-header">
                <q-icon name="dns" class="mcf-info-icon" />
                <span class="mcf-info-label">Server API</span>
                <q-btn
                  round
                  flat
                  size="sm"
                  icon="refresh"
                  color="primary"
                  @click="refreshNetworkInfo"
                  :loading="refreshing"
                  class="mcf-refresh-btn"
                >
                  <q-tooltip>Aggiorna informazioni</q-tooltip>
                </q-btn>
              </div>
              <div class="mcf-info-value" :class="serverClass">{{ apiServer }}</div>
              <div class="mcf-info-status">
                <q-icon name="circle" :color="serverStatus.color" />
                <span :class="'text-' + serverStatus.color">{{ serverStatus.text }}</span>
              </div>
            </div>

            <div class="mcf-info-card">
              <div class="mcf-info-header">
                <q-icon name="wifi" class="mcf-info-icon" />
                <span class="mcf-info-label">IP Pubblico</span>
              </div>
              <div class="mcf-info-value">{{ publicIP }}</div>
            </div>

            <div class="mcf-info-card">
              <div class="mcf-info-header">
                <q-icon name="devices" class="mcf-info-icon" />
                <span class="mcf-info-label">IP Dispositivo</span>
              </div>
              <div class="mcf-info-value">{{ deviceIP }}</div>
            </div>

            <div class="mcf-info-card">
              <div class="mcf-info-header">
                <q-icon name="smartphone" class="mcf-info-icon" />
                <span class="mcf-info-label">Piattaforma</span>
              </div>
              <div class="mcf-info-value">{{ platform }}</div>
            </div>

            <div class="mcf-info-card">
              <div class="mcf-info-header">
                <q-icon name="info" class="mcf-info-icon" />
                <span class="mcf-info-label">Versione App</span>
              </div>
              <div class="mcf-info-value">{{ appVersion }}</div>
            </div>

            <!-- Download APK for Android -->
            <div v-if="isAndroidDevice" class="mcf-info-card mcf-download-card">
              <div class="mcf-info-header">
                <q-icon name="android" class="mcf-info-icon" />
                <span class="mcf-info-label">App Android</span>
              </div>
              <div class="mcf-info-value">Migliore esperienza</div>
              <q-btn
                flat
                dense
                color="primary"
                label="Scarica APK"
                icon="download"
                @click="downloadAPK"
                class="mcf-download-btn"
              />
            </div>
          </div>
        </div>

        <!-- Camera Testing -->
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="camera_alt" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Test Fotocamera</h3>
          </div>

          <div class="mcf-camera-section">
            <p class="mcf-section-description">
              Testa la funzionalità della fotocamera posteriore per verificare il corretto funzionamento dello scanner.
            </p>

            <div class="mcf-camera-controls">
              <q-btn
                class="mcf-btn-primary mcf-camera-btn"
                label="Apri Fotocamera"
                icon="camera_alt"
                @click="openBackCamera"
                :loading="cameraLoading"
                no-caps
                unelevated
              />
            </div>

            <!-- Camera preview -->
            <div v-if="showCamera" class="mcf-camera-container">
              <video
                ref="videoElement"
                autoplay
                playsinline
                class="mcf-camera-preview"
              ></video>
              <div class="mcf-camera-actions">
                <q-btn
                  class="mcf-btn-primary"
                  icon="camera"
                  label="Scatta"
                  @click="takePhoto"
                  no-caps
                  unelevated
                />
                <q-btn
                  class="mcf-btn-secondary"
                  icon="close"
                  label="Chiudi"
                  @click="closeCamera"
                  no-caps
                  unelevated
                />
              </div>
            </div>

            <!-- Photo preview -->
            <div v-if="capturedPhoto" class="mcf-photo-container">
              <div class="mcf-photo-header">
                <q-icon name="photo" class="mcf-photo-icon" />
                <span class="mcf-photo-label">Foto Acquisita</span>
              </div>
              <img :src="capturedPhoto" alt="Foto acquisita" class="mcf-captured-photo" />
            </div>
          </div>
        </div>

        <!-- App Updates Section -->
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="system_update" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Aggiornamenti</h3>
          </div>

          <div class="mcf-updates-section">
            <p class="mcf-section-description">
              Controlla e installa gli aggiornamenti dell'applicazione per avere sempre le ultime funzionalità.
            </p>

            <div class="mcf-update-controls">
              <q-btn
                class="mcf-btn-primary mcf-update-btn"
                label="Controlla Aggiornamenti"
                icon="system_update"
                @click="checkForUpdates"
                :loading="updateChecking"
                no-caps
                unelevated
              />
            </div>

            <div v-if="currentVersion" class="mcf-version-info">
              <div class="mcf-version-current">
                <q-icon name="info" class="mcf-version-icon" />
                <span class="mcf-version-text">
                  Versione corrente: v{{ currentVersion.name }} ({{ currentVersion.code }})
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Font Settings Section -->
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="text_fields" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Impostazioni Font</h3>
          </div>

          <div class="mcf-font-section">
            <p class="mcf-section-description">
              Personalizza i font dell'applicazione per migliorare la tua esperienza di lettura.
            </p>

            <!-- Logo Font Selection -->
            <div class="mcf-font-group">
              <h4 class="mcf-font-group-title">
                <q-icon name="account_balance_wallet" class="mcf-font-group-icon" />
                Font Logo "My Crazy Family"
              </h4>

              <div class="mcf-font-preview-container">
                <div class="mcf-font-preview" :style="{ fontFamily: selectedLogoFont }">
                  My Crazy Family
                </div>
              </div>

              <div class="mcf-font-options">
                <q-btn-toggle
                  v-model="selectedLogoFont"
                  toggle-color="primary"
                  :options="logoFontOptions"
                  class="mcf-font-toggle"
                  @update:model-value="updateLogoFont"
                />
              </div>
            </div>

            <!-- App Font Selection -->
            <div class="mcf-font-group">
              <h4 class="mcf-font-group-title">
                <q-icon name="article" class="mcf-font-group-icon" />
                Font Applicazione
              </h4>

              <div class="mcf-font-preview-container">
                <div class="mcf-font-preview mcf-app-font-preview" :style="{ fontFamily: selectedAppFont }">
                  <div class="mcf-preview-title">Titolo Esempio</div>
                  <div class="mcf-preview-text">Questo è un esempio di testo dell'applicazione con il font selezionato.</div>
                  <div class="mcf-preview-small">Testo piccolo e dettagli</div>
                </div>
              </div>

              <div class="mcf-font-options">
                <q-btn-toggle
                  v-model="selectedAppFont"
                  toggle-color="primary"
                  :options="appFontOptions"
                  class="mcf-font-toggle"
                  @update:model-value="updateAppFont"
                />
              </div>
            </div>

            <!-- Reset Button -->
            <div class="mcf-font-reset">
              <q-btn
                flat
                color="secondary"
                icon="refresh"
                label="Ripristina Font Predefiniti"
                @click="resetFonts"
                class="mcf-reset-btn"
              />
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Family Management Dialogs -->

    <!-- Create Family Dialog -->
    <q-dialog
      v-model="showCreateFamilyDialog"
      persistent
      :full-width="$q.screen.lt.md"
    >
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 400px; max-width: 500px;'">
        <q-card-section>
          <div class="text-h6">Crea Nuova Famiglia</div>
          <div class="text-caption text-grey-6">
            Crea una famiglia per condividere le spese con i tuoi cari
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="createFamily" class="q-gutter-md">
            <q-input
              v-model="newFamily.name"
              label="Nome Famiglia *"
              required
              outlined
              placeholder="es. Famiglia Serra, Famiglia Rossi..."
              :rules="[val => val && val.length > 0 || 'Nome famiglia richiesto']"
            />

            <q-input
              v-model="newFamily.description"
              label="Descrizione (opzionale)"
              outlined
              type="textarea"
              rows="2"
              placeholder="Una breve descrizione della famiglia..."
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" v-close-popup @click="resetFamilyForms" />
          <q-btn
            flat
            label="Crea Famiglia"
            color="primary"
            @click="createFamily"
            :loading="familyLoading"
            :disable="!newFamily.name"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Join Family Dialog -->
    <q-dialog
      v-model="showJoinFamilyDialog"
      persistent
      :full-width="$q.screen.lt.md"
    >
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 400px; max-width: 500px;'">
        <q-card-section>
          <div class="text-h6">Unisciti a una Famiglia</div>
          <div class="text-caption text-grey-6">
            Inserisci il codice invito che hai ricevuto
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="joinFamily" class="q-gutter-md">
            <q-input
              v-model="joinFamilyCode"
              label="Codice Invito *"
              required
              outlined
              placeholder="es. FAM-ABC123"
              :rules="[val => val && val.length > 0 || 'Codice invito richiesto']"
              mask="AAA-AAAAAA"
              uppercase
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" v-close-popup @click="resetFamilyForms" />
          <q-btn
            flat
            label="Unisciti"
            color="primary"
            @click="joinFamily"
            :loading="familyLoading"
            :disable="!joinFamilyCode"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Invite Member Dialog -->
    <q-dialog
      v-model="showInviteDialog"
      persistent
      :full-width="$q.screen.lt.md"
    >
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 400px; max-width: 500px;'">
        <q-card-section>
          <div class="text-h6">Invita Membro</div>
          <div class="text-caption text-grey-6">
            Genera un codice invito per aggiungere un nuovo membro alla famiglia
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="inviteCode" class="mcf-invite-code-display">
            <div class="mcf-invite-header">
              <q-icon name="vpn_key" class="mcf-invite-icon" />
              <span class="mcf-invite-label">Codice Invito Generato</span>
            </div>
            <div class="mcf-invite-code">{{ inviteCode }}</div>
            <div class="mcf-invite-actions">
              <q-btn
                icon="content_copy"
                label="Copia"
                color="primary"
                outline
                @click="copyInviteCode"
                class="q-mr-sm"
              />
              <q-btn
                icon="share"
                label="Condividi"
                color="secondary"
                outline
                @click="shareInviteCode"
              />
            </div>
            <div class="mcf-invite-instructions">
              <p>Condividi questo codice con la persona che vuoi invitare.</p>
              <p class="text-caption text-grey-6">
                Il codice scade tra 7 giorni dalla generazione.
              </p>
            </div>
          </div>

          <div v-else class="mcf-invite-generate">
            <p>Genera un nuovo codice invito per aggiungere un membro alla tua famiglia.</p>

            <q-form @submit.prevent="generateInviteCode" class="q-gutter-md">
              <q-input
                v-model="inviteEmail"
                label="Email del nuovo membro *"
                type="email"
                required
                outlined
                placeholder="es. sara@email.com"
                :rules="[val => val && val.length > 0 || 'Email richiesta']"
              />

              <q-btn
                class="mcf-btn-primary"
                icon="add"
                label="Genera Codice Invito"
                @click="generateInviteCode"
                :loading="familyLoading"
                :disable="!inviteEmail"
                no-caps
                unelevated
              />
            </q-form>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Chiudi" v-close-popup @click="resetInviteDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Manage Family Dialog -->
    <q-dialog
      v-model="showManageFamilyDialog"
      persistent
      :full-width="$q.screen.lt.md"
    >
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 500px; max-width: 600px;'">
        <q-card-section>
          <div class="text-h6">Gestisci Famiglia</div>
          <div class="text-caption text-grey-6">
            Modifica le impostazioni della famiglia
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="updateFamily" class="q-gutter-md">
            <q-input
              v-model="familyEditForm.name"
              label="Nome Famiglia"
              outlined
              :rules="[val => val && val.length > 0 || 'Nome famiglia richiesto']"
            />

            <q-input
              v-model="familyEditForm.description"
              label="Descrizione"
              outlined
              type="textarea"
              rows="2"
            />
          </q-form>

          <div class="mcf-danger-zone">
            <div class="mcf-danger-header">
              <q-icon name="warning" class="mcf-danger-icon" />
              <span class="mcf-danger-title">Zona Pericolosa</span>
            </div>
            <p class="mcf-danger-description">
              Elimina la famiglia. Questa azione non può essere annullata.
            </p>
            <q-btn
              color="red"
              icon="delete"
              label="Elimina Famiglia"
              @click="confirmDeleteFamily"
              outline
              no-caps
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" v-close-popup @click="resetFamilyForms" />
          <q-btn
            flat
            label="Salva Modifiche"
            color="primary"
            @click="updateFamily"
            :loading="familyLoading"
            :disable="!familyEditForm.name"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { updateService } from 'src/services/updateService.js'
import { usersAPI } from 'src/services/api/users.js'
import { useAuthStore } from 'stores/auth.js'
import { useSnackbar } from 'src/composables/useSnackbar'

const $q = useQuasar()
const authStore = useAuthStore()
const snackbar = useSnackbar()

// Camera refs
const videoElement = ref(null)
const showCamera = ref(false)
const cameraLoading = ref(false)
const capturedPhoto = ref(null)
let mediaStream = null

// Update refs
const updateChecking = ref(false)
const currentVersion = ref(null)

// Debug info refs (moved from LoginPage)
const publicIP = ref('Rilevamento...')
const deviceIP = ref('Rilevamento...')
const platform = ref('Sconosciuto')
const appVersion = ref('1.0.22')
const serverStatus = ref({ text: 'Controllo...', color: 'grey' })
const refreshing = ref(false)

// Font settings refs
const selectedLogoFont = ref('Fredoka One')
const selectedAppFont = ref('Nunito')

// Family management refs
const currentFamily = ref(null)
const familyLoading = ref(false)
const showCreateFamilyDialog = ref(false)
const showJoinFamilyDialog = ref(false)
const showInviteDialog = ref(false)
const showManageFamilyDialog = ref(false)
const inviteCode = ref('')
const inviteEmail = ref('')
const joinFamilyCode = ref('')
const familyInvitations = ref([])
const invitationsLoading = ref(false)
const receivedInvitations = ref([])
const receivedInvitationsLoading = ref(false)
const acceptingInvitation = ref(null)

// Family forms
const newFamily = ref({
  name: '',
  description: ''
})

const familyEditForm = ref({
  name: '',
  description: ''
})

// Font options
const logoFontOptions = [
  { label: 'Fredoka One', value: 'Fredoka One' },
  { label: 'Comfortaa', value: 'Comfortaa' },
  { label: 'Quicksand', value: 'Quicksand' },
  { label: 'Poppins', value: 'Poppins' }
]

const appFontOptions = [
  { label: 'Nunito', value: 'Nunito' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Quicksand', value: 'Quicksand' }
]

// Computed properties (moved from LoginPage)
const apiServer = computed(() => {
  const url = process.env.API_BASE_URL || 'http://localhost:8000'
  return url.replace(/^https?:\/\//, '')
})

const serverClass = computed(() => {
  const url = process.env.API_BASE_URL || 'http://localhost:8000'
  return url.includes('localhost') ? 'text-orange-8' : 'text-green-7'
})

const isAndroidDevice = computed(() => {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('android') && (userAgent.includes('mobile') || userAgent.includes('tablet'))
})

onMounted(async () => {
  console.log('🔧 SettingsPage onMounted started')
  console.log('🔧 Auth status:', authStore.isAuthenticated, 'Token:', !!authStore.accessToken)

  // Ottieni versione corrente
  await updateService.init()
  currentVersion.value = updateService.currentVersion

  // Get device info for debugging (moved from LoginPage)
  getDeviceInfo()

  // Load UI preferences (fonts, etc.)
  await loadUIPreferences()

  // Test connection every 30 seconds (less frequent than login page)
  setInterval(testServerConnection, 30000)

  // Add small delay to ensure auth store is properly initialized
  setTimeout(async () => {
    console.log('🔧 After timeout - Auth status:', authStore.isAuthenticated, 'Token:', !!authStore.accessToken)
    // Load family data if authenticated
    if (authStore.isAuthenticated && authStore.accessToken) {
      console.log('🔧 Calling loadCurrentFamily...')
      await loadCurrentFamily()
      // Carica sempre gli inviti ricevuti
      console.log('🔧 Calling loadReceivedInvitations...')
      await loadReceivedInvitations()
    } else {
      console.log('🔧 Not calling loadCurrentFamily - auth issue')
    }
  }, 500) // 500ms delay to ensure token is loaded
})

async function openBackCamera() {
  try {
    cameraLoading.value = true
    capturedPhoto.value = null

    // Request camera permission with back camera preference
    const constraints = {
      video: {
        facingMode: 'environment', // Back camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    }

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    showCamera.value = true

    // Wait for next tick to ensure video element is rendered
    await new Promise(resolve => setTimeout(resolve, 100))

    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream
    }

    snackbar.success('Camera opened successfully')

  } catch (error) {
    console.error('Error accessing camera:', error)
    snackbar.error('Failed to access camera: ' + error.message)
  } finally {
    cameraLoading.value = false
  }
}

function takePhoto() {
  if (!videoElement.value) return

  try {
    const canvas = document.createElement('canvas')
    const video = videoElement.value

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.8)

    snackbar.success('Photo captured successfully')

  } catch (error) {
    console.error('Error taking photo:', error)
    snackbar.error('Failed to capture photo')
  }
}

function closeCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  showCamera.value = false

  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
}

// Controllo manuale aggiornamenti
async function checkForUpdates() {
  updateChecking.value = true
  try {
    await updateService.checkForUpdates(true, true) // Forza la visualizzazione anche se già mostrato
  } finally {
    updateChecking.value = false
  }
}

// Debug functions (moved from LoginPage)
const getDeviceInfo = async () => {
  // Get platform info
  if (window.Capacitor) {
    const { Capacitor } = window
    platform.value = `${Capacitor.getPlatform()} (${Capacitor.isNativePlatform() ? 'Native' : 'Web'})`
  } else {
    platform.value = 'Web Browser'
  }

  // Get public IP
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    publicIP.value = data.ip || 'Sconosciuto'
  } catch {
    publicIP.value = 'Non rilevabile'
  }

  // Get local device IP (approximation)
  try {
    if (window.Capacitor) {
      // For mobile app, try to create a WebRTC connection to detect local IP
      const pc = new RTCPeerConnection({iceServers: []})
      pc.createDataChannel('')
      pc.createOffer().then(offer => pc.setLocalDescription(offer))

      pc.onicecandidate = (ice) => {
        if (ice && ice.candidate && ice.candidate.candidate) {
          const candidate = ice.candidate.candidate
          const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
          if (match && match[1] && !match[1].startsWith('127.')) {
            deviceIP.value = match[1]
            pc.close()
          }
        }
      }

      // Fallback after 2 seconds
      setTimeout(() => {
        if (deviceIP.value === 'Rilevamento...') {
          deviceIP.value = 'Rilevamento fallito'
        }
        pc.close()
      }, 2000)
    } else {
      // For web, show a basic approximation
      deviceIP.value = 'Controlla impostazioni WiFi'
    }
  } catch {
    deviceIP.value = 'Non rilevabile'
  }

  // Test server connection
  testServerConnection()
}

const testServerConnection = async () => {
  serverStatus.value = { text: 'Test...', color: 'orange' }

  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000'
    const testUrl = `${baseUrl}/api/auth/login/`
    const response = await fetch(testUrl, {
      method: 'OPTIONS',
      mode: 'cors'
    })

    if (response.ok || response.status === 200 || response.status === 405) {
      serverStatus.value = { text: 'Connesso', color: 'green' }
    } else {
      serverStatus.value = { text: `Errore ${response.status}`, color: 'red' }
    }
  } catch (error) {
    console.error('Server test error:', error)
    serverStatus.value = { text: 'Non raggiungibile', color: 'red' }
  }
}

const refreshNetworkInfo = async () => {
  refreshing.value = true
  try {
    await getDeviceInfo()
    snackbar.success('Informazioni aggiornate')
  } catch (error) {
    console.error('Error refreshing network info:', error)
    snackbar.error('Errore durante l\'aggiornamento')
  } finally {
    refreshing.value = false
  }
}

const downloadAPK = () => {
  // URL per scaricare l'ultima versione dell'APK
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000'
  const apkUrl = `${baseUrl}/api/updates/latest/download/`

  // Apri il link di download in una nuova finestra
  window.open(apkUrl, '_blank')

  // Mostra un messaggio informativo
  snackbar.info('Download APK avviato. Installa l\'app per una migliore esperienza!')
}

// Font management functions
const updateLogoFont = async (fontFamily) => {
  // Aggiorna il CSS custom property per il logo
  document.documentElement.style.setProperty('--mcf-logo-font', fontFamily)

  // Salva la preferenza nel localStorage (backup)
  localStorage.setItem('mcf-logo-font', fontFamily)

  // Salva nel profilo utente
  await saveUIPreference('logoFont', fontFamily)

  snackbar.success(`Font logo aggiornato: ${fontFamily}`)
}

const updateAppFont = async (fontFamily) => {
  // Aggiorna il CSS custom property per l'app
  document.documentElement.style.setProperty('--mcf-app-font', fontFamily)

  // Salva la preferenza nel localStorage (backup)
  localStorage.setItem('mcf-app-font', fontFamily)

  // Salva nel profilo utente
  await saveUIPreference('appFont', fontFamily)

  snackbar.success(`Font applicazione aggiornato: ${fontFamily}`)
}

// UI Preferences management
const saveUIPreference = async (key, value) => {
  try {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    // Ottieni le preferenze attuali
    const currentPreferences = authStore.user?.profile?.ui_preferences || {}

    // Aggiorna la preferenza specifica
    const updatedPreferences = {
      ...currentPreferences,
      [key]: value
    }

    // Salva nel backend tramite auth store
    await authStore.updateProfile({
      ui_preferences: updatedPreferences
    })

    console.log(`✅ UI preference saved: ${key} = ${value}`)
  } catch (error) {
    console.error('❌ Error saving UI preference:', error)
    // Fallback al localStorage se il salvataggio nel profilo fallisce
    localStorage.setItem(`mcf-${key}`, value)
  }
}

const loadSavedFonts = () => {
  // Load fonts from localStorage as fallback
  const savedLogoFont = localStorage.getItem('mcf-logo-font')
  const savedAppFont = localStorage.getItem('mcf-app-font')

  if (savedLogoFont) {
    selectedLogoFont.value = savedLogoFont
    document.documentElement.style.setProperty('--mcf-logo-font', savedLogoFont)
  }

  if (savedAppFont) {
    selectedAppFont.value = savedAppFont
    document.documentElement.style.setProperty('--mcf-app-font', savedAppFont)
  }

  console.log('✅ UI preferences loaded from localStorage')
}

const loadUIPreferences = async () => {
  try {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated || !authStore.accessToken) {
      // Carica dal localStorage se non autenticato
      loadSavedFonts()
      return
    }

    const preferences = authStore.user?.profile?.ui_preferences || {}

    // Carica font logo
    if (preferences.logoFont) {
      selectedLogoFont.value = preferences.logoFont
      document.documentElement.style.setProperty('--mcf-logo-font', preferences.logoFont)
    }

    // Carica font app
    if (preferences.appFont) {
      selectedAppFont.value = preferences.appFont
      document.documentElement.style.setProperty('--mcf-app-font', preferences.appFont)
    }

    console.log('✅ UI preferences loaded from profile:', preferences)
  } catch (error) {
    console.error('❌ Error loading UI preferences:', error)
    // Fallback al localStorage
    loadSavedFonts()
  }
}

const resetFonts = async () => {
  selectedLogoFont.value = 'Fredoka One'
  selectedAppFont.value = 'Nunito'

  await updateLogoFont('Fredoka One')
  await updateAppFont('Nunito')

  snackbar.info('Font ripristinati ai valori predefiniti')
}

// Family Management Methods
const loadCurrentFamily = async () => {
  // Skip if not authenticated to avoid token errors
  if (!authStore.isAuthenticated || !authStore.accessToken) {
    console.log('Skipping family load - user not authenticated')
    return
  }

  try {
    console.log('🔍 Loading families...')
    const familiesResponse = await usersAPI.getFamilies()
    console.log('🔍 Families received:', familiesResponse)

    // L'API restituisce un oggetto paginato con results
    const families = familiesResponse.results || familiesResponse

    if (families.length > 0) {
      currentFamily.value = families[0] // L'utente può far parte di una sola famiglia
      console.log('✅ Current family set:', currentFamily.value)
    } else {
      console.log('❌ No families found')
      currentFamily.value = null
    }
  } catch (error) {
    console.error('❌ Error loading family:', error)
    // Only log errors that aren't authentication related
    if (error.response?.status !== 401) {
      console.error('Errore nel caricamento della famiglia:', error)
    }
  }
}

const createFamily = async () => {
  if (!newFamily.value.name) return

  familyLoading.value = true
  try {
    const familyData = {
      name: newFamily.value.name,
      description: newFamily.value.description
    }

    const family = await usersAPI.createFamily(familyData)
    currentFamily.value = family

    // Aggiorna i dati utente nell'authStore per includere la famiglia appena creata
    await authStore.refreshUserData()

    snackbar.success('Famiglia creata con successo!')

    showCreateFamilyDialog.value = false
    resetFamilyForms()

  } catch (error) {
    console.error('Errore nella creazione della famiglia:', error)
    snackbar.error(error.response?.data?.detail || 'Errore nella creazione della famiglia')
  } finally {
    familyLoading.value = false
  }
}

const joinFamily = async () => {
  if (!joinFamilyCode.value) return

  familyLoading.value = true
  try {
    const joinData = {
      invite_code: joinFamilyCode.value
    }

    await usersAPI.joinFamily(joinData)
    await loadCurrentFamily() // Ricarica i dati della famiglia

    // Aggiorna i dati utente nell'authStore per includere la famiglia
    await authStore.refreshUserData()

    snackbar.success('Ti sei unito alla famiglia con successo!')

    showJoinFamilyDialog.value = false
    resetFamilyForms()

  } catch (error) {
    console.error('Errore nell\'adesione alla famiglia:', error)
    snackbar.error(error.response?.data?.detail || 'Codice invito non valido o scaduto')
  } finally {
    familyLoading.value = false
  }
}

const generateInviteCode = async () => {
  if (!currentFamily.value || !inviteEmail.value) return

  familyLoading.value = true
  try {
    const invitationData = {
      email: inviteEmail.value,
      family_role: 'familiare'  // Default role for new members
    }

    const invitation = await usersAPI.createFamilyInvitation(invitationData)
    console.log('🔍 Invitation response:', invitation)

    inviteCode.value = invitation.token

    snackbar.success('Codice invito generato!')

  } catch (error) {
    console.error('Errore nella generazione del codice invito:', error)
    snackbar.error('Errore nella generazione del codice invito')
  } finally {
    familyLoading.value = false
  }
}

const copyInviteCode = async () => {
  try {
    await navigator.clipboard.writeText(inviteCode.value)
    snackbar.success('Codice copiato negli appunti!')
  } catch {
    // Fallback per browser che non supportano clipboard API
    snackbar.info(`Codice: ${inviteCode.value}`)
  }
}

const shareInviteCode = async () => {
  const shareData = {
    title: 'Invito Famiglia - My Crazy Family',
    text: `Unisciti alla mia famiglia su My Crazy Family! Usa questo codice: ${inviteCode.value}`,
    url: window.location.origin
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback per desktop
      await copyInviteCode()
    }
  } catch {
    await copyInviteCode()
  }
}

const updateFamily = async () => {
  if (!currentFamily.value || !familyEditForm.value.name) return

  familyLoading.value = true
  try {
    const updatedFamily = await usersAPI.updateFamily(currentFamily.value.id, familyEditForm.value)
    currentFamily.value = updatedFamily

    snackbar.success('Famiglia aggiornata con successo!')

    showManageFamilyDialog.value = false

  } catch (error) {
    console.error('Errore nell\'aggiornamento della famiglia:', error)
    snackbar.error('Errore nell\'aggiornamento della famiglia')
  } finally {
    familyLoading.value = false
  }
}

const confirmDeleteFamily = () => {
  $q.dialog({
    title: 'Elimina Famiglia',
    message: 'Sei sicuro di voler eliminare la famiglia? Questa azione non può essere annullata.',
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(async () => {
    try {
      await usersAPI.deleteFamily(currentFamily.value.id)
      currentFamily.value = null

      snackbar.success('Famiglia eliminata con successo')

      showManageFamilyDialog.value = false

    } catch (error) {
      console.error('Errore nell\'eliminazione della famiglia:', error)
      snackbar.error('Errore nell\'eliminazione della famiglia')
    }
  })
}

const resetFamilyForms = () => {
  newFamily.value = {
    name: '',
    description: ''
  }
  joinFamilyCode.value = ''
  familyEditForm.value = {
    name: '',
    description: ''
  }
}

const resetInviteDialog = () => {
  inviteCode.value = ''
  inviteEmail.value = ''
}

// Family Invitations Management
const loadFamilyInvitations = async () => {
  if (!currentFamily.value) return

  invitationsLoading.value = true
  try {
    const invitations = await usersAPI.getFamilyInvitations()
    familyInvitations.value = invitations.results || invitations
    console.log('✅ Loaded family invitations:', familyInvitations.value)
  } catch (error) {
    console.error('❌ Error loading invitations:', error)
    snackbar.error('Errore nel caricamento degli inviti')
  } finally {
    invitationsLoading.value = false
  }
}

const loadReceivedInvitations = async () => {
  receivedInvitationsLoading.value = true
  try {
    const invitations = await usersAPI.getReceivedInvitations()
    receivedInvitations.value = invitations
    console.log('✅ Loaded received invitations:', receivedInvitations.value)
  } catch (error) {
    console.error('❌ Error loading received invitations:', error)
    snackbar.error('Errore nel caricamento degli inviti ricevuti')
  } finally {
    receivedInvitationsLoading.value = false
  }
}

const acceptInvitation = async (invitation) => {
  acceptingInvitation.value = invitation.id
  try {
    const response = await usersAPI.acceptInvitation(invitation.id)

    snackbar.success(response.detail || 'Invito accettato con successo!')

    // Rimuovi l'invito dalla lista
    receivedInvitations.value = receivedInvitations.value.filter(inv => inv.id !== invitation.id)

    // Aggiorna i dati della famiglia dell'utente
    await authStore.refreshUserData()

    // Ricarica la famiglia corrente
    await loadCurrentFamily()

  } catch (error) {
    console.error('❌ Error accepting invitation:', error)

    const errorMessage = error.response?.data?.detail || 'Errore nell\'accettare l\'invito'

    snackbar.error(errorMessage)
  } finally {
    acceptingInvitation.value = null
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status) => {
  const colors = {
    'pending': 'orange',
    'accepted': 'green',
    'declined': 'red',
    'expired': 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'In Attesa',
    'accepted': 'Accettato',
    'declined': 'Rifiutato',
    'expired': 'Scaduto'
  }
  return labels[status] || status
}


// Cleanup on component unmount
onUnmounted(() => {
  closeCamera()
})
</script>

<style lang="scss" scoped>
/* === MAIN CONTAINER === */
.mcf-settings-page-content {
  width: 100%;
  margin: 0;
  padding: 16px 4px;
  min-height: 100vh;

  @media (min-width: 768px) {
    padding: 24px 8px;
  }

  @media (min-width: 1200px) {
    padding: 24px 8px;
  }
}

.mcf-page-container-fullwidth {
  background-color: var(--mcf-bg-primary);
  min-height: 100vh;
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
}

/* === MODERN HEADER === */
.mcf-settings-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 4px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    padding: 40px 8px;
    margin-bottom: 24px;
  }
}

.mcf-settings-illustration {
  position: relative;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    margin-bottom: 40px;
  }
}

.mcf-settings-icon-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 100%);
  border-radius: 50%;

  @media (min-width: 768px) {
    width: 140px;
    height: 140px;
  }
}

.mcf-settings-icon {
  font-size: 60px;
  color: white;
  z-index: 3;
  animation: rotate 8s linear infinite;

  @media (min-width: 768px) {
    font-size: 70px;
  }
}

.mcf-settings-gears {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.mcf-gear {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }

  &.mcf-gear-1 {
    top: 20%;
    right: 15%;
    animation: rotate 6s linear infinite;
  }

  &.mcf-gear-2 {
    bottom: 25%;
    left: 10%;
    animation: rotate 4s linear infinite reverse;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mcf-settings-content {
  max-width: 600px;
  margin: 0 auto;
}

.mcf-settings-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  margin: 0 0 16px 0;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 36px;
    margin-bottom: 20px;
  }
}

.mcf-settings-description {
  font-size: 16px;
  color: var(--mcf-text-secondary);
  margin: 0;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 18px;
  }
}

/* === SETTINGS SECTIONS === */
.mcf-settings-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    gap: 20px;
  }
}

.mcf-settings-section {
  background: var(--mcf-bg-surface);
  border-radius: 8px;
  box-shadow: var(--mcf-shadow-md);
  padding: 12px;
  margin: 0 2px;

  @media (min-width: 768px) {
    padding: 16px;
    margin: 0 4px;
  }

  @media (min-width: 1200px) {
    padding: 20px;
    margin: 0;
  }
}

.mcf-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    margin-bottom: 32px;
  }
}

.mcf-section-icon {
  font-size: 28px;
  color: var(--mcf-primary);

  @media (min-width: 768px) {
    font-size: 32px;
  }
}

.mcf-section-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }
}

.mcf-section-description {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 15px;
    margin-bottom: 24px;
  }
}

/* === INFO GRID === */
.mcf-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}

.mcf-info-card {
  background: var(--mcf-bg-primary);
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  padding: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--mcf-shadow-sm);
  }

  @media (min-width: 768px) {
    padding: 12px;
  }
}

.mcf-download-card {
  border-color: var(--mcf-primary);
  background: linear-gradient(135deg, var(--mcf-primary-light) 0%, var(--mcf-bg-primary) 100%);
}

.mcf-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.mcf-info-icon {
  font-size: 18px;
  color: var(--mcf-primary);
  margin-right: 8px;
}

.mcf-info-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--mcf-text-secondary);
  flex: 1;

  @media (min-width: 768px) {
    font-size: 14px;
  }
}

.mcf-refresh-btn {
  margin-left: auto;
}

.mcf-info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin-bottom: 4px;
  word-break: break-all;

  @media (min-width: 768px) {
    font-size: 17px;
  }
}

.mcf-info-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;

  @media (min-width: 768px) {
    font-size: 13px;
  }
}

.mcf-download-btn {
  margin-top: 8px;
  font-size: 12px;
  padding: 4px 12px;
}

/* === CAMERA SECTION === */
.mcf-camera-section {
  text-align: center;
}

.mcf-camera-controls {
  margin-bottom: 24px;
}

.mcf-camera-btn {
  padding: 12px 24px;
  font-size: 16px;

  @media (min-width: 768px) {
    padding: 14px 28px;
    font-size: 17px;
  }
}

.mcf-camera-container {
  background: var(--mcf-bg-primary);
  border: 2px solid var(--mcf-primary);
  border-radius: 8px;
  padding: 8px;
  margin-top: 12px;

  @media (min-width: 768px) {
    padding: 12px;
    margin-top: 16px;
  }
}

.mcf-camera-preview {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  background: var(--mcf-text-primary);
  border: 1px solid var(--mcf-border-light);
}

.mcf-camera-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.mcf-photo-container {
  background: var(--mcf-bg-primary);
  border: 2px solid var(--mcf-secondary);
  border-radius: 8px;
  padding: 8px;
  margin-top: 12px;
  text-align: center;

  @media (min-width: 768px) {
    padding: 12px;
    margin-top: 16px;
  }
}

.mcf-photo-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mcf-photo-icon {
  font-size: 20px;
  color: var(--mcf-secondary);
}

.mcf-photo-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
}

.mcf-captured-photo {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--mcf-border-light);
  box-shadow: var(--mcf-shadow-sm);
}

/* === UPDATES SECTION === */
.mcf-updates-section {
  text-align: center;
}

.mcf-update-controls {
  margin-bottom: 24px;
}

.mcf-update-btn {
  padding: 12px 24px;
  font-size: 16px;

  @media (min-width: 768px) {
    padding: 14px 28px;
    font-size: 17px;
  }
}

.mcf-version-info {
  background: var(--mcf-bg-primary);
  border-radius: 6px;
  padding: 8px 12px;

  @media (min-width: 768px) {
    padding: 12px 16px;
  }
}

.mcf-version-current {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.mcf-version-icon {
  font-size: 16px;
  color: var(--mcf-primary);
}

.mcf-version-text {
  font-size: 13px;
  color: var(--mcf-text-secondary);
  font-weight: 500;

  @media (min-width: 768px) {
    font-size: 14px;
  }
}

/* === FONT SETTINGS === */
.mcf-font-section {
  text-align: left;
}

.mcf-font-group {
  background: var(--mcf-bg-primary);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid var(--mcf-border-light);

  @media (min-width: 768px) {
    padding: 16px;
    margin-bottom: 20px;
  }
}

.mcf-font-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 0 0 16px 0;

  @media (min-width: 768px) {
    font-size: 17px;
    margin-bottom: 20px;
  }
}

.mcf-font-group-icon {
  font-size: 18px;
  color: var(--mcf-primary);
}

.mcf-font-preview-container {
  background: var(--mcf-bg-surface);
  border: 2px solid var(--mcf-border-light);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  text-align: center;

  @media (min-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
  }
}

.mcf-font-preview {
  font-size: 24px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  line-height: 1.3;

  @media (min-width: 768px) {
    font-size: 28px;
  }
}

.mcf-app-font-preview {
  text-align: left;

  .mcf-preview-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--mcf-text-primary);

    @media (min-width: 768px) {
      font-size: 22px;
      margin-bottom: 12px;
    }
  }

  .mcf-preview-text {
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 8px;
    color: var(--mcf-text-secondary);
    line-height: 1.5;

    @media (min-width: 768px) {
      font-size: 15px;
      margin-bottom: 12px;
    }
  }

  .mcf-preview-small {
    font-size: 12px;
    font-weight: 400;
    color: var(--mcf-text-tertiary);

    @media (min-width: 768px) {
      font-size: 13px;
    }
  }
}

.mcf-font-options {
  display: flex;
  justify-content: center;
}

.mcf-font-toggle {
  border-radius: 8px;
  overflow: hidden;

  :deep(.q-btn) {
    font-size: 13px;
    padding: 8px 12px;

    @media (min-width: 768px) {
      font-size: 14px;
      padding: 10px 16px;
    }
  }
}

.mcf-font-reset {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--mcf-border-light);
  margin-top: 24px;
}

.mcf-reset-btn {
  font-size: 13px;
  padding: 8px 16px;

  @media (min-width: 768px) {
    font-size: 14px;
    padding: 10px 20px;
  }
}

/* === FAMILY MANAGEMENT STYLES === */
.mcf-family-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mcf-family-info {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--mcf-shadow-sm);
}

.mcf-family-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.mcf-family-main {
  flex: 1;
  min-width: 0;
}

.mcf-family-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  margin-bottom: 4px;
}

.mcf-family-members {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  font-weight: 500;
}

.mcf-family-members-list {
  margin-bottom: 24px;
}

.mcf-members-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--mcf-text-secondary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mcf-member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--mcf-border-light);

  &:last-child {
    border-bottom: none;
  }
}

.mcf-member-avatar {
  flex-shrink: 0;
  background: var(--mcf-primary-light);
  color: var(--mcf-primary);
}

.mcf-member-info {
  flex: 1;
  min-width: 0;
}

.mcf-member-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin-bottom: 2px;
}

.mcf-member-email {
  font-size: 13px;
  color: var(--mcf-text-secondary);
}

.mcf-family-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
  }
}

/* No Family State */
.mcf-no-family {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 16px;
}

.mcf-no-family-icon {
  margin-bottom: 24px;
}

.mcf-no-family-content {
  max-width: 400px;
}

.mcf-no-family-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 0 0 12px 0;
}

.mcf-no-family-description {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  line-height: 1.5;
  margin: 0 0 32px 0;
}

.mcf-no-family-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Invite Code Display */
.mcf-invite-code-display {
  text-align: center;
}

.mcf-invite-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.mcf-invite-icon {
  font-size: 24px;
  color: var(--mcf-primary);
}

.mcf-invite-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
}

.mcf-invite-code {
  font-size: 24px;
  font-weight: 700;
  color: var(--mcf-primary);
  background: var(--mcf-primary-light);
  padding: 16px 24px;
  border-radius: 12px;
  margin: 16px 0;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.mcf-invite-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 16px 0;
  flex-wrap: wrap;
}

.mcf-invite-instructions {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  line-height: 1.5;
  margin-top: 16px;

  p {
    margin: 8px 0;
  }
}

.mcf-invite-generate {
  text-align: center;
  padding: 24px;

  p {
    font-size: 14px;
    color: var(--mcf-text-secondary);
    margin: 0 0 24px 0;
    line-height: 1.5;
  }
}

/* Danger Zone */
.mcf-danger-zone {
  margin-top: 32px;
  padding: 24px;
  border: 1px solid #fca5a5;
  border-radius: 12px;
  background: #fef2f2;
}

.mcf-danger-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mcf-danger-icon {
  font-size: 20px;
  color: #dc2626;
}

.mcf-danger-title {
  font-size: 16px;
  font-weight: 600;
  color: #dc2626;
}

.mcf-danger-description {
  font-size: 14px;
  color: #7f1d1d;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

/* === INVITATIONS SECTION === */
.mcf-invitations-section {
  margin-top: 24px;
  background: var(--mcf-bg-primary);
  border: 1px solid var(--mcf-border-light);
  border-radius: 12px;
  padding: 16px;
}

.mcf-invitations-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--mcf-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mcf-invitations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mcf-invitation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--mcf-shadow-sm);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

.mcf-invitation-info {
  flex: 1;
  min-width: 0;
}

.mcf-invitation-email {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin-bottom: 4px;
}

.mcf-invitation-details {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--mcf-text-secondary);
}

.mcf-invitation-role {
  text-transform: capitalize;
  font-weight: 500;
}

.mcf-invitation-status {
  text-align: right;

  @media (max-width: 600px) {
    text-align: left;
  }
}

.mcf-invitation-expires {
  font-size: 12px;
  color: var(--mcf-text-tertiary);
  margin-top: 4px;
}

/* Received Invitations Styles */
.mcf-received-invitations {
  margin-bottom: 24px;
  background: var(--mcf-bg-primary);
  border: 2px solid var(--mcf-primary);
  border-radius: 12px;
  padding: 20px;

  @media (max-width: 600px) {
    padding: 16px;
    margin-bottom: 20px;
  }
}

.mcf-received-invitations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 600px) {
    gap: 12px;
  }
}

.mcf-received-invitation-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-primary-light);
  border-radius: 12px;
  transition: all 0.2s ease;
  min-height: auto;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--mcf-shadow-md);
    border-color: var(--mcf-primary);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
    padding: 16px;
  }
}

.mcf-invitation-info {
  flex: 1;
  min-width: 0; /* Permette al contenuto di ridursi */

  @media (max-width: 600px) {
    width: 100%;
  }
}

.mcf-invitation-family {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 600px) {
    gap: 10px;
    margin-bottom: 16px;
  }
}

.mcf-invitation-family-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.mcf-invitation-family-name {
  font-weight: 600;
  font-size: 18px;
  color: var(--mcf-text-primary);
  line-height: 1.3;

  @media (max-width: 600px) {
    font-size: 16px;
    line-height: 1.4;
  }
}

.mcf-invitation-invited-by {
  font-size: 13px;
  color: var(--mcf-text-secondary);
  font-style: italic;
  line-height: 1.3;

  @media (max-width: 600px) {
    font-size: 12px;
  }
}

.mcf-invitation-details {
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 600px) {
    gap: 10px;
  }
}

.mcf-invitation-role {
  font-size: 14px;
  color: var(--mcf-text-tertiary);
  line-height: 1.4;

  @media (max-width: 600px) {
    font-size: 13px;
  }
}

.mcf-invitation-from-detail {
  font-size: 14px;
  color: var(--mcf-text-tertiary);
  line-height: 1.4;

  @media (max-width: 600px) {
    font-size: 13px;
  }
}

.mcf-invitation-code {
  font-size: 14px;
  color: var(--mcf-primary);
  font-weight: 600;
  font-family: monospace;
  background: var(--mcf-primary-light);
  padding: 6px 10px;
  border-radius: 6px;
  display: inline-block;
  word-break: break-all;

  @media (max-width: 600px) {
    font-size: 13px;
    padding: 8px 12px;
    margin-top: 4px;
  }
}

.mcf-invitation-actions {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
    gap: 16px;
  }
}
</style>
