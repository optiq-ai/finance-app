# Finance App - Aplikacja Analizy Finansowej

Aplikacja do kompleksowej analizy danych finansowych firmy z konfiguracją Docker dla łatwego wdrożenia przez Portainer.

## Funkcjonalności

- Import i analiza danych z plików Excel (zakupy, wypłaty, sprzedaż)
- Zaawansowane filtrowanie i sortowanie danych
- Wizualizacja danych w formie wykresów i dashboardów
- Zapisywanie i udostępnianie widoków
- Zarządzanie słownikami (oddziały, grupy, rodzaje usług, kontrahenci, kategorie kosztów)

## Wdrożenie przez Portainer

### Wymagania
- Portainer CE/EE
- Docker Engine
- Docker Compose

### Instrukcja wdrożenia

1. Zaloguj się do Portainera
2. Przejdź do sekcji "Stacks"
3. Kliknij "Add stack"
4. Wybierz metodę "Repository"
5. Wprowadź URL repozytorium: `https://github.com/optiq-ai/finance-app.git`
6. Ustaw ścieżkę do pliku Compose: `docker-compose.yml`
7. Opcjonalnie dostosuj zmienne środowiskowe
8. Kliknij "Deploy the stack"

### Domyślne dane logowania

- Login: admin
- Hasło: 5N13gul!

**WAŻNE**: Po pierwszym logowaniu zmień domyślne hasło administratora!

## Struktura projektu

```
/
├── docker-compose.yml      # Główny plik konfiguracyjny Docker Compose
├── .env                    # Zmienne środowiskowe
├── backend/                # Konfiguracja backendu
│   └── Dockerfile          # Dockerfile dla backendu
├── frontend/               # Konfiguracja frontendu
│   ├── Dockerfile          # Dockerfile dla frontendu
│   └── nginx.conf          # Konfiguracja Nginx
├── init-scripts/           # Skrypty inicjalizacyjne
│   └── 01-init.sql         # Inicjalizacja bazy danych
└── database/               # Skrypty bazy danych
    └── schema.sql          # Schemat bazy danych
```

## Zmienne środowiskowe

Możesz dostosować następujące zmienne w pliku `.env`:

- `POSTGRES_USER` - nazwa użytkownika bazy danych
- `POSTGRES_PASSWORD` - hasło do bazy danych
- `POSTGRES_DB` - nazwa bazy danych
- `JWT_SECRET` - sekretny klucz do generowania tokenów JWT
- `NODE_ENV` - środowisko (production/development)
- `PORT` - port na którym działa backend (domyślnie 3001)

## Wsparcie

W przypadku problemów z aplikacją, skontaktuj się z zespołem wsparcia:
- Email: support@example.com
- Telefon: +48 123 456 789
