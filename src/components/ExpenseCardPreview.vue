<template>
  <div
    class="expense-card-preview"
    :class="{ 'expense-card-preview--completed': expense.is_completed }"
  >
    <!-- Prima riga: Nome spesa e Cifra -->
    <div class="expense-main-row">
      <div class="expense-name">{{ expense.description }}</div>
      <div class="expense-amount">€{{ formatAmount(expense.amount) }}</div>
    </div>

    <!-- Seconda riga: Chip utenti + Altri chip + Badge PAGATA -->
    <div class="expense-details-row">
      <div class="expense-chips">
        <!-- Chip per chi ha pagato -->
        <div v-if="expense.paid_by_users && expense.paid_by_users.length > 0" class="paid-by-chips">
          <q-chip
            v-for="user in expense.paid_by_users"
            :key="user.id"
            color="blue-grey-6"
            text-color="white"
            size="xs"
            :label="getUserInitials(user.full_name)"
            class="paid-by-chip"
          >
            <q-tooltip>{{ user.full_name }} - €{{ formatAmount(user.amount_paid) }}</q-tooltip>
          </q-chip>
        </div>

        <!-- Altri chip (priorità, stato) -->
        <q-chip
          v-if="!expense.is_completed"
          :color="getPriorityColor(expense.priority)"
          text-color="white"
          size="xs"
          :label="getPriorityLabel(expense.priority)"
          class="priority-chip"
        />
      </div>

      <!-- Badge PAGATA -->
      <div class="expense-status">
        <q-chip
          v-if="expense.is_completed"
          color="positive"
          text-color="white"
          size="xs"
          label="PAGATA"
          icon="check_circle"
          class="completed-chip"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  expense: {
    type: Object,
    required: true
  }
})

const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

const getUserInitials = (fullName) => {
  if (!fullName) return '?'
  const names = fullName.trim().split(' ')
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase()
  }
  return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase()
}

const getPriorityColor = (priority) => {
  const colors = {
    low: 'blue-grey-5',
    medium: 'orange-6',
    high: 'red-6',
    urgent: 'red-8'
  }
  return colors[priority] || 'blue-grey-5'
}

const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Bassa',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  }
  return labels[priority] || 'Media'
}
</script>

<style lang="scss" scoped>
.expense-card-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #e5e7eb;
    transform: translateX(4px);
  }

  &--completed {
    background: #ffffff;
    border-color: #10b981;
  }
}

// Prima riga: Nome e Cifra
.expense-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.expense-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}

.expense-amount {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  flex-shrink: 0;
}

// Seconda riga: Chip e Badge
.expense-details-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.expense-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
}

.paid-by-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.paid-by-chip {
  min-width: 24px;
  height: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 10px;
}

.priority-chip {
  font-size: 0.65rem;
  font-weight: 600;
  height: 18px;
}

.expense-status {
  flex-shrink: 0;
}

.completed-chip {
  font-size: 0.65rem;
  font-weight: 700;
  height: 20px;
}

// Responsive per mobile
@media (max-width: 768px) {
  .expense-card-preview {
    padding: 10px 14px;
    gap: 6px;
  }

  .expense-main-row {
    gap: 8px;
  }

  .expense-name {
    font-size: 0.9rem;
  }

  .expense-amount {
    font-size: 0.9rem;
  }

  .expense-details-row {
    gap: 6px;
  }

  .expense-chips {
    gap: 4px;
  }

  .paid-by-chips {
    gap: 3px;
  }

  .paid-by-chip {
    font-size: 0.65rem;
    height: 18px;
    min-width: 20px;
  }

  .priority-chip {
    font-size: 0.6rem;
    height: 16px;
  }

  .completed-chip {
    font-size: 0.6rem;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .expense-card-preview {
    padding: 8px 12px;
    gap: 6px;
  }

  .expense-name {
    font-size: 0.85rem;
    line-height: 1.2;
  }

  .expense-amount {
    font-size: 0.85rem;
  }

  .paid-by-chip {
    font-size: 0.6rem;
    height: 16px;
    min-width: 18px;
    padding: 0 4px;
  }

  .priority-chip {
    font-size: 0.55rem;
    height: 15px;
  }

  .completed-chip {
    font-size: 0.55rem;
    height: 16px;
  }
}
</style>