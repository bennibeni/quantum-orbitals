# Atlante quantistico — componente React autonomo

Componente in italiano, senza librerie grafiche aggiuntive. React 18+; Canvas 2D proietta una nuvola tridimensionale ruotabile. Nessuna chiamata di rete a runtime.

## Integrazione

Copia `QuantumOrbitals.jsx`, `model.js` e `quantum-orbitals.css` nella tua applicazione:

```jsx
import QuantumOrbitals from './quantum-orbitals/QuantumOrbitals.jsx';

export default function App() {
  return <QuantumOrbitals />;
}
```

Props facoltative: `className` e `onSelectionChange({n,l,m,mode,element})`. Per una callback che modifica lo stato del genitore usa `useCallback` per mantenerne stabile l'identità. Il componente include `use client` per Next.js; importa il CSS secondo le regole del framework se necessario. Le classi CSS hanno prefisso `qo-`. Ogni istanza mantiene il proprio stato.

## Demo locale

```sh
npm install
npm run dev
```

`npm run build` crea la demo in `dist`; `npm test` verifica conteggi, eccezioni, nodi, orientamento e tutti i 140 stati ammessi.

## Interazioni

- n da 1 a 7, ℓ da 0 a n−1, m da −ℓ a ℓ; i valori dipendenti si aggiornano automaticamente.
- Modalità complessa: autostati Lz, fase cromatica; ±m hanno la stessa densità.
- Modalità reale: per m positivo cos(|m|φ), negativo sin(|m|φ), m=0 invariato. Sono combinazioni di ±|m|, non autostati Lz per m≠0.
- Mouse/tocco ruotano la nuvola; pulsanti equivalenti accessibili da tastiera e cursore zoom.
- Tavola di 118 elementi: evidenzia il sottoguscio occupato, inclusi elettroni interni; selezione elemento, configurazione cliccabile e caselle di Hund.
- La tavola scorre orizzontalmente sui piccoli schermi. Il bordo oro indica l'elemento selezionato, il fondo verde il sottoguscio occupato.

## Modello scientifico e limiti

La densità è generata da R(n,ℓ,r) × Y(ℓ,m,θ,φ) per Z=1. R usa polinomi di Laguerre associati; Y usa funzioni di Legendre associate. Il campionamento separato include il Jacobiano r² e usa u=cos θ. Costanti di normalizzazione si cancellano nelle tre distribuzioni normalizzate numericamente. CDF con 4096 intervalli, seme riproducibile e 10.000 punti. Dominio radiale troncato a 4n²+12n a₀; scala adattiva al quantile 99,5% della distribuzione numerica. Lo zoom può tagliare punti periferici. La nuvola è una proiezione della densità, non un'isosuperficie; i punti non sono elettroni individuali. Il colore rappresenta la fase (segno nella base reale); la fase globale è convenzionale.

Le configurazioni H–U seguono la tabella NIST citata, comprese le eccezioni al semplice Aufbau. Per Z>92 si usa esplicitamente un modello Aufbau semplificato: NON dati sperimentali o configurazioni fondamentali verificate, e può sbagliare l'occupazione di sottogusci. Questa limitazione appare nel componente. Per uso scientifico sostituire quei dati con un dataset revisionato. Per atomi pesanti anche l'assegnazione di una sola configurazione può essere approssimata.

La selezione dell'elemento non modifica la funzione idrogenoide Z=1. Non si simula la schermatura o l'interazione tra elettroni. Le caselle rappresentano una distribuzione didattica secondo Hund, non valori m misurati; il conteggio dei nodi riportato è quello radiale. Per g/h/i o sottogusci non occupati la tavola può non evidenziare alcun elemento.

Fonti:
- https://dlmf.nist.gov/18.39 — funzioni radiali coulombiane
- https://dlmf.nist.gov/14.30 — armoniche sferiche
- https://math.nist.gov/DFTdata/atomdata/configuration.html — configurazioni neutre H–U

La demo è indipendente: per integrare servono solo i tre file indicati sopra, non Vite o gli altri file della demo.

## Modalità fissata nel codice
In `QuantumOrbitals.jsx`, `USE_REAL_ORBITALS = true` mostra gli orbitali reali. Impostalo a `false` per gli autostati Lz. Non è presente un selettore di rappresentazione nell’interfaccia. La terza manopola si chiama “Variante dell’orbitale” in modalità reale.

## Sonificazione degli spettri
Per integrare la versione attuale copia anche `SpectrumPlayer.jsx` e `spectra.js`. Nel dettaglio di Idrogeno, Elio e Sodio sono disponibili selezioni di righe NIST di atomi neutri, con link alla fonte. Non sono spettri completi. Lunghezze d’onda in aria: conversione approssimata f_audio = 299792.458 / lambda_nm, equivalente a c/lambda × 10^-12. Ampiezze proporzionali alle intensità tabulate e normalizzate sulla somma; intensità dipendenti dalle condizioni della fonte. Colori indicativi. Non replica gli audio ACS.
Web Audio API, riproduzione esplicita di 5 secondi, volume regolabile, attacco/rilascio graduali. Arresto al cambio elemento, chiusura dettaglio, fine riproduzione o pagina nascosta. Nessuna richiesta di rete per dati o audio a runtime.

## Estensione NIST: soli atomi neutri
La prima selezione manuale è sostituita da `spectra-data.json` (necessario per integrare il componente): 99 tabelle Strong Lines consultate, 92 elementi con righe utilizzabili, 2828 righe. Importazione riproducibile con `node import-nist-spectra.mjs`; copie delle pagine in `nist-source`. Filtro rigoroso: specie esattamente `Simbolo I`, lunghezza d’onda in aria 380–750 nm, intensità numerica positiva. Conservati riferimento e indicazioni originali di intensità. Nessun dato ionico incluso. Assenza di righe utili o mancata copertura del Handbook non equivale ad assenza generale di dati NIST. La raccolta Strong Lines non è lo spettro completo; intensità relative dipendenti dalle condizioni delle fonti. Tutte le righe importate sono sonificate, senza cap nascosti.
