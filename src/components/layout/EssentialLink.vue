<template>
  <q-item
    clickable
    :to="isInternalLink ? props.link : undefined"
    :href="isInternalLink ? undefined : props.link"
    :target="isInternalLink ? undefined : '_blank'"
    :tag="isInternalLink ? undefined : 'a'"
    :class="[
      'mcf-essential-link',
      { 'mcf-essential-link--active': isInternalLink && isCurrentRoute }
    ]"
  >
    <q-item-section v-if="props.icon" avatar>
      <q-icon :name="props.icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ props.title }}</q-item-label>
      <q-item-label caption v-if="props.caption">{{ props.caption }}</q-item-label>
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

<style lang="scss" scoped>
.mcf-essential-link {
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: var(--mcf-bg-secondary);
  }

  &.mcf-essential-link--active {
    background-color: var(--mcf-primary-light);
    color: var(--mcf-primary);

    .q-icon {
      color: var(--mcf-primary);
    }
  }
}
</style>
