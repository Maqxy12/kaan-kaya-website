/**
 * Dein Profilfoto. Liegt eine Datei src/assets/profil.jpg (oder .png/.webp/.avif),
 * wird sie überall verwendet: Startseite, Blog, Lebenslauf (Seite + PDF) und für Google.
 * Ohne Foto zeigt die Website automatisch das Monogramm.
 */
import type { ImageMetadata } from 'astro';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const fotos = import.meta.glob<{ default: ImageMetadata }>('../assets/profil.{jpg,jpeg,png,webp,avif}', { eager: true });

/** Für <Picture>/<Image> und getImage() */
export const foto: ImageMetadata | undefined = Object.values(fotos)[0]?.default;

/** Dateipfad für das PDF (pdfkit kann nur JPG und PNG) */
export const fotoDatei: string | undefined = ['jpg', 'jpeg', 'png']
  .map((endung) => join(process.cwd(), 'src/assets', `profil.${endung}`))
  .find((pfad) => existsSync(pfad));
