<template>
  <q-input
    :model-value="displayValue"
    :label="label"
    :outlined="outlined"
    :filled="filled"
    :dense="dense"
    :disable="disable"
    :readonly="readonly"
    :rules="rules"
    :error="error"
    :error-message="errorMessage"
    :clearable="clearable"
    class="mcf-datepicker"
    @clear="onClear"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer mcf-datepicker-icon">
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
          :breakpoint="600"
        >
          <q-date
            :model-value="internalValue"
            @update:model-value="onDateChange"
            :locale="italianLocale"
            class="mcf-date-popup"
            today-btn
            flat
            v-if="internalValue !== undefined"
          >
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn
                label="Annulla"
                color="grey-7"
                flat
                v-close-popup
              />
              <q-btn
                label="OK"
                color="primary"
                flat
                v-close-popup
              />
            </div>
          </q-date>
          <q-date
            @update:model-value="onDateChange"
            :locale="italianLocale"
            class="mcf-date-popup"
            today-btn
            flat
            v-else
          >
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn
                label="Annulla"
                color="grey-7"
                flat
                v-close-popup
              />
              <q-btn
                label="OK"
                color="primary"
                flat
                v-close-popup
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Seleziona data'
  },
  outlined: {
    type: Boolean,
    default: true
  },
  filled: {
    type: Boolean,
    default: false
  },
  dense: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  rules: {
    type: Array,
    default: () => []
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  clearable: {
    type: Boolean,
    default: true
  },
  minDate: {
    type: String,
    default: null
  },
  maxDate: {
    type: String,
    default: null
  },
  disablePast: {
    type: Boolean,
    default: false
  },
  disableFuture: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// Locale italiana per il datepicker
const italianLocale = {
  days: 'Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato'.split('_'),
  daysShort: 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
  months: 'Gennaio_Febbraio_Marzo_Aprile_Maggio_Giugno_Luglio_Agosto_Settembre_Ottobre_Novembre_Dicembre'.split('_'),
  monthsShort: 'Gen_Feb_Mar_Apr_Mag_Giu_Lug_Ago_Set_Ott_Nov_Dic'.split('_'),
  firstDayOfWeek: 1 // Lunedì come primo giorno della settimana
}

// Valore interno per il datepicker (formato YYYY/MM/DD)
const internalValue = computed({
  get: () => {
    // Se non c'è valore, ritorna undefined (non null)
    if (!props.modelValue || props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) {
      return undefined
    }

    // Verifica che sia una stringa
    if (typeof props.modelValue !== 'string') {
      console.warn('ModelValue non è una stringa:', props.modelValue)
      return undefined
    }

    try {
      // Verifica formato YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(props.modelValue)) {
        console.warn('Formato data non valido:', props.modelValue)
        return undefined
      }

      // Converte da YYYY-MM-DD a YYYY/MM/DD per q-date
      const convertedValue = props.modelValue.replace(/-/g, '/')

      // Verifica che la data sia valida
      const testDate = new Date(convertedValue)
      if (isNaN(testDate.getTime())) {
        console.warn('Data non valida:', props.modelValue)
        return undefined
      }

      return convertedValue
    } catch (error) {
      console.warn('Errore nel parsing della data:', props.modelValue, error)
      return undefined
    }
  },
  set: (value) => {
    if (!value || value === '' || value === null || value === undefined) {
      emit('update:modelValue', '')
      return
    }

    try {
      // Verifica che sia una stringa
      if (typeof value !== 'string') {
        console.warn('Valore da convertire non è una stringa:', value)
        emit('update:modelValue', '')
        return
      }

      // Converte da YYYY/MM/DD a YYYY-MM-DD
      const formattedValue = value.replace(/\//g, '-')

      // Verifica che il formato sia corretto
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(formattedValue)) {
        console.warn('Formato data convertito non valido:', formattedValue)
        emit('update:modelValue', '')
        return
      }

      emit('update:modelValue', formattedValue)
    } catch (error) {
      console.warn('Errore nel formatting della data:', value, error)
      emit('update:modelValue', '')
    }
  }
})

