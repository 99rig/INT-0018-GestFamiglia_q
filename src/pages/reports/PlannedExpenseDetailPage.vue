<template>
  <q-page class="mcf-page-container-fullwidth">
    <div class="planned-expense-detail-content">
      <!-- Header -->
      <div class="mcf-action-header">
        <q-btn
          icon="arrow_back"
          label="Torna ai Piani"
          class="mcf-btn-secondary"
          flat
          @click="$router.go(-1)"
        />
      </div>

      <!-- Loading State -->
      <MCFLoading
        v-if="loading"
        message="Caricamento spese pianificate..."
        submessage="Recupero dettagli del piano di spesa"
      />

      <!-- Content -->
      <div v-else>
        <!-- Plan Info Card -->
        <div v-if="currentPlan" class="plan-info-card">
          <div class="plan-header">
            <div class="plan-main">
              <div class="plan-name">{{ currentPlan.name }}</div>
              <div class="plan-period">
                {{ formatDate(currentPlan.start_date) }} - {{ formatDate(currentPlan.end_date) }}
              </div>
              <div v-if="currentPlan.description" class="plan-description">
                {{ currentPlan.description }}
              </div>
            </div>
            <q-btn
              icon="add"
              label="Nuova Spesa"
              class="mcf-btn-primary"
              @click="showCreateExpenseDialog = true"
            />
          </div>

          <!-- Plan Summary -->
          <div class="plan-summary">
            <div class="summary-stats">
              <div class="stat-item">
                <div class="stat-value">{{ plannedExpenses.length }}</div>
                <div class="stat-label">Pianificate</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">€{{ formatAmount(totalPlanned) }}</div>
                <div class="stat-label">Pianificato</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">€{{ formatAmount(totalPaid) }}</div>
                <div class="stat-label">Già Pagato</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">€{{ formatAmount(totalRemaining) }}</div>
                <div class="stat-label">Rimanente</div>
              </div>
            </div>
            <div class="progress-container">
              <q-linear-progress
                :value="dynamicProgressValue"
                size="8px"
                :color="progressColor"
                track-color="grey-3"
                class="progress-bar"
              />
              <div class="progress-text cursor-pointer" @click="toggleProgressDisplay">
                {{ progressText }}
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <q-tabs
            v-model="activeTab"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="all" label="Tutte"/>
            <q-tab name="pending" label="In Attesa"/>
            <q-tab name="partial" label="Parziali"/>
            <q-tab name="completed" label="Completate"/>
            <q-tab name="overdue" label="Scadute"/>
          </q-tabs>
        </div>

        <!-- Expenses List -->
        <div class="expenses-list">
          <div
            v-for="expense in filteredExpenses"
            :key="expense.id"
            class="expense-card"
            :class="getExpenseStatusClass(expense)"
          >
            <div class="expense-header">
              <div class="expense-main">
                <div class="expense-name">{{ expense.description }}</div>
                <div class="expense-details">
                  <span v-if="expense.category_detail" class="expense-category">
                    {{ expense.category_detail.name }}
                  </span>
                  <div v-if="expense.due_date" class="expense-due-date">
                    <span class="due-date-text">
                      <span class="due-date-label">Scad.:</span> {{ formatDate(expense.due_date) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="expense-amount">
                <div class="amount-main">€{{ formatAmount(expense.amount) }}</div>
                <div class="amount-mobile-status">
                  <span class="status-badge mobile-status" :class="expense.payment_status">
                    {{ getStatusLabel(expense.payment_status) }}
                  </span>
                  <!-- Badge con chi ha pagato SOTTO lo status mobile -->
                  <div v-if="expense.paid_by_users && expense.paid_by_users.length > 0" class="paid-by-badges-mobile q-mt-xs">
                    <q-badge
                      v-for="user in expense.paid_by_users"
                      :key="user.id"
                      color="blue-grey-6"
                      text-color="white"
                      :label="user.first_name.toUpperCase()"
                      class="paid-by-badge"
                    >
                      <q-tooltip>{{ user.full_name }} - €{{ formatAmount(user.amount_paid) }}</q-tooltip>
                    </q-badge>
                  </div>
                  <div v-if="expense.is_recurring" class="expense-badges q-mt-xs">
                    <q-badge
                      color="deep-orange-2"
                      text-color="deep-orange-9"
                      class="recurring-badge"
                    >
                      RICORRENTE {{ expense.installment_number }}/{{ expense.total_installments }}
                    </q-badge>
                  </div>
                </div>
                <div class="amount-status">
                  <span class="status-badge" :class="expense.payment_status">
                    {{ getStatusLabel(expense.payment_status) }}
                  </span>
                  <!-- Badge con chi ha pagato SOTTO lo status desktop -->
                  <div v-if="expense.paid_by_users && expense.paid_by_users.length > 0" class="paid-by-badges-desktop q-mt-xs">
                    <q-badge
                      v-for="user in expense.paid_by_users"
                      :key="user.id"
                      color="blue-grey-6"
                      text-color="white"
                      :label="user.first_name.toUpperCase()"
                      class="paid-by-badge"
                    >
                      <q-tooltip>{{ user.full_name }} - €{{ formatAmount(user.amount_paid) }}</q-tooltip>
                    </q-badge>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Progress -->
            <div class="payment-progress">
              <div class="progress-info">
                <span class="paid-amount">Pagato: €{{ expense.total_paid }}</span>
                <span class="remaining-amount">Rimanente: €{{ expense.remaining_amount }}</span>
              </div>
              <q-linear-progress
                :value="expense.completion_percentage / 100"
                size="6px"
                :color="getProgressColor(expense.completion_percentage)"
                track-color="grey-2"
                class="payment-progress-bar"
              />
            </div>

            <!-- Action Buttons -->
            <div class="expense-actions">
              <!-- Desktop view with labels -->
              <template v-if="$q.screen.gt.sm">
                <!-- Left side: Recurring elements -->
                <div class="desktop-actions-left">
                  <!-- Toggle Detailed View Button (first) -->
                  <q-btn
                    v-if="expense.is_recurring && expense.recurring_installments_status"
                    flat
                    round
                    :icon="isRecurringExpanded(expense.id) ? 'expand_less' : 'expand_more'"
                    size="sm"
                    color="orange"
                    class="mcf-desktop-toggle-btn"
                    @click="toggleRecurringView(expense.id)"
                  >
                    <q-tooltip>{{ isRecurringExpanded(expense.id) ? 'Nascondi' : 'Mostra' }} Dettagli Rate</q-tooltip>
                  </q-btn>

                  <!-- Recurring Installments Checkboxes -->
                  <div
                    v-if="expense.is_recurring && expense.recurring_installments_status"
                    class="recurring-checkboxes-desktop"
                  >
                    <q-checkbox
                      v-for="installment in expense.recurring_installments_status"
                      :key="installment.installment_number"
                      :model-value="getInstallmentCheckboxValue(installment, expense.installment_number)"
                      readonly
                      size="sm"
                      :color="getInstallmentCheckboxColor(installment, expense.installment_number)"
                      class="installment-checkbox"
                    >
                      <q-tooltip>
                        Rata {{ installment.installment_number }}/{{ expense.total_installments }} -
                        {{ getInstallmentStatus(installment) }}
                        <br>Debug: completed={{ installment.is_completed }}, paid={{ installment.is_fully_paid }},
                        checkbox={{ getInstallmentCheckboxValue(installment, expense.installment_number) }}
                      </q-tooltip>
                    </q-checkbox>
                  </div>
                </div>

                <!-- Right side: Action buttons -->
                <div class="desktop-actions-right">
                  <q-btn
                    v-if="!expense.is_fully_paid"
                    icon="payment"
                    label="Aggiungi Pagamento"
                    size="sm"
                    color="primary"
                    outline
                    @click="openPaymentDialog(expense)"
                  />
                  <q-btn
                    icon="receipt"
                    label="Pagamenti"
                    size="sm"
                    color="secondary"
                    outline
                    @click="viewPayments(expense)"
                  />
                  <q-btn
                    flat
                    round
                    icon="more_vert"
                    size="sm"
                    class="mcf-planned-expense-menu-btn"
                    @click.stop
                  >
                    <q-menu
                      class="mcf-planned-expense-menu"
                      transition-show="scale"
                      transition-hide="scale"
                      anchor="bottom right"
                      self="top right"
                    >
                      <q-list class="mcf-menu-list">
                        <q-item
                          clickable
                          v-close-popup
                          @click="editExpense(expense)"
                          class="mcf-menu-item mcf-menu-edit"
                        >
                          <q-item-section avatar>
                            <q-icon name="edit" class="mcf-menu-icon"/>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="mcf-menu-title">Modifica</q-item-label>
                            <q-item-label caption class="mcf-menu-subtitle">Modifica i dettagli della spesa
                              pianificata
                            </q-item-label>
                          </q-item-section>
                        </q-item>

                        <!-- Generate Recurring Installments -->
                        <q-item
                          v-if="expense.is_recurring && canGenerateRecurring(expense)"
                          clickable
                          v-close-popup
                          @click="generateRecurringInstallments(expense)"
                          class="mcf-menu-item mcf-menu-recurring"
                        >
                          <q-item-section avatar>
                            <q-icon name="repeat" class="mcf-menu-icon"/>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="mcf-menu-title">Genera Rate</q-item-label>
                            <q-item-label caption class="mcf-menu-subtitle">
                              Crea le {{ (expense.total_installments || 1) - 1 }} rate successive
                            </q-item-label>
                          </q-item-section>
                        </q-item>

                        <!-- Nascondi/Mostra opzione per spese pagate -->
                        <q-item
                          v-if="expense.is_fully_paid && !expense.is_hidden"
                          clickable
                          v-close-popup
                          @click="hideExpense(expense)"
                          class="mcf-menu-item mcf-menu-hide"
                        >
                          <q-item-section avatar>
                            <q-icon name="visibility_off" class="mcf-menu-icon"/>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="mcf-menu-title">Nascondi</q-item-label>
                            <q-item-label caption class="mcf-menu-subtitle">Nascondi questa spesa pagata dalla vista
                            </q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item
                          v-if="expense.is_hidden"
                          clickable
                          v-close-popup
                          @click="showExpense(expense)"
                          class="mcf-menu-item mcf-menu-show"
                        >
                          <q-item-section avatar>
                            <q-icon name="visibility" class="mcf-menu-icon"/>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="mcf-menu-title">Mostra</q-item-label>
                            <q-item-label caption class="mcf-menu-subtitle">Mostra nuovamente questa spesa
                            </q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-separator class="mcf-menu-separator"/>

                        <q-item
                          clickable
                          v-close-popup
                          @click="deleteExpense(expense)"
                          class="mcf-menu-item mcf-menu-delete"
                        >
                          <q-item-section avatar>
                            <q-icon name="delete" class="mcf-menu-icon"/>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="mcf-menu-title">Elimina</q-item-label>
                            <q-item-label caption class="mcf-menu-subtitle">Rimuovi questa spesa pianificata
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </template>

              <!-- Mobile view with text menu -->
              <template v-else>
                <!-- Primary Action Buttons (most used) -->
                <div class="mobile-primary-actions">
                  <q-btn
                    v-if="!expense.is_fully_paid"
                    icon="payment"
                    label="PAGA"
                    size="sm"
                    color="primary"
                    class="mcf-mobile-primary-btn"
                    @click="openPaymentDialog(expense)"
                  />
                  <q-btn
                    icon="receipt"
                    label="STORICO"
                    size="sm"
                    color="secondary"
                    outline
                    class="mcf-mobile-primary-btn"
                    @click="viewPayments(expense)"
                  />

                  <!-- Recurring Toggle Button (if applicable) -->
                  <q-btn
                    v-if="expense.is_recurring && expense.recurring_installments_status"
                    :icon="isRecurringExpanded(expense.id) ? 'expand_less' : 'expand_more'"
                    :label="isRecurringExpanded(expense.id) ? 'Nascondi Rate' : 'Mostra Rate'"
                    size="sm"
                    color="orange"
                    outline
                    class="mcf-mobile-primary-btn"
                    @click="toggleRecurringView(expense.id)"
                  />
                </div>

                <!-- Secondary Actions Menu -->
                <div class="mobile-secondary-actions">
                  <q-btn
                    flat
                    round
                    icon="more_vert"
                    size="sm"
                    class="mcf-mobile-menu-btn"
                    @click.stop
                  >
                    <q-menu
                      class="mcf-mobile-expense-menu"
                      transition-show="scale"
                      transition-hide="scale"
                      anchor="bottom right"
                      self="top right"
                    >
                      <q-list class="mcf-mobile-menu-list">
                        <q-item
                          clickable
                          v-close-popup
                          @click="editExpense(expense)"
                          class="mcf-mobile-menu-item"
                        >
                          <q-item-section avatar>
                            <q-icon name="edit" class="mcf-mobile-menu-icon"/>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="mcf-mobile-menu-title">Modifica</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item
                          v-if="expense.is_recurring && canGenerateRecurring(expense)"
                          clickable
                          v-close-popup
                          @click="generateRecurringInstallments(expense)"
                          class="mcf-mobile-menu-item"
                        >
                          <q-item-section avatar>
                            <q-icon name="repeat" class="mcf-mobile-menu-icon"/>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="mcf-mobile-menu-title">Genera Rate</q-item-label>
                            <q-item-label caption class="mcf-mobile-menu-subtitle">
                              {{ (expense.total_installments || 1) - 1 }} rimanenti
                            </q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item
                          v-if="expense.is_fully_paid && !expense.is_hidden"
                          clickable
                          v-close-popup
                          @click="hideExpense(expense)"
                          class="mcf-mobile-menu-item"
                        >
                          <q-item-section avatar>
                            <q-icon name="visibility_off" class="mcf-mobile-menu-icon"/>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="mcf-mobile-menu-title">Nascondi</q-item-label>
                            <q-item-label caption class="mcf-mobile-menu-subtitle">Spesa completata</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item
                          v-if="expense.is_hidden"
                          clickable
                          v-close-popup
                          @click="showExpense(expense)"
                          class="mcf-mobile-menu-item"
                        >
                          <q-item-section avatar>
                            <q-icon name="visibility" class="mcf-mobile-menu-icon"/>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="mcf-mobile-menu-title">Mostra</q-item-label>
                            <q-item-label caption class="mcf-mobile-menu-subtitle">Rendi visibile</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-separator class="mcf-mobile-menu-separator"/>

                        <q-item
                          clickable
                          v-close-popup
                          @click="deleteExpense(expense)"
                          class="mcf-mobile-menu-item mcf-mobile-menu-delete"
                        >
                          <q-item-section avatar>
                            <q-icon name="delete" class="mcf-mobile-menu-icon mcf-delete-icon"/>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="mcf-mobile-menu-title mcf-delete-text">Elimina</q-item-label>
                            <q-item-label caption class="mcf-mobile-menu-subtitle">Rimuovi spesa</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </template>
            </div>

            <!-- Recurring Installments Details (Mobile & Desktop) -->
            <div
              v-if="expense.is_recurring && expense.recurring_installments_status && isRecurringExpanded(expense.id)"
              class="recurring-dots-detailed"
            >
              <div class="recurring-header">
                <q-icon name="repeat" color="orange"/>
                <span class="recurring-title">Rate del piano</span>

                <!-- Desktop Summary -->
                <div v-if="$q.screen.gt.sm && expense.recurring_installments_summary" class="recurring-summary-desktop">
                  <span class="summary-item">
                    Totale rate: <strong>€{{ expense.recurring_installments_summary.total_amount }}</strong>
                  </span>
                  <span class="summary-item">
                    Rate pagate: <strong>€{{ expense.recurring_installments_summary.completed_amount }}</strong>
                  </span>
                  <span class="summary-item">
                    Rate da pagare: <strong>€{{ expense.recurring_installments_summary.pending_amount }}</strong>
                  </span>
                </div>

                <!-- Mobile Summary (only numbers) -->
                <div v-else-if="expense.recurring_installments_summary" class="recurring-summary-mobile">
                  <span class="summary-numbers">
                    €{{
                      expense.recurring_installments_summary.completed_amount
                    }}/€{{
                      expense.recurring_installments_summary.total_amount
                    }}/€{{ expense.recurring_installments_summary.pending_amount }}
                  </span>
                </div>
              </div>
              <div class="recurring-installments-grid">
                <div
                  v-for="installment in expense.recurring_installments_status"
                  :key="installment.installment_number"
                  class="installment-item-mobile"
                >
                  <div class="installment-info-mobile">
                    <q-checkbox
                      :model-value="getInstallmentCheckboxValue(installment, expense.installment_number)"
                      readonly
                      size="sm"
                      :color="getInstallmentCheckboxColor(installment, expense.installment_number)"
                      class="installment-checkbox-mobile"
                      @click="toggleInstallmentEdit(expense.id, installment.installment_number)"
                    />
                    <div class="installment-number">{{ installment.installment_number }}</div>
                    <div
                      class="installment-status"
                      :class="getInstallmentStatusClass(installment, expense.installment_number)"
                    >
                      {{ getInstallmentStatus(installment) }}
                    </div>
                  </div>

                  <!-- Installment Amount - Editable -->
                  <div class="installment-amount-container">
                    <!-- Normal View -->
                    <div
                      v-if="!isInstallmentEditing(expense.id, installment.installment_number)"
                      class="installment-amount"
                      @click="toggleInstallmentEdit(expense.id, installment.installment_number)"
                    >
                      €{{ installment.amount }}
                      <q-icon name="edit" size="xs" class="edit-hint-icon"/>
                    </div>

                    <!-- Edit Mode -->
                    <div
                      v-else
                      class="installment-edit-container"
                    >
                      <q-input
                        v-model="editingInstallmentAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        dense
                        outlined
                        autofocus
                        prefix="€"
                        class="installment-edit-input"
                        @keyup.enter="saveInstallmentAmount(expense.id, installment.installment_number)"
                        @keyup.escape="cancelInstallmentEdit()"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="save"
                        size="sm"
                        color="primary"
                        class="save-installment-btn"
                        @click="saveInstallmentAmount(expense.id, installment.installment_number)"
                        :loading="savingInstallment"
                      >
                        <q-tooltip>Salva Rata</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredExpenses.length === 0" class="empty-expenses">
            <q-icon name="receipt_long" size="48px" class="text-grey-4"/>
            <div class="empty-title">Nessuna spesa {{ getEmptyStateText() }}</div>
            <div class="empty-subtitle">
              <span v-if="activeTab === 'all'">
                Inizia aggiungendo una spesa pianificata a questo piano.
              </span>
              <span v-else>
                Cambia filtro per vedere altre spese.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Expense Dialog -->
    <q-dialog
      v-model="showCreateExpenseDialog"
      persistent
      full-width
      position="top"
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="full-width" style="margin: 0; border-radius: 0 0 16px 16px; max-height: 90vh; display: flex; flex-direction: column;">
        <q-card-section class="flex-shrink-0 bg-grey-2" style="border-radius: 0 0 12px 12px;">
          <div class="text-h6">Nuova Spesa Pianificata</div>
          <div class="text-caption text-grey-6">Aggiungi una spesa al piano "{{ currentPlan?.name }}"</div>
        </q-card-section>

        <q-card-section class="q-pt-none flex-grow-1" style="overflow-y: auto;">
          <q-form @submit.prevent="createExpense" class="q-gutter-sm">
            <MCFInput
              v-model="newExpense.description"
              label="Descrizione *"
              required
              placeholder="es. Retta Thomas, Spesa supermercato..."
              :rules="[val => val && val.length > 0 || 'Descrizione richiesta']"
            />

            <MCFInput
              v-model="newExpense.amount"
              label="Importo Stimato *"
              required
              type="number"
              step="0.01"
              min="0"
              prefix="€"
              :rules="[val => val > 0 || 'Importo deve essere maggiore di zero']"
            />

            <CategorySelect
              v-model="newExpense.category"
              label="Categoria"
              clearable
              :return-object="true"
            />

            <MCFSelect
              v-model="newExpense.priority"
              :options="priorityOptions"
              label="Priorità"
              option-value="value"
              option-label="label"
              prepend-icon="priority_high"
            />

            <MCFDatePicker
              v-model="newExpense.due_date"
              label="Data Scadenza"
              clearable
            />

            <MCFInput
              v-model="newExpense.notes"
              label="Note (opzionali)"
              type="textarea"
              rows="2"
              placeholder="Note aggiuntive..."
            />

            <!-- Recurring Expense Section -->
            <q-separator class="q-my-sm"/>

            <div class="text-subtitle2 text-weight-medium q-mb-sm">
              <q-icon name="repeat" class="q-mr-xs"/>
              <q-toggle
                v-model="newExpense.is_recurring"
                label="Questa è una spesa ricorrente"
                color="orange"
                left-label
                @update:model-value="onRecurringToggle"
              />
            </div>

            <div v-if="newExpense.is_recurring" class="recurring-fields q-mt-sm">
              <div class="mcf-form-row">
                <div class="mcf-form-col">
                  <MCFInput
                    v-model.number="newExpense.total_installments"
                    label="Numero Rate Totali *"
                    required
                    type="number"
                    min="2"
                    max="60"
                    :rules="[val => val >= 2 || 'Minimo 2 rate', val => val <= 60 || 'Massimo 60 rate']"
                    hint="Es: 10 per dentista in 10 rate"
                  />
                </div>
                <div class="mcf-form-col">
                  <MCFSelect
                    v-model="newExpense.recurring_frequency"
                    :options="frequencyOptions"
                    label="Frequenza *"
                    required
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <q-banner class="bg-orange-1 text-orange-8 q-mt-sm" rounded>
                <template v-slot:avatar>
                  <q-icon name="info" color="orange"/>
                </template>
                Questa sarà la <strong>prima rata</strong>.
                Le altre {{ (newExpense.total_installments || 2) - 1 }} rate verranno generate automaticamente
                nei mesi successivi quando cliccherai "Genera Rate".
              </q-banner>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="flex-shrink-0 bg-grey-2" style="border-radius: 12px 12px 0 0;">
          <q-btn flat label="Annulla" v-close-popup @click="resetExpenseForm"/>
          <q-btn
            flat
            label="Crea Spesa"
            color="primary"
            @click="createExpense"
            :loading="saving"
            :disable="!canCreateExpense"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Payment Dialog -->
    <q-dialog
      v-model="showPaymentDialog"
      persistent
      full-width
      position="top"
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="full-width" style="margin: 0; border-radius: 0 0 16px 16px; max-height: 90vh; display: flex; flex-direction: column;">
        <q-card-section class="flex-shrink-0 bg-grey-2" style="border-radius: 0 0 12px 12px;">
          <div class="text-h6">Aggiungi Pagamento</div>
          <div class="q-mt-sm">
            <div class="text-subtitle1 text-weight-medium">{{ selectedExpense?.description }}</div>
            <div class="q-mt-sm">
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <div class="text-caption text-grey-6">Totale spesa</div>
                  <div class="text-body2 text-weight-medium">€{{ selectedExpense?.amount }}</div>
                </div>
                <div class="col-4">
                  <div class="text-caption text-grey-6">Già pagato</div>
                  <div class="text-body2 text-weight-medium text-positive">€{{ selectedExpense?.total_paid }}</div>
                </div>
                <div class="col-4">
                  <div class="text-caption text-grey-6">Rimanente</div>
                  <div class="text-body2 text-weight-medium text-negative">€{{ selectedExpense?.remaining_amount }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none flex-grow-1" style="overflow-y: auto;">
          <q-form @submit.prevent="addPayment" class="q-gutter-sm">
            <MCFInput
              v-model="newPayment.amount"
              label="Importo Pagamento *"
              required
              type="number"
              step="0.01"
              min="0"
              :max="selectedExpense?.remaining_amount"
              prefix="€"
              :rules="[val => {
                const numVal = parseFloat(val)
                const maxAmount = parseFloat(selectedExpense?.remaining_amount || 0)
                return (!isNaN(numVal) && numVal > 0 && numVal <= maxAmount) || 'Importo non valido'
              }]"
            />

            <MCFInput
              v-model="newPayment.description"
              label="Descrizione Pagamento"
              placeholder="es. Pagamento Marco..."
            />

            <MCFDatePicker
              v-model="newPayment.date"
              label="Data Pagamento"
              clearable
            />

            <MCFSelect
              v-model="newPayment.payment_method"
              :options="paymentMethodOptions"
              label="Metodo di Pagamento"
              emit-value
              map-options
            />

            <MCFSelect
              v-model="newPayment.payment_source"
              :options="paymentSourceOptions"
              label="Fonte di Pagamento"
              emit-value
              map-options
              @update:model-value="onPaymentSourceChange"
            />

            <div v-if="newPayment.payment_source === 'contribution'" class="text-caption text-grey-6 q-mt-sm">
              <div class="row items-center q-gutter-xs">
                <q-icon name="account_balance_wallet" size="16px"/>
                <span>Saldo disponibile: <span v-html="familyBalanceText"></span></span>
                <q-spinner v-if="loadingBalance" size="14px"/>
              </div>
              <div v-if="newPayment.amount && parseFloat(newPayment.amount) > familyBalance" class="text-negative">
                <q-icon name="warning" size="14px"/>
                Importo superiore al saldo disponibile
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="flex-shrink-0 bg-grey-2" style="border-radius: 12px 12px 0 0;">
          <q-btn flat label="Annulla" v-close-popup @click="resetPaymentForm"/>
          <q-btn
            flat
            label="Aggiungi Pagamento"
            color="primary"
            @click="addPayment"
            :loading="savingPayment"
            :disable="!canAddPayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Expense Dialog -->
    <q-dialog
      v-model="showEditExpenseDialog"
      persistent
      full-width
      position="top"
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="full-width" style="margin: 0; border-radius: 0 0 16px 16px; max-height: 90vh; display: flex; flex-direction: column;">
        <q-card-section class="flex-shrink-0 bg-grey-2" style="border-radius: 0 0 12px 12px;">
          <div class="text-h6">Modifica Spesa Pianificata</div>
          <div class="text-caption text-grey-6">Modifica la spesa del piano "{{ currentPlan?.name }}"</div>
        </q-card-section>

        <q-card-section class="q-pt-none flex-grow-1" style="overflow-y: auto;">
          <q-form @submit.prevent="updateExpense" class="q-gutter-sm">
            <MCFInput
              v-model="editExpenseForm.description"
              label="Descrizione *"
              required
              placeholder="es. Retta Thomas, Spesa supermercato..."
              :rules="[val => val && val.length > 0 || 'Descrizione richiesta']"
            />

            <MCFInput
              v-model="editExpenseForm.amount"
              label="Importo Stimato *"
              required
              type="number"
              step="0.01"
              min="0"
              prefix="€"
              :rules="[val => val > 0 || 'Importo deve essere maggiore di zero']"
            />

            <CategorySelect
              v-model="editExpenseForm.category"
              label="Categoria"
              clearable
              :return-object="true"
            />

            <MCFSelect
              v-model="editExpenseForm.priority"
              :options="priorityOptions"
              label="Priorità"
              option-value="value"
              option-label="label"
              prepend-icon="priority_high"
            />

            <MCFDatePicker
              v-model="editExpenseForm.due_date"
              label="Data Scadenza"
              clearable
            />

            <MCFInput
              v-model="editExpenseForm.notes"
              label="Note (opzionali)"
              type="textarea"
              rows="2"
              placeholder="Note aggiuntive..."
            />

            <!-- Recurring Expense Section -->
            <q-separator class="q-my-sm"/>

            <div class="text-subtitle2 text-weight-medium q-mb-sm">
              <q-icon name="repeat" class="q-mr-xs"/>
              <q-toggle
                v-model="editExpenseForm.is_recurring"
                label="Questa è una spesa ricorrente"
                color="orange"
                left-label
                @update:model-value="onRecurringToggle"
              />
            </div>

            <div v-if="editExpenseForm.is_recurring" class="recurring-fields q-mt-sm">
              <div class="mcf-form-row">
                <div class="mcf-form-col">
                  <MCFInput
                    v-model.number="editExpenseForm.total_installments"
                    label="Numero Rate Totali *"
                    required
                    type="number"
                    min="2"
                    max="60"
                    :rules="[val => val >= 2 || 'Minimo 2 rate', val => val <= 60 || 'Massimo 60 rate']"
                    hint="Es: 10 per dentista in 10 rate"
                  />
                </div>
                <div class="mcf-form-col">
                  <MCFSelect
                    v-model="editExpenseForm.recurring_frequency"
                    :options="frequencyOptions"
                    label="Frequenza *"
                    required
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <q-banner class="bg-orange-1 text-orange-8 q-mt-sm" rounded>
                <template v-slot:avatar>
                  <q-icon name="info" color="orange"/>
                </template>
                Questa sarà la <strong>prima rata</strong>.
                Le altre {{ (editExpenseForm.total_installments || 2) - 1 }} rate verranno generate automaticamente
                nei mesi successivi quando cliccherai "Genera Rate".
              </q-banner>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="flex-shrink-0 bg-grey-2" style="border-radius: 12px 12px 0 0;">
          <q-btn flat label="Annulla" v-close-popup @click="resetEditExpenseForm"/>
          <q-btn
            flat
            label="Salva Modifiche"
            color="primary"
            @click="updateExpense"
            :loading="saving"
            :disable="!canEditExpense"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Payments View Dialog -->
    <q-dialog
      v-model="showPaymentsDialog"
      persistent
      full-width
      position="top"
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="full-width" style="margin: 0; border-radius: 0 0 16px 16px; max-height: 90vh; display: flex; flex-direction: column;">
        <q-card-section class="flex-shrink-0 bg-grey-2" style="border-radius: 0 0 12px 12px;">
          <div class="text-h6">Pagamenti Effettuati</div>
          <div class="q-mt-sm">
            <div class="text-subtitle1 text-weight-medium">{{ selectedExpense?.description }}</div>
            <div class="q-mt-sm">
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <div class="text-caption text-grey-6">Totale spesa</div>
                  <div class="text-body2 text-weight-medium">€{{ selectedExpense?.amount }}</div>
                </div>
                <div class="col-4">
                  <div class="text-caption text-grey-6">Pagato</div>
                  <div class="text-body2 text-weight-medium text-positive">€{{ selectedExpense?.total_paid }}</div>
                </div>
                <div class="col-4">
                  <div class="text-caption text-grey-6">Rimanente</div>
                  <div class="text-body2 text-weight-medium text-negative">€{{ selectedExpense?.remaining_amount }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none flex-grow-1" style="overflow-y: auto;">
          <!-- Loading payments -->
          <div v-if="loading" class="text-center q-pa-lg">
            <q-spinner-dots size="40px" color="primary"/>
            <div class="q-mt-md">Caricamento pagamenti...</div>
          </div>

          <!-- Payments list -->
          <div v-else-if="payments.length > 0" class="payments-list">
            <div
              v-for="payment in payments"
              :key="payment.id"
              class="payment-item"
            >
              <div class="payment-header">
                <div class="payment-main">
                  <div class="payment-user-info">
                    <q-avatar
                      size="32px"
                      :color="payment.user ? 'primary' : 'grey-5'"
                      text-color="white"
                      class="payment-avatar"
                    >
                      {{ getUserInitials(payment.user?.first_name + ' ' + payment.user?.last_name) }}
                    </q-avatar>
                    <div class="payment-details">
                      <div class="payment-description">{{ payment.description }}</div>
                      <div class="payment-meta">
                        <span class="payment-user">{{ payment.user?.first_name }} {{ payment.user?.last_name }}</span>
                        <span class="payment-date">• {{ formatDate(payment.date) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="payment-amount">€{{ formatAmount(payment.amount) }}</div>
              </div>
              <div v-if="payment.notes" class="payment-notes">{{ payment.notes }}</div>
            </div>

            <!-- Summary by User -->
            <div v-if="paymentsByUser.length > 0" class="payments-by-user">
              <div class="section-title">Pagamenti per utente</div>
              <div
                v-for="userPayment in paymentsByUser"
                :key="userPayment.userId"
                class="user-payment-summary"
              >
                <div class="user-summary-info">
                  <q-avatar
                    size="24px"
                    color="primary"
                    text-color="white"
                    class="user-summary-avatar"
                  >
                    {{ getUserInitials(userPayment.fullName) }}
                  </q-avatar>
                  <span class="user-summary-name">{{ userPayment.fullName }}</span>
                </div>
                <div class="user-summary-stats">
                  <span class="user-summary-count">{{ userPayment.count }} pagamenti</span>
                  <span class="user-summary-amount">€{{ formatAmount(userPayment.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Overall Summary -->
            <div class="payments-summary">
              <div class="summary-row">
                <span>Totale pagamenti:</span>
                <span class="summary-amount">€{{ formatAmount(totalPayments) }}</span>
              </div>
              <div class="summary-row">
                <span>Importo rimanente:</span>
                <span class="summary-amount remaining">€{{
                    formatAmount(selectedExpense?.remaining_amount || 0)
                  }}</span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="empty-payments">
            <q-icon name="receipt" size="48px" class="text-grey-4"/>
            <div class="empty-title">Nessun pagamento effettuato</div>
            <div class="empty-subtitle">Questa spesa non ha ancora ricevuto pagamenti.</div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="flex-shrink-0 bg-grey-2" style="border-radius: 12px 12px 0 0;">
          <q-btn flat label="Chiudi" v-close-popup @click="closePaymentsDialog"/>
          <q-btn
            v-if="!selectedExpense?.is_fully_paid"
            flat
            label="Aggiungi Pagamento"
            color="primary"
            @click="addPaymentFromPaymentsView"
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

  </q-page>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {useQuasar} from 'quasar'
import {useRoute} from 'vue-router'
// 🚀 Import ottimizzato: solo i moduli API necessari per questa pagina
import {reportsAPI} from 'src/services/api/reports.js'
import {expensesAPI} from 'src/services/api/expenses.js'
import {useContributionsStore} from 'src/stores/contributions.js'

// Questa pagina gestisce piani di spesa e spese, quindi importiamo solo:
// - reportsAPI per spending plans e planned expenses
// - contributionsStore per il balance famiglia con caching
import {useSnackbar} from 'src/composables/useSnackbar'
import MCFDatePicker from 'components/MCFDatePicker.vue'
import MCFAutocomplete from 'components/MCFAutocomplete.vue'
import MCFInput from 'components/forms/MCFInput.vue'
import MCFSelect from 'components/forms/MCFSelect.vue'
import CategorySelect from 'components/CategorySelect.vue'
import DeleteExpenseModal from 'components/DeleteExpenseModal.vue'
import MCFLoading from 'src/components/MCFLoading.vue'
import { MCFFormModal, MCFInfoModal } from 'components/modals'

const $q = useQuasar()
const route = useRoute()
const snackbar = useSnackbar()
const contributionsStore = useContributionsStore()

// Stato reattivo
const plannedExpenses = ref([])
const currentPlan = ref(null)
const loading = ref(false)

// Cache per i pagamenti
const expensePaymentsCache = ref(new Map())
const saving = ref(false)
const savingPayment = ref(false)
const activeTab = ref('all')
const showCreateExpenseDialog = ref(false)
const showPaymentDialog = ref(false)
const showEditExpenseDialog = ref(false)
const showPaymentsDialog = ref(false)
const selectedExpense = ref(null)
const editingExpense = ref(null)
const payments = ref([])

// Delete modal state
const showDeleteModal = ref(false)
const expenseToDelete = ref(null)
const deleting = ref(false)

// Toggle per visualizzare percentuale per numero o per importo
const showAmountProgress = ref(false)

// Form nuova spesa
const newExpense = ref({
  description: '',
  amount: '',
  category: null, // Conterrà {category: id, subcategory: id}
  priority: 'medium',
  due_date: '',
  notes: '',
  // Recurring fields
  is_recurring: false,
  total_installments: 2,
  installment_number: 1,
  recurring_frequency: 'monthly'
})

// Form nuovo pagamento
const newPayment = ref({
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  payment_method: 'carta',
  payment_source: 'personal'
})

// Form modifica spesa
const editExpenseForm = ref({
  description: '',
  amount: '',
  category: null, // Conterrà {category: id, subcategory: id}
  priority: 'medium',
  due_date: '',
  notes: '',
  is_recurring: false,
  total_installments: 2,
  recurring_frequency: 'monthly'
})

// Opzioni priorità
const priorityOptions = [
  {label: 'Bassa', value: 'low'},
  {label: 'Media', value: 'medium'},
  {label: 'Alta', value: 'high'},
  {label: 'Urgente', value: 'urgent'}
]

// Options for recurring frequency
const frequencyOptions = [
  {label: 'Mensile', value: 'monthly'},
  {label: 'Bimestrale', value: 'bimonthly'},
  {label: 'Trimestrale', value: 'quarterly'}
]

// Payment options
const paymentMethodOptions = [
  {label: 'Carta di Credito/Debito', value: 'carta'},
  {label: 'Contanti', value: 'contanti'},
  {label: 'Bonifico Bancario', value: 'bonifico'},
  {label: 'PayPal', value: 'paypal'},
  {label: 'Assegno', value: 'assegno'},
  {label: 'Altro', value: 'altro'}
]

const paymentSourceOptions = [
  {label: 'Personale', value: 'personal'},
  {label: 'Contributi Famiglia', value: 'contribution'}
]

// Computed
const planId = computed(() => route.params.id)
const familyBalance = computed(() => {
  const balance = contributionsStore.familyBalance
  return (balance !== null && balance !== undefined) ? balance : 0
})

const familyTotalContributions = computed(() => {
  const total = contributionsStore.familyTotalContributions
  return (total !== null && total !== undefined) ? total : 0
})

const familyBalanceText = computed(() => {
  const balance = familyBalance.value
  const total = familyTotalContributions.value

  console.log('🏦 familyBalanceText computed - balance:', balance, 'total:', total)

  if (total > 0) {
    return `<span style="font-weight: 600;">€${balance.toFixed(2)}</span><span style="color: #666; margin: 0 2px;">/</span><span style="font-size: 0.85em; color: #888;">€${total.toFixed(2)}</span>`
  } else {
    return `€${balance.toFixed(2)}`
  }
})
const loadingBalance = ref(false)

// Computed properties
const filteredExpenses = computed(() => {
  if (activeTab.value === 'all') return plannedExpenses.value
  return plannedExpenses.value.filter(expense => {
    return expense.payment_status === activeTab.value
  })
})

const totalPlanned = computed(() => {
  // Usa il dato calcolato dal backend che include tutte le spese
  return parseFloat(currentPlan.value?.total_estimated_amount || 0)
})

const totalPaid = computed(() => {
  // Usa il dato calcolato dal backend che include spese pianificate + effettive
  return parseFloat(currentPlan.value?.completed_expenses_amount || 0)
})

const totalRemaining = computed(() => {
  // Usa il dato calcolato dal backend
  return parseFloat(currentPlan.value?.pending_expenses_amount || 0)
})

const progressValue = computed(() => {
  // Usa la percentuale già calcolata dal backend
  const percentage = parseFloat(currentPlan.value?.completion_percentage || 0)
  return percentage / 100
})

const progressColor = computed(() => {
  const progress = progressValue.value
  if (progress >= 1) return 'green-3'      // Verde tenue per completato
  if (progress >= 0.7) return 'amber-4'    // Ambra delicata per quasi completo
  if (progress >= 0.4) return 'blue-3'     // Blu tenue per in progresso
  return 'blue-grey-4'                     // Grigio-blu per inizio
})

// Computed per il testo del progresso
const progressText = computed(() => {
  if (!currentPlan.value) return ''

  if (showAmountProgress.value) {
    // Mostra importi economici
    const paid = parseFloat(currentPlan.value.completed_expenses_amount || 0)
    const total = parseFloat(currentPlan.value.total_planned_amount || 0)
    return `Pagati €${paid.toFixed(2)} su €${total.toFixed(2)}`
  } else {
    // Mostra numero di spese
    const completed = parseInt(currentPlan.value.completed_count || 0)
    const total = parseInt(currentPlan.value.total_expenses_count || 0)
    return `Pagate ${completed} su ${total}`
  }
})

// Computed per il valore del progresso in base al toggle
const dynamicProgressValue = computed(() => {
  if (!currentPlan.value) return 0

  if (showAmountProgress.value) {
    // Calcola percentuale per importi
    const paid = parseFloat(currentPlan.value.completed_expenses_amount || 0)
    const total = parseFloat(currentPlan.value.total_planned_amount || 0)
    return total > 0 ? paid / total : 0
  } else {
    // Usa la percentuale per numero di spese (quella esistente)
    return progressValue.value
  }
})

const canCreateExpense = computed(() => {
  return newExpense.value.description &&
    newExpense.value.amount &&
    parseFloat(newExpense.value.amount) > 0
})

const canAddPayment = computed(() => {
  const amount = parseFloat(newPayment.value.amount)
  const remainingAmount = parseFloat(selectedExpense.value?.remaining_amount || 0)

  // Validazione base
  const basicValidation = newPayment.value.amount &&
    !isNaN(amount) &&
    amount > 0 &&
    !isNaN(remainingAmount) &&
    amount <= remainingAmount

  // Se sta pagando con contributi, verifica che ci sia saldo sufficiente
  if (newPayment.value.payment_source === 'contribution') {
    // Debug validazione saldo
    // console.log('🏦 Validazione saldo:', { amount, familyBalance: familyBalance.value, isValid: amount <= familyBalance.value, basicValidation })
    return basicValidation && amount <= familyBalance.value
  }

  return basicValidation
})

const canEditExpense = computed(() => {
  return editExpenseForm.value.description &&
    editExpenseForm.value.amount &&
    parseFloat(editExpenseForm.value.amount) > 0
})

const totalPayments = computed(() => {
  return payments.value.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
})

const paymentsByUser = computed(() => {
  const userMap = new Map()

  payments.value.forEach(payment => {
    if (payment.user) {
      const userId = payment.user.id
      const fullName = `${payment.user.first_name} ${payment.user.last_name}`.trim()

      if (userMap.has(userId)) {
        const existing = userMap.get(userId)
        existing.total += parseFloat(payment.amount || 0)
        existing.count += 1
      } else {
        userMap.set(userId, {
          userId,
          fullName,
          total: parseFloat(payment.amount || 0),
          count: 1
        })
      }
    }
  })

  return Array.from(userMap.values()).sort((a, b) => b.total - a.total)
})

// Stats per le modali
const paymentModalStats = computed(() => [
  {
    label: 'Totale spesa',
    value: `€${selectedExpense.value?.amount || 0}`,
    colorClass: ''
  },
  {
    label: 'Già pagato',
    value: `€${selectedExpense.value?.total_paid || 0}`,
    colorClass: 'text-positive'
  },
  {
    label: 'Rimanente',
    value: `€${selectedExpense.value?.remaining_amount || 0}`,
    colorClass: 'text-negative'
  }
])

// Metodi
const loadPlanData = async () => {
  loading.value = true
  try {
    // 🚀 Usa il nuovo endpoint ottimizzato che carica tutto in una chiamata
    const response = await reportsAPI.getSpendingPlanDetails(planId.value)

    currentPlan.value = response.plan

    // Le spese pianificate vengono caricate direttamente dal piano
    const plannedExpensesFromPlan = response.plan.planned_expenses_detail || []

    // Le spese non pianificate vengono caricate separatamente
    const unplannedExpenses = response.unplanned_expenses || []

    // Combina spese pianificate e non pianificate
    plannedExpenses.value = [
      ...plannedExpensesFromPlan,
      ...unplannedExpenses.map(exp => ({
        ...exp,
        is_real_expense: true // Flag per distinguere spese reali non pianificate
      }))
    ]

    console.log('📋 Piano caricato:', currentPlan.value)
    console.log('💰 Spese pianificate:', plannedExpensesFromPlan.length)
    console.log('💳 Spese non pianificate:', unplannedExpenses.length)
    console.log('💰 Totale spese caricate:', plannedExpenses.value.length)
    console.log('🚀 Performance: utilizzato endpoint ottimizzato /details/')

    // Carica i dati dei pagamenti in background
    loadPaymentsData()
  } catch (error) {
    console.error('Errore nel caricamento dei dati del piano:', error)
    snackbar.error('Errore nel caricamento dei dati')
  } finally {
    loading.value = false
  }
}

const loadFamilyBalance = async (forceRefresh = false) => {
  try {
    loadingBalance.value = true
    await contributionsStore.fetchBalance(forceRefresh)
  } catch (error) {
    console.error('Errore nel caricamento del saldo famiglia:', error)
  } finally {
    loadingBalance.value = false
  }
}

const createExpense = async () => {
  if (!canCreateExpense.value) return

  saving.value = true
  try {
    // Il CategorySelect restituisce {category: id, subcategory: id}
    const categoryData = newExpense.value.category
    const expenseData = {
      description: newExpense.value.description,
      amount: parseFloat(newExpense.value.amount),
      category: categoryData?.category || null,
      subcategory: categoryData?.subcategory || null,
      priority: newExpense.value.priority,
      due_date: newExpense.value.due_date,
      notes: newExpense.value.notes,
      spending_plan: parseInt(planId.value),
      // Campi ricorrenza
      is_recurring: newExpense.value.is_recurring,
      total_installments: newExpense.value.total_installments,
      installment_number: newExpense.value.installment_number,
      recurring_frequency: newExpense.value.recurring_frequency
    }

    await reportsAPI.createPlannedExpense(expenseData)

    snackbar.success('Spesa pianificata creata con successo!')

    showCreateExpenseDialog.value = false
    resetExpenseForm()
    await loadPlanData()

  } catch (error) {
    console.error('Errore nella creazione della spesa:', error)
    snackbar.error('Errore nella creazione della spesa')
  } finally {
    saving.value = false
  }
}

const openPaymentDialog = (expense) => {
  selectedExpense.value = expense
  newPayment.value = {
    amount: (parseFloat(expense.remaining_amount || 0) || 0).toString(),
    description: `Pagamento per ${expense.description}`,
    date: new Date().toISOString().split('T')[0],
    payment_method: 'carta',
    payment_source: 'personal'
  }
  showPaymentDialog.value = true
}

const addPayment = async () => {
  if (!canAddPayment.value) return

  savingPayment.value = true
  try {
    const paymentData = {
      amount: parseFloat(newPayment.value.amount),
      description: newPayment.value.description,
      date: newPayment.value.date,
      payment_method: newPayment.value.payment_method,
      payment_source: newPayment.value.payment_source
    }

    // Usa l'API esistente per i pagamenti di spese pianificate, ora con supporto per contributi
    await reportsAPI.addPaymentToPlannedExpense(selectedExpense.value.id, paymentData)

    snackbar.success('Pagamento aggiunto con successo!')

    showPaymentDialog.value = false
    resetPaymentForm()
    await loadPlanData()

    // Ricarica il saldo famiglia se è stato usato un contributo
    if (paymentData.payment_source === 'contribution') {
      contributionsStore.invalidateBalanceCache()
      await loadFamilyBalance(true) // Force refresh dopo uso contributo
    }

  } catch (error) {
    console.error('Errore nell\'aggiunta del pagamento:', error)
    snackbar.error(error.response?.data?.detail || 'Errore nell\'aggiunta del pagamento')
  } finally {
    savingPayment.value = false
  }
}

const resetExpenseForm = () => {
  newExpense.value = {
    description: '',
    amount: '',
    category: null,
    priority: 'medium',
    due_date: '',
    notes: '',
    // Recurring fields
    is_recurring: false,
    total_installments: 2,
    installment_number: 1,
    recurring_frequency: 'monthly'
  }
}

const resetPaymentForm = () => {
  newPayment.value = {
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'carta',
    payment_source: 'personal'
  }
  selectedExpense.value = null
}

const onPaymentSourceChange = (source) => {
  if (source === 'contribution') {
    loadFamilyBalance() // Usa cache se disponibile
  }
}

// Recurring expense logic
const onRecurringToggle = (isRecurring) => {
  if (!isRecurring) {
    // Reset recurring fields when toggled off for new expense
    if (newExpense.value) {
      newExpense.value.total_installments = 2
      newExpense.value.installment_number = 1
      newExpense.value.recurring_frequency = 'monthly'
    }

    // Reset recurring fields when toggled off for edit expense
    if (editExpenseForm.value) {
      editExpenseForm.value.total_installments = 2
      editExpenseForm.value.recurring_frequency = 'monthly'
    }
  } else {
    // Set defaults for recurring expense (new)
    if (newExpense.value) {
      newExpense.value.installment_number = 1
      if (!newExpense.value.total_installments || newExpense.value.total_installments < 2) {
        newExpense.value.total_installments = 2
      }
    }

    // Set defaults for recurring expense (edit)
    if (editExpenseForm.value && (!editExpenseForm.value.total_installments || editExpenseForm.value.total_installments < 2)) {
      editExpenseForm.value.total_installments = 2
    }
  }
}

const resetEditExpenseForm = () => {
  editExpenseForm.value = {
    description: '',
    amount: '',
    category: null,
    priority: 'medium',
    due_date: '',
    notes: '',
    is_recurring: false,
    total_installments: 2,
    recurring_frequency: 'monthly'
  }
  editingExpense.value = null
}

const toggleProgressDisplay = () => {
  showAmountProgress.value = !showAmountProgress.value
}

const updateExpense = async () => {
  if (!canEditExpense.value || !editingExpense.value) return

  console.log('🔍 Updating expense with ID:', editingExpense.value.id)
  console.log('🔍 Expense data:', editingExpense.value)

  saving.value = true
  try {
    // Il CategorySelect restituisce {category: id, subcategory: id}
    const categoryData = editExpenseForm.value.category
    const expenseData = {
      description: editExpenseForm.value.description,
      amount: parseFloat(editExpenseForm.value.amount),
      category: categoryData?.category || null,
      subcategory: categoryData?.subcategory || null,
      priority: editExpenseForm.value.priority,
      due_date: editExpenseForm.value.due_date,
      notes: editExpenseForm.value.notes,
      spending_plan: parseInt(planId.value),
      is_recurring: editExpenseForm.value.is_recurring,
      total_installments: editExpenseForm.value.is_recurring ? parseInt(editExpenseForm.value.total_installments) : null,
      recurring_frequency: editExpenseForm.value.is_recurring ? editExpenseForm.value.recurring_frequency : null
    }

    await reportsAPI.updatePlannedExpense(editingExpense.value.id, expenseData)

    // Se è stata attivata la ricorrenza, genera automaticamente le rate
    if (editExpenseForm.value.is_recurring && editExpenseForm.value.total_installments > 1) {
      try {
        console.log('🔄 Generating recurring installments...')
        const recurringResponse = await reportsAPI.generateRecurringInstallments(editingExpense.value.id)
        console.log('✅ Recurring installments generated:', recurringResponse)

        snackbar.success(`Spesa pianificata aggiornata e generate ${recurringResponse.created_installments || 0} rate ricorrenti!`)
      } catch (recurringError) {
        console.error('⚠️ Error generating recurring installments:', recurringError)
        snackbar.warning('Spesa aggiornata, ma errore nella generazione delle rate ricorrenti')
      }
    } else {
      snackbar.success('Spesa pianificata aggiornata con successo!')
    }

    showEditExpenseDialog.value = false
    resetEditExpenseForm()
    await loadPlanData()

  } catch (error) {
    console.error('❌ Errore nell\'aggiornamento della spesa:', error)

    let errorMessage = 'Errore nell\'aggiornamento della spesa'

    if (error.response?.status === 404) {
      errorMessage = 'Spesa non trovata. Potrebbe essere stata eliminata. Ricaricando i dati...'
      // Ricarica automaticamente i dati del piano per sincronizzare
      setTimeout(() => {
        loadPlanData()
      }, 2000)
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    }

    snackbar.error(errorMessage)
  } finally {
    saving.value = false
  }
}

const editExpense = (expense) => {
  editingExpense.value = expense

  // Costruisci l'oggetto categoria nel formato atteso dal CategorySelect
  let categoryData = null
  if (expense.category || expense.subcategory) {
    categoryData = {
      category: expense.category,
      subcategory: expense.subcategory
    }
  }

  editExpenseForm.value = {
    description: expense.description,
    amount: expense.amount,
    category: categoryData,
    priority: expense.priority,
    due_date: expense.due_date,
    notes: expense.notes || '',
    is_recurring: expense.is_recurring || false,
    total_installments: expense.total_installments || 2,
    recurring_frequency: expense.recurring_frequency || 'monthly'
  }
  showEditExpenseDialog.value = true
}

const deleteExpense = (expense) => {
  expenseToDelete.value = expense
  showDeleteModal.value = true
}

const confirmDeleteExpense = async () => {
  if (!expenseToDelete.value) return

  deleting.value = true
  try {
    await reportsAPI.deletePlannedExpense(expenseToDelete.value.id)
    snackbar.success('Spesa eliminata con successo')
    await loadPlanData()

    // Chiudi la modale
    showDeleteModal.value = false
    expenseToDelete.value = null
  } catch (error) {
    console.error('Errore nell\'eliminazione della spesa:', error)
    snackbar.error('Errore nell\'eliminazione della spesa')
  } finally {
    deleting.value = false
  }
}

const cancelDeleteExpense = () => {
  showDeleteModal.value = false
  expenseToDelete.value = null
}

const viewPayments = async (expense) => {
  selectedExpense.value = expense
  showPaymentsDialog.value = true

  try {
    loading.value = true

    // Debug: loggiamo i dettagli della spesa
    console.log('🔍 DEBUG - Expense object:', {
      id: expense.id,
      description: expense.description,
      is_real_expense: expense.is_real_expense,
      planned_expense_id: expense.planned_expense_id,
      parent_recurring_id: expense.parent_recurring_id,
      type: expense.is_real_expense ? 'REAL_EXPENSE' : 'PLANNED_EXPENSE'
    })

    // Se è una spesa reale non pianificata, usa l'endpoint delle quote
    if (expense.is_real_expense) {
      const response = await expensesAPI.getExpenseQuotes(expense.id)
      payments.value = response || []
      console.log('📋 Quote spesa reale caricate:', payments.value.length)
    } else {
      // È una spesa pianificata, usa l'endpoint delle planned expenses
      const response = await reportsAPI.getPlannedExpensePayments(expense.id)
      payments.value = response.results || response || []
      console.log('📋 Pagamenti spesa pianificata caricati:', payments.value.length)
    }
  } catch (error) {
    console.error('❌ Errore nel caricamento dei pagamenti:', error)
    console.error('❌ Expense che ha causato l\'errore:', expense)
    snackbar.error('Errore nel caricamento dei pagamenti')
    payments.value = []
  } finally {
    loading.value = false
  }
}

const closePaymentsDialog = () => {
  showPaymentsDialog.value = false
  selectedExpense.value = null
  payments.value = []
}

const addPaymentFromPaymentsView = () => {
  showPaymentsDialog.value = false
  openPaymentDialog(selectedExpense.value)
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

const getUserInitials = (fullName) => {
  if (!fullName) return '?'
  const names = fullName.split(' ')
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'In Attesa',
    partial: 'Parziale',
    completed: 'Completata',
    overdue: 'Scaduta'
  }
  return labels[status] || status
}

const getExpenseStatusClass = (expense) => {
  return `status-${expense.payment_status}`
}

const getProgressColor = (percentage) => {
  if (percentage >= 100) return 'green-3'    // Verde più tenue
  if (percentage >= 75) return 'light-green-4'  // Verde chiaro
  if (percentage >= 50) return 'amber-4'     // Ambra più delicata
  if (percentage >= 25) return 'blue-3'     // Blu tenue
  return 'blue-grey-4'                       // Grigio-blu per inizio
}

// Nuovo metodo per il testo dei pagatori
const getPaymentByText = (expense) => {
  const paymentsData = expensePaymentsCache.value.get(expense.id)

  if (paymentsData && paymentsData.length > 0) {
    // Raggruppa i pagamenti per utente
    const paymentsByUser = paymentsData.reduce((acc, payment) => {
      const userName = payment.user.first_name || payment.user.username
      acc[userName] = (acc[userName] || 0) + 1
      return acc
    }, {})

    const users = Object.keys(paymentsByUser)
    if (users.length === 1) {
      const count = paymentsByUser[users[0]]
      return count === 1
        ? `Pagamento di ${users[0]}`
        : `${count} pagamenti di ${users[0]}`
    } else if (users.length === 2) {
      return `Pagamenti di ${users[0]} e ${users[1]}`
    } else {
      return `Pagamenti di ${users[0]} e altri ${users.length - 1}`
    }
  }

  // Fallback: mostra solo il numero di pagamenti
  if (expense.actual_payments_count === 1) {
    return `1 pagamento effettuato`
  }
  return `${expense.actual_payments_count} pagamenti effettuati`
}

const getEmptyStateText = () => {
  const texts = {
    all: 'trovata',
    pending: 'in attesa',
    partial: 'parzialmente pagata',
    completed: 'completata',
    overdue: 'scaduta'
  }
  return texts[activeTab.value] || 'trovata'
}

// Carica i dati dei pagamenti per tutte le spese con pagamenti
const loadPaymentsData = async () => {
  for (const expense of plannedExpenses.value) {
    if (expense.actual_payments_count > 0) {
      try {
        const paymentsResponse = await reportsAPI.getPlannedExpensePayments(expense.id)
        const paymentsData = paymentsResponse.results || paymentsResponse || []
        expensePaymentsCache.value.set(expense.id, paymentsData)
      } catch (error) {
        console.warn(`Errore nel caricamento pagamenti per spesa ${expense.id}:`, error)
      }
    }
  }
}

// Recurring Installments Logic
const canGenerateRecurring = (expense) => {
  // Verifica se ci sono ancora rate da generare
  if (!expense.is_recurring || !expense.total_installments) return false

  // Controlla se le rate sono già state generate (indicatore nelle note)
  if (expense.notes && expense.notes.includes('✅ Rate generate il')) {
    return false
  }

  // Verifica il numero effettivo di rate esistenti
  const parentId = expense.parent_recurring_id || expense.id
  const existingInstallments = plannedExpenses.value.filter(exp =>
    exp.parent_recurring_id === parentId || exp.id === parentId
  )

  // Se il numero di rate esistenti è già uguale o superiore al totale previsto, non mostrare il bottone
  if (existingInstallments.length >= expense.total_installments) {
    return false
  }

  return true
}

const generateRecurringInstallments = async (expense) => {
  if (!canGenerateRecurring(expense)) {
    console.warn('Cannot generate recurring installments for this expense')
    return
  }

  try {
    // Mostra loading con LoadingBar
    $q.loadingBar.start()

    // Chiama l'API per generare le ricorrenze
    const response = await reportsAPI.generateRecurringInstallments(expense.id)

    console.log('✅ Rate ricorrenti generate:', response)

    // Mostra messaggio di successo
    snackbar.success(
      `Generate ${response.created_installments} rate ricorrenti. ` +
      `Creati ${response.created_plans} nuovi piani.`
    )

    // Ricarica i dati per mostrare lo stato aggiornato
    await loadPlanData()

  } catch (error) {
    console.error('❌ Errore durante la generazione delle rate ricorrenti:', error)

    const errorMessage = error.response?.data?.detail ||
      error.message ||
      'Errore durante la generazione delle rate ricorrenti'

    snackbar.error(errorMessage)
  } finally {
    $q.loadingBar.stop()
  }
}

// Recurring Installments Visual Logic
const expandedRecurringExpenses = ref(new Set())

const isRecurringExpanded = (expenseId) => {
  return expandedRecurringExpenses.value.has(expenseId)
}

const toggleRecurringView = (expenseId) => {
  if (expandedRecurringExpenses.value.has(expenseId)) {
    expandedRecurringExpenses.value.delete(expenseId)
  } else {
    expandedRecurringExpenses.value.add(expenseId)
  }
}

const getInstallmentDotClass = (installment, currentInstallmentNumber) => {
  if (installment.is_fully_paid) {
    return 'installment-paid'
  } else if (installment.installment_number === currentInstallmentNumber) {
    return 'installment-current'
  } else {
    return 'installment-pending'
  }
}

const getInstallmentStatus = (installment) => {
  if (installment.is_fully_paid) {
    return 'Pagata'
  } else if (installment.is_partially_paid) {
    return 'Parziale'
  } else {
    return 'Da pagare'
  }
}

const getInstallmentStatusClass = (installment, currentInstallmentNumber) => {
  if (installment.is_fully_paid) {
    return 'paid'
  } else if (installment.installment_number === currentInstallmentNumber) {
    return 'current'
  } else {
    return 'pending'
  }
}

const getInstallmentCheckboxValue = (installment, currentInstallmentNumber) => {
  // Checkbox spuntata solo se pagata/completata
  if (installment.is_completed || installment.is_fully_paid) {
    return true
  }
  // Per test: mostra la rata corrente come checked per vedere se funziona
  return installment.installment_number === currentInstallmentNumber
}

const getInstallmentCheckboxColor = (installment, currentInstallmentNumber) => {
  if (installment.is_completed || installment.is_fully_paid) {
    return 'green-3'    // Verde tenue per completato
  } else if (installment.installment_number === currentInstallmentNumber) {
    return 'blue-3'     // Blu tenue per corrente
  } else {
    return 'grey-5'
  }
}

// Installment Edit Logic
const editingInstallments = ref(new Set())
const editingInstallmentAmount = ref('')
const savingInstallment = ref(false)

const isInstallmentEditing = (expenseId, installmentNumber) => {
  return editingInstallments.value.has(`${expenseId}-${installmentNumber}`)
}

const toggleInstallmentEdit = (expenseId, installmentNumber) => {
  const key = `${expenseId}-${installmentNumber}`

  if (editingInstallments.value.has(key)) {
    // Cancel edit
    editingInstallments.value.delete(key)
    editingInstallmentAmount.value = ''
  } else {
    // Start edit - find current amount
    const expense = filteredExpenses.value.find(e => e.id === expenseId)
    if (expense && expense.recurring_installments_status) {
      const installment = expense.recurring_installments_status.find(
        i => i.installment_number === installmentNumber
      )
      if (installment) {
        editingInstallmentAmount.value = installment.amount
        editingInstallments.value.clear() // Only one edit at a time
        editingInstallments.value.add(key)
      }
    }
  }
}

const cancelInstallmentEdit = () => {
  editingInstallments.value.clear()
  editingInstallmentAmount.value = ''
}

const saveInstallmentAmount = async (expenseId, installmentNumber) => {
  try {
    savingInstallment.value = true

    // Validate amount
    const amount = parseFloat(editingInstallmentAmount.value)
    if (isNaN(amount) || amount <= 0) {
      snackbar.error('Inserisci un importo valido maggiore di 0')
      return
    }

    console.log(`💰 Updating installment ${installmentNumber} for expense ${expenseId} to €${amount}`)

    // Call API to update installment amount
    // Note: This would need a new API endpoint
    const response = await reportsAPI.updatePlannedExpenseInstallment(expenseId, installmentNumber, {
      amount: amount
    })

    // Update local data
    const expense = filteredExpenses.value.find(e => e.id === expenseId)
    if (expense && expense.recurring_installments_status) {
      const installment = expense.recurring_installments_status.find(
        i => i.installment_number === installmentNumber
      )
      if (installment) {
        installment.amount = amount
      }

      // Update summary if returned by backend
      if (response.updated_summary) {
        expense.recurring_installments_summary = response.updated_summary
      }
    }

    snackbar.success(`Rata ${installmentNumber} aggiornata a €${amount}`)
    cancelInstallmentEdit()

  } catch (error) {
    console.error('❌ Error updating installment amount:', error)

    let errorMessage = 'Errore durante l\'aggiornamento della rata'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  } finally {
    savingInstallment.value = false
  }
}

// Note: Installment summary calculations are now done in backend
// via recurring_installments_summary field for better performance

// ===== HIDE/SHOW EXPENSE FUNCTIONS =====
const hideExpense = async (expense) => {
  try {
    await reportsAPI.updatePlannedExpense(expense.id, {
      is_hidden: true
    })

    // Update local data
    expense.is_hidden = true

    snackbar.success('Spesa nascosta dalla vista')
  } catch (error) {
    console.error('❌ Error hiding expense:', error)

    let errorMessage = 'Errore durante il nascondimento della spesa'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  }
}

const showExpense = async (expense) => {
  try {
    await reportsAPI.updatePlannedExpense(expense.id, {
      is_hidden: false
    })

    // Update local data
    expense.is_hidden = false

    snackbar.success('Spesa mostrata nella vista')
  } catch (error) {
    console.error('❌ Error showing expense:', error)

    let errorMessage = 'Errore durante la visualizzazione della spesa'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  }
}


// Lifecycle
onMounted(async () => {
  // Le route guards garantiscono che l'utente sia autenticato
  await loadPlanData()
  // Carica il saldo famiglia all'avvio per averlo disponibile
  await loadFamilyBalance()
})
</script>

<style lang="scss" scoped>

.planned-expense-detail-content {
  width: 100%;
  margin: 0;
  padding: 12px;

  @media (min-width: 768px) {
    padding: 24px;
  }
}

// Override gestito nel CSS globale

.mcf-action-header {
  margin-bottom: 16px;
  padding: 0;

  @media (min-width: 768px) {
    margin-bottom: 24px;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;

  @media (min-width: 768px) {
    padding: 0 24px;
  }
}


// === PLAN INFO CARD ===
.plan-info-card {
  background: var(--mcf-bg-surface);
  border: 1px dashed var(--mcf-secondary);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;

  @media (min-width: 768px) {
    border-radius: 16px;
    margin-bottom: 24px;
  }
}

.plan-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
  gap: 12px;

  @media (min-width: 768px) {
    padding: 24px;
    gap: 16px;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

.plan-main {
  flex: 1;
  min-width: 0;
}

.plan-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  line-height: 1.3;
  margin-bottom: 6px;

  @media (min-width: 768px) {
    font-size: 24px;
    margin-bottom: 8px;
  }
}

.plan-period {
  font-size: 13px;
  color: var(--mcf-text-secondary);
  font-weight: 500;
  margin-bottom: 8px;

  @media (min-width: 768px) {
    font-size: 14px;
    margin-bottom: 12px;
  }
}

.plan-description {
  font-size: 16px;
  color: var(--mcf-text-muted);
  line-height: 1.4;
}

.plan-summary {
  padding: 0 16px 16px 16px;
  border-top: 1px solid var(--mcf-border-light);
  background-color: #ffffff;

  @media (min-width: 768px) {
    padding: 0 24px 24px 24px;
  }
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }
}

.stat-item {
  text-align: center;
  padding: 2px 6px;

  @media (min-width: 768px) {
    padding: 16px 8px;
  }
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--mcf-primary);
  margin-bottom: 3px;
  font-feature-settings: 'tnum';

  @media (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 4px;
  }
}

.stat-label {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-container {
  margin-top: 8px;
}

.progress-bar {
  border-radius: 4px;
  margin-bottom: 6px;
}

.progress-text {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  text-align: center;
  font-weight: 500;
  transition: all 0.2s ease;

  &.cursor-pointer {
    user-select: none;

    &:hover {
      color: var(--q-primary);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

// === FILTER TABS ===
.filter-tabs {
  margin-bottom: 16px;

  @media (min-width: 768px) {
    margin-bottom: 24px;
  }
}

// === EXPENSES LIST ===
.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.expense-card {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  padding: 14px;
  transition: all 0.2s ease;

  @media (min-width: 768px) {
    border-radius: 12px;
    padding: 20px;
  }

  &:hover {
    box-shadow: var(--mcf-shadow-sm);
  }

  &.status-completed {
    border-left: 4px solid var(--mcf-accent);
    /* Rimuovo opacity e background disabilitato - card resta normale */
    opacity: 1;
    background-color: #ffffff;

    .expense-category,
    .amount-main,
    .payment-by-text {
      /* Testo normale, non disabilitato */
      color: inherit !important;
    }

    .status-badge {
      opacity: 1;
    }
  }

  &.status-partial {
    border-left: 4px solid orange;
  }

  &.status-overdue {
    border-left: 4px solid var(--mcf-error);
  }

  &.status-pending {
    border-left: 4px solid var(--mcf-primary);
  }
}

.expense-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;

  @media (min-width: 768px) {
    margin-bottom: 16px;
    gap: 16px;
  }
}

.expense-main {
  flex: 1;
  min-width: 0;
}

.expense-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-primary);
  line-height: 1.3;
  margin-bottom: 6px;

  @media (min-width: 768px) {
    font-size: 18px;
    margin-bottom: 8px;
  }
}

.expense-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--mcf-text-secondary);
}

.expense-badges {
  margin-top: 8px;
}

.recurring-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.recurring-fields {
  padding: 16px;
  background: rgba(255, 152, 0, 0.04);
  border: 1px solid rgba(255, 152, 0, 0.2);
  border-radius: 8px;
}

.expense-category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.expense-due-date {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-status {
  display: none; // Nascosto di default su desktop
}

.amount-mobile-status {
  display: none; // Nascosto di default su desktop
}

.expense-category {
  padding: 2px 8px;
  background-color: var(--mcf-bg-secondary);
  border-radius: 4px;
  font-weight: 500;
}

.expense-amount {
  text-align: right;
}

.amount-main {
  font-size: 18px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  margin-bottom: 3px;
  font-feature-settings: 'tnum';

  @media (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 4px;
  }
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.pending {
    background-color: var(--mcf-primary-light);
    color: var(--mcf-primary);
  }

  &.partial {
    background-color: #fff3cd;
    color: #856404;
  }

  &.completed {
    background-color: var(--mcf-accent-light);
    color: var(--mcf-accent);
  }

  &.overdue {
    background-color: var(--mcf-error-light);
    color: var(--mcf-error);
  }
}

.payment-progress {
  margin-bottom: 12px;

  @media (min-width: 768px) {
    margin-bottom: 16px;
  }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--mcf-text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
}

.payment-progress-bar {
  border-radius: 3px;
}

.payment-details {
  margin-top: 4px;
  text-align: center;
}

.payment-by-text {
  font-size: 11px;
  color: var(--mcf-text-secondary);
  font-style: italic;
}

.payment-info-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.paid-by-badges-inline {
  display: flex;
  gap: 4px;
  align-items: center;
}

.paid-by-badges {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-top: 4px;
}

.paid-by-badges-mobile {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.paid-by-badges-desktop {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.paid-by-chip {
  min-width: 24px;
  height: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 10px;
}

.paid-by-chip-small {
  min-width: 20px;
  height: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 10px;
}

.paid-by-badge {
  font-size: 0.65rem;
  font-weight: 600;
  margin-right: 4px;
  margin-bottom: 2px;
}

.expense-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (min-width: 769px) {
    justify-content: space-between;
  }

  @media (max-width: 600px) {
    justify-content: center;
    gap: 12px;
  }
}

/* Desktop layout containers */
.desktop-actions-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.desktop-actions-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Mobile Actions Layout */
.mobile-primary-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;

  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 6px;
  }
}

.mobile-secondary-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.mcf-mobile-primary-btn {
  min-height: 32px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: none;
  border-radius: 16px;
  transition: all 0.2s ease;

  &.q-btn--outline {
    border-width: 1px;
  }

  @media (max-width: 480px) {
    min-height: 28px;
    padding: 4px 10px;
    font-size: 11px;
  }
}

.mcf-mobile-menu-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--mcf-text-secondary);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--mcf-bg-hover);
    color: var(--mcf-text-primary);
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
  }
}

/* Mobile Menu Styles */
.mcf-mobile-expense-menu {
  min-width: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--mcf-border-light);
}

