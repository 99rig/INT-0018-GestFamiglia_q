# 🔹 1️⃣ STAGE DI BUILD CON NODE
FROM node:18-alpine as build-stage
WORKDIR /app

# ✅ Copia solo package.json per ottimizzare la cache dei pacchetti
COPY package.json package-lock.json* ./

# ✅ Installa le dipendenze globali e di progetto
RUN npm install -g @quasar/cli
RUN npm install --legacy-peer-deps

# ✅ Copia tutto il progetto Quasar
COPY . .

# 🔎 Debug: Controlla che il progetto sia valido
RUN ls -la /app

# ✅ Build per produzione SPA (usa .env.prod)
RUN quasar build -m spa --target prod
# 🔹 2️⃣ STAGE DI PRODUZIONE CON NGINX
FROM nginx:1.25.0-alpine as production-stage

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