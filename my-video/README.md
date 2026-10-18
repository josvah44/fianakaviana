# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Vidéo « Madagascar » (composition `Madagascar`)

Vidéo promotionnelle de 1 min 45 sur Madagascar, avec voix off masculine en
français, sous-titres animés et 8 scènes illustrées (carte, biodiversité,
Allée des Baobabs, plages, Tsingy, culture, final).

- Texte de la narration : `src/Madagascar/narration.json` (`text` est affiché
  en sous-titre, `speak` corrige la prononciation quand il est présent).
- Scènes : `src/Madagascar/scenes/`.

- Bruitages et ambiances par scène : `src/Madagascar/sound.tsx`. La musique
  baisse automatiquement pendant la voix off.

Après avoir modifié la narration, régénérez la voix et la durée des scènes,
puis la musique (synthétisée, style salegy) et les bruitages :

```console
sudo apt-get install espeak-ng mbrola mbrola-fr1 ffmpeg
node scripts/generate-audio.mjs
node scripts/generate-music-sfx.mjs
```

Puis rendez la vidéo :

```console
npx remotion render Madagascar out/madagascar.mp4
```

Pour utiliser une autre voix (par exemple un enregistrement réel), remplacez
les fichiers `public/voice/<scène>.mp3` et mettez à jour `voiceSeconds` et
`durationInFrames` dans `src/Madagascar/timing.json`.

## Commands

**Install Dependencies**

```console
npm i --loglevel=error
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