.mcf-mobile-menu-list {
  padding: 8px 0;
}

.mcf-mobile-menu-item {
  min-height: 48px;
  padding: 8px 16px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--mcf-bg-hover);
  }

  &.mcf-mobile-menu-delete:hover {
    background-color: rgba(244, 67, 54, 0.1);
  }
}

.mcf-mobile-menu-icon {
  font-size: 20px;
  color: var(--mcf-text-secondary);

  &.mcf-delete-icon {
    color: var(--mcf-error);
  }
}

.mcf-mobile-menu-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--mcf-text-primary);

  &.mcf-delete-text {
    color: var(--mcf-error);
  }
}

.mcf-mobile-menu-subtitle {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  margin-top: 2px;
}

.mcf-mobile-menu-separator {
  margin: 4px 0;
  background-color: var(--mcf-border-light);
}

/* Backward compatibility for old mobile action buttons */
.mcf-mobile-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 600px) {
    width: 36px;
    height: 36px;
  }
}

// === EMPTY STATE ===
.empty-expenses {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 12px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 16px 0 8px 0;
}

.empty-subtitle {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  line-height: 1.4;
}

// === MOBILE COMPACT LAYOUT ===
@media (max-width: 480px) {
  .planned-expense-detail-content {
    padding: 8px;
  }

  .plan-header {
    padding: 12px;
  }

  .plan-summary {
    padding: 0 12px 12px 12px;
  }

  .expense-card {
    padding: 12px;
  }

  .expenses-list {
    gap: 12px;
  }

  .stat-item {
    padding: 6px 6px !important;
  }

  .summary-stats .stat-item {
    padding: 6px 0 !important;
  }
}

