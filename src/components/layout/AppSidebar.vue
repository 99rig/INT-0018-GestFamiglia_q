<template>
  <q-drawer v-model="isOpen" show-if-above bordered>
    <q-list>
      <q-item-label header> 
        <div class="text-center q-py-md">
          <q-icon 
            name="account_balance_wallet" 
            size="64px" 
            class="text-mcf-primary"
          />
          <div class="text-h6 text-mcf-primary q-mt-sm">MCF</div>
        </div>
      </q-item-label>

      <EssentialLink 
        v-for="link in linksList" 
        :key="link.title" 
        v-bind="link" 
      />
    </q-list>
  </q-drawer>
</template>

<script setup>
import { computed } from 'vue'
import EssentialLink from './EssentialLink.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const linksList = [
  {
    title: 'Home',
    caption: 'Dashboard principale',
    icon: 'dashboard',
    link: '/',
  },
  {
    title: 'Spese',
    caption: 'Visualizza tutte le spese',
    icon: 'receipt_long',
    link: '/expenses',
  },
  {
    title: 'Scanner',
    caption: 'Scansiona ricevute',
    icon: 'document_scanner',
    link: '/scanner',
  },
  {
    title: 'Settings',
    caption: 'Impostazioni app',
    icon: 'settings',
    link: '/settings',
  },
]
</script>