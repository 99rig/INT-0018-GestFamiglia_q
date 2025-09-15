<template>
  <q-page class="mumble-page-container q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        
        <!-- Header -->
        <div class="mumble-card q-pa-lg q-mb-lg">
          <div class="text-h4 text-mumble-primary q-mb-md">Help & Documentation</div>
          <div class="text-subtitle1 text-mumble-accent">
            Guide to using this Mumble Projects application
          </div>
        </div>

        <!-- Installation Guide -->
        <div class="mumble-card q-pa-lg q-mb-lg">
          <div class="text-h5 text-mumble-primary q-mb-md">Installing the App</div>
          
          <div class="q-mb-md">
            <div class="text-h6 text-mumble-secondary q-mb-sm">On Mobile Devices:</div>
            <ul class="text-body2 text-mumble-accent">
              <li>Open this app in your mobile browser (Safari on iOS, Chrome on Android)</li>
              <li>Tap the share button and select "Add to Home Screen"</li>
              <li>The app will be installed as a native-like application</li>
              <li>Access the app from your home screen like any other app</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-h6 text-mumble-secondary q-mb-sm">On Desktop:</div>
            <ul class="text-body2 text-mumble-accent">
              <li>Open this app in Chrome, Edge, or another modern browser</li>
              <li>Look for the install icon in the address bar</li>
              <li>Click "Install" to add the app to your desktop</li>
              <li>The app will work offline and receive updates automatically</li>
            </ul>
          </div>
        </div>

        <!-- Color Palette -->
        <div class="mumble-card q-pa-lg q-mb-lg">
          <div class="text-h5 text-mumble-primary q-mb-md">Mumble Color Palette</div>
          <div class="text-body2 text-mumble-accent q-mb-lg">
            This application uses the official Mumble Projects color palette:
          </div>
          
          <div class="row q-gutter-md">
            <div class="col-12 col-sm-6 col-md-4">
              <div class="mumble-bg-primary q-pa-md rounded" style="color: white;">
                <div class="text-weight-bold">Primary</div>
                <div class="text-caption">#3A3F4A</div>
                <div class="text-caption">Dark Blue</div>
              </div>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4">
              <div class="mumble-bg-secondary q-pa-md rounded" style="color: white;">
                <div class="text-weight-bold">Secondary</div>
                <div class="text-caption">#29252C</div>
                <div class="text-caption">Dark Grey</div>
              </div>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4">
              <div class="mumble-bg-accent q-pa-md rounded" style="color: white;">
                <div class="text-weight-bold">Accent</div>
                <div class="text-caption">#A096A3</div>
                <div class="text-caption">Light Purple</div>
              </div>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4">
              <div class="mumble-bg-light q-pa-md rounded border" style="color: #3A3F4A;">
                <div class="text-weight-bold">Light</div>
                <div class="text-caption">#E5E9DF</div>
                <div class="text-caption">Cream</div>
              </div>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4">
              <div class="mumble-bg-warm q-pa-md rounded" style="color: #3A3F4A;">
                <div class="text-weight-bold">Warm</div>
                <div class="text-caption">#DCC0AB</div>
                <div class="text-caption">Beige</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Developer Guide -->
        <div class="mumble-card q-pa-lg q-mb-lg">
          <div class="text-h5 text-mumble-primary q-mb-md">For Developers</div>
          
          <div class="q-mb-md">
            <div class="text-h6 text-mumble-secondary q-mb-sm">Creating a New Project:</div>
            <div class="q-pa-md mumble-bg-light rounded q-mb-md">
              <code class="text-mumble-primary">create-quasar-app .</code>
            </div>
            <div class="text-body2 text-mumble-accent q-mb-md">
              Run this command in your desired directory to create a new project based on this template.
            </div>
          </div>

          <div class="q-mb-md">
            <div class="text-h6 text-mumble-secondary q-mb-sm">What You Get:</div>
            <ul class="text-body2 text-mumble-accent">
              <li>Quasar framework with Vue 3 and Composition API</li>
              <li>Capacitor ready for iOS and Android deployment</li>
              <li>PWA capabilities with offline support</li>
              <li>Mumble Projects branding and color palette</li>
              <li>Optimized build configurations</li>
              <li>Essential Capacitor plugins pre-installed</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-h6 text-mumble-secondary q-mb-sm">Available CSS Classes:</div>
            <ul class="text-body2 text-mumble-accent">
              <li><code>.mumble-primary</code>, <code>.mumble-secondary</code>, <code>.mumble-accent</code> - Text colors</li>
              <li><code>.mumble-bg-primary</code>, <code>.mumble-bg-secondary</code>, etc. - Background colors</li>
              <li><code>.mumble-btn-primary</code>, <code>.mumble-btn-accent</code> - Button styles</li>
              <li><code>.mumble-card</code> - Styled cards with Mumble design</li>
              <li><code>.mumble-page-container</code> - Page background container</li>
            </ul>
          </div>
        </div>

        <!-- Support -->
        <div class="mumble-card q-pa-lg">
          <div class="text-h5 text-mumble-primary q-mb-md">Support</div>
          <div class="text-body2 text-mumble-accent">
            This application template is provided by Mumble Projects. 
            For technical support or questions about implementing new features, 
            refer to the official Quasar and Capacitor documentation.
          </div>
          
          <div class="q-mt-lg">
            <q-btn 
              class="mumble-btn-primary q-mr-md" 
              label="Quasar Docs" 
              @click="openExternal('https://quasar.dev')"
              outline
            />
            <q-btn 
              class="mumble-btn-accent" 
              label="Capacitor Docs" 
              @click="openExternal('https://capacitorjs.com')"
              outline
            />
          </div>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
const openExternal = (url) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
code {
  background-color: rgba(58, 63, 74, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.border {
  border: 1px solid #A096A3;
}

.rounded {
  border-radius: 8px;
}
</style>