// === RESPONSIVE ===
@media (max-width: 600px) {
  .summary-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    padding: 2px 0;
    border-bottom: 1px solid var(--mcf-border-light);

    &:last-child {
      border-bottom: none;
    }
  }

  .stat-label {
    margin-bottom: 0;
  }

  .expense-header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }

  .expense-main {
    flex: 1;
    min-width: 0;
  }

  .expense-amount {
    text-align: right;
    flex-shrink: 0;
    margin-left: 12px;
  }

  .expense-amount .amount-status {
    display: none; // Nasconde il badge desktop
  }

  .amount-mobile-status {
    display: block;
    text-align: right;
    margin-top: 4px;
  }

  .mobile-status {
    display: inline-block;
  }
}


/* === PLANNED EXPENSE MENU STYLES === */
.mcf-planned-expense-menu-btn {
  color: var(--mcf-text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;

  &:hover {
    color: var(--mcf-primary);
    background: linear-gradient(135deg, rgba(35, 157, 176, 0.12), rgba(35, 157, 176, 0.08));
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(35, 157, 176, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
}

.mcf-planned-expense-menu {
  min-width: 260px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15),
  0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--mcf-border-light);
  overflow: hidden;
  background: var(--mcf-bg-surface);
  backdrop-filter: blur(20px);
}

.mcf-menu-list {
  padding: 12px 0;
}

.mcf-menu-item {
  padding: 16px 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border-radius: 12px;
  margin: 0 8px 4px 8px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: var(--mcf-bg-hover);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
}

.mcf-menu-edit:hover {
  background: linear-gradient(135deg, rgba(35, 157, 176, 0.12), rgba(35, 157, 176, 0.08));
  border-left: 3px solid var(--mcf-primary);

  .mcf-menu-icon {
    color: var(--mcf-primary);
    transform: scale(1.1) rotate(5deg);
  }

  .mcf-menu-title {
    color: var(--mcf-primary);
    font-weight: 600;
  }
}

.mcf-menu-recurring:hover {
  background: linear-gradient(135deg, rgba(75, 85, 99, 0.12), rgba(75, 85, 99, 0.08));
  border-left: 3px solid #4b5563;

  .mcf-menu-icon {
    color: #4b5563;
    transform: scale(1.1) rotate(360deg);
  }

  .mcf-menu-title {
    color: #4b5563;
    font-weight: 600;
  }
}

.mcf-menu-hide:hover,
.mcf-menu-show:hover {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.12), rgba(156, 163, 175, 0.08));
  border-left: 3px solid #9ca3af;

  .mcf-menu-icon {
    color: #9ca3af;
    transform: scale(1.1);
  }

  .mcf-menu-title {
    color: #9ca3af;
    font-weight: 600;
  }
}

