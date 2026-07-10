/* ============================================================
   CONFIGURAZIONE SPAZI PUBBLICITARI
   ============================================================
   Questo è l'UNICO file che devi toccare per gestire le due
   inserzioni. Non serve sapere programmare.

   Per ogni spazio compila:
   - imageUrl : il link all'immagine. Puoi usare:
                 a) un URL esterno completo, es:
                    "https://tuo-sponsor.com/banner.jpg"
                 b) un file caricato in questa stessa cartella,
                    dentro ads/, es: "ads/banner-gennaio.jpg"
   - link     : dove va il visitatore se clicca sull'immagine
                (il sito dello sponsor). Es: "https://sponsor.com"
   - alt      : testo alternativo (accessibilità), es: nome sponsor

   Per SPEGNERE uno spazio (nasconderlo del tutto ai visitatori):
   lascia imageUrl uguale a "" (stringa vuota).

   DEBUG_ADS = true mostra un riquadro tratteggiato con le misure
   corrette al posto degli spazi vuoti, utile solo mentre lavori
   in locale. Rimettilo a false prima di pubblicare online.
   ============================================================ */

const DEBUG_ADS = false;

const ADS = {
  // Banner in testa alla pagina — formato consigliato 728×90 (desktop),
  // si adatta comunque alla larghezza dello schermo.
  banner: {
    imageUrl: "",   // es: "ads/banner.jpg"
    link: "",       // es: "https://sponsor.com"
    alt: "Sponsor"
  },

  // Riquadro quadrato dentro la pagina — formato consigliato 300×250.
  square: {
    imageUrl: "",   // es: "ads/quadrato.jpg"
    link: "",       // es: "https://sponsor.com"
    alt: "Sponsor"
  }
};
