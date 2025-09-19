<template>
  <q-page class="mcf-page-container-fullwidth">
    <div class="help-page-content">

      <!-- Header -->
      <div class="help-header">
        <div class="help-title">Aiuto e Documentazione</div>
        <div class="help-subtitle">
          Tutto quello che devi sapere per utilizzare al meglio l'app di gestione spese
        </div>
      </div>

      <!-- FAQ Sections -->
      <div class="faq-sections">

        <!-- Primi Passi -->
        <q-expansion-item
          icon="rocket_launch"
          label="Primi Passi"
          caption="Come iniziare a usare l'app"
          class="faq-section"
          header-class="faq-header"
        >
          <div class="faq-content">
            <q-expansion-item
              icon="person_add"
              label="Come registro un nuovo account?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Per registrarti:</p>
                <ol>
                  <li>Vai alla pagina di login</li>
                  <li>Clicca su "Registrati"</li>
                  <li>Inserisci nome, email e password</li>
                  <li>Seleziona il tuo ruolo in famiglia (Padre, Madre, Figlio, Altro)</li>
                  <li>Conferma la registrazione</li>
                </ol>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="family_restroom"
              label="Come aggiungo altri membri della famiglia?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Ogni membro della famiglia deve registrarsi autonomamente con il proprio account. Non è possibile aggiungere altri utenti dal proprio profilo per motivi di sicurezza.</p>
                <p>Una volta registrati, potrete condividere le spese tra voi.</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="dashboard"
              label="Cosa vedo nella dashboard principale?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>La dashboard ti mostra:</p>
                <ul>
                  <li>Riepilogo spese del mese corrente</li>
                  <li>Ultime spese inserite</li>
                  <li>Quote in scadenza</li>
                  <li>Budget mensile e quanto hai speso</li>
                  <li>Grafici delle categorie più utilizzate</li>
                </ul>
              </div>
            </q-expansion-item>
          </div>
        </q-expansion-item>

        <!-- Gestione Spese -->
        <q-expansion-item
          icon="receipt_long"
          label="Gestione Spese"
          caption="Come inserire e gestire le tue spese"
          class="faq-section"
          header-class="faq-header"
        >
          <div class="faq-content">
            <q-expansion-item
              icon="add_circle"
              label="Come inserisco una nuova spesa?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Per aggiungere una spesa:</p>
                <ol>
                  <li>Vai alla sezione "Spese"</li>
                  <li>Clicca sul pulsante "Nuova Spesa"</li>
                  <li>Inserisci la descrizione (es. "Spesa al supermercato")</li>
                  <li>Scegli l'importo</li>
                  <li>Seleziona la categoria</li>
                  <li>Scegli la data (di default è oggi)</li>
                  <li>Se vuoi, aggiungi una nota</li>
                  <li>Salva la spesa</li>
                </ol>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="group"
              label="Come condivido una spesa con altri?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Durante la creazione della spesa:</p>
                <ol>
                  <li>Nella sezione "Condividi con", seleziona i membri della famiglia</li>
                  <li>L'importo verrà diviso automaticamente tra tutti i selezionati</li>
                  <li>Ogni persona vedrà la sua quota nella sezione "Le mie quote"</li>
                </ol>
                <p><strong>Esempio:</strong> Spesa di 100€ condivisa tra 4 persone = 25€ a testa</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="schedule"
              label="Come funzionano le spese ricorrenti?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Le spese ricorrenti sono perfette per bollette, affitti, abbonamenti:</p>
                <ol>
                  <li>Crea una "Spesa Ricorrente"</li>
                  <li>Imposta la frequenza (settimanale, mensile, annuale)</li>
                  <li>L'app creerà automaticamente le spese alle date stabilite</li>
                  <li>Puoi modificare o interrompere la ricorrenza in qualsiasi momento</li>
                </ol>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="payments"
              label="Come funziona il pagamento a rate?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Per spese grandi che vuoi pagare a rate:</p>
                <ol>
                  <li>Inserisci la spesa normalmente</li>
                  <li>Clicca su "Crea Quote" nella spesa</li>
                  <li>Scegli numero di rate e date di scadenza</li>
                  <li>Segna come pagate man mano che paghi</li>
                </ol>
                <p>L'app ti ricorderà le rate in scadenza nella dashboard.</p>
              </div>
            </q-expansion-item>
          </div>
        </q-expansion-item>

        <!-- Categorie -->
        <q-expansion-item
          icon="category"
          label="Categorie e Budget"
          caption="Come organizzare le spese per tipologia"
          class="faq-section"
          header-class="faq-header"
        >
          <div class="faq-content">
            <q-expansion-item
              icon="list_alt"
              label="Che categorie ci sono disponibili?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>L'app include categorie predefinite per famiglie italiane:</p>
                <div class="categories-list">
                  <div class="category-group">
                    <strong>Categorie Necessarie:</strong>
                    <ul>
                      <li>Casa e Abitazione</li>
                      <li>Alimentari e Bevande</li>
                      <li>Trasporti</li>
                      <li>Salute e Benessere</li>
                      <li>Assicurazioni</li>
                      <li>Tasse e Imposte</li>
                      <li>Educazione e Formazione</li>
                    </ul>
                  </div>
                  <div class="category-group">
                    <strong>Categorie Extra:</strong>
                    <ul>
                      <li>Tempo Libero</li>
                      <li>Viaggi e Vacanze</li>
                      <li>Abbigliamento</li>
                      <li>Elettronica e Tecnologia</li>
                      <li>Casa Extra</li>
                      <li>Sport e Fitness</li>
                      <li>Regali e Eventi</li>
                      <li>Animali Domestici</li>
                    </ul>
                  </div>
                </div>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="account_balance_wallet"
              label="Come imposto un budget mensile?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Per gestire il budget:</p>
                <ol>
                  <li>Vai alla sezione "Budget"</li>
                  <li>Clicca "Nuovo Budget"</li>
                  <li>Imposta l'importo totale mensile</li>
                  <li>Distribuisci l'importo tra le varie categorie</li>
                  <li>L'app ti mostrerà quanto hai speso vs budget</li>
                </ol>
                <p>Il budget viene rinnovato automaticamente ogni mese.</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="trending_up"
              label="Come vedo se sto sforando il budget?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>L'app ti avvisa in diversi modi:</p>
                <ul>
                  <li>Barre di progresso colorate nella dashboard</li>
                  <li>Notifiche quando superi il 80% del budget</li>
                  <li>Colori rossi per categorie in sovrabudget</li>
                  <li>Report mensili dettagliati</li>
                </ul>
              </div>
            </q-expansion-item>
          </div>
        </q-expansion-item>

        <!-- Piani di Spesa -->
        <q-expansion-item
          icon="event_note"
          label="Piani di Spesa"
          caption="Pianifica spese future per eventi o progetti"
          class="faq-section"
          header-class="faq-header"
        >
          <div class="faq-content">
            <q-expansion-item
              icon="add_task"
              label="Cosa sono i piani di spesa?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>I piani di spesa ti aiutano a organizzare spese future per:</p>
                <ul>
                  <li>Vacanze (hotel, voli, ristoranti)</li>
                  <li>Eventi (matrimoni, feste, compleanni)</li>
                  <li>Progetti casa (ristrutturazioni, arredamento)</li>
                  <li>Spese stagionali (back to school, Natale)</li>
                </ul>
                <p>Puoi vedere il progresso e tenere tutto sotto controllo.</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="create"
              label="Come creo un piano di spesa?"
              class="faq-item"
            >
              <div class="faq-answer">
                <ol>
                  <li>Vai alla sezione "Piani di Spesa"</li>
                  <li>Clicca "Nuovo Piano di Spesa"</li>
                  <li>Dai un nome al piano (es. "Vacanze Estate 2025")</li>
                  <li>Scegli il tipo (Mensile, Stagionale, Evento, etc.)</li>
                  <li>Imposta le date di inizio e fine</li>
                  <li>Aggiungi una descrizione opzionale</li>
                </ol>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="playlist_add"
              label="Come aggiungo spese a un piano?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Ci sono due modi:</p>
                <ol>
                  <li><strong>Dalla lista piani:</strong> Clicca sul piano e aggiungi spese pianificate</li>
                  <li><strong>Durante l'inserimento spesa:</strong> Seleziona il piano nel campo apposito</li>
                </ol>
                <p>Le spese pianificate sono stime - quando le spendi realmente, verranno marcate come completate.</p>
              </div>
            </q-expansion-item>
          </div>
        </q-expansion-item>

        <!-- Spese Ricorrenti -->
        <q-expansion-item
          icon="repeat"
          label="Spese Ricorrenti"
          caption="Gestisci spese a rate con controllo visivo dello stato"
          class="faq-section"
          header-class="faq-header"
        >
          <div class="faq-content">
            <q-expansion-item
              icon="schedule"
              label="Cosa sono le spese ricorrenti nei piani?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Le spese ricorrenti nei piani di spesa ti permettono di pianificare spese da pagare a rate:</p>
                <ul>
                  <li><strong>Acquisti a rate:</strong> Elettrodomestici, mobili, tecnologia</li>
                  <li><strong>Pagamenti dilazionati:</strong> Corsi, iscrizioni, abbonamenti</li>
                  <li><strong>Progetti a fasi:</strong> Ristrutturazione, matrimonio, vacanze</li>
                  <li><strong>Spese stagionali:</strong> Tasse, assicurazioni, rate annuali</li>
                </ul>
                <p>Ogni rata ha una data di scadenza e puoi monitorare il progresso dei pagamenti.</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="add_task"
              label="Come creo una spesa ricorrente?"
              class="faq-item"
            >
              <div class="faq-answer">
                <ol>
                  <li>Vai al piano di spesa desiderato</li>
                  <li>Clicca "Nuova Spesa Pianificata"</li>
                  <li>Compila descrizione, importo, categoria e data scadenza</li>
                  <li>Attiva l'opzione "Spesa ricorrente"</li>
                  <li>Scegli il numero totale di rate (da 2 a 120)</li>
                  <li>Seleziona la frequenza (mensile, bimestrale, trimestrale)</li>
                  <li>Salva la spesa - sarà creata solo la prima rata</li>
                </ol>
                <p><strong>Nota:</strong> Inizialmente viene creata solo la prima rata, poi generi le altre quando necessario.</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="playlist_add"
              label="Come genero le rate successive?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Dopo aver creato la prima rata, puoi generare tutte le altre:</p>
                <ol>
                  <li>Trova la spesa ricorrente nella lista (ha il badge "RICORRENTE 1/X")</li>
                  <li>Clicca sull'icona arancione "🔄" per generare le rate</li>
                  <li>L'app creerà automaticamente tutte le rate rimanenti</li>
                  <li>Ogni rata avrà la data corretta basata sulla frequenza scelta</li>
                </ol>
                <p><strong>Desktop:</strong> L'icona 🔄 appare dopo i pulsanti principali</p>
                <p><strong>Mobile:</strong> L'icona 🔄 appare tra i pulsanti delle azioni</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="check_box"
              label="Come funzionano gli indicatori visivi?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Le spese ricorrenti hanno indicatori visivi per controllare lo stato a colpo d'occhio:</p>
                <div class="visual-indicators">
                  <div class="indicator-item">
                    <strong>☑️ Checkbox Verde:</strong> Rate già pagate/completate
                  </div>
                  <div class="indicator-item">
                    <strong>☐ Checkbox Blu:</strong> Rata corrente (in scadenza ora)
                  </div>
                  <div class="indicator-item">
                    <strong>☐ Checkbox Grigia:</strong> Rate future ancora da pagare
                  </div>
                </div>
                <p><strong>Desktop:</strong> Le checkbox appaiono in linea dopo il pulsante chevron</p>
                <p><strong>Mobile:</strong> Tocca l'icona chevron per espandere e vedere i dettagli</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="expand_more"
              label="Come vedo i dettagli delle rate?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Puoi vedere tutti i dettagli delle rate in una vista espandibile:</p>
                <ol>
                  <li>Clicca sul pulsante chevron (▽) accanto alle checkbox</li>
                  <li>Si aprirà una sezione con tutti i dettagli:</li>
                  <ul>
                    <li>Numero rata (1, 2, 3...)</li>
                    <li>Stato (Pagata, Da pagare, Parziale)</li>
                    <li>Importo di ogni rata</li>
                    <li>Checkbox colorate per stato visivo</li>
                  </ul>
                  <li>Clicca di nuovo il chevron per nascondere i dettagli</li>
                </ol>
                <p>Questa vista è disponibile sia su desktop che mobile con lo stesso layout.</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="edit"
              label="Posso modificare una spesa ricorrente?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Sì! Nella modale di modifica puoi:</p>
                <ul>
                  <li><strong>Attivare la ricorrenza:</strong> Su spese normali già create</li>
                  <li><strong>Cambiare numero rate:</strong> Aumentare o diminuire le rate totali</li>
                  <li><strong>Modificare frequenza:</strong> Da mensile a trimestrale, etc.</li>
                  <li><strong>Disattivare ricorrenza:</strong> Tornare a spesa singola</li>
                </ul>
                <p><strong>Attenzione:</strong> Se hai già generato le rate, le modifiche influenzeranno solo la rata corrente. Per cambi importanti, considera di creare una nuova spesa ricorrente.</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="payment"
              label="Come marco una rata come pagata?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Per segnare il pagamento di una rata:</p>
                <ol>
                  <li>Clicca su "Aggiungi Pagamento" sulla rata corrente</li>
                  <li>Inserisci l'importo pagato e la data</li>
                  <li>Conferma il pagamento</li>
                  <li>La checkbox diventerà verde automaticamente</li>
                  <li>La prossima rata diventerà blu (corrente)</li>
                </ol>
                <p>Il sistema aggiorna automaticamente gli indicatori visivi e il progresso complessivo del piano.</p>
              </div>
            </q-expansion-item>
          </div>
        </q-expansion-item>

        <!-- Report e Analisi -->
        <q-expansion-item
          icon="analytics"
          label="Report e Analisi"
          caption="Monitora le tue finanze con grafici e statistiche"
          class="faq-section"
          header-class="faq-header"
        >
          <div class="faq-content">
            <q-expansion-item
              icon="bar_chart"
              label="Che tipo di report posso vedere?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>L'app offre diversi tipi di report:</p>
                <ul>
                  <li><strong>Report Mensile:</strong> Spese totali del mese per categoria</li>
                  <li><strong>Report Annuale:</strong> Andamento delle spese durante l'anno</li>
                  <li><strong>Confronto Budget:</strong> Quanto hai speso vs quanto avevi pianificato</li>
                  <li><strong>Analisi per Utente:</strong> Chi spende di più in famiglia</li>
                  <li><strong>Trend Categoria:</strong> Quali categorie costano di più</li>
                </ul>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="calendar_month"
              label="Come cambio il periodo di analisi?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Nella sezione Report puoi:</p>
                <ul>
                  <li>Selezionare mese e anno specifici</li>
                  <li>Confrontare più mesi</li>
                  <li>Vedere l'andamento annuale</li>
                  <li>Filtrare per categorie specifiche</li>
                  <li>Filtrare per membri della famiglia</li>
                </ul>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="download"
              label="Posso esportare i dati?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Sì! Puoi esportare:</p>
                <ul>
                  <li>Lista spese in formato CSV</li>
                  <li>Report mensili in PDF</li>
                  <li>Grafici e statistiche come immagini</li>
                </ul>
                <p>Utile per condividere con commercialista o per backup personali.</p>
              </div>
            </q-expansion-item>
          </div>
        </q-expansion-item>

        <!-- Impostazioni e Sicurezza -->
        <q-expansion-item
          icon="settings"
          label="Impostazioni e Sicurezza"
          caption="Personalizza l'app e proteggi i tuoi dati"
          class="faq-section"
          header-class="faq-header"
        >
          <div class="faq-content">
            <q-expansion-item
              icon="lock"
              label="I miei dati sono sicuri?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>La sicurezza è una priorità:</p>
                <ul>
                  <li>Tutti i dati sono criptati</li>
                  <li>Password protette con hash sicuri</li>
                  <li>Sessioni con timeout automatico</li>
                  <li>Backup automatici del database</li>
                  <li>Accesso protetto tramite autenticazione</li>
                </ul>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="person"
              label="Come cambio la password?"
              class="faq-item"
            >
              <div class="faq-answer">
                <ol>
                  <li>Vai al tuo profilo utente</li>
                  <li>Clicca "Cambia Password"</li>
                  <li>Inserisci la password attuale</li>
                  <li>Inserisci la nuova password (min 8 caratteri)</li>
                  <li>Conferma la modifica</li>
                </ol>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="notifications"
              label="Come gestisco le notifiche?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Nelle impostazioni puoi configurare:</p>
                <ul>
                  <li>Notifiche per quote in scadenza</li>
                  <li>Avvisi di sforamento budget</li>
                  <li>Reminder per spese ricorrenti</li>
                  <li>Riepiloghi mensili automatici</li>
                </ul>
                <p>Puoi attivare/disattivare ogni tipo di notifica.</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="smartphone"
              label="Come installo l'app sul telefono?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p><strong>Su iPhone:</strong></p>
                <ol>
                  <li>Apri l'app con Safari</li>
                  <li>Tocca il pulsante di condivisione</li>
                  <li>Seleziona "Aggiungi alla schermata Home"</li>
                  <li>Conferma l'installazione</li>
                </ol>
                <p><strong>Su Android:</strong></p>
                <ol>
                  <li>Apri l'app con Chrome</li>
                  <li>Tocca il menu (3 puntini)</li>
                  <li>Seleziona "Installa app"</li>
                  <li>Conferma l'installazione</li>
                </ol>
              </div>
            </q-expansion-item>
          </div>
        </q-expansion-item>

        <!-- Risoluzione Problemi -->
        <q-expansion-item
          icon="help_outline"
          label="Risoluzione Problemi"
          caption="Soluzioni ai problemi più comuni"
          class="faq-section"
          header-class="faq-header"
        >
          <div class="faq-content">
            <q-expansion-item
              icon="sync_problem"
              label="L'app non si sincronizza"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Prova questi passaggi:</p>
                <ol>
                  <li>Controlla la connessione internet</li>
                  <li>Chiudi e riapri l'app</li>
                  <li>Fai logout e login nuovamente</li>
                  <li>Aggiorna il browser/app</li>
                </ol>
                <p>Se il problema persiste, contatta il supporto.</p>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="error_outline"
              label="Vedo un errore durante il salvataggio"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Gli errori più comuni:</p>
                <ul>
                  <li><strong>Campi obbligatori:</strong> Controlla di aver compilato tutti i campi richiesti</li>
                  <li><strong>Importo non valido:</strong> Usa il punto per i decimali (es. 10.50)</li>
                  <li><strong>Data non valida:</strong> Controlla che la data sia nel formato corretto</li>
                  <li><strong>Sessione scaduta:</strong> Fai login nuovamente</li>
                </ul>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="refresh"
              label="Come aggiorno l'app?"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>L'app si aggiorna automaticamente! Quando disponibili:</p>
                <ul>
                  <li>Ricarica la pagina nel browser</li>
                  <li>O chiudi e riapri l'app installata</li>
                  <li>Vedrai una notifica per le nuove funzionalità</li>
                </ul>
              </div>
            </q-expansion-item>

            <q-expansion-item
              icon="restore"
              label="Ho cancellato una spesa per sbaglio"
              class="faq-item"
            >
              <div class="faq-answer">
                <p>Se hai appena cancellato la spesa:</p>
                <ol>
                  <li>Controlla se c'è un pulsante "Annulla" nella notifica</li>
                  <li>Altrimenti, dovrai ricreare la spesa manualmente</li>
                  <li>Per il futuro, l'app chiede sempre conferma prima di cancellare</li>
                </ol>
                <p><strong>Consiglio:</strong> Invece di cancellare, puoi modificare una spesa esistente.</p>
              </div>
            </q-expansion-item>
          </div>
        </q-expansion-item>

      </div>

      <!-- Contatti -->
      <div class="help-footer">
        <div class="help-contact">
          <div class="contact-title">Hai ancora bisogno di aiuto?</div>
          <div class="contact-text">
            Questa documentazione non ha risposto alla tua domanda?
            Contatta il supporto tecnico per assistenza personalizzata.
          </div>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