.mcf-menu-delete:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08));
  border-left: 3px solid #ef4444;

  .mcf-menu-icon {
    color: #ef4444;
    transform: scale(1.1) rotate(-5deg);
  }

  .mcf-menu-title {
    color: #ef4444;
    font-weight: 600;
  }
}

.mcf-menu-icon {
  font-size: 22px;
  color: var(--mcf-text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mcf-menu-title {
  font-weight: 500;
  font-size: 15px;
  color: var(--mcf-text-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
}

.mcf-menu-subtitle {
  font-size: 13px;
  color: var(--mcf-text-secondary);
  opacity: 0.75;
  margin-top: 4px;
  line-height: 1.4;
  transition: opacity 0.3s ease;
}

.mcf-menu-separator {
  margin: 8px 16px;
  background: linear-gradient(90deg, transparent 0%, var(--mcf-border-light) 20%, var(--mcf-border-light) 80%, transparent 100%);
  height: 1px;
  border: none;
}

/* === RESPONSIVE FORM LAYOUT === */
.mcf-form-row {
  display: flex;
  gap: 16px;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 16px;
  }
}

.mcf-form-col {
  flex: 1;
  min-width: 0; /* Previene overflow */

  @media (max-width: 600px) {
    flex: none;
    width: 100%;
  }
}

/* === PAYMENTS VIEW STYLES === */
.payments-list {
  max-height: 400px;
  overflow-y: auto;
}

.payment-item {
  padding: 12px;
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  margin-bottom: 8px;
  background: var(--mcf-bg-surface);
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    box-shadow: var(--mcf-shadow-sm);
  }
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.payment-main {
  flex: 1;
  min-width: 0;
}

.payment-description {
  font-size: 14px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin-bottom: 4px;
}

.payment-date {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  font-weight: 500;
}

.payment-amount {
  font-size: 16px;
  font-weight: 700;
  color: var(--mcf-primary);
  font-feature-settings: 'tnum';
}

.payment-notes {
  margin-top: 8px;
  font-size: 12px;
  color: var(--mcf-text-muted);
  font-style: italic;
  padding-top: 8px;
  border-top: 1px solid var(--mcf-border-light);
}

.payments-summary {
  margin-top: 16px;
  padding: 12px;
  background: var(--mcf-bg-surface);
  border-radius: 8px;
  border: 1px solid var(--mcf-border-light);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 13px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 4px;
    border-top: 1px solid var(--mcf-border-light);
    font-weight: 600;
  }
}

.summary-amount {
  font-weight: 600;
  color: var(--mcf-primary);

  &.remaining {
    color: var(--mcf-text-secondary);
  }
}

.empty-payments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 12px 0 8px 0;
}

