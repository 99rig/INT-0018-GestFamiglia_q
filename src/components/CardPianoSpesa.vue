<template>
  <div
    class="card-piano-spesa"
    :class="{
      'card-piano-spesa--active': plan.is_current,
      'card-piano-spesa--completed': isCompleted,
      'card-piano-spesa--expanded': isExpanded
    }"
    @click="$emit('click', plan)"
  >
    <!-- Card Header -->
    <div class="card-header">
      <div class="card-header__main">
        <div class="plan-title">
          <h3 class="plan-name">
            {{ plan.name }}
            <q-icon
              v-if="!plan.is_shared"
              name="lock"
              size="xs"
              class="plan-privacy-icon"
            >
              <q-tooltip>Piano personale</q-tooltip>
            </q-icon>
          </h3>
          <div class="plan-period">
            <q-icon name="calendar_today" size="xs" />
            {{ formatPeriod(plan.start_date, plan.end_date) }}
          </div>
        </div>

        <div class="plan-badges">
          <q-chip
            :color="getPlanTypeColor(plan.plan_type)"
            text-color="white"
            size="sm"
            :label="getPlanTypeLabel(plan.plan_type)"
            class="plan-type-chip"
          />
          <q-chip
            v-if="plan.is_current"
            color="green"
            text-color="white"
            size="sm"
            label="Attivo"
            icon="circle"
            class="plan-status-chip"
          />
        </div>
      </div>

      <div class="card-header__actions" @click.stop>
        <q-btn
          flat
          round
          icon="more_vert"
          size="sm"
          class="actions-menu-btn"
        >
          <q-menu
            class="actions-menu"
            transition-show="scale"
            transition-hide="scale"
            anchor="bottom right"
            self="top right"
          >
            <q-list class="actions-menu-list">
              <q-item
                clickable
                v-close-popup
                @click="$emit('edit', plan)"
                class="menu-item menu-item--edit"
              >
                <q-item-section avatar class="menu-icon">
                  <q-icon name="edit" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Modifica Piano</q-item-label>
                  <q-item-label caption>Cambia nome, date o budget</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                clickable
                v-close-popup
                @click="$emit('clone', plan)"
                class="menu-item menu-item--clone"
              >
                <q-item-section avatar class="menu-icon">
                  <q-icon name="content_copy" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Clona Piano</q-item-label>
                  <q-item-label caption>Crea copia per il periodo successivo</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator class="menu-separator" />

              <q-item
                clickable
                v-close-popup
                @click="$emit('delete', plan)"
                class="menu-item menu-item--delete"
              >
                <q-item-section avatar class="menu-icon">
                  <q-icon name="delete_outline" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Elimina Piano</q-item-label>
                  <q-item-label caption>Rimuovi definitivamente</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <!-- Plan Description -->
    <div v-if="plan.description" class="plan-description">
      {{ plan.description }}
    </div>

    <!-- Plan Statistics -->
    <div class="plan-stats">
      <div class="stats-grid">
        <div class="stat-card stat-card--primary" @click.stop="toggleExpansion">
          <div class="stat-header">
            <span class="stat-label">Spese Totali</span>
            <q-icon
              :name="isExpanded ? 'expand_less' : 'expand_more'"
              size="16px"
              class="expand-icon"
            />
          </div>
          <div class="stat-value">{{ plannedCount }}</div>
        </div>

        <div class="stat-card stat-card--success">
          <div class="stat-header">
            <span class="stat-label">Completate</span>
          </div>
          <div class="stat-value">{{ completedCount }}</div>
        </div>

        <div class="stat-card stat-card--amount">
          <div class="stat-header">
            <span class="stat-label">Budget</span>
          </div>
          <div class="stat-value">€{{ formatAmount(plan.total_estimated_amount || 0) }}</div>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Progresso completamento</span>
          <span class="progress-percentage">{{ Math.round(completionPercentage) }}%</span>
        </div>
        <div class="progress-bar-container">
          <div
            class="progress-bar"
            :class="`progress-bar--${getProgressColor(completionPercentage)}`"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Expense Preview (Collapsible) -->
    <q-slide-transition>
      <div v-if="hasExpenses && isExpanded" class="expenses-preview">
        <div class="preview-header">
          <q-icon name="list_alt" size="xs" />
          <span>Prime {{ previewExpensesCount }} spese</span>
        </div>

        <div class="expenses-list">
          <div
            v-for="expense in previewExpenses"
            :key="expense.id"
            class="expense-item"
            :class="{ 'expense-item--completed': expense.is_completed }"
          >
            <div class="expense-main">
              <div class="expense-name">{{ expense.description }}</div>
              <div class="expense-amount">€{{ formatAmount(expense.amount) }}</div>
            </div>

            <div class="expense-status">
              <q-icon
                v-if="expense.is_completed"
                name="check_circle"
                class="status-icon status-icon--completed"
              />
              <q-chip
                v-else
                :color="getPriorityColor(expense.priority)"
                text-color="white"
                size="xs"
                :label="getPriorityLabel(expense.priority)"
                class="priority-chip"
              />
            </div>
          </div>
        </div>

        <div v-if="hasMoreExpenses" class="more-expenses">
          <q-icon name="more_horiz" size="xs" />
          <span>+{{ remainingExpensesCount }} altre spese</span>
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

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
const previewExpensesCount = computed(() => Math.min(3, plannedCount.value))
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

