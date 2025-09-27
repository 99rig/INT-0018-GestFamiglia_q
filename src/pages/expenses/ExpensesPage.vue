<template>
  <q-page class="mcf-page-container-fullwidth">
    <div class="expenses-page-content">
      <!-- Action Button -->
      <div class="mcf-action-header">
        <q-btn-dropdown
          icon="add"
          label="Nuova Spesa"
          class="mcf-btn-primary mcf-btn-fullwidth"
          dropdown-icon="expand_more"
        >
          <q-list>
            <q-item clickable v-close-popup @click="openManualForm()">
              <q-item-section avatar>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Inserimento Manuale</q-item-label>
                <q-item-label caption>Inserisci i dati della spesa manualmente</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="$router.push('/scanner')">
              <q-item-section avatar>
                <q-icon name="document_scanner" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Scansiona Ricevuta</q-item-label>
                <q-item-label caption>Usa la fotocamera per scansionare</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="$router.push('/scanner')">
              <q-item-section avatar>
                <q-icon name="photo_camera" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Scatta Foto</q-item-label>
                <q-item-label caption>Fotografa la ricevuta</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <!-- Search and Filters -->
      <div v-if="!loading" class="mcf-filters-section">
        <!-- Search Input -->
        <div class="mcf-search-container">
          <q-input
            ref="searchInputRef"
            v-model="searchQuery"
            placeholder="Cerca per nome o categoria..."
            outlined
            dense
            clearable
            @update:model-value="onSearchChange"
            class="mcf-search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- Category Chips -->
        <div v-if="categories.length > 0" class="mcf-filters-chips">
          <q-chip
            :outline="selectedCategoryFilter !== null"
            :color="selectedCategoryFilter === null ? 'primary' : 'grey-5'"
            :text-color="selectedCategoryFilter === null ? 'white' : 'grey-8'"
            clickable
            @click="filterByCategory(null)"
            class="mcf-filter-chip"
          >
            Tutte ({{ expenses.length }})
          </q-chip>

          <q-chip
            v-for="category in visibleCategories"
            :key="category.id"
            :outline="selectedCategoryFilter !== category.id"
            :color="selectedCategoryFilter === category.id ? 'primary' : 'grey-5'"
            :text-color="selectedCategoryFilter === category.id ? 'white' : 'grey-8'"
            clickable
            @click="filterByCategory(category.id)"
            class="mcf-filter-chip"
          >
            {{ category.name }}
          </q-chip>

          <q-chip
            v-if="hasMoreCategories && !showAllCategories"
            outline
            color="grey-6"
            text-color="grey-8"
            clickable
            @click="showAllCategories = true"
            class="mcf-filter-chip mcf-more-chip"
          >
            ... ({{ categories.length - 3 }} altre)
          </q-chip>

          <q-chip
            v-if="showAllCategories && hasMoreCategories"
            outline
            color="grey-6"
            text-color="grey-8"
            clickable
            @click="showAllCategories = false"
            class="mcf-filter-chip mcf-less-chip"
          >
            meno
          </q-chip>
        </div>
      </div>

      <!-- Loading -->
      <MCFLoading
        v-if="loading"
        message="Caricamento spese..."
        submessage="Attendere mentre vengono caricate le spese"
      />

      <!-- Lista spese moderna -->
      <div v-else-if="filteredExpenses.length > 0" class="mcf-expenses-list">
        <div v-for="group in groupedExpenses" :key="group.date" class="mcf-expense-group">
          <!-- Date Header -->
          <div class="mcf-date-header">
            <div class="mcf-date-label">
              {{ formatDateHeader(group.date) }}
            </div>
            <div class="mcf-date-count">
              {{ group.expenses.length }} spesa{{ group.expenses.length !== 1 ? 'e' : '' }}
            </div>
          </div>

          <!-- Expenses for this date -->
          <div
            v-for="expense in group.expenses"
            :key="expense.id"
            :class="[
              'mcf-expense-card',
              { 'mcf-expense-card--quick': isQuickExpense(expense) }
            ]"
            @click="openEditModal(expense)"
          >
          <!-- Header della card -->
          <div class="mcf-expense-header">
            <div class="mcf-expense-content">
              <div class="mcf-expense-left">
                <div class="mcf-expense-title">
                  {{ expense.description }}
                  <q-icon
                    v-if="expense.status === 'pagata'"
                    name="check_circle"
                    class="mcf-paid-badge"
                  />
                </div>
                <div v-if="expense.notes" class="mcf-expense-notes">{{ expense.notes }}</div>
              </div>
              <div class="mcf-expense-right">
                <div class="mcf-amount-value">€{{ expense.amount }}</div>
                <div v-if="expense.shared_with && expense.shared_with.length > 0" class="mcf-shared-indicator">
                  <q-icon name="people" size="14px" />
                  <span>Condivisa</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata della spesa -->
          <div class="mcf-expense-metadata">
            <div class="mcf-metadata-left">
              <div class="mcf-metadata-item mcf-metadata-category">
                <q-icon name="category" />
                <span>{{ expense.category_detail?.name || 'Categoria non specificata' }}</span>
              </div>

              <div class="mcf-metadata-item mcf-metadata-date">
                <q-icon name="calendar_today" />
                <span>{{ formatDate(expense.date) }}</span>
              </div>
            </div>

            <div class="mcf-metadata-right">
              <!-- Pulsante Paga per spese non pagate -->
              <q-btn
                v-if="expense.status !== 'pagata'"
                flat
                dense
                round
                icon="payments"
                class="mcf-pay-btn"
                @click.stop="openPaymentDialog(expense)"
                size="sm"
                color="positive"
              >
                <q-tooltip>Paga spesa</q-tooltip>
              </q-btn>

              <q-btn
                flat
                dense
                round
                icon="delete_outline"
                class="mcf-delete-btn"
                @click.stop="deleteExpense(expense)"
                size="sm"
              >
                <q-tooltip>Elimina spesa</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Note OCR (se presenti) -->
          <div v-if="expense.note && expense.note.includes('OCR')" class="mcf-expense-ocr">
            <q-expansion-item
              icon="text_snippet"
              label="Testo OCR riconosciuto"
              class="mcf-ocr-expansion"
              header-class="mcf-ocr-header"
            >
              <div class="mcf-ocr-content">
                {{ expense.note }}
              </div>
            </q-expansion-item>
          </div>
          </div>
        </div>
      </div>

      <!-- Stato vuoto -->
      <div v-else class="empty-state text-center q-pa-xl">
        <q-icon
          name="receipt_long"
          size="64px"
          style="color: #d1d5db;"
          class="q-mb-md"
        />
        <div class="text-h6 q-mb-sm text-weight-semibold" style="color: #374151;">Nessuna spesa trovata</div>
        <div class="text-body2 q-mb-lg" style="color: #6b7280;">
          Inizia aggiungendo la tua prima spesa!
        </div>
        <div class="row q-gutter-md justify-center">
          <q-btn
            icon="edit"
            label="Inserimento Manuale"
            class="mcf-btn-primary"
            size="lg"
            @click="openManualForm()"
          />
          <q-btn
            icon="document_scanner"
            label="Scansiona Ricevuta"
            class="mcf-btn-secondary"
            size="lg"
            @click="$router.push('/scanner')"
          />
        </div>
      </div>

      <!-- FAB per aggiungere spesa -->
      <MCFDraggableFab>
        <q-fab-action
          @click="openManualForm()"
          icon="edit"
          label="Manuale"
          external-label
          label-position="left"
          class="mcf-fab-action mcf-fab-manual"
        />
        <q-fab-action
          @click="$router.push('/scanner')"
          icon="document_scanner"
          label="Scanner"
          external-label
          label-position="left"
          class="mcf-fab-action mcf-fab-scanner"
        />
        <q-fab-action
          @click="openQuickExpense"
          icon="flash_on"
          label="Rapida"
          external-label
          label-position="left"
          class="mcf-fab-action mcf-fab-quick"
        />
      </MCFDraggableFab>

      <!-- Dialog inserimento manuale -->
      <q-dialog
        v-model="showManualForm"
        persistent
        maximized
      >
        <q-card class="mcf-manual-expense-dialog">
          <q-card-section>
            <div class="text-h6">Nuova Spesa</div>
            <div class="text-caption text-grey-6">Scegli come inserire la spesa</div>
          </q-card-section>

          <!-- Method Selection -->
          <q-card-section class="q-pt-none q-pb-sm">
            <div class="mcf-method-tabs">
              <q-btn-toggle
                v-model="inputMethod"
                spread
                no-caps
                toggle-color="primary"
                color="grey-3"
                text-color="grey-8"
                :options="[
                  {label: 'Manuale', value: 'manual', icon: 'edit'},
                  {label: 'Scanner', value: 'scanner', icon: 'document_scanner'}
                ]"
                class="mcf-toggle-buttons"
              />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <!-- Manual Form -->
            <div v-if="inputMethod === 'manual'">
              <q-form @submit.prevent="submitManualExpense" class="q-gutter-md">
                <MCFInput
                v-model="manualExpense.description"
                label="Descrizione *"
                required
                :rules="[val => val && val.length > 0 || 'Descrizione richiesta']"
              />

              <MCFInput
                v-model="manualExpense.amount"
                label="Importo *"
                type="number"
                step="0.01"
                required
                prefix="€"
                :rules="[val => val > 0 || 'Importo deve essere maggiore di 0']"
              />

              <CategorySelect
                v-model="categorySelection"
                label="Categoria *"
                subcategory-label="Sottocategoria"
                return-object
                bg-color="white"
                @category-changed="onCategoryChanged"
                @subcategory-changed="onSubcategoryChanged"
              />

              <MCFAutocomplete
                v-model="manualExpense.spending_plan"
                :options="spendingPlanOptions"
                label="Piano di Spesa"
                outlined
                bg-color="white"
                option-value="value"
                option-label="label"
                clearable
                prepend-icon="event_note"
                :hint="manualExpense.spending_plan ? 'Spesa collegata a un piano' : 'Spesa generica (non collegata a nessun piano)'"
                :multiple="false"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label v-if="scope.opt.description" caption>{{ scope.opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected>
                  <div class="mcf-selected-option" v-if="manualExpense.spending_plan">
                    <q-icon
                      name="event_note"
                      color="primary"
                      size="sm"
                      class="q-mr-sm"
                    />
                    {{ getSelectedSpendingPlanLabel(manualExpense.spending_plan) }}
                  </div>
                  <div class="mcf-no-plan-selected" v-else>
                    <q-icon
                      name="remove_circle_outline"
                      color="grey-6"
                      size="sm"
                      class="q-mr-sm"
                    />
                    <span class="text-grey-6">Nessun piano</span>
                  </div>
                </template>
              </MCFAutocomplete>

              <MCFDatePicker
                v-model="manualExpense.date"
                label="Data *"
                required
                outlined
                bg-color="white"
                :rules="[val => val && val.length > 0 || 'Data richiesta']"
              />

              <MCFInput
                v-model="manualExpense.notes"
                label="Note"
                type="textarea"
                rows="3"
              />

              <!-- Sezione Metodo di Pagamento -->
              <q-separator class="q-my-md" />

              <div class="mcf-payment-section">
                <div class="mcf-payment-header">
                  <q-icon name="payment" size="20px" color="primary" />
                  <span class="mcf-payment-title">Metodo di Pagamento</span>
                </div>

                <div class="row q-gutter-md">
                  <div class="col-12 col-md-6">
                    <MCFSelect
                      v-model="manualExpense.payment_method"
                      label="Metodo *"
                      :options="paymentMethodOptions"
                      option-value="value"
                      option-label="label"
                      emit-value
                      map-options
                      outlined
                      bg-color="white"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <MCFSelect
                      v-model="manualExpense.payment_source"
                      label="Fonte *"
                      :options="paymentSourceOptions"
                      option-value="value"
                      option-label="label"
                      emit-value
                      map-options
                      outlined
                      bg-color="white"
                    />
                  </div>
                </div>

                <!-- Avviso per pagamento da contributi -->
                <q-banner
                  v-if="manualExpense.payment_source === 'contribution' && familyBalance <= 0"
                  class="bg-warning text-white q-mt-md"
                  rounded
                >
                  <template v-slot:avatar>
                    <q-icon name="warning" />
                  </template>
                  <div class="text-weight-medium">Attenzione: Bilancio Famiglia Insufficiente</div>
                  <div class="text-body2">
                    Il bilancio famiglia attuale è €0.00.
                    <router-link to="/spending-plans" class="text-white text-decoration-underline">
                      Aggiungi contributi
                    </router-link> prima di pagare con questo metodo.
                  </div>
                </q-banner>

                <!-- Info bilancio disponibile -->
                <div v-if="manualExpense.payment_source === 'contribution' && familyBalance > 0" class="q-mt-sm">
                  <q-chip
                    color="green"
                    text-color="white"
                    icon="account_balance_wallet"
                    size="sm"
                  >
                    Bilancio disponibile: €{{ formatAmount(familyBalance) }}
                  </q-chip>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="mcf-receipt-section">
                <div class="mcf-receipt-header">
                  <q-icon name="receipt" size="20px" color="primary" />
                  <span class="mcf-receipt-title">Ricevuta (opzionale)</span>
                </div>

                <MCFFile
                  v-model="manualExpense.receiptFile"
                  label="Carica ricevuta"
                  accept="image/*"
                  max-file-size="5242880"
                  @rejected="onReceiptRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:append>
                    <q-btn
                      v-if="manualExpense.receiptFile"
                      round
                      dense
                      flat
                      icon="clear"
                      @click.stop.prevent="manualExpense.receiptFile = null"
                    />
                  </template>
                </MCFFile>

                <div v-if="manualExpense.receiptFile" class="mcf-receipt-preview">
                  <q-img
                    :src="receiptPreviewUrl"
                    style="max-width: 200px; max-height: 150px;"
                    class="mcf-receipt-image"
                  />
                </div>

                <div class="mcf-receipt-actions">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="photo_camera"
                    label="Scatta foto"
                    color="primary"
                    @click="takeReceiptPhoto"
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <q-checkbox
                v-model="manualExpense.shared"
                label="Spesa condivisa con la famiglia"
              />
              </q-form>
            </div>

            <!-- Scanner Form -->
            <div v-else-if="inputMethod === 'scanner'">
              <div class="mcf-scanner-section">
                <div class="mcf-scanner-header">
                  <q-icon name="document_scanner" size="48px" color="primary" />
                  <h6 class="mcf-scanner-title">Scansiona Ricevuta</h6>
                  <p class="mcf-scanner-subtitle">Fotografa o carica un'immagine della ricevuta per estrarre automaticamente i dati</p>
                </div>

                <div class="mcf-scanner-actions">
                  <q-btn
                    icon="photo_camera"
                    label="Scatta Foto"
                    class="mcf-btn-primary"
                    size="lg"
                    @click="openCamera"
                  />
                  <q-btn
                    icon="upload_file"
                    label="Carica Immagine"
                    class="mcf-btn-secondary"
                    size="lg"
                    @click="uploadImage"
                  />
                </div>

                <div class="mcf-scanner-note">
                  <q-icon name="info" size="16px" color="grey-6" />
                  <span>Assicurati che la ricevuta sia ben illuminata e leggibile</span>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Annulla"
              color="grey"
              @click="closeManualForm"
            />
            <q-btn
              v-if="inputMethod === 'manual'"
              label="Salva Spesa"
              color="primary"
              :loading="saving"
              @click="submitManualExpense"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialog modifica spesa -->
      <q-dialog
        v-model="showEditForm"
        persistent
        maximized
      >
        <q-card>
          <q-card-section>
            <div class="text-h6">Modifica Spesa</div>
            <div class="text-caption text-grey-6">Modifica i dati della spesa</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-form @submit.prevent="submitEditExpense" class="q-gutter-md">
              <q-input
                v-model="editForm.description"
                label="Descrizione *"
                required
                outlined
                :rules="[val => val && val.length > 0 || 'Descrizione richiesta']"
              />

              <q-input
                v-model="editForm.amount"
                label="Importo *"
                required
                outlined
                type="number"
                step="0.01"
                min="0"
                prefix="€"
                :rules="[
                  val => val && val > 0 || 'Importo richiesto',
                  val => val <= 999999 || 'Importo troppo alto'
                ]"
              />

              <CategorySelect
                v-model="editCategorySelection"
                label="Categoria *"
                subcategory-label="Sottocategoria"
                return-object
                @category-changed="onEditCategoryChanged"
                @subcategory-changed="onEditSubcategoryChanged"
              />

              <MCFDatePicker
                v-model="editForm.date"
                label="Data *"
                :required="true"
                icon="event"
              />

              <MCFAutocomplete
                v-model="editForm.spending_plan"
                :options="spendingPlanOptions"
                label="Piano di Spesa"
                icon="event_note"
                :multiple="false"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label v-if="scope.opt.description" caption>{{ scope.opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected>
                  <div class="mcf-selected-option" v-if="editForm.spending_plan">
                    <q-icon
                      name="event_note"
                      color="primary"
                      size="sm"
                      class="q-mr-sm"
                    />
                    {{ getSelectedSpendingPlanLabel(editForm.spending_plan) }}
                  </div>
                  <div class="mcf-no-plan-selected" v-else>
                    <q-icon
                      name="remove_circle_outline"
                      color="grey-6"
                      size="sm"
                      class="q-mr-sm"
                    />
                    <span class="text-grey-6">Nessun piano</span>
                  </div>
                </template>
              </MCFAutocomplete>

              <q-input
                v-model="editForm.notes"
                label="Note (opzionale)"
                outlined
                type="textarea"
                rows="3"
              />

              <!-- Sezione Ricorrenza -->
              <q-separator class="q-my-md" />

              <div class="mcf-recurring-section">
                <q-toggle
                  v-model="editForm.is_recurring"
                  label="Rendi questa spesa ricorrente"
                  color="primary"
                  @update:model-value="onRecurringToggle"
                />

                <div v-if="editForm.is_recurring" class="mcf-recurring-fields q-mt-md q-gutter-md">
                  <MCFSelect
                    v-model="editForm.frequency"
                    :options="frequencyOptions"
                    label="Frequenza *"
                    required
                    emit-value
                    map-options
                  />

                  <MCFDatePicker
                    v-model="editForm.start_date"
                    label="Data inizio ricorrenza *"
                    required
                    outlined
                    :rules="[val => val && val.length > 0 || 'Data inizio richiesta']"
                  />

                  <MCFDatePicker
                    v-model="editForm.end_date"
                    label="Data fine ricorrenza (opzionale)"
                    outlined
                    hint="Lascia vuoto per ricorrenza senza fine"
                  />

                  <q-input
                    v-model.number="editForm.total_installments"
                    label="Numero rate totali (opzionale)"
                    outlined
                    type="number"
                    min="1"
                    max="120"
                    hint="Es: 12 per rate mensili per un anno"
                  />

                  <q-toggle
                    v-model="editForm.generate_immediately"
                    label="Genera spese future immediatamente"
                    color="primary"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Annulla" v-close-popup @click="closeEditForm" />
            <q-btn
              flat
              label="Salva Modifiche"
              color="primary"
              :loading="saving"
              @click="submitEditExpense"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialog spesa rapida -->
      <q-dialog
        v-model="showQuickForm"
        persistent
      >
        <q-card style="min-width: 350px; max-width: 400px;">
          <q-card-section class="row items-center">
            <q-icon name="flash_on" color="orange" size="28px" class="q-mr-sm" />
            <div>
              <div class="text-h6">Spesa Rapida</div>
              <div class="text-caption text-grey-6">Inserimento veloce per poi gestire dopo</div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-form @submit.prevent="submitQuickExpense" class="q-gutter-md">
              <q-input
                v-model="quickExpense.description"
                label="Cosa hai comprato? *"
                required
                autofocus
                outlined
                :rules="[val => val && val.length > 0 || 'Descrizione richiesta']"
                placeholder="es. Spesa supermercato"
              />

              <q-input
                v-model="quickExpense.amount"
                label="Quanto hai speso? *"
                type="number"
                step="0.01"
                required
                outlined
                prefix="€"
                :rules="[val => val > 0 || 'Importo deve essere maggiore di 0']"
                placeholder="es. 25.50"
              />
            </q-form>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Annulla"
              color="grey"
              @click="closeQuickForm"
            />
            <q-btn
              label="Salva Veloce"
              color="orange"
              :loading="saving"
              @click="submitQuickExpense"
              icon="flash_on"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialog Pagamento Spesa -->
      <q-dialog v-model="showPaymentDialog" persistent>
        <q-card style="min-width: 400px; max-width: 500px;">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">
              <q-icon name="payments" class="q-mr-sm" />
              Paga Spesa
            </div>
          </q-card-section>

          <q-card-section v-if="expenseToPay">
            <div class="text-h6 q-mb-md">{{ expenseToPay.description }}</div>
            <div class="text-h4 text-primary q-mb-lg">€{{ formatAmount(expenseToPay.amount) }}</div>

            <!-- Metodo di Pagamento -->
            <MCFSelect
              v-model="paymentForm.payment_method"
              label="Metodo di Pagamento *"
              :options="paymentMethodOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              class="q-mb-md"
            />

            <!-- Fonte di Pagamento -->
            <MCFSelect
              v-model="paymentForm.payment_source"
              label="Fonte di Pagamento *"
              :options="paymentSourceOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              class="q-mb-md"
            />

            <!-- Avviso bilancio famiglia -->
            <q-banner
              v-if="paymentForm.payment_source === 'contribution' && familyBalance < expenseToPay.amount"
              class="bg-warning text-white q-mb-md"
              rounded
            >
              <template v-slot:avatar>
                <q-icon name="warning" />
              </template>
              <div class="text-weight-medium">Bilancio insufficiente</div>
              <div class="text-body2">
                Bilancio disponibile: €{{ formatAmount(familyBalance) }}
                <br>Importo richiesto: €{{ formatAmount(expenseToPay.amount) }}
              </div>
            </q-banner>

            <!-- Info bilancio disponibile -->
            <div v-if="paymentForm.payment_source === 'contribution' && familyBalance >= expenseToPay.amount" class="q-mb-md">
              <q-chip
                color="green"
                text-color="white"
                icon="account_balance_wallet"
                size="sm"
              >
                Bilancio disponibile: €{{ formatAmount(familyBalance) }}
              </q-chip>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Annulla"
              color="grey"
              @click="closePaymentDialog"
              :disable="saving"
            />
            <q-btn
              label="Paga Spesa"
              color="primary"
              :loading="saving"
              :disable="!canPayExpense"
              @click="payExpense"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Delete Expense Modal -->
      <DeleteExpenseModal
        v-model="showDeleteModal"
        :expense-name="expenseToDelete?.description || ''"
        :loading="deleting"
        @confirm="confirmDeleteExpense"
        @cancel="cancelDeleteExpense"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useSnackbar } from 'src/composables/useSnackbar'
import { expensesAPI } from 'src/services/api/expenses.js'
import { reportsAPI } from 'src/services/api/reports.js'
import { contributionsAPI } from 'src/services/api/contributions.js'
import { categoriesAPI } from 'src/services/api/categories.js'
import MCFAutocomplete from 'components/forms/MCFAutocomplete.vue'
import MCFSelect from 'components/forms/MCFSelect.vue'
import MCFDatePicker from 'components/MCFDatePicker.vue'
import DeleteExpenseModal from 'components/DeleteExpenseModal.vue'
import MCFDraggableFab from 'components/MCFDraggableFab.vue'
import MCFInput from 'components/forms/MCFInput.vue'
import MCFFile from 'components/forms/MCFFile.vue'
import CategorySelect from 'components/CategorySelect.vue'
import MCFLoading from 'components/MCFLoading.vue'

const snackbar = useSnackbar()

// State
const loading = ref(false)
const expenses = ref([])
const showManualForm = ref(false)
const showEditForm = ref(false)
const showQuickForm = ref(false)
const showPaymentDialog = ref(false)
const saving = ref(false)
const editingExpense = ref(null)
const expenseToPay = ref(null)
const inputMethod = ref('manual')
const spendingPlans = ref([])
const spendingPlanOptions = ref([])
const selectedCategoryFilter = ref(null)
const categories = ref([])
const showAllCategories = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)
let searchTimeout = null

// Variabili per il sistema di pagamento
const familyBalance = ref(0)
const paymentForm = ref({
  payment_method: 'carta',
  payment_source: 'personal'
})

// Opzioni per metodi di pagamento
const paymentMethodOptions = [
  { label: 'Carta di Credito/Debito', value: 'carta' },
  { label: 'Contanti', value: 'contanti' },
  { label: 'Bonifico', value: 'bonifico' },
  { label: 'PayPal', value: 'paypal' },
  { label: 'Apple Pay', value: 'apple_pay' },
  { label: 'Google Pay', value: 'google_pay' },
  { label: 'Altro', value: 'altro' }
]

const paymentSourceOptions = [
  { label: 'Fondi Personali', value: 'personal' },
  { label: 'Da Contributo Famiglia', value: 'contribution' }
]

// Computed per validazione pagamento
const canPayExpense = computed(() => {
  if (!expenseToPay.value || !paymentForm.value.payment_method || !paymentForm.value.payment_source) {
    return false
  }

  // Se si paga con contributi, verifica che ci sia bilancio sufficiente
  if (paymentForm.value.payment_source === 'contribution') {
    return familyBalance.value >= expenseToPay.value.amount
  }

  return true
})

// Opzioni per la frequenza di ricorrenza
const frequencyOptions = [
  { label: 'Giornaliera', value: 'giornaliera' },
  { label: 'Settimanale', value: 'settimanale' },
  { label: 'Bisettimanale', value: 'bisettimanale' },
  { label: 'Mensile', value: 'mensile' },
  { label: 'Bimestrale', value: 'bimestrale' },
  { label: 'Trimestrale', value: 'trimestrale' },
  { label: 'Semestrale', value: 'semestrale' },
  { label: 'Annuale', value: 'annuale' }
]

// Computed properties for category filtering UI
const visibleCategories = computed(() => {
  if (showAllCategories.value) {
    return categories.value
  }
  // Mostra solo i primi 3 categorie
  return categories.value.slice(0, 3)
})

const hasMoreCategories = computed(() => {
  return categories.value.length > 3
})

// Delete modal state
const showDeleteModal = ref(false)
const expenseToDelete = ref(null)
const deleting = ref(false)



// Form data
const manualExpense = ref({
  description: '',
  amount: null,
  category: null,
  subcategory: null,
  date: new Date().toISOString().split('T')[0], // Today's date
  notes: '',
  shared: false,
  spending_plan: null,
  receiptFile: null,
  payment_method: 'carta',
  payment_source: 'personal'
})

// Category selection for new component
const categorySelection = ref({ category: null, subcategory: null })

const editForm = ref({
  description: '',
  amount: null,
  category: null,
  subcategory: null,
  date: '',
  notes: '',
  spending_plan: null,
  // Campi per ricorrenza
  is_recurring: false,
  frequency: 'mensile',
  start_date: '',
  end_date: '',
  total_installments: null,
  generate_immediately: true
})

// Category selection for edit form
const editCategorySelection = ref({ category: null, subcategory: null })

const quickExpense = ref({
  description: '',
  amount: null
})

// Computed
const filteredExpenses = computed(() => {
  // Con filtri backend, expenses contiene già i risultati filtrati
  return expenses.value
})

// Group expenses by date
const groupedExpenses = computed(() => {
  const groups = {}

  filteredExpenses.value.forEach(expense => {
    const dateKey = expense.date // Use the date as key (YYYY-MM-DD format)

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        expenses: []
      }
    }

    groups[dateKey].expenses.push(expense)
  })

  // Convert to array and sort by date (newest first)
  return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date))
})


