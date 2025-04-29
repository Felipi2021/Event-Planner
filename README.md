# Opis aplikacji Event-Planner

**Autor:** Filip Andrzejczak  
**Projekt:** Indywidualny projekt zaliczeniowy  
*Wszystkie funkcjonalności i elementy aplikacji zostały w całości opracowane i zaimplementowane przeze mnie.*

## Opis działania aplikacji

Aplikacja Event-Planner to kompleksowe narzędzie do zarządzania i uczestnictwa w wydarzeniach. Umożliwia użytkownikom tworzenie, przeglądanie i uczestnictwo w różnych wydarzeniach.

### Funkcjonalności aplikacji:

1. **Strona główna** - prezentuje najnowsze wydarzenia, wiadomości ze świata oraz aktualną pogodę dla wybranego miasta.

2. **System użytkowników** - umożliwia rejestrację i logowanie, zarządzanie profilem oraz przydzielanie ról (użytkownik standardowy/administrator).

3. **Zarządzanie wydarzeniami**:
   - Przeglądanie dostępnych wydarzeń
   - Tworzenie nowych wydarzeń
   - Szczegółowy widok wydarzenia
   - Zarządzanie uczestnictwem (dołączanie/rezygnacja)
   - Dodawanie wydarzeń do ulubionych

4. **Filtrowanie i wyszukiwanie** - możliwość sortowania wydarzeń według nazwy, daty lub pojemności oraz wyszukiwanie po tytule.

5. **Panel administracyjny** - specjalne funkcje dla administratorów systemu.

6. **Prognozy pogody** - integracja z API OpenWeatherMap dostarczającym informacje o pogodzie.

## Opis techniczny aplikacji

### Architektura

Aplikacja wykorzystuje architekturę klient-serwer z wyraźnym podziałem na frontend i backend:

1. **Frontend**:
   - Framework: React.js
   - Routing: React Router (nawigacja między stronami)
   - Zarządzanie stanem: React Hooks (useState, useEffect)
   - Stylizacja: SCSS
   - Komunikacja z API: Axios
   - Powiadomienia: React-Toastify

2. **Backend**:
   - Środowisko: Node.js
   - Framework: Express.js
   - Baza danych: SQL (wykorzystanie modeli i migracji)
   - API RESTful: endpointy dla użytkowników i wydarzeń
   - Uwierzytelnianie: JWT (JSON Web Token)
   - Przechowywanie plików: upload zdjęć profilowych i wydarzeń

### Główne komponenty techniczne:

1. **Frontend**:
   - Strony (pages): Home, Events, Login, Register, Profile, CreateEvent, EventDetails, Admin
   - Komponenty: Navbar, EventCard, ErrorBoundary
   - Zarządzanie sesją: localStorage (przechowywanie tokenów i danych użytkownika)

2. **Backend**:
   - Kontrolery: userController, eventController, commentController
   - Routery: userRoutes, eventRoutes
   - Modele danych: reprezentacja tabel w bazie danych
   - Middleware: obsługa uwierzytelniania i autoryzacji

3. **Integracje zewnętrzne**:
   - OpenWeatherMap API: prognoza pogody
   - Inne serwisy informacyjne (wiadomości)

### Bezpieczeństwo:

- Tokeny JWT dla bezpiecznego uwierzytelniania
- Walidacja danych wejściowych
- Autoryzacja dostępu do zasobów
- Zabezpieczenie przed nieautoryzowanym dostępem do chronionych ścieżek

### Przepływ danych:

1. Żądania klienta (frontend) są wysyłane do serwera przez API RESTful
2. Backend przetwarza żądania, wykonuje operacje na bazie danych i zwraca odpowiednie dane
3. Frontend renderuje otrzymane dane i umożliwia interakcję użytkownika z aplikacją

Aplikacja Event-Planner to wszechstronne narzędzie do zarządzania wydarzeniami, łączące nowoczesne technologie webowe w celu zapewnienia intuicyjnego i funkcjonalnego doświadczenia użytkownika. 