.empty-subtitle {
  font-size: 14px;
  color: var(--mcf-text-secondary);
}

/* Payments dialog improvements */
.payment-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.payment-avatar {
  flex-shrink: 0;
}

.payment-details {
  flex: 1;
  min-width: 0;
}

.payment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 13px;
  color: var(--mcf-text-secondary);
}

.payment-user {
  font-weight: 500;
  color: var(--mcf-text-primary);
}

.payment-date {
  color: var(--mcf-text-secondary);
}

/* Payments by user section */
.payments-by-user {
  margin: 20px 0;
  padding: 16px;
  background: var(--mcf-bg-surface);
  border-radius: 8px;
  border: 1px solid var(--mcf-border-light);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin-bottom: 12px;
}

.user-payment-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--mcf-border-light);
  }
}

.user-summary-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-summary-avatar {
  flex-shrink: 0;
}

.user-summary-name {
  font-weight: 500;
  color: var(--mcf-text-primary);
  font-size: 14px;
}

.user-summary-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.user-summary-count {
  font-size: 12px;
  color: var(--mcf-text-secondary);
}

.user-summary-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--mcf-text-primary);
}

@media (max-width: 600px) {
  .payment-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .user-summary-stats {
    align-items: flex-end;
  }
}

/* Installment checkboxes styling */
.recurring-checkboxes-desktop {
  display: flex;
  align-items: center;
  gap: 4px;
}

