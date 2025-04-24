#!/bin/bash

# Skrypt testowy do weryfikacji poprawności wyświetlania danych w interfejsie użytkownika

echo "Rozpoczynam testy komponentów frontendowych..."

# Sprawdzenie, czy aplikacja jest uruchomiona
echo "Sprawdzanie, czy aplikacja jest uruchomiona..."
curl -s http://localhost:3000 > /dev/null
if [ $? -ne 0 ]; then
  echo "BŁĄD: Aplikacja nie jest dostępna pod adresem http://localhost:3000"
  echo "Upewnij się, że kontenery Docker są uruchomione."
  exit 1
fi
echo "OK: Aplikacja jest uruchomiona."

# Testowanie endpointów API
echo "Testowanie endpointów API..."

# Test endpointu dashboard
echo "Test endpointu dashboard..."
DASHBOARD_RESPONSE=$(curl -s http://localhost:5000/api/dashboard)
if [[ $DASHBOARD_RESPONSE == *"error"* ]]; then
  echo "BŁĄD: Endpoint dashboard zwrócił błąd."
  echo $DASHBOARD_RESPONSE
else
  echo "OK: Endpoint dashboard działa poprawnie."
fi

# Test endpointu purchases
echo "Test endpointu purchases..."
PURCHASES_RESPONSE=$(curl -s http://localhost:5000/api/purchases)
if [[ $PURCHASES_RESPONSE == *"error"* ]]; then
  echo "BŁĄD: Endpoint purchases zwrócił błąd."
  echo $PURCHASES_RESPONSE
else
  echo "OK: Endpoint purchases działa poprawnie."
fi

# Test endpointu payroll
echo "Test endpointu payroll..."
PAYROLL_RESPONSE=$(curl -s http://localhost:5000/api/payroll)
if [[ $PAYROLL_RESPONSE == *"error"* ]]; then
  echo "BŁĄD: Endpoint payroll zwrócił błąd."
  echo $PAYROLL_RESPONSE
else
  echo "OK: Endpoint payroll działa poprawnie."
fi

# Test endpointu sales
echo "Test endpointu sales..."
SALES_RESPONSE=$(curl -s http://localhost:5000/api/sales)
if [[ $SALES_RESPONSE == *"error"* ]]; then
  echo "BŁĄD: Endpoint sales zwrócił błąd."
  echo $SALES_RESPONSE
else
  echo "OK: Endpoint sales działa poprawnie."
fi

# Test endpointu dictionary
echo "Test endpointu dictionary..."
DICTIONARY_RESPONSE=$(curl -s http://localhost:5000/api/dictionary)
if [[ $DICTIONARY_RESPONSE == *"error"* ]]; then
  echo "BŁĄD: Endpoint dictionary zwrócił błąd."
  echo $DICTIONARY_RESPONSE
else
  echo "OK: Endpoint dictionary działa poprawnie."
fi

echo "Testy zakończone."
echo "Aby przeprowadzić pełne testy interfejsu użytkownika, należy ręcznie sprawdzić:"
echo "1. Czy dane są poprawnie wyświetlane w dashboardzie"
echo "2. Czy dane zakupów są poprawnie wyświetlane i filtrowane"
echo "3. Czy dane wypłat są poprawnie wyświetlane i filtrowane"
echo "4. Czy dane sprzedaży są poprawnie wyświetlane i filtrowane"
echo "5. Czy słowniki są poprawnie wyświetlane i można nimi zarządzać"