const receiptPreviewUrl = computed(() => {
  if (manualExpense.value.receiptFile) {
    return URL.createObjectURL(manualExpense.value.receiptFile)
  }
  return null
})

// Methods
const loadExpenses = async (filters = {}) => {
  try {
    loading.value = true

    console.log('📊 Loading expenses with filters:', filters)
    const expensesData = await expensesAPI.getExpenses(filters)

    expenses.value = expensesData.results || expensesData || []
    console.log('📊 Expenses loaded:', expenses.value.length)

  } catch (error) {
    console.error('Failed to load expenses:', error)

    let errorMessage = 'Errore nel caricamento delle spese'
    if (error.response?.status === 401) {
      errorMessage = 'Accesso negato. Effettua il login.'
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Data non specificata'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatDateHeader = (dateString) => {
  if (!dateString) return 'Data non specificata'

  try {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    // Normalize dates to compare only year, month, day
    const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const normalizedDate = normalize(date)
    const normalizedToday = normalize(today)
    const normalizedYesterday = normalize(yesterday)

    if (normalizedDate.getTime() === normalizedToday.getTime()) {
      return 'Oggi'
    } else if (normalizedDate.getTime() === normalizedYesterday.getTime()) {
      return 'Ieri'
    } else {
      return date.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
  } catch {
    return dateString
  }
}


const getSelectedSpendingPlanLabel = (planId) => {
  if (!planId) return ''
  const plan = spendingPlanOptions.value.find(opt => opt.value === planId)
  return plan ? plan.label : ''
}

const isQuickExpense = (expense) => {
  // Identifica le spese rapide tramite:
  // 1. Note che contengono "Spesa rapida - da completare"
  // 2. Categoria ID 16 (Da Categorizzare)
  return (expense.notes && expense.notes.includes('Spesa rapida - da completare')) ||
         expense.category === 16
}


// Manual form methods

const loadSpendingPlans = async () => {
  try {
    console.log('🚀 [LAZY-LOAD] Loading spending plans for form...')
    const startTime = performance.now()

    const response = await reportsAPI.getSpendingPlansForSelect()
    const allPlans = Array.isArray(response) ? response : (response.results || response)

    if (!Array.isArray(allPlans)) {
      console.error('Spending plans response is not an array:', response)
      return
    }

    // La nuova API già filtra solo i piani attivi necessari
    spendingPlans.value = allPlans

    console.log(`🚀 [OPTIMIZED] Loaded ${allPlans.length} optimized spending plans for select`)

    // Create options for spending plans (already filtered by API)
    spendingPlanOptions.value = [
      { label: 'Nessun piano (spesa generica)', value: null },
      ...allPlans.map(plan => ({
        label: plan.name,
        value: plan.id,
        description: plan.plan_type // La nuova API leggera ha solo plan_type senza date
      }))
    ]

    const endTime = performance.now()
    console.log(`✅ [LAZY-LOAD] Spending plans loaded in ${(endTime - startTime).toFixed(2)}ms: ${spendingPlanOptions.value.length - 1} plans`) // -1 per escludere "Nessun piano"
  } catch (error) {
    console.error('❌ [LAZY-LOAD] Failed to load spending plans for form:', error)
    // Non mostro errore all'utente perché è un campo opzionale
  }
}


// New methods for CategorySelect component
const onCategoryChanged = (categoryId) => {
  manualExpense.value.category = categoryId
  categorySelection.value.category = categoryId
}

const onSubcategoryChanged = (subcategoryId) => {
  manualExpense.value.subcategory = subcategoryId
  categorySelection.value.subcategory = subcategoryId
}

// Edit form category methods
const onEditCategoryChanged = (categoryId) => {
  editForm.value.category = categoryId
  editCategorySelection.value.category = categoryId
}

const onEditSubcategoryChanged = (subcategoryId) => {
  editForm.value.subcategory = subcategoryId
  editCategorySelection.value.subcategory = subcategoryId
}


const resetManualForm = () => {
  manualExpense.value = {
    description: '',
    amount: null,
    category: null,
    subcategory: null,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    shared: false,
    spending_plan: null,
    receiptFile: null,
    payment_method: 'carta',
    payment_source: 'personal'
  }
  categorySelection.value = { category: null, subcategory: null }
}

const closeManualForm = () => {
  showManualForm.value = false
  inputMethod.value = 'manual' // Reset to default
  resetManualForm()
}

const openManualForm = async () => {
  // Carica i piani di spesa solo quando l'utente apre il form
  if (spendingPlanOptions.value.length === 0) {
    await loadSpendingPlans()
  }
  showManualForm.value = true
}

// Scanner functions
const openCamera = () => {
  // Reindirizza alla pagina scanner
  snackbar.info('Apertura fotocamera...')
  closeManualForm()
  // Qui potresti implementare la logica della fotocamera o reindirizzare
  // router.push('/scanner?mode=camera')
}

const uploadImage = () => {
  // Implementa il caricamento di immagini
  snackbar.info('Caricamento immagine...')
  closeManualForm()
  // Qui potresti implementare il file picker per le immagini
  // router.push('/scanner?mode=upload')
}

// Receipt handling functions
const onReceiptRejected = () => {
  snackbar.error(`File troppo grande o formato non supportato. Max 5MB, solo immagini.`)
}

const takeReceiptPhoto = () => {
  // Implementa l'apertura della fotocamera
  snackbar.info('Funzionalità fotocamera in sviluppo')
}

const submitManualExpense = async () => {
  try {
    saving.value = true

    // Validate form
    if (!manualExpense.value.description || !manualExpense.value.amount || !manualExpense.value.category || !manualExpense.value.date) {
      snackbar.warning('Compila tutti i campi obbligatori')
      return
    }

    console.log('💾 Saving manual expense...', manualExpense.value)
    console.log('🏷️ Selected subcategory:', manualExpense.value.subcategory)

    // Validation per pagamento con contributi
    if (manualExpense.value.payment_source === 'contribution') {
      if (familyBalance.value <= 0) {
        snackbar.warning('Bilancio famiglia insufficiente per questo metodo di pagamento')
        return
      }
      if (manualExpense.value.amount > familyBalance.value) {
        snackbar.warning(`Importo troppo elevato. Bilancio disponibile: €${formatAmount(familyBalance.value)}`)
        return
      }
    }

    // Prepare expense data for API
    const expenseData = {
      description: manualExpense.value.description,
      amount: manualExpense.value.amount,
      category: manualExpense.value.category,
      subcategory: manualExpense.value.subcategory || null,
      date: manualExpense.value.date,
      notes: manualExpense.value.notes || '',
      shared_with: manualExpense.value.shared ? [] : null, // Empty array means shared with all family
      spending_plan: manualExpense.value.spending_plan || null,
      payment_method: manualExpense.value.payment_method,
      payment_source: manualExpense.value.payment_source
    }

    console.log('📤 Expense data to send:', expenseData)

    // Se c'è un file ricevuta, crea FormData per l'upload
    if (manualExpense.value.receiptFile) {
      const formData = new FormData()

      // Aggiungi tutti i campi della spesa
      Object.keys(expenseData).forEach(key => {
        if (expenseData[key] !== null && expenseData[key] !== undefined) {
          formData.append(key, expenseData[key])
        }
      })

      // Aggiungi il file
      formData.append('receipt_image', manualExpense.value.receiptFile)

      await expensesAPI.createExpenseWithFile(formData)
    } else {
      await expensesAPI.createExpense(expenseData)
    }

    snackbar.success('Spesa salvata con successo!')

    // Se la spesa è stata pagata con contributi, aggiorna il bilancio famiglia
    if (manualExpense.value.payment_source === 'contribution') {
      await loadFamilyBalance()
    }

    // Close form and reload expenses with current filter
    closeManualForm()

    const currentFilters = {}
    if (selectedCategoryFilter.value !== null) {
      currentFilters.category = selectedCategoryFilter.value
    }
    await loadExpenses(currentFilters)

  } catch (error) {
    console.error('Failed to save manual expense:', error)

    let errorMessage = 'Errore nel salvataggio della spesa'
    if (error.response?.status === 401) {
      errorMessage = 'Accesso negato. Effettua il login.'
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  } finally {
    saving.value = false
  }
}

// Categories functions
const loadCategories = async () => {
  try {
    const response = await categoriesAPI.getCategories()
    categories.value = response.results || response || []
  } catch (error) {
    console.error('Error loading categories:', error)
    snackbar.error('Errore nel caricamento delle categorie')
  }
}

// Search functions
const onSearchChange = () => {
  // Debounce per evitare troppe chiamate API
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 500)
}

const performSearch = async () => {
  // Salva il riferimento al campo di input attivo
  const activeElement = document.activeElement
  const wasSearchInput = activeElement?.classList?.contains('mcf-search-input') ||
                        activeElement?.closest('.mcf-search-input')

  try {
    // Prepara i filtri per il backend
    const filters = {}

    if (searchQuery.value && searchQuery.value.trim()) {
      filters.search = searchQuery.value.trim()
    }

    if (selectedCategoryFilter.value !== null) {
      filters.category = selectedCategoryFilter.value
    }

    await loadExpenses(filters)

    // Ripristina il focus se era sul campo di ricerca
    if (wasSearchInput && searchInputRef.value) {
      await nextTick()
      searchInputRef.value.focus()
    }
  } catch (error) {
    console.error('Search error:', error)
  }
}

// Filter functions
const filterByCategory = async (categoryId) => {
  selectedCategoryFilter.value = categoryId
  await performSearch() // Usa la ricerca unificata
}

// Edit functions
const openEditModal = async (expense) => {
  editingExpense.value = expense

  console.log('🔧 Opening edit modal for expense:', expense)
  console.log('💰 Expense spending_plan:', expense.spending_plan)

  // Populate edit form
  editForm.value = {
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    subcategory: expense.subcategory || null,
    date: expense.date,
    notes: expense.notes || '',
    spending_plan: expense.spending_plan || null,
    // Campi ricorrenza
    is_recurring: false, // Reset sempre a false inizialmente
    frequency: 'mensile',
    start_date: expense.date, // Inizializza con la data della spesa
    end_date: '',
    total_installments: null,
    generate_immediately: true
  }

  // Populate category selection for CategorySelect component
  editCategorySelection.value = {
    category: expense.category || null,
    subcategory: expense.subcategory || null
  }

  console.log('📝 EditForm populated:', editForm.value)
  console.log('📂 EditCategorySelection populated:', editCategorySelection.value)

  // Load spending plans if not already loaded
  if (spendingPlanOptions.value.length === 0) {
    await loadSpendingPlans()
  }

  showEditForm.value = true
}

const closeEditForm = () => {
  showEditForm.value = false
  editingExpense.value = null
  editForm.value = {
    description: '',
    amount: null,
    category: null,
    subcategory: null,
    date: '',
    notes: '',
    spending_plan: null,
    // Reset campi ricorrenza
    is_recurring: false,
    frequency: 'mensile',
    start_date: '',
    end_date: '',
    total_installments: null,
    generate_immediately: true
  }

  // Reset category selection
  editCategorySelection.value = { category: null, subcategory: null }
}

// Funzione per gestire il toggle ricorrenza
const onRecurringToggle = (value) => {
  if (value) {
    // Quando viene attivata la ricorrenza, imposta valori di default intelligenti
    if (!editForm.value.start_date) {
      editForm.value.start_date = editForm.value.date
    }
  } else {
    // Quando viene disattivata, pulisce i campi opzionali
    editForm.value.end_date = ''
    editForm.value.total_installments = null
  }
}


const submitEditExpense = async () => {
  try {
    saving.value = true

    // Validate form
    if (!editForm.value.description || !editForm.value.amount || !editForm.value.category || !editForm.value.date) {
      snackbar.warning('Compila tutti i campi obbligatori')
      return
    }

    // Validazione specifica per ricorrenza
    if (editForm.value.is_recurring) {
      if (!editForm.value.start_date || !editForm.value.frequency) {
        snackbar.warning('Compila tutti i campi obbligatori per la ricorrenza')
        return
      }

      if (editForm.value.end_date && editForm.value.start_date >= editForm.value.end_date) {
        snackbar.warning('La data di fine deve essere successiva alla data di inizio')
        return
      }
    }

    console.log('💾 Updating expense...', editForm.value)

    // Prima aggiorna la spesa normale
    const expenseData = {
      description: editForm.value.description,
      amount: editForm.value.amount,
      category: editForm.value.category,
      subcategory: editForm.value.subcategory,
      date: editForm.value.date,
      notes: editForm.value.notes,
      spending_plan: editForm.value.spending_plan || null
    }

    await expensesAPI.updateExpense(editingExpense.value.id, expenseData)
    console.log('✅ Expense updated')

    // Se è stata attivata la ricorrenza, converti la spesa
    if (editForm.value.is_recurring) {
      console.log('🔄 Converting to recurring...')

      const conversionData = {
        frequency: editForm.value.frequency,
        start_date: editForm.value.start_date,
        end_date: editForm.value.end_date || null,
        generate_immediately: editForm.value.generate_immediately
      }

      const recurringResponse = await expensesAPI.convertToRecurring(editingExpense.value.id, conversionData)
      console.log('✅ Converted to recurring:', recurringResponse)

      snackbar.success(`Spesa convertita in ricorrente! Generate ${recurringResponse.generated_count} spese future.`)
    } else {
      snackbar.success('Spesa modificata con successo!')
    }

    closeEditForm()

    // Reload list with current filter
    const currentFilters = {}
    if (selectedCategoryFilter.value !== null) {
      currentFilters.category = selectedCategoryFilter.value
    }
    await loadExpenses(currentFilters)

  } catch (error) {
    console.error('❌ Error updating expense:', error)

    let errorMessage = 'Errore durante la modifica della spesa'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  } finally {
    saving.value = false
  }
}

// Delete expense function
const deleteExpense = (expense) => {
  expenseToDelete.value = expense
  showDeleteModal.value = true
}

const confirmDeleteExpense = async () => {
  if (!expenseToDelete.value) return

  deleting.value = true
  try {
    await expensesAPI.deleteExpense(expenseToDelete.value.id)

    snackbar.success('Spesa eliminata con successo')

    // Ricarica le spese
    const currentFilters = {}
    if (selectedCategoryFilter.value !== null) {
      currentFilters.category = selectedCategoryFilter.value
    }
    await loadExpenses(currentFilters)

    // Chiudi la modale
    showDeleteModal.value = false
    expenseToDelete.value = null

  } catch (error) {
    console.error('❌ Error deleting expense:', error)

    let errorMessage = 'Errore durante l\'eliminazione della spesa'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  } finally {
    deleting.value = false
  }
}

const cancelDeleteExpense = () => {
  showDeleteModal.value = false
  expenseToDelete.value = null
}



// Quick expense methods
const openQuickExpense = () => {
  // Reset form
  quickExpense.value = {
    description: '',
    amount: null
  }
  showQuickForm.value = true
}

const closeQuickForm = () => {
  showQuickForm.value = false
  quickExpense.value = {
    description: '',
    amount: null
  }
}

const submitQuickExpense = async () => {
  try {
    saving.value = true

    // Validate form
    if (!quickExpense.value.description || !quickExpense.value.amount) {
      snackbar.warning('Compila tutti i campi')
      return
    }

    console.log('Saving quick expense...', quickExpense.value)

    // Create a temporary expense with default values
    const expenseData = {
      description: quickExpense.value.description,
      amount: quickExpense.value.amount,
      category: 16, // Categoria "Da Categorizzare"
      subcategory: null,
      date: new Date().toISOString().split('T')[0],
      notes: 'Spesa rapida - da completare',
      shared_with: [], // Array vuoto invece di null
      spending_plan: null
    }

    console.log('Quick expense data to send:', expenseData)

    await expensesAPI.createExpense(expenseData)

    snackbar.success('Spesa rapida salvata! Ricordati di completarla dopo.')

    // Close form and reload expenses
    closeQuickForm()
    await loadExpenses()

  } catch (error) {
    console.error('Failed to save quick expense:', error)

    let errorMessage = 'Errore nel salvataggio della spesa rapida'
    if (error.response?.status === 401) {
      errorMessage = 'Accesso negato. Effettua il login.'
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Imposta loading subito per evitare di mostrare lo stato vuoto
  loading.value = true

  try {
    // Le route guards garantiscono che l'utente sia autenticato
    const startTime = performance.now()
    console.log('🚀 Loading expenses page data...')

    // Carica solo categorie e spese - i piani di spesa vengono caricati lazy quando necessario
    await Promise.all([
      loadCategories(),
      loadExpenses()
    ])

    const endTime = performance.now()
    console.log(`✅ Expenses page loaded in ${(endTime - startTime).toFixed(2)}ms (without spending plans)`)

    // Auto-focus sul campo di ricerca dopo il caricamento
    await nextTick()
    if (searchInputRef.value) {
      searchInputRef.value.focus()
    }
  } finally {
    // Il loading viene gestito automaticamente da loadExpenses(),
    // ma assicuriamoci che sia false se ci sono errori
    loading.value = false
  }
})

// Funzioni per il sistema di pagamento
const loadFamilyBalance = async () => {
  try {
    const response = await contributionsAPI.getBalance()
    const balanceData = response.data || response
    familyBalance.value = balanceData.current_balance || 0
  } catch (error) {
    console.error('Errore nel caricamento del bilancio famiglia:', error)
    familyBalance.value = 0
  }
}

const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

// Carica il bilancio famiglia quando la pagina viene montata
onMounted(async () => {
  await loadFamilyBalance()
})
</script>

<style lang="scss" scoped>
.expenses-page-content {
  width: 100%;
  margin: 0;
  padding: 16px;

  @media (min-width: 768px) {
    padding: 24px;
  }
}

// === ACTION HEADER ===
.mcf-action-header {
  margin-bottom: 20px;
  padding: 0;

  @media (min-width: 768px) {
    margin-bottom: 24px;
  }
}

.mcf-btn-fullwidth {
  width: 100%;
  justify-content: space-between;
  padding: 12px 16px;

  @media (min-width: 768px) {
    padding: 14px 20px;
  }

  :deep(.q-btn__content) {
    justify-content: space-between;
    width: 100%;
  }

  :deep(.q-btn-dropdown__arrow) {
    margin-left: auto;
  }

  :deep(.q-icon) {
    margin-right: 8px;
  }
}

// === METHOD TOGGLE BUTTONS ===
.mcf-method-tabs {
  margin-bottom: 16px;
}

.mcf-toggle-buttons {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;

  :deep(.q-btn) {
    padding: 12px 16px;
    font-weight: 500;

    &.q-btn--active {
      background-color: var(--mcf-primary) !important;
      color: white !important;
    }
  }
}

// === RECEIPT SECTION ===
.mcf-receipt-section {
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  padding: 16px;
  background-color: var(--mcf-bg-secondary);
}

.mcf-receipt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mcf-receipt-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--mcf-text-primary);
}

.mcf-receipt-preview {
  margin: 12px 0;
  text-align: center;
}

.mcf-receipt-image {
  border-radius: 8px;
  border: 1px solid var(--mcf-border-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mcf-receipt-actions {
  margin-top: 8px;
}

// === SCANNER SECTION ===
.mcf-scanner-section {
  text-align: center;
  padding: 32px 16px;
}

.mcf-scanner-header {
  margin-bottom: 32px;
}

.mcf-scanner-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 16px 0 8px 0;
}

.mcf-scanner-subtitle {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.mcf-scanner-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 16px;
  }
}

.mcf-scanner-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: var(--mcf-text-muted);
  background-color: var(--mcf-bg-secondary);
  padding: 12px 16px;
  border-radius: 8px;
  margin: 0 auto;
  max-width: 400px;
}

// === CATEGORY FILTERS ===
.mcf-filters-section {
  margin-bottom: 16px;
  padding: 0 4px;

  @media (min-width: 768px) {
    margin-bottom: 20px;
    padding: 0 8px;
  }
}

.mcf-search-container {
  margin-bottom: 12px;

  @media (min-width: 768px) {
    margin-bottom: 16px;
  }
}

.mcf-search-input {
  width: 100%;

  :deep(.q-field__control) {
    border-radius: 12px;
    background-color: var(--mcf-bg-card);
  }

  :deep(.q-field__native) {
    font-size: 14px;
    color: var(--mcf-text-primary);
  }

  :deep(.q-icon) {
    color: var(--mcf-text-secondary);
  }
}

.mcf-filters-header {
  margin-bottom: 8px;
}

.mcf-filters-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--mcf-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (min-width: 768px) {
    font-size: 13px;
  }
}

