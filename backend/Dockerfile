FROM node:16-alpine

# Ustawienie zmiennych środowiskowych
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

# Instalacja zależności - zmieniono z npm ci na npm install
RUN npm install

# Kopiowanie reszty plików projektu
COPY . .

# Utworzenie katalogów dla uploadu i danych
RUN mkdir -p /app/uploads /app/data
VOLUME ["/app/uploads", "/app/data"]

# Ekspozycja portu
EXPOSE 5000

# Uruchomienie aplikacji
CMD ["npm", "start"]
