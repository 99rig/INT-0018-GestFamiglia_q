<template>
  <div class="category-autocomplete">
    <MCFAutocomplete
      v-model="selectedCategory"
      :options="filteredCategoryOptions"
      :label="categoryLabel"
      required
      v-bind="$attrs"
      option-value="value"
      option-label="label"
      @update:model-value="onCategoryChange"
      :rules="[val => val !== null && val !== undefined || 'Categoria richiesta']"
      prepend-icon="category"
      :multiple="false"
      :custom-filter="categoryFilter"
      :show-icon="false"
      class="mcf-category-field"
    />

    <MCFAutocomplete
      v-if="showSubcategorySelect"
      v-model="selectedSubcategory"
      :options="subcategoryOptions"
      :label="subcategoryLabel"
      v-bind="$attrs"
      option-value="value"
      option-label="label"
      :disable="!selectedCategory || subcategoryOptions.length === 0"
      prepend-icon="label"
      :multiple="false"
      @update:model-value="onSubcategoryChange"
      :show-icon="false"
      :placeholder="selectedCategory ? (subcategoryOptions.length > 0 ? 'Seleziona sottocategoria...' : 'Nessuna sottocategoria disponibile') : 'Seleziona prima una categoria'"
      class="mcf-subcategory-field"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { categoriesAPI } from 'src/services/api/categories.js'
import MCFAutocomplete from './MCFAutocomplete.vue'

// Disable automatic attribute inheritance since we handle them manually
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ category: null, subcategory: null })
  },
  categoryLabel: {
    type: String,
    default: 'Categoria'
  },
  subcategoryLabel: {
    type: String,
    default: 'Sottocategoria'
  },
  hideSubcategory: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'category-changed', 'subcategory-changed'])

// Reactive data
const loading = ref(false)
const categories = ref([])
const categoryOptions = ref([])
const allCategoryOptions = ref([])
const subcategoryOptions = ref([])
const filteredCategoryOptions = ref([])

// Model values
const selectedCategory = ref(null)
const selectedSubcategory = ref(null)

// Computed
const showSubcategorySelect = computed(() => {
  // Mostra sempre il campo sottocategoria a meno che non sia esplicitamente nascosto
  return !props.hideSubcategory
})

// Methods
const loadCategories = async () => {
  try {
    loading.value = true
    const response = await categoriesAPI.getCategories()
    categories.value = response.results || response.data || response

    console.log('📂 Categories loaded:', categories.value)

    // Debug: mostra le prime sottocategorie per vedere se hanno icone
    if (categories.value.length > 0 && categories.value[0].subcategories) {
      console.log('🔍 Prima categoria con sottocategorie:', categories.value[0])
      console.log('🔍 Prime 3 sottocategorie:', categories.value[0].subcategories.slice(0, 3))
    }

    if (!Array.isArray(categories.value)) {
      console.error('Categories is not an array:', categories.value)
      return
    }

    // Create main category options (default display)
    categoryOptions.value = categories.value.map(cat => ({
      label: cat.name || cat.nome,
      value: cat.id,
      type: 'category',
      icon: cat.icon,
      subcategories: cat.subcategories || []
    }))

    // Create all options (categories + subcategories) for search
    allCategoryOptions.value = []

    categories.value.forEach(cat => {
      // Add main category
      allCategoryOptions.value.push({
        label: cat.name || cat.nome,
        value: cat.id,
        type: 'category',
        icon: cat.icon,
        subcategories: cat.subcategories || []
      })

      // Add subcategory options in grouped format
      if (cat.subcategories) {
        cat.subcategories.forEach(sub => {
          allCategoryOptions.value.push({
            label: `${cat.name} > ${sub.name}`,
            value: `${cat.id}_${sub.id}`,
            type: 'subcategory',
            categoryId: cat.id,
            subcategoryId: sub.id,
            categoryName: cat.name,
            subcategoryName: sub.name,
            icon: sub.icon || cat.icon,
            aliases: sub.aliases || []
          })
        })
      }
    })

    // Set initial filtered options
    filteredCategoryOptions.value = categoryOptions.value.filter(opt => opt.type === 'category')

  } catch (error) {
    console.error('Errore nel caricamento delle categorie:', error)
  } finally {
    loading.value = false
  }
}

