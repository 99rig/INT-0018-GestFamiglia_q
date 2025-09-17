<template>
  <q-page class="mumble-page-container q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <div class="mumble-card q-pa-lg">
          <div class="text-h4 text-mumble-primary q-mb-md">Settings</div>
          <div class="text-subtitle1 text-mumble-accent q-mb-lg">
            Application settings and preferences
          </div>
          
          <!-- Camera Section -->
          <div class="q-mb-xl">
            <div class="text-h6 text-mumble-primary q-mb-md">Camera</div>
            <div class="text-body2 text-mumble-accent q-mb-md">
              Test camera functionality with back camera
            </div>
            
            <div class="text-center">
              <q-btn
                class="mumble-btn-primary q-mb-md"
                label="Open Back Camera"
                icon="camera_alt"
                @click="openBackCamera"
                :loading="cameraLoading"
                no-caps
                unelevated
                rounded
              />
            </div>
            
            <!-- Camera preview -->
            <div v-if="showCamera" class="camera-container q-mb-md">
              <video
                ref="videoElement"
                autoplay
                playsinline
                class="camera-preview"
              ></video>
              <div class="camera-controls q-mt-sm">
                <q-btn
                  class="mumble-btn-accent q-mr-sm"
                  icon="camera"
                  @click="takePhoto"
                  no-caps
                  unelevated
                  rounded
                />
                <q-btn
                  class="mumble-btn-secondary"
                  icon="close"
                  @click="closeCamera"
                  no-caps
                  unelevated
                  rounded
                />
              </div>
            </div>
            
            <!-- Photo preview -->
            <div v-if="capturedPhoto" class="photo-container">
              <div class="text-subtitle2 text-mumble-primary q-mb-sm">Captured Photo:</div>
              <img :src="capturedPhoto" alt="Captured photo" class="captured-photo" />
            </div>
          </div>
          
          <!-- App Updates Section -->
          <div class="q-mb-xl">
            <div class="text-h6 text-mumble-primary q-mb-md">Aggiornamenti App</div>
            <div class="text-body2 text-mumble-accent q-mb-md">
              Controlla e installa aggiornamenti dell'applicazione
            </div>
            
            <div class="text-center">
              <q-btn
                class="mumble-btn-primary q-mb-md"
                label="Controlla Aggiornamenti"
                icon="system_update"
                @click="checkForUpdates"
                :loading="updateChecking"
                no-caps
                unelevated
                rounded
              />
            </div>
            
            <div v-if="currentVersion" class="text-center">
              <div class="text-caption text-mumble-accent">
                Versione corrente: v{{ currentVersion.name }} ({{ currentVersion.code }})
              </div>
            </div>
          </div>

          <div class="text-center q-mt-xl q-pt-xl">
            <q-icon name="settings" size="4rem" class="text-mumble-accent q-mb-md" />
            <div class="text-h6 text-mumble-primary q-mb-sm">Settings Page</div>
            <div class="text-body2 text-mumble-accent">
              Configura le impostazioni dell'applicazione.
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { updateService } from 'src/services/updateService'

const $q = useQuasar()

const videoElement = ref(null)
const showCamera = ref(false)
const cameraLoading = ref(false)
const capturedPhoto = ref(null)
const updateChecking = ref(false)
const currentVersion = ref(null)
let mediaStream = null

onMounted(async () => {
  // Ottieni versione corrente
  await updateService.init()
  currentVersion.value = updateService.currentVersion
})

async function openBackCamera() {
  try {
    cameraLoading.value = true
    capturedPhoto.value = null
    
    // Request camera permission with back camera preference
    const constraints = {
      video: {
        facingMode: 'environment', // Back camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    }
    
    mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    showCamera.value = true
    
    // Wait for next tick to ensure video element is rendered
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream
    }
    
    $q.notify({
      type: 'positive',
      message: 'Camera opened successfully',
      position: 'top'
    })
    
  } catch (error) {
    console.error('Error accessing camera:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to access camera: ' + error.message,
      position: 'top'
    })
  } finally {
    cameraLoading.value = false
  }
}

function takePhoto() {
  if (!videoElement.value) return
  
  try {
    const canvas = document.createElement('canvas')
    const video = videoElement.value
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    
    capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.8)
    
    $q.notify({
      type: 'positive',
      message: 'Photo captured successfully',
      position: 'top'
    })
    
  } catch (error) {
    console.error('Error taking photo:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to capture photo',
      position: 'top'
    })
  }
}

function closeCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  showCamera.value = false
  
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
}

// Controllo manuale aggiornamenti
async function checkForUpdates() {
  updateChecking.value = true
  try {
    await updateService.checkForUpdates(true) // Mostra dialog anche se non ci sono aggiornamenti
  } finally {
    updateChecking.value = false
  }
}

// Cleanup on component unmount
onUnmounted(() => {
  closeCamera()
})
</script>

<style scoped>
.camera-container {
  border: 2px solid #A096A3;
  border-radius: 0;
  padding: 16px;
  background: #E5E9DF;
}

.camera-preview {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 0;
  background: #29252C;
  border: 2px solid #3A3F4A;
}

.camera-controls {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.photo-container {
  border: 2px solid #3A3F4A;
  border-radius: 0;
  padding: 16px;
  background: #DCC0AB;
}

.captured-photo {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 0;
  border: 2px solid #A096A3;
  box-shadow: 0 2px 8px rgba(58, 63, 74, 0.2);
}
</style>