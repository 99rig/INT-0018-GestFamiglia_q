<template>
  <q-item 
    clickable 
    :to="isInternalLink ? props.link : undefined"
    :href="isInternalLink ? undefined : props.link"
    :target="isInternalLink ? undefined : '_blank'"
    :tag="isInternalLink ? undefined : 'a'"
    :class="isInternalLink && isCurrentRoute ? 'text-primary bg-grey-2' : ''"
  >
    <q-item-section v-if="props.icon" avatar>
      <q-icon :name="props.icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ props.title }}</q-item-label>
      <q-item-label caption>{{ props.caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  caption: {
    type: String,
    default: '',
  },

  link: {
    type: String,
    default: '#',
  },

  icon: {
    type: String,
    default: '',
  },
})

// Controlla se il link è interno (inizia con /) o esterno (http/https)
const isInternalLink = computed(() => {
  return props.link.startsWith('/') || props.link === '#'
})

// Controlla se il link corrisponde alla route attuale
const isCurrentRoute = computed(() => {
  if (props.link === '/' && route.path === '/') {
    return true
  }
  if (props.link !== '/' && route.path.startsWith(props.link)) {
    return true
  }
  return false
})
</script>
