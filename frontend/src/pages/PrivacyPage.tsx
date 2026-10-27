import { Link } from 'react-router';
import { usePageTitle } from '../usePageTitle';

const CONTACT_EMAIL = 'zeke0097@gmail.com';
const GITHUB_URL = 'https://github.com/MarcoCapasso';
const LAST_UPDATE = '27 ottobre 2026';

//L'informativa sul trattamento dei dati personali: pubblica, raggiungibile anche senza accedere
export function PrivacyPage() {
  usePageTitle('Informativa privacy');

  return (
    <main className="legal">
      <Link className="card-link" to="/">
        ← Torna all'app
      </Link>

      <h1 className="t-h1">Informativa privacy</h1>
      <p className="t-small">Ultimo aggiornamento: {LAST_UPDATE}</p>

      <section>
        <h2>Chi tratta i tuoi dati</h2>
        <p>
          Spiccioli è un progetto personale a scopo didattico, non commerciale. Il titolare del trattamento è
          Marco (su GitHub: <a href={GITHUB_URL}>MarcoCapasso</a>). Per qualsiasi richiesta sui tuoi dati scrivi a{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>Quali dati raccolgo</h2>
        <ul>
          <li>
            <b>Dati di accesso:</b> indirizzo email e, se accedi con Google, il nome che il tuo account Google
            condivide.
          </li>
          <li>
            <b>Dati che inserisci tu:</b> categorie, movimenti (importi, date, note), piani mensili e spese
            ricorrenti.
          </li>
          <li>
            <b>Dati tecnici:</b> i servizi che ospitano l'app possono registrare nei loro registri informazioni
            tecniche, come l'indirizzo IP, per far funzionare e proteggere il servizio.
          </li>
        </ul>
        <p>Non uso pubblicità, né strumenti di tracciamento o di analisi.</p>
      </section>

      <section>
        <h2>Perché li uso</h2>
        <p>
          Solo per fornirti il servizio che hai richiesto, cioè tenere traccia delle tue spese. La base giuridica è
          l'esecuzione del servizio. Non vendo né cedo i tuoi dati a nessuno, e non li uso per altri scopi.
        </p>
      </section>

      <section>
        <h2>Chi li tratta per mio conto</h2>
        <p>Per far funzionare l'app mi appoggio a questi fornitori:</p>
        <ul>
          <li>Supabase: database e accesso degli utenti</li>
          <li>Render: il server dell'app</li>
          <li>Vercel: il sito che vedi nel browser</li>
          <li>Google: solo se scegli di accedere con Google</li>
        </ul>
        <p>
          Alcuni di questi fornitori possono trattare i dati anche fuori dall'Unione Europea, con le garanzie previste
          dal GDPR.
        </p>
      </section>

      <section>
        <h2>Per quanto tempo li conservo</h2>
        <p>
          Finché mantieni l'account. Puoi eliminarlo in qualsiasi momento dall'app, con il pulsante «Elimina
          account»: i tuoi dati vengono cancellati. Oppure scrivimi.
        </p>
      </section>

      <section>
        <h2>Cookie e archiviazione nel browser</h2>
        <p>
          L'app usa lo spazio di archiviazione del browser solo per tenerti collegato e ricordare il tema scelto. Non
          uso cookie di profilazione né pubblicitari, quindi non serve alcun banner.
        </p>
      </section>

      <section>
        <h2>I tuoi diritti</h2>
        <p>
          Puoi chiedere di accedere ai tuoi dati, correggerli, cancellarli, limitarne l'uso, riceverli in un formato
          leggibile oppure opporti al trattamento. Scrivi a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          Hai anche il diritto di presentare reclamo al{' '}
          <a href="https://www.garanteprivacy.it">Garante per la protezione dei dati personali</a>.
        </p>
      </section>

      <section>
        <h2>Nota</h2>
        <p>Il servizio è offerto così com'è, senza garanzie di continuità. Può cambiare o chiudere.</p>
      </section>
    </main>
  );
}