// Valore da mostrare nell'input (formato italiano)
const displayValue = computed(() => {
  if (!props.modelValue || props.modelValue === '') return ''
  try {
    const date = new Date(props.modelValue)
    // Verifica che la data sia valida
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.warn('Errore nel display della data:', props.modelValue)
    return ''
  }
})

// Opzioni per limitare le date selezionabili
const dateOptions = computed(() => {
  if (!props.minDate && !props.maxDate && !props.disablePast && !props.disableFuture) {
    return null
  }

  return (date) => {
    try {
      const currentDate = new Date()
      const selectedDate = new Date(date)

      if (isNaN(selectedDate.getTime())) {
        return false
      }

      if (props.disablePast && selectedDate < currentDate.setHours(0, 0, 0, 0)) {
        return false
      }

      if (props.disableFuture && selectedDate > currentDate.setHours(23, 59, 59, 999)) {
        return false
      }

      if (props.minDate) {
        const minDate = new Date(props.minDate)
        if (!isNaN(minDate.getTime()) && selectedDate < minDate) {
          return false
        }
      }

      if (props.maxDate) {
        const maxDate = new Date(props.maxDate)
        if (!isNaN(maxDate.getTime()) && selectedDate > maxDate) {
          return false
        }
      }

      return true
    } catch (error) {
      console.warn('Errore nella validazione della data:', error)
      return false
    }
  }
})

// Limitazioni per la navigazione
const navigationMinYearMonth = computed(() => {
  try {
    if (props.minDate) {
      const date = new Date(props.minDate)
      if (!isNaN(date.getTime())) {
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`
      }
    }
    if (props.disablePast) {
      const date = new Date()
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`
    }
  } catch (error) {
    console.warn('Errore nel calcolo navigationMinYearMonth:', error)
  }
  return null
})

const navigationMaxYearMonth = computed(() => {
  try {
    if (props.maxDate) {
      const date = new Date(props.maxDate)
      if (!isNaN(date.getTime())) {
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`
      }
    }
    if (props.disableFuture) {
      const date = new Date()
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`
    }
  } catch (error) {
    console.warn('Errore nel calcolo navigationMaxYearMonth:', error)
  }
  return null
})

// Gestori eventi
const onDateChange = (value) => {
  internalValue.value = value
}

const onClear = () => {
  emit('update:modelValue', '')
}
</script>

<style lang="scss" scoped>
.mcf-datepicker {
  .mcf-datepicker-icon {
    color: var(--q-primary);
    transition: color 0.2s ease;

    &:hover {
      color: var(--q-primary-dark, #1976d2);
    }
  }
}

:deep(.mcf-date-popup) {
  .q-date__header {
    background-color: var(--q-primary);
    color: white;
  }

  .q-date__view {
    padding: 16px;
  }

  .q-date__calendar-weekdays {
    color: var(--q-primary);
    font-weight: 600;
  }

  .q-date__calendar-item {
    &.q-date__calendar-item--in {
      background-color: var(--q-primary);
      color: white;

      &:before {
        background-color: transparent;
      }
    }

    &.q-date__calendar-item--selected {
      background-color: var(--q-primary);
      color: white;
      font-weight: 600;
    }

    &:not(.q-date__calendar-item--selected):hover {
      background-color: rgba(var(--q-primary-rgb, 25, 118, 210), 0.1);
    }
  }

  .q-date__navigation {
    .q-btn {
      color: var(--q-primary);
    }
  }

  .q-date__header-subtitle,
  .q-date__header-title {
    color: white;
  }

  .q-date__arrow {
    color: var(--q-primary);
  }
}

// Stili responsivi
@media (max-width: 600px) {
  :deep(.mcf-date-popup) {
    .q-date__view {
      padding: 8px;
    }
  }
}
</style>
