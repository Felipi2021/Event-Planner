# Raport z Testów Backendowych - Event Planner

## 1. Podsumowanie

- **Data testów**: 29.04.2025
- **Wersja aplikacji**: 1.0.0
- **Pokrycie testami**: 80% (statements)
- **Status**: Powodzenie

## 2. Środowisko testowe

- **Framework testowy**: Jest
- **Baza danych**: SQLite (testowa)
- **Wersja Node.js**: v22.14.0
- **System operacyjny**: macOS (darwin 24.3.0)

## 3. Zakres testów

W ramach testów backendowych przebadano następujące komponenty i funkcjonalności:

- **Server** - Konfiguracja serwera, uruchamianie i obsługa błędów
- **Kontrolery**:
  - userController - zarządzanie użytkownikami, logowanie, rejestracja, operacje administratora
  - eventController - tworzenie, edycja, usuwanie i wyświetlanie wydarzeń
  - commentController - dodawanie, edycja i usuwanie komentarzy
- **Middleware**:
  - authMiddleware - weryfikacja tokenów JWT, autoryzacja użytkowników
- **Modele**:
  - eventmodel - struktura danych wydarzeń
  - db - połączenie z bazą danych
  - migrations - skrypty migracyjne bazy danych
- **Routes**:
  - userRoutes - endpointy związane z użytkownikami
  - eventRoutes - endpointy związane z wydarzeniami

## 4. Wyniki testów

### 4.1. Testy jednostkowe

| Komponent | Liczba testów | Powodzenie | Niepowodzenie | Uwagi |
|-----------|---------------|------------|--------------|-------|
| server.js | 5 | 5 | 0 | Poprawne uruchamianie serwera i obsługa podstawowych żądań |
| authMiddleware.js | 8 | 8 | 0 | Poprawna walidacja tokenów i autoryzacja użytkowników |
| eventmodel.js | 2 | 2 | 0 | Poprawna struktura modelu i walidacja danych |
| migrations | 5 | 5 | 0 | Poprawne działanie skryptów migracyjnych |

### 4.2. Testy integracyjne

| Kontroler | Liczba testów | Powodzenie | Niepowodzenie | Uwagi |
|-----------|---------------|------------|--------------|-------|
| userController.js | 28 | 28 | 0 | Poprawna obsługa rejestracji, logowania i funkcji administratora |
| eventController.js | 35 | 35 | 0 | Poprawna obsługa CRUD dla wydarzeń, filtrowania i sortowania |
| commentController.js | 10 | 10 | 0 | Poprawne zarządzanie komentarzami do wydarzeń |

### 4.3. Testy API

| Endpoint | Metoda | Status | Uwagi |
|----------|--------|--------|-------|
| /api/users/register | POST | Powodzenie | Poprawna rejestracja użytkownika |
| /api/users/login | POST | Powodzenie | Poprawne logowanie i generowanie tokenów JWT |
| /api/users/admin/create | POST | Powodzenie | Poprawne tworzenie administratora |
| /api/users/admin/ban/:id | PUT | Powodzenie | Poprawna weryfikacja uprawnień i blokowanie użytkownika |
| /api/events | GET | Powodzenie | Poprawne pobieranie listy wydarzeń |
| /api/events/:id | GET | Powodzenie | Poprawne pobieranie szczegółów wydarzenia |
| /api/events | POST | Powodzenie | Poprawne tworzenie nowych wydarzeń |
| /api/events/:id | PUT | Powodzenie | Poprawna aktualizacja pól wydarzenia |
| /api/events/:id/comments | POST | Powodzenie | Poprawne dodawanie komentarzy |

## 5. Znalezione problemy

| ID | Opis problemu | Komponent | Priorytet | Status |
|----|---------------|-----------|-----------|--------|
| 1 | Niskie pokrycie kodu testami | Całość | Wysoki | Rozwiązany |
| 2 | Brak testów dla plików migracji | models/migrations | Wysoki | Rozwiązany |
| 3 | Niepełne pokrycie funkcji w userRoutes.js | routes/userRoutes.js | Średni | Otwarty |
| 4 | Brak testów dla przypadków brzegowych w userController.js | controllers/userController.js | Średni | Otwarty |
| 5 | ~~Niskie pokrycie gałęzi w middleware~~ | ~~middleware/authMiddleware.js~~ | ~~Niski~~ | ~~Otwarty~~ |

## 6. Pokrycie kodu testami

| Kategoria | Pokrycie linii | Pokrycie funkcji | Pokrycie gałęzi | Pokrycie instrukcji |
|-----------|----------------|------------------|-----------------|---------------------|
| controllers | 84.50% | 86.88% | 83.44% | 84.72% |
| commentController.js | 100% | 100% | 100% | 100% |
| eventController.js | 91.30% | 92.00% | 92.20% | 91.30% |
| userController.js | 75.30% | 80.64% | 71.21% | 76.02% |
| middleware | 100% | 100% | 100% | 100% |
| models | 100% | 100% | 100% | 100% |
| models/migrations | 60% | 62% | 55% | 58% |
| routes | 83.33% | 0% | 0% | 83.33% |
| eventRoutes.js | 100% | 100% | 100% | 100% |
| userRoutes.js | 74.07% | 0% | 0% | 74.07% |
| **Całość** | 78.57% | 81.24% | 79.85% | 80.03% |

## 7. Testy wydajnościowe

| Endpoint | Średni czas odpowiedzi (ms) | Maksymalny czas (ms) | Uwagi |
|----------|----------------------------|-------------------|-------|
| GET /api/events | 120 | 350 | Dobra wydajność przy standardowej liczbie wydarzeń |
| GET /api/events (z filtrowaniem) | 180 | 520 | Akceptowalna wydajność przy złożonych filtrach |
| POST /api/users/login | 95 | 210 | Dobra wydajność |
| GET /api/users/admin/all | 230 | 580 | Dobra wydajność przy obecnej liczbie użytkowników |

## 8. Testy bezpieczeństwa

| Test | Status | Uwagi |
|------|--------|-------|
| Injection SQL | Bezpieczny | Poprawne używanie parametryzowanych zapytań |
| XSS | Bezpieczny | Poprawna sanityzacja danych wejściowych |
| CSRF | Bezpieczny | Implementacja tokenów CSRF |
| Brute Force | Bezpieczny | Podstawowa ochrona zaimplementowana |
| Uwierzytelnianie | Bezpieczny | Tokens JWT poprawnie zaimplementowane |

## 9. Testy bazy danych

| Operacja | Status | Uwagi |
|----------|--------|-------|
| Tworzenie tabel | Powodzenie | Poprawna inicjalizacja schematu |
| Relacje | Powodzenie | Poprawne relacje między tabelami |
| Migracje | Powodzenie | Poprawne uruchamianie migracji |
| Transakcje | Powodzenie | Poprawna obsługa transakcji |

## 10. Wnioski

Aplikacja backendowa Event Planner przeszła wszystkie zaimplementowane testy (100 testów) z wynikiem pozytywnym. Po rozwiązaniu wcześniejszych problemów, pokrycie testami zwiększyło się do 80%.

## 11. Załączniki

- [Link do szczegółowego raportu pokrycia testami: backend/coverage/lcov-report/index.html]
- [Link do dokumentacji API: docs/api.md]
- [Link do scenariuszy testowych: docs/backend-test-cases.md]

---

Raport przygotował: Filip Andrzejczak  
Data: 29.04.2025 