const categoryFilter = (options, searchText) => {
  console.log('🔍 CategoryFilter called with:', searchText)
  if (!searchText || searchText.trim() === '') {
    // No search text: return only main categories
    return categoryOptions.value.filter(opt => opt.type === 'category')
  }

  // Search text: return filtered results from all options (categories + subcategories)
  const searchValue = searchText.toLowerCase()
  console.log('🔍 Searching for:', searchValue, 'in', allCategoryOptions.value.length, 'options')

  const results = allCategoryOptions.value.filter(option => {
    const labelMatch = option.label.toLowerCase().includes(searchValue)

    if (option.type === 'subcategory') {
      const categoryMatch = option.categoryName.toLowerCase().includes(searchValue)
      const subcategoryMatch = option.subcategoryName.toLowerCase().includes(searchValue)

      // Check aliases
      let aliasMatch = false
      if (option.aliases && Array.isArray(option.aliases)) {
        aliasMatch = option.aliases.some(alias =>
          alias.toLowerCase().includes(searchValue)
        )
      }

      return labelMatch || categoryMatch || subcategoryMatch || aliasMatch
    }

    return labelMatch
  })

  console.log('🔍 Found', results.length, 'results for:', searchValue)
  return results
}

const onCategoryChange = (selectedValue) => {
  selectedSubcategory.value = null
  subcategoryOptions.value = []

  if (!selectedValue) {
    selectedCategory.value = null
    const newValue = { category: null, subcategory: null }
    emit('update:modelValue', newValue)
    emit('category-changed', null)
    return
  }

  if (typeof selectedValue === 'string' && selectedValue.includes('_')) {
    // It's a category_subcategory combo
    const [categoryId, subcategoryId] = selectedValue.split('_').map(id => parseInt(id))

    // Find category and populate subcategories
    const category = categories.value.find(cat => cat.id === categoryId)
    if (category) {
      selectedCategory.value = categoryId
      subcategoryOptions.value = (category.subcategories || []).map(sub => ({
        label: sub.name || sub.nome,
        value: sub.id,
        icon: sub.icon
      }))
      selectedSubcategory.value = subcategoryId

      const newValue = { category: categoryId, subcategory: subcategoryId }
      emit('update:modelValue', newValue)
      emit('category-changed', categoryId)
      emit('subcategory-changed', subcategoryId)
    }
  } else {
    // Regular category selection
    const categoryId = selectedValue
    const category = categories.value.find(cat => cat.id === categoryId)

    if (category) {
      selectedCategory.value = categoryId
      subcategoryOptions.value = (category.subcategories || []).map(sub => ({
        label: sub.name || sub.nome,
        value: sub.id,
        icon: sub.icon
      }))

      const newValue = { category: categoryId, subcategory: null }
      emit('update:modelValue', newValue)
      emit('category-changed', categoryId)
    }
  }
}

const onSubcategoryChange = (subcategoryId) => {
  const newValue = {
    category: selectedCategory.value,
    subcategory: subcategoryId
  }
  emit('update:modelValue', newValue)
  emit('subcategory-changed', subcategoryId)
}


// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedCategory.value = newValue.category
    selectedSubcategory.value = newValue.subcategory

    // Load subcategories if category is selected
    if (newValue.category) {
      const category = categories.value.find(cat => cat.id === newValue.category)
      if (category) {
        subcategoryOptions.value = (category.subcategories || []).map(sub => ({
          label: sub.name || sub.nome,
          value: sub.id
        }))
      }
    }
  } else {
    selectedCategory.value = null
    selectedSubcategory.value = null
    subcategoryOptions.value = []
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadCategories()
})
</script>

<style lang="scss" scoped>
.category-autocomplete {
  /* Rispetta il padding del contenitore padre - solo il padding sinistro mancante */
  width: calc(100% - 16px) !important;
  display: flex;
  flex-direction: column;
  gap: 16px !important;
  margin: 0 0 0 16px !important; /* Solo margin sinistro per allineamento */
  padding: 0 !important;
  box-sizing: border-box !important;
}

/* Rimuovi tutti gli stili forzati dai campi interni */
:deep(.mcf-category-field),
:deep(.mcf-subcategory-field) {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;

  .q-field {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }

  .q-field__control {
    width: 100% !important;
    box-sizing: border-box !important;
  }
}
</style>
