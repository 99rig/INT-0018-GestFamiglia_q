# API Services - Struttura Organizzata

Questa directory contiene l'API del frontend organizzata per domini, seguendo la struttura del backend Django.

## 📁 Struttura Directory

```
services/api/
├── client.js         # Client HTTP condiviso (axios configurato)
├── auth.js           # API Autenticazione e profilo utente
├── expenses.js       # API Gestione spese
├── categories.js     # API Categorie e sottocategorie
├── reports.js        # API Budget, piani di spesa, spese pianificate
├── users.js          # API Famiglie e inviti
├── index.js          # Export centralizzato
└── README.md         # Questa documentazione
```

## 🚀 Utilizzo

### Nuovo Approccio (Consigliato)
```javascript
import { API } from 'src/services/api'

// Autenticazione
await API.auth.login(email, password)
const user = await API.auth.getCurrentUser()

// Spese
const expenses = await API.expenses.getExpenses()
await API.expenses.createExpense(data)

// Report
const plan = await API.reports.getSpendingPlanDetails(id) // 🚀 Endpoint ottimizzato
const budgets = await API.reports.getBudgets()

// Famiglie
const families = await API.users.getFamilies()
```

### Approccio Legacy (Compatibilità)
```javascript
import { api } from 'src/services/api'

// Funziona come prima
await api.login(email, password)
const expenses = await api.getExpenses()
const plan = await api.getSpendingPlanDetails(id)
```

## 🏗️ Architettura

### 1. **client.js** - HTTP Client
- Configurazione axios centralizzata
- Interceptors per autenticazione
- Gestione refresh token automatico
- Timeout e header predefiniti

### 2. **auth.js** - Autenticazione
- Login/logout/registrazione
- Refresh token
- Profilo utente
- Gestione sessioni

### 3. **expenses.js** - Gestione Spese
- CRUD spese
- Upload file/allegati
- Filtri e ricerche

### 4. **categories.js** - Categorie
- CRUD categorie e sottocategorie
- Gestione icone e colori

### 5. **reports.js** - Report e Budget
- **Budget**: CRUD budget familiari
- **Spending Plans**: Piani di spesa con clonazione intelligente
- **Planned Expenses**: Spese pianificate e pagamenti
- **🚀 Endpoint ottimizzato**: `getSpendingPlanDetails()` - carica piano+spese in una chiamata

### 6. **users.js** - Utenti e Famiglie
- Gestione famiglie
- Inviti e adesioni
- Membri famiglia

## 🔄 Migrazione

Il codice esistente continua a funzionare senza modifiche. Per migrare gradualmente:

1. **Immediate**: Usa la nuova API per nuove feature
2. **Graduale**: Refactor dei file esistenti quando li modifichi
3. **Futuro**: Rimuovi il layer di compatibilità

## 🚨 Performance

Le API sono ottimizzate con:
- ✅ Query prefetch nel backend
- ✅ Endpoint combinati (es. `/details/`)
- ✅ Caching automatico interceptors
- ✅ Riduzione N+1 queries

## 📊 Benefici

1. **Organizzazione**: API raggruppate logicamente
2. **Manutenibilità**: Facile trovare e modificare endpoint
3. **Scalabilità**: Facile aggiungere nuovi domini
4. **Performance**: Endpoint ottimizzati per use case specifici
5. **Compatibilità**: Zero breaking changes per codice esistente