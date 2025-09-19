<template>
  <q-select
    :model-value="selectedOption"
    @update:model-value="onSelectionChange"
    :options="filteredOptions"
    :option-value="optionValue"
    :option-label="optionLabel"
    :label="label"
    :outlined="outlined"
    :filled="filled"
    :dense="dense"
    :disable="disable"
    :readonly="props.readonly"
    :rules="rules"
    :error="error"
    :error-message="errorMessage"
    :clearable="clearable"
    :multiple="multiple"
    use-input
    use-chips
    @filter="filterFn"
    @input-value="onInputChange"
    :input-debounce="debounce"
    :loading="loading"
    :no-options-text="noOptionsText"
    :no-results-text="noResultsText"
    class="mcf-autocomplete"
    :behavior="selectBehavior"
    :dialog-props="dialogProps"
    emit-value
    map-options
    ref="selectRef"
  >
    <!-- Slot per personalizzare come vengono mostrate le opzioni -->
    <template v-slot:option="scope" v-if="$slots.option">
      <slot name="option" v-bind="scope" />
    </template>

    <!-- Template di default per le opzioni -->
    <template v-slot:option="scope" v-else>
      <q-item
        v-bind="scope.itemProps"
        class="mcf-autocomplete-option"
      >
        <q-item-section v-if="scope.opt.icon && scope.opt.icon.length > 0" avatar>
          <q-icon
            :name="scope.opt.icon"
            :color="scope.opt.color || 'primary'"
            size="sm"
          />
        </q-item-section>

        <q-item-section>
          <q-item-label class="mcf-option-label">
            {{ getOptionLabel(scope.opt) }}
          </q-item-label>
          <q-item-label v-if="scope.opt.description" caption class="mcf-option-description">
            {{ scope.opt.description }}
          </q-item-label>
        </q-item-section>

        <q-item-section v-if="scope.opt.badge" side>
          <q-badge
            :color="scope.opt.badgeColor || 'grey'"
            :label="scope.opt.badge"
            rounded
          />
        </q-item-section>
      </q-item>
    </template>

    <!-- Slot per personalizzare il display quando selezionato -->
    <template v-slot:selected v-if="$slots.selected">
      <slot name="selected" :option="selectedOption" />
    </template>

    <!-- Template di default per il display selezionato -->
    <template v-slot:selected v-else-if="selectedOption && !multiple">
      <div class="mcf-selected-option">
        <q-icon
          v-if="showIcon && selectedOption.icon"
          :name="selectedOption.icon"
          :color="selectedOption.color || 'primary'"
          size="sm"
          class="q-mr-sm"
        />
        {{ getOptionLabel(selectedOption) }}
      </div>
    </template>

    <!-- Slot per messaggio quando non ci sono opzioni -->
    <template v-slot:no-option v-if="$slots.noOption">
      <slot name="no-option" />
    </template>

    <!-- Template di default per nessuna opzione -->
    <template v-slot:no-option v-else>
      <q-item class="mcf-no-option">
        <q-item-section class="text-grey">
          {{ noOptionsText }}
        </q-item-section>
      </q-item>
    </template>

    <!-- Prepend slot per icona personalizzata -->
    <template v-slot:prepend v-if="prependIcon">
      <q-icon :name="prependIcon" :color="prependIconColor" />
    </template>

    <!-- Append slot per icone aggiuntive -->
    <template v-slot:append v-if="$slots.append">
      <slot name="append" />
    </template>

    <!-- Template per dialog mobile con pulsante X -->
    <template v-slot:before-options v-if="isMobile">
      <div class="mcf-mobile-dialog-header">
        <div class="mcf-dialog-title">{{ label }}</div>
        <q-btn
          flat
          round
          dense
          icon="close"
          class="mcf-close-btn"
          @click="closeDialog"
        />
      </div>
    </template>
  </q-select>
</template>

<script setup>
import { ref, computed, watch, readonly as vueReadonly } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Array],
    default: null
  },
  options: {
    type: Array,
    required: false
  },
  type: {
    type: String,
    default: 'default', // 'default', 'category'
    validator: (value) => ['default', 'category'].includes(value)
  },
  optionValue: {
    type: [String, Function],
    default: 'value'
  },
  optionLabel: {
    type: [String, Function],
    default: 'label'
  },
  label: {
    type: String,
    default: ''
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
  multiple: {
    type: Boolean,
    default: false
  },
  debounce: {
    type: Number,
    default: 300
  },
  loading: {
    type: Boolean,
    default: false
  },
  noOptionsText: {
    type: String,
    default: 'Nessuna opzione disponibile'
  },
  noResultsText: {
    type: String,
    default: 'Nessun risultato trovato'
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  prependIcon: {
    type: String,
    default: null
  },
  prependIconColor: {
    type: String,
    default: 'primary'
  },
  // Opzioni di ricerca
  searchFields: {
    type: Array,
    default: () => ['label', 'name', 'description']
  },
  caseSensitive: {
    type: Boolean,
    default: false
  },
  // Funzione di filtro personalizzata
  customFilter: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'input', 'filter', 'clear'])

// Stato interno
const searchText = ref('')
const filteredOptions = ref(props.options ? [...props.options] : [])
const selectRef = ref(null)

// Category-specific variables
// const categories = ref([]) - not used
// const categoryOptions = ref([]) - not used
// const allCategoryOptions = ref([]) - not used
// const loadingCategories = ref(false) - not used

// Opzione selezionata
const selectedOption = computed(() => {
  if (!props.modelValue) return null

  if (props.multiple) {
    return props.options.filter(option =>
      props.modelValue.includes(getOptionValue(option))
    )
  }

  return props.options.find(option =>
    getOptionValue(option) === props.modelValue
  ) || null
})

