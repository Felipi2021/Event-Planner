# Konfiguracja funkcjonalności administratora

Ten dokument opisuje, jak skonfigurować i korzystać z funkcjonalności administratora w aplikacji Event Planner.
## Instalacja i Konfiguracja

### Wymagania Wstępne
- Zainstalowane Node.js i npm.
- Skonfigurowana baza danych MySQL z wymaganym schematem.

### Kroki:
### 1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/your-repo/event-planner.git
   ```
### 2. Przejdź do katalogu projektu:
   ```bash
   cd event-planner
   ```
### 3. Zainstaluj zależności:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
### 4. Skonfiguruj zmienne środowiskowe:
- **Utwórz plik .env w katalogu backend i dodaj**:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=twoje_hasło
DB_NAME=event_planner
JWT_SECRET=twój_klucz_tajny
PORT=5001
```
### 5. Zaimportuj baze danych:
- **Wybierz okno import z panelu phpmyadmin i wstaw plik event_planner.sql**

### 6. Uruchom serwer backend:
```bash
cd backend
npm start
```
### 7. Uruchom frontend:
```bash
cd frontend
npm run dev
```

## Schema Bazy Danych

### Tabela Users
- **id** (Klucz główny)
- **username** (nazwa użytkownika)
- **email** (adres e-mail)
- **password** (hasło, zahaszowane)
- **role** (rola: user/admin)
- **image** (ścieżka do zdjęcia profilowego)
- **description** (opis profilu)
- **created_at** (data utworzenia konta)
- **is_admin** (flaga administratora)
- **is_banned** (flaga blokady)
- **ban_reason** (powód blokady)

### Tabela Events
- **id** (Klucz główny)
- **title** (tytuł wydarzenia)
- **description** (opis wydarzenia)
- **date** (data wydarzenia)
- **location** (lokalizacja)
- **capacity** (pojemność)
- **attendees_count** (liczba uczestników)
- **created_by** (ID twórcy)
- **image** (ścieżka do obrazu wydarzenia)

### Tabela Registration
- **id** (Klucz główny)
- **user_id** (Klucz obcy do tabeli Users)
- **event_id** (Klucz obcy do tabeli Events)

### Tabela Comments
- **id** (Klucz główny)
- **event_id** (Klucz obcy do tabeli Events)
- **user_id** (Klucz obcy do tabeli Users)
- **text** (treść komentarza)
- **created_at** (data utworzenia)

### Tabela Favorites
- **id** (Klucz główny)
- **user_id** (Klucz obcy do tabeli Users)
- **event_id** (Klucz obcy do tabeli Events)

### Tabela Ratings
- **id** (Klucz główny)
- **rater_id** (Klucz obcy do tabeli Users - oceniający)
- **rated_id** (Klucz obcy do tabeli Users - oceniany)
- **rating** (ocena, 1-5)
- **created_at** (data wystawienia oceny)

## Tworzenie użytkownika administratora

1. Uruchom skrypt tworzenia administratora:
```bash
cd backend
node models/migrations/create_admin_user.js
```

Utworzy to użytkownika administratora z następującymi danymi:
- Email: admin@event-planner.com
- Hasło: Admin123!

## Tworzenie danych testowych (opcjonalne)

Jeśli chcesz wypełnić bazę danych przykładowymi danymi do testowania, możesz uruchomić skrypt:

```bash
cd backend
node models/migrations/create_fixtures.js
```

Ten skrypt utworzy:
- 5 przykładowych użytkowników (3 zwykłych użytkowników, 2 zablokowanych)
- 5 wydarzeń z różnymi datami i lokalizacjami
- około 20 komentarzy do różnych wydarzeń
- rejestracje na wydarzenia dla zwykłych użytkowników
- ulubione wydarzenia dla zwykłych użytkowników

Po utworzeniu możesz zalogować się używając przykładowych kont:
- Zwykli użytkownicy: 
  - alice@example.com / Test123!
  - bob@example.com / Test123!
  - carol@example.com / Test123!
- Zablokowani użytkownicy:
  - dave@example.com / Test123!
  - evan@example.com / Test123!

Zablokowani użytkownicy pozwolą Ci przetestować funkcję blokowania i zobaczyć, jak działa doświadczenie zablokowanego użytkownika.

## Funkcje administratora

Po zalogowaniu jako administrator będziesz mieć dostęp do:

1. Panelu administratora (dostępnego z paska nawigacyjnego)
2. Zarządzania użytkownikami:
   - Przeglądanie wszystkich użytkowników
   - Blokowanie użytkowników (z niestandardowym powodem blokady)
   - Odblokowywanie użytkowników

## Doświadczenie zablokowanego użytkownika

Gdy zablokowany użytkownik próbuje się zalogować:
1. Zobaczy komunikat informujący o zablokowaniu
2. Komunikat będzie zawierał powód podany przez administratora
3. Nie będzie mógł uzyskać dostępu do żadnej części aplikacji

## Uwagi dotyczące bezpieczeństwa

- Panel administratora jest chroniony zarówno na frontendzie, jak i backendzie
- Tylko użytkownicy z flagą `is_admin` ustawioną na true mogą uzyskać dostęp do funkcji administratora
- Weryfikacja tokenów zapewnia, że tylko administratorzy mogą wykonywać działania administratora

## Ręczne tworzenie administratora (w razie potrzeby)

Jeśli musisz ręcznie utworzyć użytkownika administratora, możesz użyć endpointu tworzenia administratora:

```
POST /api/users/admin/create
```

Treść:
```json
{
  "username": "Admin",
  "email": "admin@example.com",
  "password": "StrongPassword123!",
  "adminSecret": "your-admin-secret-key"
}
```

Wartość `adminSecret` powinna odpowiadać `ADMIN_SECRET_KEY` w twoich zmiennych środowiskowych. 