.mcf-filters-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (min-width: 768px) {
    gap: 10px;
  }
}

.mcf-filter-chip {
  transition: all 0.2s ease;
  border-radius: 20px !important;
  font-size: 11px;
  font-weight: 500;

  @media (min-width: 768px) {
    font-size: 12px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.mcf-more-chip,
  &.mcf-less-chip {
    font-style: italic;
    border: 1px dashed var(--mcf-border-light) !important;

    &:hover {
      background-color: var(--mcf-bg-secondary);
      border-color: var(--mcf-primary) !important;
    }
  }
}

// === MODERN EXPENSES LIST ===
.mcf-expenses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
  width: 100%;

  @media (min-width: 768px) {
    gap: 20px;
  }
}

.mcf-expense-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: 768px) {
    gap: 10px;
  }
}

// === DATE HEADER ===
.mcf-date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--mcf-bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--mcf-border-light);
  margin-bottom: 4px;

  @media (min-width: 768px) {
    padding: 10px 16px;
    border-radius: 10px;
    margin-bottom: 6px;
  }
}

.mcf-date-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  text-transform: capitalize;

  @media (min-width: 768px) {
    font-size: 15px;
  }
}

.mcf-date-count {
  font-size: 12px;
  font-weight: 500;
  color: var(--mcf-text-secondary);
  opacity: 0.8;

  @media (min-width: 768px) {
    font-size: 13px;
  }
}

