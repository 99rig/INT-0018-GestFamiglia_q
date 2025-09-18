<template>
  <CategoryAutocomplete
    v-model="categorySelection"
    :category-label="label || 'Categoria'"
    :subcategory-label="subcategoryLabel || 'Sottocategoria'"
    :hide-subcategory="hideSubcategory"
    @category-changed="onCategoryChanged"
    @subcategory-changed="onSubcategoryChanged"
    v-bind="$attrs"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import CategoryAutocomplete from './CategoryAutocomplete.vue'

const props = defineProps({
  modelValue: {
    type: [Number, Object],
    default: null
  },
  label: {
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
  },
  returnObject: {
    type: Boolean,
    default: false // Se true, ritorna { category: id, subcategory: id }, altrimenti solo category id
  }
})

const emit = defineEmits(['update:modelValue', 'category-changed', 'subcategory-changed'])

// Internal category selection
const categorySelection = ref({ category: null, subcategory: null })

// Handle category changes
const onCategoryChanged = (categoryId) => {
  if (props.returnObject) {
    const newValue = {
      category: categoryId,
      subcategory: categorySelection.value.subcategory
    }
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', categoryId)
  }
  emit('category-changed', categoryId)
}

const onSubcategoryChanged = (subcategoryId) => {
  if (props.returnObject) {
    emit('update:modelValue', {
      category: categorySelection.value.category,
      subcategory: subcategoryId
    })
  }
  emit('subcategory-changed', subcategoryId)
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (props.returnObject && newValue && typeof newValue === 'object') {
    categorySelection.value = {
      category: newValue.category || null,
      subcategory: newValue.subcategory || null
    }
  } else {
    categorySelection.value = {
      category: newValue || null,
      subcategory: null
    }
  }
}, { immediate: true })
</script>

<style scoped>
/* Inherit styles from CategoryAutocomplete */
</style>