// Computed for effective options based on type
// const effectiveOptions = computed(() => { - not used
/*
  if (props.type === 'category') {
    return searchText.value && searchText.value.trim() !== ''
      ? allCategoryOptions.value
      : categoryOptions.value.filter(opt => opt.type === 'category')
  }
  return props.options || []
})
*/

// Rilevamento mobile per comportamento responsive
const isMobile = computed(() => {
  return $q.platform.is.mobile || $q.screen.lt.sm
})

// Comportamento della select basato su contesto
const selectBehavior = computed(() => {
  // Desktop: sempre dropdown normale sotto la select
  if (!isMobile.value) {
    return 'menu'
  }

  // Mobile: dialog fullscreen
  return 'dialog'
})

// Props del dialog basate su contesto
const dialogProps = computed(() => {
  // Desktop: nessun dialog, usa dropdown normale
  if (!isMobile.value) {
    return undefined
  }

  // Mobile: dialog fullscreen
  return {
    persistent: false,
    'no-backdrop-dismiss': false,
    'no-esc-dismiss': false,
    'popup-content-class': 'mcf-mobile-select-dialog'
  }
})

// Funzioni helper per gestire option-value e option-label
const getOptionValue = (option) => {
  if (typeof props.optionValue === 'function') {
    return props.optionValue(option)
  }
  return option[props.optionValue]
}

const getOptionLabel = (option) => {
  if (!option) return ''
  if (typeof props.optionLabel === 'function') {
    return props.optionLabel(option)
  }
  return option[props.optionLabel] || option.name || option.label || ''
}

// Funzione di filtro
const filterFn = (val, update) => {
  searchText.value = val

  update(() => {
    if (val === '') {
      filteredOptions.value = [...props.options]
      return
    }

    // Se c'è una funzione di filtro personalizzata, usala
    if (props.customFilter) {
      filteredOptions.value = props.customFilter(props.options, val)
      return
    }

    // Filtro di default
    const searchValue = props.caseSensitive ? val : val.toLowerCase()

    filteredOptions.value = props.options.filter(option => {
      return props.searchFields.some(field => {
        const fieldValue = option[field]
        if (!fieldValue) return false

        const stringValue = props.caseSensitive
          ? String(fieldValue)
          : String(fieldValue).toLowerCase()

        return stringValue.includes(searchValue)
      })
    })
  })

  emit('filter', val, filteredOptions.value)
}

// Gestori eventi
const onSelectionChange = (value) => {
  emit('update:modelValue', value)
}

const onInputChange = (value) => {
  emit('input', value)
}

// Watcher per aggiornare le opzioni filtrate quando cambiano le opzioni
watch(() => props.options, (newOptions) => {
  filteredOptions.value = [...newOptions]
}, { immediate: true })

// Metodo per forzare l'aggiornamento del filtro
const updateFilter = () => {
  filterFn(searchText.value, () => {})
}

// Metodo per pulire la selezione
const clear = () => {
  emit('update:modelValue', props.multiple ? [] : null)
  emit('clear')
}

// Metodo per chiudere il dialog mobile
const closeDialog = () => {
  if (selectRef.value) {
    selectRef.value.hidePopup()
  }
}

// Esponiamo i metodi per l'utilizzo esterno
defineExpose({
  updateFilter,
  clear,
  closeDialog,
  searchText: vueReadonly(searchText),
  filteredOptions: vueReadonly(filteredOptions)
})
</script>

<style lang="scss" scoped>
.mcf-autocomplete {
  .q-field__control {
    transition: all 0.2s ease;
  }

  &.q-field--focused {
    .q-field__control {
      box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb, 25, 118, 210), 0.2);
    }
  }

  /* Fix per allineamento campi categoria in modali */
  &.mcf-category-field,
  &.mcf-subcategory-field {
    width: 100% !important;
    box-sizing: border-box !important;
    margin: 0 !important;

    .q-field__control {
      width: 100% !important;
      box-sizing: border-box !important;
    }
  }
}

:deep(.mcf-autocomplete-option) {
  border-radius: 8px;
  margin: 2px 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(var(--q-primary-rgb, 25, 118, 210), 0.1);
  }

  .mcf-option-label {
    font-weight: 500;
    color: var(--q-dark, #1d1d1d);
  }

  .mcf-option-description {
    color: var(--q-dark-page, #757575);
    font-size: 0.875rem;
  }

  &.q-manual-focusable--focused {
    background-color: rgba(var(--q-primary-rgb, 25, 118, 210), 0.15);
  }
}

:deep(.mcf-selected-option) {
  display: flex;
  align-items: center;
  font-weight: 500;
}

:deep(.mcf-no-option) {
  .q-item__section {
    font-style: italic;
    text-align: center;
    padding: 16px;
  }
}

// Stili per il menu dropdown
:deep(.q-menu) {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(var(--q-primary-rgb, 25, 118, 210), 0.1);

  .q-item {
    border-radius: 8px;
    margin: 2px 8px;
  }
}

// Stili per le chips (quando multiple=true)
:deep(.q-chip) {
  background-color: rgba(var(--q-primary-rgb, 25, 118, 210), 0.1);
  color: var(--q-primary);
  border: 1px solid rgba(var(--q-primary-rgb, 25, 118, 210), 0.3);

  .q-chip__icon {
    color: var(--q-primary);
  }
}

// Responsivo
@media (max-width: 600px) {
  :deep(.q-menu) {
    border-radius: 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  }
}

/* === MOBILE DIALOG STYLES === */
.mcf-mobile-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 100;
}

.mcf-dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.mcf-close-btn {
  color: #666;
  transition: all 0.2s ease;

  &:hover {
    color: #333;
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>
