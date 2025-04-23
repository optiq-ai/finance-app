FROM node:16-alpine as build

# Ustawienie zmiennych środowiskowych
ARG NODE_ENV=production
ARG API_URL
ENV REACT_APP_API_URL=${API_URL}

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

# Instalacja zależności - zmieniono z npm ci na npm install
RUN npm install

# Kopiowanie reszty plików projektu
COPY . .

# Budowanie aplikacji
RUN npm run build

# Etap produkcyjny - serwowanie plików statycznych przez NGINX
FROM nginx:alpine

# Kopiowanie plików budowy z poprzedniego etapu
COPY --from=build /app/build /usr/share/nginx/html

# Kopiowanie własnej konfiguracji NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ekspozycja portu
EXPOSE 80

# Uruchomienie NGINX
CMD ["nginx", "-g", "daemon off;"]
