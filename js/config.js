/* ==========================================================================
   CONFIGURATION DU SITE — Boulangerie Murciano
   --------------------------------------------------------------------------
   Toutes les informations pratiques sont ici. Modifiez ce fichier, le site
   se met à jour tout seul (horaires, badge « Ouvert / Fermé », formulaire).

   ⚠ Pensez aussi à reporter les horaires dans le bloc JSON-LD (Schema.org)
     en haut de index.html, utilisé par Google.
   ========================================================================== */

window.SITE_CONFIG = {
  phone: "+33148874888",          // format international pour le lien tel:
  phoneDisplay: "01 48 87 48 88", // format affiché

  // Adresse e-mail qui reçoit les demandes de commande (si pas de Formspree).
  // Laisser vide tant que le client ne l'a pas communiquée.
  email: "",                      // À CONFIRMER

  // Formspree (https://formspree.io) : créez un formulaire et collez ici
  // l'URL d'envoi, ex. "https://formspree.io/f/abcdwxyz". Prioritaire sur l'e-mail.
  formspreeEndpoint: "",          // À CONFIGURER

  /* ------------------------------------------------------------------------
     HORAIRES — À CONFIRMER avec le gérant
     Jours : 0 = dimanche, 1 = lundi … 6 = samedi.
     Une journée sans créneau = fermé. Heures au format "HH:MM".
     ------------------------------------------------------------------------ */
  hours: {
    0: [["08:30", "19:00"]], // dimanche   — À CONFIRMER
    1: [["08:30", "19:00"]], // lundi      — À CONFIRMER
    2: [["08:30", "19:00"]], // mardi      — À CONFIRMER
    3: [["08:30", "19:00"]], // mercredi   — À CONFIRMER
    4: [["08:30", "19:00"]], // jeudi      — À CONFIRMER
    5: [["08:30", "15:00"]], // vendredi   — fermeture avancée avant Chabbat, À CONFIRMER
    6: []                    // samedi     — fermé (Chabbat)
  }
};
