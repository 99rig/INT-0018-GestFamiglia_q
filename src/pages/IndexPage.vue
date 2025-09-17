<template>
  <q-page class="flex flex-center mcf-page-container">
    <div class="text-center q-pa-lg">
      <div class="mcf-card q-pa-xl">
        <q-icon 
          name="account_balance_wallet" 
          size="128px" 
          class="text-mcf-primary q-mb-lg"
        />
        <h4 class="text-h4 q-mt-md q-mb-sm text-mcf-primary">My Crazy Family</h4>
        <p class="text-subtitle1 text-mcf-accent q-mb-lg">
          Gestione Spese Famigliari
        </p>
        <div class="q-mt-lg">
          <q-btn 
            class="mcf-btn-primary q-mr-md" 
            label="Le Tue Spese" 
            size="lg"
            icon="receipt_long"
            unelevated
            rounded
            style="padding: 12px 32px"
            @click="$router.push('/expenses')"
          />
          <q-btn 
            class="mcf-btn-secondary" 
            label="Scansiona Ricevuta" 
            size="lg"
            icon="document_scanner"
            unelevated
            rounded
            style="padding: 12px 32px"
            @click="$router.push('/scanner')"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
//
</script>

<style scoped>
.flex-center {
  min-height: 100vh;
}
</style>