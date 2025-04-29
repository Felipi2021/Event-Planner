# Aplikacja Event Planner

## Przegląd

Event Planner to aplikacja internetowa zaprojektowana w celu usprawnienia organizacji wydarzeń i uczestnictwa w nich. Umożliwia użytkownikom tworzenie, zarządzanie i udział w wydarzeniach, jednocześnie tworząc społecznościowe doświadczenie poprzez system oceniania profili użytkowników. Platforma zawiera dodatkowe funkcje interakcji między użytkownikami, system reputacji oraz nadzór administracyjny zapewniający sprawne działanie.

---

## Funkcje

### 1. Zarządzanie Wydarzeniami
- **Tworzenie Wydarzeń**: Użytkownicy mogą tworzyć wydarzenia z takimi szczegółami jak nazwa, opis, lokalizacja, data i pojemność.
- **Przeglądanie Wydarzeń**: Wszyscy użytkownicy mogą przeglądać listę dostępnych wydarzeń.
- **Rejestracja na Wydarzenia**: Użytkownicy mogą rejestrować się na wydarzenia, którymi są zainteresowani.
- **Oznaczanie Obecności**: Zarejestrowani użytkownicy mogą oznaczać swoją obecność na wydarzeniach.

### 2. Profile Użytkowników
- **Przeglądanie Profili**: Każdy użytkownik posiada profil prezentujący jego informacje oraz wydarzenia, które stworzył lub w których uczestniczył.
- **Ocenianie i Recenzowanie Profili**:
  - **Oceny Gwiazdkowe**: Użytkownicy mogą oceniać profile innych użytkowników za pomocą systemu 5-gwiazdkowego.

### 3. Kontrola Administracyjna
- **Profil Administratora**: Specjalne konto administratora z podwyższonymi uprawnieniami.
- **Zarządzanie Użytkownikami**:
  - Usuwanie użytkowników z konkretnych wydarzeń.
  - Blokowanie kont użytkowników w razie potrzeby.
---

## Technologie
Aplikacja została zbudowana przy użyciu nowoczesnych technologii webowych:
- **Frontend**: React.js, Axios, SCSS
- **Backend**: Node.js, Express.js, MySQL
- **Uwierzytelnianie**: JWT (JSON Web Tokens)

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
### 5. Uruchom serwer backend:
```bash
cd backend
npm start
```
### 6. Uruchom frontend:
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

---

## Korzystanie z Aplikacji

### Tworzenie Konta:
- Zarejestruj się jako użytkownik, aby tworzyć wydarzenia lub dołączać do nich.
- Konta administratorów są tworzone przez backend ze względów bezpieczeństwa.

### Tworzenie lub Dołączanie do Wydarzeń:
- Użytkownicy mogą tworzyć wydarzenia lub rejestrować się na wydarzenia wyświetlane na stronie głównej.

### Interakcja z Profilami Użytkowników:
- Przeglądaj profile innych użytkowników i wystawiaj im oceny lub komentarze.
- Wydarzenia utworzone przez wysoko ocenianych użytkowników pojawią się na górze listy wydarzeń.

### Działania Administracyjne:
- Administratorzy mogą usuwać użytkowników z wydarzeń lub usuwać całe wydarzenia.
- Administratorzy mogą monitorować i zarządzać nieodpowiednią aktywnością.

---

## Przyszłe Ulepszenia
- Dodanie powiadomień o aktualizacjach wydarzeń.
- Implementacja czatu w czasie rzeczywistym dla uczestników wydarzenia.
- Wprowadzenie funkcji wyszukiwania i filtrowania wydarzeń.

---

## Autor
Filip Andrzejczak

---

## Licencja
Ten projekt jest objęty licencją MIT.
