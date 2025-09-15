<template>
  <q-drawer v-model="isOpen" show-if-above bordered>
    <q-list>
      <q-item-label header> 
        <div class="text-center q-py-md">
          <img 
            src="/mumble-logo.svg" 
            alt="Mumble" 
            style="width: 150px" 
          />
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
    title: 'Dashboard',
    caption: 'Main dashboard',
    icon: 'dashboard',
    link: '/',
  },
  {
    title: 'Settings',
    caption: 'App settings',
    icon: 'settings',
    link: '/settings',
  },
  {
    title: 'Help',
    caption: 'Documentation',
    icon: 'help',
    link: '/help',
  },
]
</script>