// No script logic needed for static FAQ page
</script>

<style lang="scss" scoped>
// Nessun override necessario - gestito nel CSS globale

.help-page-content {
  width: 100%;
  margin: 0;
  padding: 16px 8px;

  @media (min-width: 768px) {
    padding: 24px 16px;
  }
}

.help-header {
  text-align: center;
  margin-bottom: 40px;
}

.help-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  margin-bottom: 12px;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 40px;
  }
}

.help-subtitle {
  font-size: 18px;
  color: var(--mcf-text-secondary);
  line-height: 1.4;
  max-width: 600px;
  margin: 0 auto;

  @media (min-width: 768px) {
    font-size: 20px;
  }
}

.faq-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 48px;
}

:deep(.faq-section) {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--mcf-shadow-sm);

  .faq-header {
    padding: 20px 24px;
    background: var(--mcf-bg-surface);

    .q-expansion-item__label {
      font-size: 18px;
      font-weight: 600;
      color: var(--mcf-text-primary);
    }

    .q-expansion-item__caption {
      font-size: 14px;
      color: var(--mcf-text-secondary);
      margin-top: 4px;
    }

    .q-icon {
      color: var(--mcf-primary);
      font-size: 24px;
    }
  }

  &.q-expansion-item--expanded .faq-header {
    border-bottom: 1px solid var(--mcf-border-light);
  }
}