const getPlanTypeColor = (type) => {
  const colors = {
    'monthly': 'blue',
    'event': 'purple',
    'vacation': 'orange',
    'emergency': 'red',
    'savings': 'green'
  }
  return colors[type] || 'grey'
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

const getProgressColor = (percentage) => {
  if (percentage >= 100) return 'success'
  if (percentage >= 75) return 'warning'
  if (percentage >= 50) return 'info'
  return 'primary'
}

const getPriorityColor = (priority) => {
  const colors = {
    'high': 'red',
    'medium': 'orange',
    'low': 'green'
  }
  return colors[priority] || 'grey'
}

const getPriorityLabel = (priority) => {
  const labels = {
    'high': 'Alta',
    'medium': 'Media',
    'low': 'Bassa'
  }
  return labels[priority] || 'N/A'
}
</script>

<style lang="scss" scoped>
.card-piano-spesa {
  background: linear-gradient(145deg, #ffffff 0%, #fafbff 50%, #f0f4ff 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 24px;
  padding: 0;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    opacity: 0;
    transition: all 0.4s ease;
    border-radius: 24px 24px 0 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.03) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.15),
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border-color: rgba(59, 130, 246, 0.3);

    &::before {
      opacity: 1;
      height: 6px;
    }

    &::after {
      opacity: 1;
    }
  }

  &--active {
    background: linear-gradient(145deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
    border-color: rgba(34, 197, 94, 0.2);

    &::before {
      background: linear-gradient(90deg, #22c55e, #16a34a, #15803d);
      opacity: 1;
    }

    .plan-name {
      background: linear-gradient(90deg, #16a34a, #22c55e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  &--completed {
    background: linear-gradient(145deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
    border-color: rgba(34, 197, 94, 0.2);

    &::before {
      background: linear-gradient(90deg, #22c55e, #16a34a, #15803d);
      opacity: 1;
    }
  }
}

// === CARD HEADER ===
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 28px 28px 0 28px;
  margin-bottom: 24px;
  position: relative;
  z-index: 2;

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__actions {
    flex-shrink: 0;
    margin-left: 16px;
  }
}

.plan-title {
  margin-bottom: 16px;
}

.plan-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.375rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  line-height: 1.2;
  letter-spacing: -0.025em;
  transition: all 0.3s ease;
}

.plan-privacy-icon {
  color: #64748b;
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.plan-period {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
  background: rgba(59, 130, 246, 0.05);
  padding: 6px 12px;
  border-radius: 12px;
  width: fit-content;
  transition: all 0.3s ease;

  .q-icon {
    font-size: 0.875rem;
    color: #3b82f6;
  }
}

.plan-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}

.plan-type-chip {
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 14px;
  font-size: 0.8rem;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

.plan-status-chip {
  animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 14px;
  font-size: 0.8rem;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
}

// === ACTIONS MENU ===
.actions-menu-btn {
  color: #64748b;
  transition: color 0.2s ease;

  &:hover {
    color: #3b82f6;
  }
}

.actions-menu {
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.actions-menu-list {
  padding: 8px;
}

.menu-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background-color: #f1f5f9;
  }

  &--edit:hover {
    background-color: #eff6ff;
    color: #3b82f6;
  }

  &--clone:hover {
    background-color: #f0fdf4;
    color: #22c55e;
  }

  &--delete:hover {
    background-color: #fef2f2;
    color: #ef4444;
  }
}

.menu-icon {
  min-width: 32px;
}

.menu-separator {
  margin: 8px 0;
  background-color: #e2e8f0;
}

// === PLAN DESCRIPTION ===
.plan-description {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  padding: 16px 20px;
  border-radius: 16px;
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.6;
  margin: 0 28px 24px 28px;
  border-left: 4px solid rgba(59, 130, 246, 0.3);
  font-style: italic;
  position: relative;

  &::before {
    content: '"';
    position: absolute;
    left: -2px;
    top: -8px;
    font-size: 2rem;
    color: rgba(59, 130, 246, 0.2);
    font-family: Georgia, serif;
  }
}

// === PLAN STATISTICS ===
.plan-stats {
  padding: 0 28px 24px 28px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &--primary {
    cursor: pointer;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);

    &:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.3);
    }
  }

  &--success {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
    border-color: rgba(34, 197, 94, 0.2);

    .stat-value {
      color: #059669;
    }
  }

  &--amount {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
    border-color: rgba(139, 92, 246, 0.2);

    .stat-value {
      color: #7c3aed;
    }
  }
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.expand-icon {
  color: #3b82f6;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));

  .card-piano-spesa--expanded & {
    transform: rotate(180deg) scale(1.1);
    color: #1d4ed8;
  }
}

// === PROGRESS SECTION ===
.progress-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-percentage {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-bar-container {
  height: 12px;
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, transparent 100%);
    border-radius: 8px 8px 0 0;
  }
}

