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

        <!-- Security & Account -->
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="security" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Sicurezza e Account</h3>
          </div>

          <div class="mcf-security-section">
            <!-- Password Change Card -->
            <div class="mcf-password-card">
              <div class="mcf-password-header">
                <q-icon name="lock" class="mcf-password-icon" />
                <div class="mcf-password-info">
                  <h4 class="mcf-password-title">Cambia Password</h4>
                  <p class="mcf-password-description">
                    Aggiorna la tua password per mantenere il tuo account sicuro
                  </p>
                </div>
                <q-btn
                  flat
                  round
                  icon="edit"
                  color="primary"
                  @click="showPasswordDialog = true"
                  class="mcf-password-edit-btn"
                >
                  <q-tooltip>Cambia Password</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- System Information -->
        <div class="mcf-settings-section">
          <q-expansion-item
            icon="info"
            label="Informazioni Sistema"
            header-class="mcf-expansion-header"
            expand-icon-class="mcf-expansion-icon"
          >
            <div class="mcf-expansion-content">
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

                <!-- Force Refresh for PWA issues -->
                <div class="mcf-info-card mcf-force-refresh-card">
                  <div class="mcf-info-header">
                    <q-icon name="refresh" class="mcf-info-icon" />
                    <span class="mcf-info-label">Forza Aggiornamento</span>
                  </div>
                  <div class="mcf-info-value">Risolve problemi di cache PWA</div>
                  <q-btn
                    flat
                    dense
                    color="warning"
                    label="Force Refresh"
                    icon="cached"
                    @click="forceAppRefresh"
                    :loading="forceRefreshing"
                    class="mcf-force-refresh-btn"
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>
        </div>

        <!-- Camera Testing - HIDDEN -->
        <!--
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

            <div v-if="capturedPhoto" class="mcf-photo-container">
              <div class="mcf-photo-header">
                <q-icon name="photo" class="mcf-photo-icon" />
                <span class="mcf-photo-label">Foto Acquisita</span>
              </div>
              <img :src="capturedPhoto" alt="Foto acquisita" class="mcf-captured-photo" />
            </div>
          </div>
        </div>
        -->

        <!-- App Updates Section -->
        <div class="mcf-settings-section" v-if="isAndroidDevice">
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

        <!-- Font Settings Section - HIDDEN -->
        <!--
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="text_fields" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Impostazioni Font</h3>
          </div>

          <div class="mcf-font-section">
            <p class="mcf-section-description">
              Personalizza i font dell'applicazione per migliorare la tua esperienza di lettura.
            </p>

            <div class="mcf-font-group">
              <h4 class="mcf-font-group-title">
                <q-icon name="account_balance_wallet" class="mcf-font-group-icon" />
                Font Logo "MyCrisisFamily"
              </h4>

              <div class="mcf-font-preview-container">
                <div class="mcf-font-preview" :style="{ fontFamily: selectedLogoFont }">
                  MyCrisisFamily
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
        -->

        <!-- Theme Palette Settings Section -->
        <!--
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="palette" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Impostazioni Tema</h3>
          </div>

          <div class="mcf-theme-section">
            <p class="mcf-section-description">
              Scegli la palette di colori che preferisci per personalizzare l'aspetto dell'applicazione.
            </p>

            <!-- Color Palette Selection -->
            <div class="mcf-theme-group">
              <h4 class="mcf-theme-group-title">
                <q-icon name="color_lens" class="mcf-theme-group-icon" />
                Palette Colori
              </h4>

              <div class="mcf-palette-container">
                <div class="mcf-palette-options">
                  <div
                    v-for="palette in colorPalettes"
                    :key="palette.id"
                    class="mcf-palette-option"
                  >
                    <q-card
                      class="mcf-palette-card cursor-pointer"
                      :class="{ 'mcf-palette-selected': selectedPalette === palette.id }"
                      @click="selectPalette(palette.id)"
                    >
                      <q-card-section class="q-pa-md">
                        <div class="mcf-palette-preview">
                          <div class="mcf-palette-name">{{ palette.name }}</div>
                          <div class="mcf-color-swatches">
                            <div
                              v-for="color in palette.colors.slice(0, 3)"
                              :key="color.name"
                              class="mcf-color-swatch"
                              :style="{ backgroundColor: color.value }"
                              :title="color.name"
                            ></div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <!-- Reset Theme Button -->
              <div class="mcf-reset-container q-mt-md">
                <q-btn
                  flat
                  color="secondary"
                  icon="refresh"
                  label="Ripristina Tema Predefinito"
                  @click="resetTheme"
                  class="mcf-reset-btn"
                />
              </div>
            </div>
          </div>
        -->

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

    <!-- Password Change Dialog -->
    <q-dialog v-model="showPasswordDialog" persistent>
      <q-card class="mcf-password-dialog">
        <q-card-section class="mcf-dialog-header">
          <div class="mcf-dialog-title-section">
            <q-icon name="lock" class="mcf-dialog-icon" />
            <div>
              <h6 class="mcf-dialog-title">Cambia Password</h6>
              <p class="mcf-dialog-subtitle">Inserisci la tua password attuale e quella nuova</p>
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="closePasswordDialog"
            class="mcf-dialog-close-btn"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="mcf-password-form-section">
          <q-form @submit="changePassword" class="mcf-password-form">
            <div class="mcf-form-row">
              <q-input
                v-model="passwordForm.old_password"
                type="password"
                label="Password Attuale *"
                outlined
                required
                :error="!!passwordErrors.old_password"
                :error-message="passwordErrors.old_password"
                class="mcf-form-field"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" />
                </template>
              </q-input>
            </div>

            <div class="mcf-form-row">
              <q-input
                v-model="passwordForm.new_password"
                type="password"
                label="Nuova Password *"
                outlined
                required
                :error="!!passwordErrors.new_password"
                :error-message="passwordErrors.new_password"
                class="mcf-form-field"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </div>

            <div class="mcf-form-row">
              <q-input
                v-model="passwordForm.new_password2"
                type="password"
                label="Conferma Nuova Password *"
                outlined
                required
                :error="!!passwordErrors.new_password2"
                :error-message="passwordErrors.new_password2"
                class="mcf-form-field"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="mcf-dialog-actions">
          <q-btn
            flat
            label="Annulla"
            @click="closePasswordDialog"
            class="mcf-btn-secondary"
          />
          <q-btn
            unelevated
            label="Cambia Password"
            color="primary"
            @click="changePassword"
            :loading="passwordLoading"
            :disable="!isPasswordFormValid"
            class="mcf-btn-primary"
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
import { useAppStore } from 'stores/useAppStore.js'
import { useSnackbar } from 'src/composables/useSnackbar'
import { useAppVersion } from 'src/composables/useAppVersion'

