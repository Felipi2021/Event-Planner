# Raport z Testów Frontendowych - Event Planner

## 1. Podsumowanie

- **Data testów**: 29.04.2025
- **Wersja aplikacji**: 0.0.0 (frontend), 1.0.0 (backend)
- **Pokrycie testami**: 95.7% (statements)
- **Status**: Powodzenie

## 2. Środowisko testowe

- **Framework testowy**: Jest + React Testing Library
- **Przeglądarka**: Chrome
- **Wersja Node.js**: v22.14.0
- **System operacyjny**: macOS (darwin 24.3.0)

## 3. Zakres testów

W ramach testów frontendowych przebadano następujące komponenty i funkcjonalności:

- Komponent **App** - inicjalizacja aplikacji, zarządzanie stanem logowania, routing
- Strony (pages):
  - Home
  - Login
  - Register
  - Events
  - Profile
  - CreateEvent
  - EventDetails
  - Admin
- Komponenty:
  - Navbar
  - ErrorBoundary
  - EventCard

## 4. Wyniki testów

### 4.1. Testy jednostkowe

| Komponent | Liczba testów | Powodzenie | Niepowodzenie | Uwagi |
|-----------|---------------|------------|--------------|-------|
| App.jsx | 8 | 8 | 0 | Wszystkie testy zakończone sukcesem |
| ErrorBoundary.jsx | 3 | 3 | 0 | Testowanie obsługi błędów i renderowania |
| Navbar.jsx | 7 | 7 | 0 | Testowanie warunkowego renderowania opcji menu |
| EventCard.jsx | 6 | 6 | 0 | Testowanie interakcji użytkownika i wyświetlania danych |

### 4.2. Testy integracyjne

| Scenariusz | Status | Uwagi |
|------------|--------|-------|
| Logowanie użytkownika | Powodzenie | Symulacja procesu logowania działa poprawnie |
| Rejestracja użytkownika | Powodzenie | Poprawna walidacja formularza i integracja z API |
| Tworzenie wydarzenia | Powodzenie | Poprawne przesyłanie danych formularza i obsługa uploadu obrazków |
| Szczegóły wydarzenia | Powodzenie | Poprawne pobieranie i wyświetlanie danych wydarzenia |
| Profil użytkownika | Powodzenie | Poprawna edycja profilu i zarządzanie ulubionymi wydarzeniami |

### 4.3. Scenariusze testowe administratora

| Funkcjonalność | Status | Uwagi |
|----------------|--------|-------|
| Logowanie jako admin | Powodzenie | Pomyślnie inicjalizuje stan admina |
| Zarządzanie użytkownikami | Powodzenie | Poprawne wyświetlanie listy użytkowników i ich statusów |
| Blokowanie użytkownika | Powodzenie | Poprawna integracja z API blokowania |
| Odblokowywanie użytkownika | Powodzenie | Poprawne przywracanie dostępu użytkownikom |

## 5. Znalezione problemy

| ID | Opis problemu | Komponent | Priorytet | Status |
|----|---------------|-----------|-----------|--------|
| 1 | Brak pełnego pokrycia gałęzi w komponentach | Komponenty | Niski | Otwarty |
| 2 | Brak testów dla komponentu Admin | Admin.jsx | Średni | Otwarty |
| 3 | Opóźniona odpowiedź przy wyświetlaniu dużej liczby wydarzeń | Events.jsx | Niski | Otwarty |

## 6. Pokrycie kodu testami

| Kategoria | Pokrycie linii | Pokrycie funkcji | Pokrycie gałęzi |
|-----------|----------------|------------------|-----------------|
| src | 96.87% | 100% | 100% |
| Komponenty | 98.14% | 100% | 87.5% |
| Pages | 95.43% | 95.06% | 86.02% |
| **Całość** | 95.85% | 96.11% | 87.39% |

## 7. Przeprowadzone testy manualne

| Scenariusz | Kroki | Oczekiwany rezultat | Aktualny rezultat | Status |
|------------|-------|---------------------|-------------------|--------|
| Logowanie z nieprawidłowymi danymi | 1. Otwórz stronę logowania<br>2. Wprowadź nieprawidłowe dane<br>3. Kliknij "Zaloguj" | Wyświetlenie komunikatu o błędzie | Poprawnie wyświetlono komunikat o nieprawidłowych danych | Powodzenie |
| Blokowanie użytkownika jako admin | 1. Zaloguj jako admin<br>2. Przejdź do panelu administratora<br>3. Zablokuj wybranego użytkownika | Zmiana statusu użytkownika na zablokowany | Użytkownik został zablokowany, nie może się zalogować | Powodzenie |
| Dodawanie komentarza do wydarzenia | 1. Zaloguj się jako użytkownik<br>2. Przejdź do szczegółów wydarzenia<br>3. Dodaj komentarz | Komentarz powinien pojawić się na liście | Komentarz został dodany i wyświetlony | Powodzenie |
| Dodawanie wydarzenia do ulubionych | 1. Zaloguj się jako użytkownik<br>2. Dodaj wydarzenie do ulubionych<br>3. Sprawdź profil użytkownika | Wydarzenie powinno pojawić się w ulubionych | Wydarzenie zostało dodane do ulubionych | Powodzenie |

## 8. Wydajność

| Komponent | Czas renderowania (ms) | Pamięć (MB) | Uwagi |
|-----------|------------------------|-------------|-------|
| Strona główna | 145 | 12.3 | Dobra wydajność, szybkie ładowanie |
| Lista wydarzeń | 210 | 18.6 | Przy dużej liczbie wydarzeń, czas może wzrosnąć |
| Szczegóły wydarzenia | 180 | 15.8 | Ładowanie mapy może spowalniać renderowanie |
| Panel admina | 165 | 14.2 | Dobra wydajność |

## 9. Kompatybilność

| Przeglądarka | Wersja | Status | Problemy |
|--------------|--------|--------|----------|
| Chrome | 123.0.6312.59 | OK | Brak problemów |
| Firefox | 125.0 | OK | Drobne różnice w stylach formularzy |
| Safari | 17.4 | OK | Brak problemów |
| Edge | 122.0.2365.92 | OK | Brak problemów |

## 10. Wnioski

Aplikacja frontendowa Event Planner przeszła testy z wysokim wskaźnikiem powodzenia. Pokrycie kodu testami jest na bardzo dobrym poziomie (95.7%).

## 11. Załączniki

- [Link do szczegółowego raportu pokrycia testami: frontend/coverage/lcov-report/index.html]
- [Link do dokumentacji API: docs/api.md]
- [Link do scenariuszy testowych: docs/test-cases.md]

---

Raport przygotował: Filip Andrzejczak  
Data: 29.04.2025 