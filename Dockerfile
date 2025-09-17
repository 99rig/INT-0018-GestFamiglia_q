# 🔹 1️⃣ STAGE DI BUILD CON NODE
FROM node:20-alpine3.20 AS build-stage
WORKDIR /app

# ✅ Installa Quasar CLI globalmente
RUN npm install -g @quasar/cli

# ✅ Copia tutto il progetto prima (necessario per quasar prepare)
COPY . .

# ✅ Installa le dipendenze del progetto
RUN npm install --legacy-peer-deps

# ✅ Crea versione mock di updateService per build web
RUN echo 'export default { init: () => {}, checkForUpdates: () => {}, downloadUpdate: () => {} }' > src/services/updateService.js.bak && \
    cp src/services/updateService.js.bak src/services/updateService.js

# 🔎 Debug: Controlla che il progetto sia valido
RUN ls -la /app

# ✅ Build per produzione SPA (con NODE_ENV=production)
ENV NODE_ENV=production
ENV CI=true
RUN quasar build -m spa --skip-pkg-version-check || quasar build -m spa
# 🔹 2️⃣ STAGE DI PRODUZIONE CON NGINX
FROM nginx:1.25.0-alpine AS production-stage

# ✅ Copia configurazione Nginx custom per SPA
COPY nginx.conf /etc/nginx/nginx.conf

# ✅ Copia i file buildati in Nginx (SPA invece di PWA)
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html

# ✅ Aggiungi curl per health check
RUN apk add --no-cache curl

# ✅ Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# ✅ Esponi la porta 80
EXPOSE 80

# ✅ Avvia Nginx
CMD ["nginx", "-g", "daemon off;"]