.mcf-expense-card {
  background: #f1f8ff;
  border: 1px solid var(--mcf-border-medium);
  border-radius: 8px;
  box-shadow: var(--mcf-shadow-md);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  width: 100%;
  cursor: pointer;

  @media (min-width: 768px) {
    border-radius: 10px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--mcf-shadow-md);
    border-color: var(--mcf-primary);
  }

  // Variante per spese rapide - bordo arancione
  &--quick {
    border-color: #ff9800;
    border-width: 1px;

    &:hover {
      border-color: #f57c00;
      box-shadow: 0 4px 16px rgba(255, 152, 0, 0.2);
    }
  }
}

// === EXPENSE HEADER ===
.mcf-expense-header {
  padding: 10px 12px 0 12px;

  @media (min-width: 768px) {
    padding: 12px 16px 0 16px;
  }

  @media (max-width: 600px) {
    padding: 8px 12px 0 12px;
  }
}

.mcf-expense-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  @media (min-width: 768px) {
    gap: 16px;
  }
}

.mcf-expense-left {
  flex: 1;
  min-width: 0;
}

.mcf-expense-right {
  text-align: right;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.mcf-expense-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  line-height: 1.2;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  word-wrap: break-word;

  @media (min-width: 768px) {
    font-size: 16px;
    margin-bottom: 4px;
  }
}

