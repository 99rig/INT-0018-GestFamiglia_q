<template>
  <div
    class="card-piano-spesa2"
    :class="{
      'card-piano-spesa2--active': plan.is_current,
      'card-piano-spesa2--completed': isCompleted,
      'card-piano-spesa2--expanded': isExpanded
    }"
    @click="$emit('click', plan)"
  >
    <!-- Status Indicator -->
    <div class="status-indicator" :class="getStatusClass()"></div>

    <!-- Card Header -->
    <div class="card-header">
      <div class="header-content">
        <div class="plan-info">
          <div class="plan-title-row">
            <h3 class="plan-name">{{ plan.name }}</h3>
            <q-icon
              v-if="!plan.is_shared"
              name="lock"
              size="16px"
              class="privacy-icon"
            >
              <q-tooltip>Piano personale</q-tooltip>
            </q-icon>
          </div>

          <div class="plan-meta">
            <div class="plan-period">
              <q-icon name="event" size="14px" />
              {{ formatPeriod(plan.start_date, plan.end_date) }}
              <q-chip
                :color="getPlanTypeColor(plan.plan_type)"
                text-color="white"
                size="sm"
                :label="getPlanTypeLabel(plan.plan_type)"
                class="type-chip"
                style="margin-left: auto;"
              />
            </div>
            <div class="plan-badges">
              <q-chip
                v-if="plan.is_current"
                color="positive"
                text-color="white"
                size="sm"
                label="Attivo"
                icon="radio_button_checked"
                class="status-chip"
              />
            </div>
          </div>
        </div>

        <div class="header-actions" @click.stop>
          <q-btn
            flat
            round
            icon="more_vert"
            size="sm"
            class="menu-btn"
          >
            <q-menu class="action-menu">
              <q-list>
                <q-item clickable v-close-popup @click="$emit('edit', plan)">
                  <q-item-section avatar>
                    <q-icon name="edit" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Modifica</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$emit('clone', plan)">
                  <q-item-section avatar>
                    <q-icon name="content_copy" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Clona</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="$emit('delete', plan)">
                  <q-item-section avatar>
                    <q-icon name="delete" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Elimina</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div v-if="plan.description" class="plan-description">
      {{ plan.description }}
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stats-row">
        <div class="stat-item" @click.stop="toggleExpansion">
          <div class="stat-icon">
            <q-icon name="receipt_long" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ plannedCount }}</div>
            <div class="stat-label">Spese</div>
          </div>
          <q-icon
            :name="isExpanded ? 'expand_less' : 'expand_more'"
            class="expand-icon"
          />
        </div>

        <div class="stat-item">
          <div class="stat-icon success">
            <q-icon name="check_circle" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ completedCount }}</div>
            <div class="stat-label">Pagate</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon primary">
            <q-icon name="euro" />
          </div>
          <div class="stat-content">
            <div class="stat-value">€{{ Math.round(plan.total_estimated_amount || 0) }}</div>
            <div class="stat-label">Budget</div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-header">
          <span class="progress-label">Completamento</span>
          <span class="progress-value">{{ Math.round(completionPercentage) }}%</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :class="getProgressClass(completionPercentage)"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Expenses Preview -->
    <q-slide-transition>
      <div v-if="hasExpenses && isExpanded" class="expenses-section">
        <div class="section-header">
          <q-icon name="list" size="18px" />
          <span>Ultime spese</span>
        </div>

        <div class="expenses-list">
          <ExpenseCardPreview
            v-for="expense in previewExpenses"
            :key="expense.id"
            :expense="expense"
          />
        </div>

        <div v-if="hasMoreExpenses" class="more-indicator">
          <q-icon name="more_horiz" />
          <span>+{{ remainingExpensesCount }} altre</span>
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import ExpenseCardPreview from './ExpenseCardPreview.vue'

