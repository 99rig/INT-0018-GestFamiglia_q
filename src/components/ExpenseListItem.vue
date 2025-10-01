<template>
  <div class="expense-list-item">
    <div class="expense-main">
      <div class="expense-info">
        <div class="expense-title">{{ expense.description }}</div>
        <div class="expense-meta">
          <span class="expense-category">{{ expense.category_name }}</span>
          <span class="expense-date">{{ formatDate(expense.due_date || expense.date) }}</span>
        </div>
      </div>
      <div class="expense-amount" :class="getAmountClass(expense)">
        €{{ formatAmount(expense.amount) }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  expense: {
    type: Object,
    required: true
  }
})

const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit'
  })
}

const getAmountClass = (expense) => {
  if (expense.payment_status === 'paid' || expense.payment_status === 'completed') return 'amount-paid'
  return 'amount-unpaid'
}
</script>

<style lang="scss" scoped>
.expense-list-item {
  padding: 10px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

.expense-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.expense-info {
  flex: 1;
  min-width: 0;
}

.expense-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expense-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #6b7280;
}

.expense-category {
  font-weight: 500;
}

.expense-date {
  &::before {
    content: '•';
    margin-right: 8px;
    color: #9ca3af;
  }
}

.expense-amount {
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 6px;

  &.amount-paid {
    background: #d1fae5;
    color: #065f46;
  }

  &.amount-unpaid {
    background: #fee2e2;
    color: #991b1b;
  }
}

// Responsive - mobile a tutta larghezza e compresso
@media (max-width: 768px) {
  .expense-list-item {
    padding: 8px 20px;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: none;

    &:last-child {
      border-bottom: none;
    }
  }

  .expense-main {
    gap: 8px;
  }

  .expense-title {
    font-size: 0.85rem;
    margin-bottom: 2px;
  }

  .expense-meta {
    font-size: 0.68rem;
    gap: 6px;
  }

  .expense-amount {
    padding: 4px 10px;
    font-size: 0.85rem;
  }
}
</style>