.faq-content {
  padding: 0;
}

:deep(.faq-item) {
  border-bottom: 1px solid var(--mcf-border-light);

  &:last-child {
    border-bottom: none;
  }

  .q-expansion-item__label {
    font-size: 16px;
    font-weight: 500;
    color: var(--mcf-text-primary);
  }

  .q-item {
    padding: 16px 24px;
  }

  .q-icon {
    color: var(--mcf-text-muted);
    font-size: 20px;
  }

  &.q-expansion-item--expanded {
    .q-icon {
      color: var(--mcf-primary);
    }
  }
}

.faq-answer {
  padding: 20px 24px;
  background: var(--mcf-bg-secondary);

  p {
    margin: 0 0 16px 0;
    line-height: 1.6;
    color: var(--mcf-text-primary);

    &:last-child {
      margin-bottom: 0;
    }
  }

  ol, ul {
    margin: 16px 0;
    padding-left: 24px;

    li {
      margin-bottom: 8px;
      line-height: 1.5;
      color: var(--mcf-text-primary);
    }
  }

  strong {
    color: var(--mcf-primary);
    font-weight: 600;
  }
}

.categories-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 16px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.category-group {
  strong {
    display: block;
    margin-bottom: 8px;
    color: var(--mcf-primary);
  }

  ul {
    margin: 0;

    li {
      margin-bottom: 4px;
      font-size: 14px;
    }
  }
}

.help-footer {
  text-align: center;
  padding: 32px 24px;
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 12px;
  box-shadow: var(--mcf-shadow-sm);
}

.help-contact {
  max-width: 500px;
  margin: 0 auto;
}

.contact-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin-bottom: 12px;
}

.contact-text {
  font-size: 16px;
  color: var(--mcf-text-secondary);
  line-height: 1.5;
}

// Responsive improvements
@media (max-width: 600px) {
  .help-page-content {
    padding: 16px 12px;
  }

  :deep(.faq-section .faq-header) {
    padding: 16px 20px;

    .q-expansion-item__label {
      font-size: 16px;
    }

    .q-expansion-item__caption {
      font-size: 13px;
    }
  }

  :deep(.faq-item .q-item) {
    padding: 12px 20px;
  }

  .faq-answer {
    padding: 16px 20px;
  }

  .help-footer {
    padding: 24px 20px;
  }
}
</style>