// Props
const props = defineProps({
  plan: {
    type: Object,
    required: true
  },
  expanded: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['click', 'edit', 'clone', 'delete', 'toggle-expansion'])

// State
const isExpanded = ref(props.expanded)

// Computed properties
const plannedCount = computed(() => props.plan.total_expenses_count || 0)
const completedCount = computed(() => props.plan.completed_count || 0)
const completionPercentage = computed(() => props.plan.completion_percentage || 0)
const isCompleted = computed(() => completionPercentage.value >= 100)

const hasExpenses = computed(() => plannedCount.value > 0)
const previewExpenses = computed(() => props.plan.planned_expenses?.slice(0, 3) || [])
const hasMoreExpenses = computed(() => plannedCount.value > 3)
const remainingExpensesCount = computed(() => plannedCount.value - 3)

// Methods
const toggleExpansion = () => {
  isExpanded.value = !isExpanded.value
  emit('toggle-expansion', props.plan.id, isExpanded.value)
}

const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

const formatPeriod = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
  const end = new Date(endDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${start} - ${end}`
}

const getStatusClass = () => {
  if (props.plan.is_current) return 'status-indicator--active'
  if (isCompleted.value) return 'status-indicator--completed'
  return 'status-indicator--default'
}

const getPlanTypeColor = (type) => {
  const colors = {
    'monthly': 'blue-6',
    'event': 'purple-6',
    'vacation': 'orange-6',
    'emergency': 'red-6',
    'savings': 'green-6'
  }
  return colors[type] || 'grey-6'
}

const getPlanTypeLabel = (type) => {
  const labels = {
    'monthly': 'Mensile',
    'event': 'Evento',
    'vacation': 'Vacanza',
    'emergency': 'Emergenza',
    'savings': 'Risparmio'
  }
  return labels[type] || 'Altro'
}

const getProgressClass = (percentage) => {
  if (percentage >= 100) return 'progress-fill--success'
  if (percentage >= 75) return 'progress-fill--warning'
  if (percentage >= 50) return 'progress-fill--info'
  return 'progress-fill--primary'
}

</script>

<style lang="scss" scoped>
.card-piano-spesa2 {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #d1d5db;
  }

  &--active {
    border-color: #10b981;
    box-shadow:
      0 1px 3px 0 rgba(16, 185, 129, 0.1),
      0 1px 2px 0 rgba(16, 185, 129, 0.06);

    &:hover {
      box-shadow:
        0 20px 25px -5px rgba(16, 185, 129, 0.1),
        0 10px 10px -5px rgba(16, 185, 129, 0.04);
    }
  }

  &--completed {
    border-color: #10b981;
    background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
    /* Card resta normale anche se completata */
  }
}

// Status Indicator
.status-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #e5e7eb;
  transition: all 0.3s ease;

  &--active {
    background: linear-gradient(90deg, #10b981, #059669);
  }

  &--completed {
    background: linear-gradient(90deg, #10b981, #059669);
  }

  &--default {
    background: #94a3b8;  /* Grigio-blu più visibile per stato pending */
  }
}

// Card Header
.card-header {
  padding: 24px 24px 0 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.plan-info {
  flex: 1;
  min-width: 0;
}

.plan-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.privacy-icon {
  color: #6b7280;
  flex-shrink: 0;
}

.plan-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-period {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  width: 100%;

  .q-icon {
    color: #9ca3af;
  }
}

.plan-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-chip {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}


.status-chip {
  font-weight: 600;
  font-size: 0.75rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.header-actions {
  flex-shrink: 0;
}

.menu-btn {
  color: #6b7280;

  &:hover {
    color: #374151;
  }
}

.action-menu {
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

// Description
.plan-description {
  margin: 16px 24px 0 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  border-left: 3px solid #e5e7eb;
}

// Stats Section
.stats-section {
  padding: 12px 24px 24px 24px;  /* Ridotto padding top per alzare la sezione */
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
    transform: translateY(-1px);
  }

  &:first-child {
    cursor: pointer;
  }

  &:not(:first-child) {
    cursor: default;
  }
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #6b7280;
  flex-shrink: 0;

  &.success {
    background: #dcfce7;
    color: #16a34a;
  }

  &.primary {
    background: #dbeafe;
    color: #2563eb;
  }
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.expand-icon {
  color: #6b7280;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.card-piano-spesa2--expanded .expand-icon {
  transform: rotate(180deg);
}

// Progress Container
.progress-container {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
}

.progress-track {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;

  &--primary {
    background: linear-gradient(90deg, #3b82f6, #2563eb);
  }

  &--info {
    background: linear-gradient(90deg, #06b6d4, #0891b2);
  }

  &--warning {
    background: linear-gradient(90deg, #f59e0b, #d97706);
  }

  &--success {
    background: linear-gradient(90deg, #10b981, #059669);
  }
}

// Expenses Section
.expenses-section {
  border-top: 1px solid #f3f4f6;
  padding: 24px;
  margin-top: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .q-icon {
    color: #6b7280;
  }
}

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}


.more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  margin-top: 12px;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .q-icon {
    color: #9ca3af;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .card-piano-spesa2 {
    border-radius: 16px;
  }

  .card-header {
    padding: 20px 20px 0 20px;
  }

  .header-content {
    position: relative;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .plan-info {
    flex: 1;
    padding-right: 40px; /* Space for menu button */
  }

  .header-actions {
    position: absolute;
    top: 0;
    right: 0;
    flex-shrink: 0;
  }

  .plan-name {
    font-size: 1.125rem;
  }

  .plan-meta {
    gap: 10px;
  }

  .plan-description {
    margin: 16px 20px 0 20px;
    padding: 14px;
    font-size: 0.8rem;
  }

  .stats-section {
    padding: 10px 20px 20px 20px;
  }

  .stats-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 20px;
  }

  .stat-item {
    padding: 12px 8px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
    position: relative;

    // Solo il primo item (Spese) ha la freccia di expansion
    &:first-child {
      .expand-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 18px;
      }
    }
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .progress-container {
    padding: 14px;
  }

  .expenses-section {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .card-piano-spesa2 {
    border-radius: 14px;
  }

  .card-header {
    padding: 16px 16px 0 16px;
  }

  .plan-name {
    font-size: 1rem;
  }

  .plan-description {
    margin: 12px 16px 0 16px;
    padding: 12px;
  }

  .stats-section {
    padding: 8px 16px 16px 16px;
  }

  .stat-item {
    padding: 12px;
    gap: 10px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .progress-container {
    padding: 12px;
  }

  .expenses-section {
    padding: 16px;
  }
}
</style>
