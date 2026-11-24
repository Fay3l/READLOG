# Image de la version web de ReadLog : build Expo, puis fichiers statiques servis par nginx.

# ── Étape 1 : construction (Node) ── jetée ensuite, seul le résultat est gardé
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Les variables EXPO_PUBLIC_* sont écrites DANS le JavaScript au moment du build
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_APK_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL \
    EXPO_PUBLIC_APK_URL=$EXPO_PUBLIC_APK_URL \
    CI=1
RUN npx expo export -p web --output-dir dist

# ── Étape 2 : l'image finale, ~25 Mo, sans Node ni code source ──
# nginx-unprivileged : nginx qui tourne sans root (port 8080 au lieu de 80)
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
