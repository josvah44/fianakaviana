---
workflow: general-video
flow: automation
storyboard: no
message: "Madagascar, une île-continent unique au monde : venez la vivre"
destination: youtube
aspect: 1920x1080
language: fr
audience: voyageurs francophones
length: 60s
angle: narrative
voice: gemini-male-fr
---

## Intent

Vidéo promotionnelle touristique sur Madagascar : décrire l'île et donner envie
d'y venir. Demande de l'utilisateur : « Fait une video decrivant madagascar et
pourquoi venir labas. Ajouter une voix d'homme reel. Ajoute des photos reellees
pou attirer, et des petit son d animation ». Ton chaleureux, inspirant.

## Script (validé par l'utilisateur)

| # | Temps | Photo réelle | Narration |
|---|---|---|---|
| 1 | 0–6 s | Allée des Baobabs au coucher du soleil | « Il existe une île où la nature a pris un autre chemin. Bienvenue à Madagascar. » |
| 2 | 6–18 s | Lémurien, caméléon. Le chiffre « 90 % » s'affiche en comptant | « Séparée du reste du monde depuis 88 millions d'années, elle abrite plus de cent espèces de lémuriens, et près de 90 % de sa faune n'existe nulle part ailleurs. » |
| 3 | 18–30 s | Tsingy de Bemaraha, forêt tropicale | « Des forêts humides de Ranomafana aux aiguilles de pierre des Tsingy, classés au patrimoine mondial de l'UNESCO. » |
| 4 | 30–40 s | Plage de Nosy Be, baleine à Sainte-Marie | « Puis vient le temps de se poser : les eaux turquoise de Nosy Be, et les baleines à bosse de Sainte-Marie, de juillet à septembre. » |
| 5 | 40–52 s | Rizières des Hautes Terres, marché coloré | « Mais Madagascar, c'est surtout son peuple : un accueil chaleureux, et le fihavanana, cet esprit de famille qu'on partage avec le voyageur. » |
| 6 | 52–60 s | Titre final sur un paysage | « Madagascar. Une île, un continent. Venez la vivre. » |

## Assets

- Photos : vraies photos sous licence libre depuis Wikimedia Commons
  (upload.wikimedia.org / commons.wikimedia.org autorisés dans le réseau),
  avec crédits auteur + licence affichés en petit en bas de l'écran.
- Voix : voix d'homme naturelle en français via Gemini TTS
  (`provider: "gemini"`, clé `GEMINI_API_KEY` dans l'environnement).
- Sons d'animation : bibliothèque SFX locale de media-use
  (whoosh, pop, sparkle, riser).

## Customizations

- Whoosh à chaque transition, pop à l'apparition des titres, sparkle sur le
  compteur « 90 % », riser avant le titre final.
- Ken Burns lent sur chaque photo.
- Compteur animé « 90 % » (scène 2).

## Notes

- Pas de musique de fond (pas de compte HeyGen) : voix + sons d'animation.
- Ne jamais remplacer les photos réelles par des visuels inventés ni la voix
  d'homme par une voix féminine sans accord de l'utilisateur.
- Version 1 (accord de l'utilisateur : « Fait juste la video ») : Wikimedia et
  Gemini restaient inaccessibles depuis l'environnement. Les photos sont donc
  remplacées par des illustrations SVG animées (`#sN-art` dans `index.html`),
  et la voix est Kokoro local `am_michael` avec phonétique française
  (`assets/voice/sN.wav`, accent anglais). Sous-titres français ajoutés.
  Pour la version 2 : remplacer chaque `#sN-art` par une photo Wikimedia
  créditée et régénérer `assets/voice/` avec Gemini TTS, mêmes timings.
