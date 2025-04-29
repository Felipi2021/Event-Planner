# Opis bazy danych Event Planner

**Projekt i implementacja:** Filip Andrzejczak

Baza danych "event_planner" składa się z 6 tabel, które wspólnie obsługują funkcjonalność platformy zarządzania wydarzeniami:

## 1. Tabela `users`
Przechowuje informacje o użytkownikach systemu.
- `id` - klucz główny, unikalny identyfikator użytkownika
- `username` - nazwa użytkownika
- `email` - unikalny adres email użytkownika
- `password` - hasło użytkownika (przechowywane w formie zaszyfrowanej)
- `role` - rola użytkownika (user/admin)
- `image` - ścieżka do obrazu profilowego
- `description` - opis profilu użytkownika
- `created_at` - data utworzenia konta
- `is_admin` - flaga oznaczająca czy użytkownik jest administratorem
- `is_banned` - flaga oznaczająca czy użytkownik został zablokowany
- `ban_reason` - powód blokady konta

## 2. Tabela `events`
Przechowuje informacje o wydarzeniach.
- `id` - klucz główny, unikalny identyfikator wydarzenia
- `title` - tytuł wydarzenia
- `description` - opis wydarzenia
- `date` - data wydarzenia
- `location` - lokalizacja wydarzenia
- `capacity` - maksymalna liczba uczestników
- `attendees_count` - aktualna liczba uczestników
- `created_by` - identyfikator użytkownika, który utworzył wydarzenie
- `image` - ścieżka do obrazu wydarzenia

## 3. Tabela `registration`
Rejestruje uczestnictwo użytkowników w wydarzeniach.
- `id` - klucz główny
- `user_id` - identyfikator użytkownika (klucz obcy do tabeli users)
- `event_id` - identyfikator wydarzenia (klucz obcy do tabeli events)

## 4. Tabela `comments`
Przechowuje komentarze użytkowników do wydarzeń.
- `id` - klucz główny
- `event_id` - identyfikator wydarzenia (klucz obcy)
- `user_id` - identyfikator użytkownika (klucz obcy)
- `text` - treść komentarza
- `created_at` - data dodania komentarza

## 5. Tabela `favorites`
Przechowuje informacje o wydarzeniach oznaczonych jako ulubione przez użytkowników.
- `id` - klucz główny
- `user_id` - identyfikator użytkownika (klucz obcy)
- `event_id` - identyfikator wydarzenia (klucz obcy)
- Unikalne połączenie `user_id` i `event_id` zapobiega duplikacji ulubionych wydarzeń

## 6. Tabela `ratings`
Przechowuje oceny użytkowników.
- `id` - klucz główny
- `rater_id` - identyfikator użytkownika wystawiającego ocenę (klucz obcy)
- `rated_id` - identyfikator ocenianego użytkownika (klucz obcy)
- `rating` - wartość oceny (liczba zmiennoprzecinkowa)
- `created_at` - data wystawienia oceny
- Unikalne połączenie `rater_id` i `rated_id` zapobiega wielokrotnemu ocenianiu tego samego użytkownika

## Relacje między tabelami:
- Użytkownik (`users`) może utworzyć wiele wydarzeń (`events`) poprzez pole `created_by`
- Użytkownik może zarejestrować się na wiele wydarzeń poprzez tabelę `registration`
- Użytkownik może dodać wiele komentarzy do wydarzeń poprzez tabelę `comments`
- Użytkownik może oznaczyć wiele wydarzeń jako ulubione poprzez tabelę `favorites`
- Użytkownicy mogą wzajemnie oceniać się poprzez tabelę `ratings`

Wszystkie powiązania między tabelami są zabezpieczone ograniczeniami integralności referencyjnej (foreign key constraints) z opcją CASCADE przy usuwaniu, co zapewnia automatyczne usunięcie powiązanych rekordów po usunięciu rekordu nadrzędnego. 