.installment-checkbox {
  margin: 0 !important;
}

.installment-checkbox-mobile {
  margin: 0 !important;
  margin-right: 8px !important;
}

/* Recurring installments detailed view styling */
.recurring-dots-detailed {
  margin-top: 8px;
  border-top: 1px solid var(--mcf-border-light);
  padding-top: 8px;
}

.recurring-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 12px;

  @media (min-width: 768px) {
    padding: 0 16px;
  }
}

.recurring-title {
  font-weight: 600;
  color: var(--mcf-text-primary);
  font-size: 14px;

  @media (min-width: 768px) {
    font-size: 15px;
  }
}

/* Desktop Summary */
.recurring-summary-desktop {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
  font-size: 13px;

  @media (min-width: 768px) {
    gap: 20px;
    font-size: 14px;
  }
}

.summary-item {
  color: var(--mcf-text-secondary);
  white-space: nowrap;

  strong {
    color: var(--mcf-primary);
    font-weight: 600;
  }
}

/* Mobile Summary */
.recurring-summary-mobile {
  margin-left: auto;
}

.summary-numbers {
  background: var(--mcf-primary-light);
  color: var(--mcf-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  font-family: monospace;
}

.installment-item-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;

  &:not(:last-child) {
    border-bottom: 1px solid var(--mcf-border-light);
  }
}