.progress-bar {
  height: 100%;
  border-radius: 8px;
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }

  &--primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }

  &--info {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%);
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
  }

  &--warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
  }

  &--success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

// === EXPENSES PREVIEW ===
.expenses-preview {
  border-top: 1px solid rgba(226, 232, 240, 0.3);
  padding: 24px 28px 28px 28px;
  margin-top: 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 28px;
    right: 28px;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
  }
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .q-icon {
    color: #3b82f6;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
}

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.expense-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateX(8px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: rgba(59, 130, 246, 0.3);

    &::before {
      opacity: 1;
    }
  }

  &--completed {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
    border-color: rgba(34, 197, 94, 0.2);

    &::before {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      opacity: 1;
    }

    .expense-name {
      text-decoration: line-through;
      opacity: 0.8;
    }
  }
}

.expense-main {
  flex: 1;
  min-width: 0;
}

.expense-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
  line-height: 1.3;
  transition: all 0.3s ease;
}

.expense-amount {
  font-size: 0.8rem;
  font-weight: 700;
  color: #7c3aed;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.expense-status {
  flex-shrink: 0;
  margin-left: 16px;
}

.status-icon {
  &--completed {
    color: #22c55e;
    font-size: 1.5rem;
    filter: drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3));
    animation: bounce 1s infinite;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.priority-chip {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.more-expenses {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  margin-top: 12px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border: 2px dashed rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #3b82f6;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    border-color: rgba(59, 130, 246, 0.4);
    transform: scale(1.02);
  }

  .q-icon {
    color: #3b82f6;
    animation: pulse 2s infinite;
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 768px) {
  .card-piano-spesa {
    border-radius: 20px;

    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }

  .card-header {
    padding: 24px 24px 0 24px;
    margin-bottom: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    &__actions {
      margin-left: 0;
      align-self: flex-end;
    }
  }

  .plan-name {
    font-size: 1.25rem;
  }

  .plan-period {
    font-size: 0.85rem;
  }

  .plan-description {
    margin: 0 24px 20px 24px;
    padding: 14px 18px;
    font-size: 0.85rem;
  }

  .plan-stats {
    padding: 0 24px 20px 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-card {
    padding: 16px 14px;
    border-radius: 14px;

    &:hover {
      transform: none;
    }

    &--primary:hover {
      transform: scale(1.02);
    }
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .progress-section {
    padding: 16px;
    border-radius: 16px;
  }

  .expenses-preview {
    padding: 20px 24px 24px 24px;

    &::before {
      left: 24px;
      right: 24px;
    }
  }

  .expense-item {
    padding: 14px 16px;
    border-radius: 14px;

    &:hover {
      transform: translateX(4px);
    }
  }

  .expense-name {
    font-size: 0.85rem;
  }

  .expense-amount {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .card-piano-spesa {
    border-radius: 18px;
  }

  .card-header {
    padding: 20px 20px 0 20px;
  }

  .plan-name {
    font-size: 1.125rem;
  }

  .plan-badges {
    gap: 8px;
  }

  .plan-type-chip,
  .plan-status-chip {
    padding: 6px 12px;
    font-size: 0.75rem;
  }

  .plan-description {
    margin: 0 20px 18px 20px;
    padding: 12px 16px;
  }

  .plan-stats {
    padding: 0 20px 18px 20px;
  }

  .stat-card {
    padding: 14px 12px;
  }

  .stat-value {
    font-size: 1.375rem;
  }

  .progress-section {
    padding: 14px;
  }

  .expenses-preview {
    padding: 18px 20px 20px 20px;

    &::before {
      left: 20px;
      right: 20px;
    }
  }

  .expense-item {
    padding: 12px 14px;
  }
}
</style>