// === PAID BADGE ===
.mcf-paid-badge {
  font-size: 16px;
  color: var(--mcf-accent);
  opacity: 0.7;
  transition: opacity 0.2s ease;
  flex-shrink: 0;

  @media (min-width: 768px) {
    font-size: 18px;
  }

  &:hover {
    opacity: 1;
  }
}

.mcf-expense-notes {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  line-height: 1.2;
  margin-top: 1px;

  @media (min-width: 768px) {
    font-size: 13px;
    line-height: 1.3;
    margin-top: 2px;
  }
}

.mcf-amount-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--mcf-primary);
  font-feature-settings: 'tnum';
  line-height: 1;
  margin-bottom: 2px;

  @media (min-width: 768px) {
    font-size: 22px;
    margin-bottom: 4px;
  }
}

.mcf-shared-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--mcf-accent);

  span {
    line-height: 1;
  }
}

.mcf-expense-actions {
  margin-top: 2px;
}

.mcf-edit-btn {
  font-size: 11px;
  font-weight: 500;
  color: var(--mcf-primary);
  padding: 4px 8px;
  min-height: 28px;
  text-transform: lowercase;
  border: 1px solid var(--mcf-border-light);
  border-radius: 6px;

  &:hover {
    background-color: var(--mcf-primary);
    color: white;
    border-color: var(--mcf-primary);
  }
}