.installment-info-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
}


.installment-number {
  font-weight: 600;
  color: var(--mcf-text-primary);
  min-width: 20px;
}

.installment-status {
  font-size: 12px;
  font-weight: 500;

  &.paid {
    color: #4caf50;
  }

  &.current {
    color: #2196f3;
  }

  &.pending {
    color: #757575;
  }
}

.installment-amount {
  font-weight: 600;
  color: var(--mcf-text-secondary);
}

/* Responsive behavior */
@media (max-width: 768px) {
  .recurring-dots-desktop {
    display: none;
  }
}

/* Desktop toggle button for detailed view */
.mcf-desktop-toggle-btn {
  width: 32px;
  height: 32px;
}

/* Installment amount editing styles */
.installment-amount-container {
  display: flex;
  align-items: center;
  min-height: 36px;
}

.installment-amount {
  font-weight: 600;
  color: var(--mcf-text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background-color: var(--mcf-bg-secondary);
    color: var(--mcf-primary);

    .edit-hint-icon {
      opacity: 1;
    }
  }
}

.edit-hint-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
  color: var(--mcf-text-muted);
}

.installment-edit-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 140px;
}

.installment-edit-input {
  flex: 1;
  min-width: 80px;

  :deep(.q-field__control) {
    min-height: 32px;
    padding: 0 8px;
  }

  :deep(.q-field__native) {
    font-size: 13px;
    font-weight: 600;
  }

  :deep(.q-field__prefix) {
    color: var(--mcf-primary);
    font-weight: 600;
  }
}

.save-installment-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  flex-shrink: 0;

  &:hover {
    background-color: var(--mcf-primary-light);
  }
}

/* Mobile responsive adjustments */
@media (max-width: 600px) {
  .installment-edit-container {
    max-width: 120px;
  }

  .installment-edit-input {
    min-width: 70px;

    :deep(.q-field__native) {
      font-size: 12px;
    }
  }

  .save-installment-btn {
    width: 24px;
    height: 24px;
    min-width: 24px;
  }
}

/* Removed media query - detailed view now available on both mobile and desktop */
</style>

<style lang="scss">
.q-page {
  background: #ffffff;
}
</style>