const $q = useQuasar()
const authStore = useAuthStore()
const snackbar = useSnackbar()

// Camera refs
const videoElement = ref(null)
const showCamera = ref(false)
const cameraLoading = ref(false)
const capturedPhoto = ref(null)
let mediaStream = null

// Password change refs
const showPasswordDialog = ref(false)
const passwordLoading = ref(false)
const passwordForm = ref({
  old_password: '',
  new_password: '',
  new_password2: ''
})
const passwordErrors = ref({})

// Update refs
const updateChecking = ref(false)
const forceRefreshing = ref(false)
// Usa versione dallo store
const appStore = useAppStore()
const currentVersion = computed(() => appStore.getCurrentVersion)

// Debug info refs (moved from LoginPage)
const publicIP = ref('Rilevamento...')
const deviceIP = ref('Rilevamento...')
const platform = ref('Sconosciuto')
const { fullVersion: appVersion } = useAppVersion()  // Usa composable per versione app
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

// Theme palette settings
const selectedPalette = ref('default')

const colorPalettes = [
  {
    id: 'default',
    name: 'MyCrisisFamily (Default)',
    colors: [
      { name: 'Primary', value: '#239db0' },
      { name: 'Secondary', value: '#2a5f82' },
      { name: 'Accent', value: '#10B981' },
      { name: 'Success', value: '#10B981' },
      { name: 'Warning', value: '#F59E0B' }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic Inspired',
    colors: [
      { name: 'Primary', value: '#131314' },
      { name: 'Secondary', value: '#404040' },
      { name: 'Accent', value: '#d97757' },
      { name: 'Success', value: '#10B981' },
      { name: 'Warning', value: '#F59E0B' }
    ]
  }
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
  // Verifica se siamo su una piattaforma che può installare APK
  const userAgent = navigator.userAgent.toLowerCase()

  // Escludi iOS esplicitamente (iPhone, iPad, iPod)
  if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
    return false
  }

  // Escludi Safari su Mac (macintosh)
  if (userAgent.includes('macintosh') || userAgent.includes('mac os')) {
    return false
  }

  // Solo Android reale può installare APK
  return userAgent.includes('android') && !userAgent.includes('iphone') && !userAgent.includes('ipad')
})