// === EXPENSE METADATA ===
.mcf-expense-metadata {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px 10px 12px;

  @media (min-width: 768px) {
    padding: 10px 16px 12px 16px;
  }

  @media (max-width: 600px) {
    padding: 6px 12px 8px 12px;
  }
}

.mcf-metadata-left {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;

  @media (min-width: 768px) {
    gap: 8px;
  }

  @media (max-width: 600px) {
    gap: 4px;
  }
}

.mcf-metadata-right {
  margin-left: 12px;
}

.mcf-metadata-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease;

  @media (min-width: 768px) {
    gap: 5px;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
  }

  .q-icon {
    font-size: 12px;

    @media (min-width: 768px) {
      font-size: 14px;
    }
  }

  span {
    line-height: 1;
  }
}

.mcf-metadata-category {
  background-color: var(--mcf-primary-light);
  color: var(--mcf-primary);
}

.mcf-metadata-date {
  background-color: var(--mcf-secondary-light);
  color: var(--mcf-secondary);
}

// Status styles removed - now using discrete badge on title

// === OCR SECTION ===
.mcf-expense-ocr {
  border-top: 1px solid var(--mcf-border-light);
  padding: 12px 16px;
  background-color: var(--mcf-bg-secondary);

  @media (min-width: 768px) {
    padding: 16px 20px;
  }

  @media (max-width: 600px) {
    padding: 10px 16px;
  }
}

