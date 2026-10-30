# LT COACH — Football Performance

Site statique de la marque **LT COACH — Football Performance** : trois parcours
(LT Académie, LT Individuel, LT Performance), trois formulaires de qualification,
aucun paiement en ligne.

## Lancer le site

Aucun build, aucune dépendance :

```bash
python3 -m http.server 3000
```

Puis ouvrir <http://localhost:3000>.

## Pages

| Fichier | Rôle |
| --- | --- |
| `index.html` | Accueil : promesse, trois parcours, six qualités, méthode, coach, FAQ |
| `academie.html` | LT Académie 8–17 ans : bénéfices, séance type, groupes, tarifs petit groupe, formulaire |
| `individuel.html` | LT Individuel : positionnement, modalités, tarifs (65 € / 240 €), formulaire de demande |
| `performance.html` | LT Performance : huit prestations, déplacements, formulaire, aucun tarif (proposition après appel) |
| `a-propos.html` | Parcours, approche terrain, valeurs |
| `mentions-legales.html` | Informations légales |
| `politique-confidentialite.html` | RGPD, mineurs, cookies, formulaires |
| `style.css` | Design system complet : tokens, composants, couche « direction artistique », responsive |
| `script.js` | Navigation, animations, formulaires, consentement et mesure d'audience |

## Images

Tout est à la racine du projet, sans sous-dossier, et le dossier ne contient que
ce que le site charge : **37 fichiers pour 4,0 Mo**, le plus gros faisant 390 Ko.

Les photos d'origine (`a1.PNG` … `a14.PNG`, `coach.PNG`, `coach2.PNG`,
`coaching.JPG`, `logo1.PNG`, `logo2.PNG`, 58 Mo au total) ont été sorties du
dossier et placées dans la **Corbeille** du Mac : elles ne sont utilisées par
aucune page et faisaient échouer l'envoi vers GitHub (limite de l'interface web).
Elles restent récupérables depuis la Corbeille si besoin.