// Password form validation
const isPasswordFormValid = computed(() => {
  return passwordForm.value.old_password &&
         passwordForm.value.new_password &&
         passwordForm.value.new_password2 &&
         passwordForm.value.new_password === passwordForm.value.new_password2
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

  // Load saved theme
  loadSavedTheme()

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

// Force refresh per problemi di cache PWA
async function forceAppRefresh() {
  forceRefreshing.value = true

  try {
    // Mostra messaggio informativo
    $q.notify({
      message: '🔄 Cancellazione cache e riavvio...',
      color: 'info',
      position: 'top',
      timeout: 2000,
      icon: 'cached'
    })

    // Attendi un attimo per mostrare la notifica
    await new Promise(resolve => setTimeout(resolve, 500))

    // Usa la funzione globale che abbiamo creato nel register-service-worker
    if (window.forceAppUpdate) {
      window.forceAppUpdate()
    } else {
      // Fallback manuale
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
      window.location.reload(true)
    }

  } catch (error) {
    console.error('Error during force refresh:', error)
    $q.notify({
      message: '❌ Errore durante il refresh forzato',
      color: 'negative',
      position: 'top',
      timeout: 3000
    })
  } finally {
    forceRefreshing.value = false
  }
}

// Password management functions
const closePasswordDialog = () => {
  showPasswordDialog.value = false
  passwordForm.value = {
    old_password: '',
    new_password: '',
    new_password2: ''
  }
  passwordErrors.value = {}
}

const changePassword = async () => {
  if (!isPasswordFormValid.value) {
    snackbar.error('Compila tutti i campi correttamente')
    return
  }

  passwordLoading.value = true
  passwordErrors.value = {}

  try {
    await usersAPI.changePassword(passwordForm.value)

    snackbar.success('Password cambiata con successo!')
    closePasswordDialog()
  } catch (error) {
    console.error('Password change error:', error)

    if (error.response?.data) {
      // Handle validation errors from the backend
      const errorData = error.response.data
      if (typeof errorData === 'object') {
        passwordErrors.value = errorData
      } else {
        snackbar.error(errorData.detail || 'Errore durante il cambio password')
      }
    } else {
      snackbar.error('Errore di connessione durante il cambio password')
    }
  } finally {
    passwordLoading.value = false
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

// Theme Management Methods
const selectPalette = async (paletteId) => {
  selectedPalette.value = paletteId
  await applyThemePalette(paletteId)

  // Save to localStorage
  localStorage.setItem('mcf-theme-palette', paletteId)

  snackbar.success(`Palette "${colorPalettes.find(p => p.id === paletteId)?.name}" applicata`)
}

const applyThemePalette = async (paletteId) => {
  const palette = colorPalettes.find(p => p.id === paletteId)
  if (!palette) return

  const root = document.documentElement

  // Apply CSS custom properties based on the selected palette
  switch (paletteId) {
    case 'default':
      // MyCrisisFamily original colors (fixed default)
      root.style.setProperty('--mcf-primary', '#239db0')
      root.style.setProperty('--mcf-secondary', '#2a5f82')
      root.style.setProperty('--mcf-accent', '#10B981')
      root.style.setProperty('--mcf-theme-primary', '#239db0')
      root.style.setProperty('--mcf-theme-secondary', '#2a5f82')
      root.style.setProperty('--mcf-theme-accent', '#10B981')
      break
    case 'anthropic':
      // Anthropic inspired dark theme
      root.style.setProperty('--mcf-primary', '#131314')
      root.style.setProperty('--mcf-secondary', '#404040')
      root.style.setProperty('--mcf-accent', '#d97757')
      root.style.setProperty('--mcf-theme-primary', '#131314')
      root.style.setProperty('--mcf-theme-secondary', '#404040')
      root.style.setProperty('--mcf-theme-accent', '#d97757')
      break
  }

  // Update Quasar's theme colors for components that use them
  if ($q && $q.colors) {
    const paletteColors = palette.colors
    $q.colors.setBrand('primary', paletteColors[0]?.value || '#14B8A6')
    $q.colors.setBrand('secondary', paletteColors[1]?.value || '#8B5CF6')
    $q.colors.setBrand('accent', paletteColors[2]?.value || '#06B6D4')
  }
}

const resetTheme = async () => {
  selectedPalette.value = 'default'

  // Clear any previously set custom properties to restore original CSS values
  const root = document.documentElement
  root.style.removeProperty('--mcf-primary')
  root.style.removeProperty('--mcf-secondary')
  root.style.removeProperty('--mcf-accent')
  root.style.removeProperty('--mcf-theme-primary')
  root.style.removeProperty('--mcf-theme-secondary')
  root.style.removeProperty('--mcf-theme-accent')

  // Force a browser cache refresh
  if ($q && $q.colors) {
    $q.colors.setBrand('primary', '#239db0')
    $q.colors.setBrand('secondary', '#2a5f82')
    $q.colors.setBrand('accent', '#10B981')
  }

  // Remove from localStorage
  localStorage.removeItem('mcf-theme-palette')

  // Force page refresh to clear any CSS cache issues
  setTimeout(() => {
    window.location.reload()
  }, 500)

  snackbar.info('Tema ripristinato ai valori originali - ricaricando...')
}

const loadSavedTheme = () => {
  const savedPalette = localStorage.getItem('mcf-theme-palette')
  if (savedPalette && colorPalettes.find(p => p.id === savedPalette)) {
    selectedPalette.value = savedPalette
    applyThemePalette(savedPalette)
  }
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
    title: 'Invito Famiglia - MyCrisisFamily',
    text: `Unisciti alla mia famiglia su MyCrisisFamily! Usa questo codice: ${inviteCode.value}`,
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

.mcf-force-refresh-card {
  border-color: var(--mcf-warning);
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, var(--mcf-bg-primary) 100%);

  .mcf-info-icon {
    color: var(--mcf-warning);
  }
}

.mcf-force-refresh-btn {
  color: var(--mcf-warning);
  border-color: var(--mcf-warning);

  &:hover {
    background-color: rgba(255, 193, 7, 0.1);
  }
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

/* === PASSWORD SECTION STYLES === */
.mcf-security-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mcf-password-card {
  background: linear-gradient(135deg, rgba(35, 157, 176, 0.05), rgba(35, 157, 176, 0.02));
  border: 1px solid rgba(35, 157, 176, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(35, 157, 176, 0.2);
    box-shadow: 0 4px 12px rgba(35, 157, 176, 0.1);
  }
}

.mcf-password-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mcf-password-icon {
  font-size: 32px;
  color: var(--mcf-primary);
  padding: 12px;
  background: rgba(35, 157, 176, 0.1);
  border-radius: 50%;
}

.mcf-password-info {
  flex: 1;
}

.mcf-password-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 0 0 4px 0;
}

.mcf-password-description {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.mcf-password-edit-btn {
  color: var(--mcf-primary);
  background: rgba(35, 157, 176, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(35, 157, 176, 0.2);
    transform: scale(1.05);
  }
}

/* === PASSWORD DIALOG STYLES === */
.mcf-password-dialog {
  min-width: 400px;
  max-width: 500px;
  border-radius: 16px;
  overflow: hidden;

  @media (max-width: 500px) {
    min-width: 90vw;
    max-width: 90vw;
  }
}

.mcf-dialog-header {
  background: linear-gradient(135deg, var(--mcf-primary), #1e7a8c);
  color: white;
  padding: 20px;
  position: relative;
}

.mcf-dialog-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mcf-dialog-icon {
  font-size: 28px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.mcf-dialog-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.mcf-dialog-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.mcf-dialog-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.mcf-password-form-section {
  padding: 24px;
  background: var(--mcf-bg-surface);
}

.mcf-password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mcf-dialog-actions {
  padding: 16px 24px;
  background: var(--mcf-bg-surface);
  gap: 12px;
}

.mcf-btn-secondary {
  color: var(--mcf-text-secondary);
  font-weight: 500;

  &:hover {
    background: var(--mcf-bg-hover);
  }
}

.mcf-btn-primary {
  background: var(--mcf-primary);
  color: white;
  font-weight: 600;
  border-radius: 8px;
  padding: 8px 20px;

  &:hover {
    background: #1e7a8c;
  }

  &:disabled {
    background: var(--mcf-text-disabled);
    color: white;
  }
}

/* === EXPANSION STYLES === */
.mcf-expansion-header {
  background: var(--mcf-card-bg);
  border-radius: 16px;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  transition: all 0.2s ease;
}

.mcf-expansion-header:hover {
  background: var(--mcf-card-hover);
}

.mcf-expansion-icon {
  color: var(--mcf-primary);
}

.mcf-expansion-content {
  padding: 20px;
  background: var(--mcf-bg-secondary);
  border-radius: 0 0 16px 16px;
  margin-top: -8px;
}

/* === THEME PALETTE STYLES === */
.mcf-theme-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mcf-theme-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mcf-theme-group-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);

  @media (min-width: 768px) {
    font-size: 18px;
  }
}

.mcf-theme-group-icon {
  color: var(--mcf-primary);
  font-size: 20px;

  @media (min-width: 768px) {
    font-size: 22px;
  }
}

.mcf-palette-container {
  width: 100%;
}

.mcf-palette-options {
  display: flex;
  gap: 16px;
  flex-direction: column;

  @media (min-width: 640px) {
    flex-direction: row;
  }
}

.mcf-palette-option {
  flex: 1;
  min-width: 0;
}

.mcf-palette-card {
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: var(--mcf-bg-surface);
  position: relative;

  &:hover {
    border-color: var(--mcf-primary);
    box-shadow: var(--mcf-shadow-md);
    transform: translateY(-2px);
  }
}

.mcf-palette-selected {
  border-color: var(--mcf-primary) !important;
  box-shadow: var(--mcf-shadow-md);

  &::after {
    content: '✓';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: var(--mcf-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }
}

.mcf-palette-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.mcf-palette-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  text-align: center;
}

.mcf-color-swatches {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.mcf-color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--mcf-border-light);
  flex-shrink: 0;

  @media (min-width: 768px) {
    width: 28px;
    height: 28px;
  }
}
</style>