:deep(.mcf-ocr-expansion) {
  .mcf-ocr-header {
    padding: 0;
    min-height: auto;

    .q-item__section--main {
      font-size: 13px;
      color: var(--mcf-text-secondary);
    }

    .q-item__section--avatar {
      min-width: auto;
      margin-right: 8px;

      .q-icon {
        font-size: 16px;
        color: var(--mcf-text-muted);
      }
    }
  }
}

.mcf-ocr-content {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  background-color: var(--mcf-bg-surface);
  padding: 12px;
  border-radius: 8px;
  white-space: pre-wrap;
  max-height: 120px;
  overflow-y: auto;
  color: var(--mcf-text-secondary);
  border: 1px solid var(--mcf-border-light);
  margin-top: 8px;
}

// === EMPTY STATE ===
.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px 16px;
  width: 100%;

  @media (min-width: 768px) {
    padding: 24px 24px;
  }
}

// === RESPONSIVE ADJUSTMENTS ===
@media (max-width: 600px) {
  .page-header .row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .row.q-gutter-md {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .row.q-gutter-md .q-btn {
    width: 100%;
    max-width: 250px;
  }
}

/* === FAB ACTIONS CUSTOM STYLES === */

.mcf-fab-manual {
  background: var(--mcf-primary) !important;
  color: white !important;
  box-shadow: 0 3px 12px rgba(35, 157, 176, 0.3) !important;

  &:hover {
    background: var(--mcf-primary-dark) !important;
    transform: translateY(-1px);
  }
}

.mcf-fab-scanner {
  background: var(--mcf-secondary) !important;
  color: white !important;
  box-shadow: 0 3px 12px rgba(42, 95, 130, 0.3) !important;

  &:hover {
    background: var(--mcf-secondary-dark) !important;
    transform: translateY(-1px);
  }
}

.mcf-fab-quick {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%) !important;
  color: white !important;
  box-shadow: 0 3px 12px rgba(255, 152, 0, 0.3) !important;

  &:hover {
    background: linear-gradient(135deg, #f57c00 0%, #e65100 100%) !important;
    transform: translateY(-1px);
  }
}



/* === DELETE BUTTON STYLES === */
.mcf-delete-btn {
  color: var(--mcf-text-secondary);
  transition: all 0.2s ease;
  opacity: 0.7;

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    opacity: 1;
    transform: scale(1.1);
  }
}

/* === SPENDING PLAN SELECT STYLES === */
.mcf-selected-option {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.mcf-no-plan-selected {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-style: italic;
  opacity: 0.8;

  .q-icon {
    opacity: 0.6;
  }

  span {
    font-size: 14px;
  }
}

/* === RECURRING SECTION STYLES === */
.mcf-recurring-section {
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  padding: 16px;
  background-color: rgba(35, 157, 176, 0.05);

  .q-toggle {
    margin-bottom: 0;
  }
}

.mcf-recurring-fields {
  border-top: 1px solid var(--mcf-border-light);
  padding-top: 16px;
  margin-top: 16px !important;

  .q-field {
    margin-bottom: 12px;
  }

  .q-input[type="number"] {
    :deep(.q-field__native) {
      text-align: left;
    }
  }
}

// === SEZIONE METODO DI PAGAMENTO ===
.mcf-payment-section {
  margin: 16px 0;
}

.mcf-payment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.mcf-payment-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--q-primary);
}

// === MODALE NUOVA SPESA ===
.mcf-manual-expense-dialog {
  background: #f8f9fa !important;
}

</style>