Les **versions web** `web-*.jpg` / `web-*.png` sont les seules à publier : photos
redimensionnées et compressées (3,2 Mo pour l'ensemble), logos détourés sur fond
transparent. Le fichier `.gitignore` empêche de réintroduire les originaux par
erreur.

| Fichier | Usage |
| --- | --- |
| `web-coach.jpg` | Portrait du coach : hero de l'accueil, page « Le coach », image de partage (`og:image`) |
| `web-coach2.jpg` | Coach avec un bilan hebdomadaire : section « Le coach » de l'accueil |
| `web-coaching.jpg` | Séance sur le terrain : page Académie, section « Une séance type » |
| `web-a1.jpg` … `web-a14.jpg` | Retours de joueurs : galerie de la page Individuel (`#references`) |
| `logo-mark.png` | Emblème détouré, dans l'en-tête et le pied de page |
| `web-logo1.png` | Logo complet « Vitesse · Explosivité · Performance », signature de la page coach |
| `web-logo2.png` | Logo « Trainer », sceau des pages Individuel et Performance |

Pour remplacer une photo : déposer le nouvel original à la racine, puis
régénérer la version web avec, par exemple :

```bash
ffmpeg -i nouvelle.PNG -vf "scale=760:950:flags=lanczos" -q:v 4 web-nouvelle.jpg
```

Les visuels d'entraînement et les retours de joueurs sont publiés sous réserve
des autorisations : accord du joueur et, pour les mineurs, de sa famille.

## Périmètre respecté

- Trois parcours distincts, trois pages, trois formulaires : LT Académie,
  LT Individuel, LT Performance.
- Tarifs académie affichés : 30 € la séance, 100 €/mois (1×/semaine),
  180 €/mois (2×/semaine), pour des **séances en petit groupe**.
- Tarifs individuels affichés : 65 € la séance, 240 €/mois (1×/semaine).
- **Aucun tarif sur LT Performance** : proposition personnalisée après l'appel.
  Aucun pack, aucun paiement, aucun panier.
- Aucune réservation ferme : mention explicite dans chaque formulaire.
- Consentement obligatoire, politique de confidentialité et mentions légales.
- Envoi direct de chaque formulaire par e-mail via FormSubmit, avec copie du
  récapitulatif affichée en secours si l'envoi échoue.
- Tracking prêt à l'emploi (clics CTA, formulaires, pages, source), conditionné
  au consentement.
- Mobile first : navigation en tiroir, CTA unique fixe en bas d'écran, boutons et
  champs ≥ 44–48 px, formulaires en une colonne sur petit écran.
- Accessibilité : lien d'évitement, focus visible, labels associés, erreurs
  reliées aux champs, contrastes vérifiés, `prefers-reduced-motion` respecté.

## Direction artistique et animations

Le site est construit comme une feuille de match : fond encre et papier, doré
comme lumière de stade, grandes capitales condensées, étiquettes en monospace.
Tout est fait sans dépendance ni bibliothèque d'animation.

- **Hero** : lignes de terrain SVG qui se dessinent au chargement, portrait
  révélé par un volet, titre en cascade, aperçu doré et indicateur de défilement.
- **Bandeau défilant** sous le hero : les six qualités travaillées, en boucle
  lente (pause au survol, statique si mouvement réduit).
- **Révélations au scroll** : les blocs apparaissent en cascade (décalage
  automatique entre voisins), via `IntersectionObserver`.
- **Micro-interactions** : cartes qui se soulèvent, halo doré qui suit le curseur
  sur les parcours, numéros en filigrane, liens et flèches qui glissent.
- **Repères** : fil de progression doré en haut, rail de sections à droite sur
  grand écran, schéma de séance qui se trace.
- **Transitions de page** natives (`@view-transition`) entre les pages.
- Tout le mouvement est désactivé sous `prefers-reduced-motion`.

## Identité et coordonnées

Le site publie **Lucien TALON (Lucho)**, 07 83 63 66 91,
ltcoach.contact@gmail.com et @lt_coach_foot : dans le pied de page, le menu
mobile, la page coach, les formulaires et les pages légales.
`mentions-legales.html` et `politique-confidentialite.html` désignent LT COACH
comme éditeur et responsable de traitement.

## Envoi des formulaires (FormSubmit)

Les trois formulaires sont expédiés depuis le navigateur à
[FormSubmit](https://formsubmit.co/), service prévu pour les sites statiques :
aucun serveur, aucune base de données, aucun compte à créer pour le visiteur.
La demande arrive dans la boîte **ltcoach.contact@gmail.com** avec toutes les
réponses, la date et l'heure, le parcours et la page d'origine. L'adresse de la
personne qui écrit est placée en `Reply-To` : il suffit de répondre à l'e-mail.

L'adresse de réception est centralisée dans `script.js`
(`FORM_ENDPOINT.recipient`), jamais répétée dans les pages.

### Première mise en service — une seule fois

1. Ouvrir le site, remplir un formulaire et valider.
2. FormSubmit adresse alors un e-mail **« Activate Form »** à
   ltcoach.contact@gmail.com : cliquer sur le lien qu'il contient.
3. Renvoyer un formulaire : la demande arrive normalement dans la boîte.
4. Facultatif : l'e-mail d'activation fournit aussi un **alias** (suite de
   lettres et de chiffres). Remplacer `recipient` par cet alias évite
   d'exposer l'adresse en clair dans le code public.

Tant que l'activation n'est pas faite, FormSubmit répond « This form needs
Activation » : le site affiche le message d'échec et les coordonnées directes,
sans jamais faire croire à un envoi réussi.

## Ce qui n'est volontairement pas inclus

Conformément à la demande :

- **Aucune base de données** et aucun stockage serveur des demandes : elles
  n'existent que dans la boîte e-mail du coach.
- Aucun back-office, aucune réservation, aucun paiement.

Les formulaires valident les champs côté navigateur, envoient la demande à
FormSubmit, puis n'affichent la confirmation qu'une fois la réponse positive du
service. En cas d'échec (réseau coupé, service indisponible, formulaire non
activé), les réponses restent dans le formulaire, un message explique quoi faire
et le récapitulatif peut être copié pour être envoyé à la main. Le bouton est
désactivé pendant l'envoi : aucune demande ne peut partir deux fois.

## À compléter / valider avant mise en ligne

1. ~~Coordonnées~~ — fait : Lucien TALON (Lucho), 07 83 63 66 91,
   ltcoach.contact@gmail.com et @lt_coach_foot sont affichés sur les pages,
   dans les formulaires et dans les mentions légales.
2. **Mentions légales** : il ne reste que le **numéro SIRET** et l'adresse
   professionnelle à ajouter. L'hébergeur est renseigné (GitHub Pages). La
   durée de conservation de douze mois indiquée dans la politique de
   confidentialité reste une valeur par défaut à valider.
3. **FormSubmit** : activer le formulaire depuis l'e-mail « Activate Form »
   reçu à la première demande (voir la section ci-dessus).
4. **Académie** : jours, horaires, lieux et groupes définitifs ; conditions de
   vacances scolaires, mois à cinq semaines, absences, rattrapages, résiliation
   et paiement (encore non publiées, un renvoi vers l'échange est affiché).
   Les tarifs académie (30 € la séance, 100 € et 180 € par mois) sont bien
   presentés comme des **séances en petit groupe** ; l'individuel est à 65 € la
   séance et 240 € par mois (section `#tarifs` de `individuel.html`).
4. ~~Diplômes~~ — fait : BPJEPS, diplôme de préparateur physique et 10 ans
   d'expérience (page coach et accueil). Reste à valider la formulation de la
   bio si le coach souhaite la détailler.
5. **Preuves** : les quatorze retours de joueurs sont en ligne dans la galerie
   Individuel (`#references`). Il faut archiver les autorisations écrites
   correspondantes (joueur, famille si mineur, et club pour un club nommé) et
   vérifier les intitulés affichés par les visuels : U19 National, U18 R1,
   U17 R1, Senior R1/R2, NJCAA D2, Maccabi Tel-Aviv, Girondins de Bordeaux.
   Le jeune âge de certains joueurs impose une vigilance particulière.
6. **Photos** : portrait du coach, scène de bilan, séance sur le terrain et
   galerie de joueurs sont en place. Pour la séance (`web-coaching.jpg`) et les
   portraits de joueurs mineurs, prévoir les autorisations parentales de droit à
   l'image avant publication.
7. **Textes** : la séance type et certaines formulations sont des propositions
   éditoriales à valider par le coach avant publication.
8. **Domaine** : `lt-coach.com` est utilisé dans les balises canonical, Open Graph,
   `robots.txt` et `sitemap.xml`. À ajuster si le domaine final diffère.

## Activer la mesure d'audience

Dans `script.js`, renseigner :

```js
var ANALYTICS = {
  provider: "plausible", // ou "ga4"
  id: "lt-coach.com",    // domaine Plausible ou ID de mesure GA4
  storageKey: "ltcoach_consent_v1"
};
```

Tant que `provider` vaut `null`, aucun script tiers n'est chargé et le bandeau
de consentement reste masqué. Dès qu'un fournisseur est configuré :

- le bandeau Accepter / Refuser apparaît ;
- le script de mesure n'est chargé qu'après acceptation ;
- les événements `page_view`, `cta_click`, `form_start` et `form_submit` sont
  poussés dans `window.dataLayer` (avec la source et la campagne) ;
- un bouton « Cookies » apparaît dans le pied de page pour modifier le choix.

## Vérifications effectuées

- Les six pages répondent en HTTP 200 via le serveur local, sans erreur console
  ni requête en échec ; `coach.jpeg` est bien chargé.
- Aucun débordement horizontal mesuré à 320, 390, 768 et 1440 px, sur l'ensemble
  des pages ; navigation en tiroir, ouverture et fermeture par Échap vérifiées.
- Animations vérifiées dans Chromium : dessin du terrain, révélations au scroll,
  bandeau défilant, rail de sections, barre de progression, copie des réponses
  toujours fonctionnelle ; aucune erreur console.
- Formulaires testés (académie, individuel et performance) : champs requis, validation, panneau
  de récapitulatif, bouton « Copier les réponses » (libellé et message de
  confirmation), restauration du formulaire.
- La citation « On ne prépare pas un joueur pour un test… » tient sur une seule
  ligne à toutes les largeurs testées (taille ajustée automatiquement).
- Aucun prix ni montant en euros dans le HTML public de la page Performance.

L'anti-spam côté serveur n'a pas d'objet pour l'instant : aucun formulaire n'est
posté sur le site. Il devra être ajouté (honeypot + limitation de débit) avec le
futur endpoint d'envoi.
