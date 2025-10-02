<template>
  <PlanCard
    :plan="plan"
    :custom-class="`card-piano-spesa2 ${plan.is_current ? 'card-piano-spesa2--active' : ''} ${isCompleted ? 'card-piano-spesa2--completed' : ''}`"
    :elevated="6"
    @click="$emit('click', plan)"
  >
    <!-- Card Header -->
    <div class="card-header">
      <div class="header-content">
        <div class="plan-info">
          <div class="plan-title-row">
            <h3 class="plan-name">{{ plan.name }}</h3>
            <q-icon
              v-if="!plan.is_shared"
              name="lock"
              size="18px"
              color="orange"
              class="privacy-icon"
            >
              <q-tooltip>Piano personale</q-tooltip>
            </q-icon>
          </div>
          <div class="plan-meta">
            <q-icon name="event" size="14px" />
            <span class="plan-period">{{ formatPeriod(plan.start_date, plan.end_date) }}</span>
            <span v-if="plan.description" class="plan-description-inline">• {{ plan.description }}</span>
          </div>
        </div>

        <div class="header-actions" @click.stop>
          <q-btn
            flat
            round
            :icon="plan.is_pinned_by_user ? 'push_pin' : 'push_pin'"
            size="sm"
            :class="['pin-btn', { 'pinned': plan.is_pinned_by_user }]"
            @click="$emit('toggle-pin', plan)"
          >
            <q-tooltip>{{ plan.is_pinned_by_user ? 'Spinna' : 'Pinna' }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="more_vert"
            size="sm"
            class="menu-btn"
          >
            <q-menu
              class="mcf-planned-expense-menu"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-list class="mcf-menu-list">
                <q-item clickable v-close-popup @click="$emit('edit', plan)" class="mcf-menu-item">
                  <q-item-section avatar>
                    <q-icon name="edit" class="mcf-menu-icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="mcf-menu-title">Modifica</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$emit('clone', plan)" class="mcf-menu-item">
                  <q-item-section avatar>
                    <q-icon name="content_copy" class="mcf-menu-icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="mcf-menu-title">Clona</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="$emit('delete', plan)" class="mcf-menu-item mcf-menu-delete">
                  <q-item-section avatar>
                    <q-icon name="delete" class="mcf-menu-icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="mcf-menu-title">Elimina</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stats-row">
        <div class="stat-item clickable" @click.stop="toggleExpanded">
          <div class="stat-icon">
            <q-icon name="receipt_long" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ plannedCount }}</div>
            <div class="stat-label">Spese</div>
          </div>
          <q-icon
            :name="expanded ? 'expand_less' : 'expand_more'"
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

    <!-- Expansion Spese -->
    <q-slide-transition>
      <div
        v-if="expanded && hasExpenses"
        class="expansion-content"
        @click.stop
      >
        <div class="expenses-list">
          <ExpenseListItem
            v-for="expense in previewExpenses"
            :key="expense.id"
            :expense="expense"
          />
        </div>

        <div v-if="hasMoreExpenses" class="more-indicator">
          <q-icon name="more_horiz" />
          <span>+{{ remainingExpensesCount }} altre spese</span>
        </div>
      </div>
    </q-slide-transition>
  </PlanCard>
</template>

<script setup>
import { computed, ref } from 'vue'
import PlanCard from './PlanCard.vue'
import ExpenseListItem from './ExpenseListItem.vue'

// Props
const props = defineProps({
  plan: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['click', 'edit', 'clone', 'delete', 'toggle-pin'])

// State
const expanded = ref(false)

// Methods
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

// Computed properties
const plannedCount = computed(() => props.plan.total_expenses_count || 0)
const completedCount = computed(() => props.plan.completed_count || 0)
const completionPercentage = computed(() => props.plan.completion_percentage || 0)
const isCompleted = computed(() => completionPercentage.value >= 100)

const hasExpenses = computed(() => plannedCount.value > 0)
const previewExpenses = computed(() => props.plan.planned_expenses?.slice(0, 10) || [])
const hasMoreExpenses = computed(() => plannedCount.value > 10)
const remainingExpensesCount = computed(() => plannedCount.value - 10)

// Methods
const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

const formatPeriod = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
  const end = new Date(endDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${start} - ${end}`
}

const getStatusClass = () => {
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
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    border-color: #d1d5db;
  }

  &--active {
    border-color: #10b981;
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

.plan-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.privacy-icon, .pin-icon {
  flex-shrink: 0;
}

.pin-btn {
  color: #9ca3af;
  transition: all 0.2s ease;

  &.pinned {
    color: #7dd3fc;
    transform: rotate(45deg);
  }

  &:hover {
    color: #7dd3fc;
  }
}

.privacy-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;

  .q-icon {
    color: #FF9800;
    font-size: 18px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 8px;
  flex-wrap: nowrap;
  min-height: 21px;
}

.plan-period {
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.plan-description-inline {
  color: #6b7280;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 0;

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
  color: #9E9E9E;
  transition: color 0.2s ease;

  &:hover {
    color: #424242;
    background: rgba(0, 0, 0, 0.04);
  }
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  min-width: 0;
  position: relative;

  &:hover {
    background: #f3f4f6;
    transform: translateY(-1px);
  }

  &:first-child {
    cursor: pointer;

    .expand-icon {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 18px;
    }
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

// Expansion Content
.expansion-content {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #ffffff;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .q-icon {
    color: #9ca3af;
  }
}

.stat-item.clickable {
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }
}

// Banner Spese
.expenses-banner {
  padding: 16px 24px;
  background: #f0f9ff;
  border-top: 1px solid #e0f2fe;
  font-size: 0.875rem;
  color: #0369a1;
}

// Responsive Design
@media (max-width: 768px) {
  .card-piano-spesa2 {
    border-radius: 16px;
  }

  .expansion-content {
    padding: 12px 0 12px 0;
  }

  .expenses-list {
    gap: 0;
  }

  .more-indicator {
    margin: 12px 16px 0 16px;
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

<style lang="scss">
/* Stili NON scoped per il menu - devono essere globali per applicarsi correttamente */
.mcf-planned-expense-menu {
  min-width: 220px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #E0E0E0;
  background: white;
}

.mcf-menu-list {
  padding: 4px 0;
}

.mcf-menu-item {
  padding: 10px 16px;
  transition: background-color 0.15s ease;
  cursor: pointer;

  &:hover {
    background-color: #F5F5F5;
  }
}

.mcf-menu-delete:hover {
  background-color: #FFEBEE;

  .mcf-menu-title {
    color: #D32F2F;
  }

  .mcf-menu-icon {
    color: #D32F2F;
  }
}

.mcf-menu-icon {
  font-size: 20px;
  color: #757575;
}

.mcf-menu-title {
  font-weight: 500;
  font-size: 14px;
  color: #424242;
}
</style>
