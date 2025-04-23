# Instrukcja wdrożenia aplikacji finansowej przez Portainer

## Przygotowanie

1. Upewnij się, że masz zainstalowany i działający Portainer (CE lub EE) w swoim środowisku
2. Upewnij się, że Portainer ma dostęp do Docker Engine

## Wdrożenie aplikacji z GitHub

### Krok 1: Zaloguj się do Portainer
Otwórz przeglądarkę i przejdź do adresu Portainera (np. `http://twój-serwer:9000` lub `https://twój-serwer:9443`)

### Krok 2: Wybierz środowisko
Po zalogowaniu wybierz środowisko Docker, w którym chcesz wdrożyć aplikację.

### Krok 3: Utwórz nowy stos (Stack)
1. W menu bocznym kliknij na "Stacks"
2. Kliknij przycisk "Add stack"

### Krok 4: Skonfiguruj stos z repozytorium GitHub
1. W sekcji "Build method" wybierz opcję "Repository"
2. W polu "Repository URL" wprowadź adres repozytorium:
   ```
   https://github.com/optiq-ai/finance-app.git
   ```
3. W polu "Repository reference" pozostaw wartość "main" (lub wprowadź ją, jeśli pole jest puste)
4. W polu "Compose path" wprowadź:
   ```
   docker-compose.yml
   ```
5. Opcjonalnie możesz dostosować zmienne środowiskowe w sekcji "Environment variables"
   - Domyślne dane dostępowe do bazy danych to: postgres/postgres
   - Domyślny sekret JWT to: finance-app-secret-key
   - **Zalecamy zmianę tych wartości w środowisku produkcyjnym!**

### Krok 5: Wdrożenie stosu
1. Kliknij przycisk "Deploy the stack"
2. Poczekaj, aż Portainer pobierze repozytorium i uruchomi wszystkie kontenery

### Krok 6: Weryfikacja wdrożenia
1. Po zakończeniu wdrożenia, przejdź do sekcji "Stacks" i sprawdź, czy stos "finance-app" ma status "Running"
2. Kliknij na nazwę stosu, aby zobaczyć szczegóły i status poszczególnych kontenerów
3. Wszystkie trzy kontenery (db, backend, frontend) powinny mieć status "Running"

## Dostęp do aplikacji

Po pomyślnym wdrożeniu, aplikacja będzie dostępna pod adresem:
```
http://twój-serwer
```

Domyślne dane logowania:
- Login: admin
- Hasło: 5N13gul!

**WAŻNE**: Po pierwszym logowaniu zmień domyślne hasło administratora!

## Rozwiązywanie problemów

Jeśli napotkasz problemy podczas wdrożenia:

1. Sprawdź logi kontenerów w Portainer:
   - Przejdź do sekcji "Containers"
   - Kliknij na nazwę kontenera
   - Przejdź do zakładki "Logs"

2. Upewnij się, że wszystkie porty są dostępne:
   - Port 80 dla frontendu
   - Port 3001 dla backendu
   - Port 5432 dla bazy danych

3. Sprawdź, czy zmienne środowiskowe są poprawnie skonfigurowane

4. Jeśli problem dotyczy bazy danych, możesz zresetować dane:
   - Usuń stos w Portainer
   - Usuń wolumen `postgres_data` (uwaga: spowoduje to utratę wszystkich danych!)
   - Wdrożyj stos ponownie

## Aktualizacja aplikacji

Aby zaktualizować aplikację do nowszej wersji:

1. Przejdź do sekcji "Stacks" w Portainer
2. Znajdź stos "finance-app"
3. Kliknij przycisk "Update"
4. Upewnij się, że opcja "Pull image" jest zaznaczona
5. Kliknij "Update the stack"

## Kontakt

W przypadku problemów z wdrożeniem, skontaktuj się z zespołem wsparcia:
- Email: support@example.com
- Telefon: +48 123 456 789
