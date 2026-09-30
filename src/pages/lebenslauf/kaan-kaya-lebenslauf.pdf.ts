import type { APIRoute } from 'astro';
import { lebenslaufPdf } from '../../lib/cv-pdf';

export const GET: APIRoute = async ({ site }) =>
  new Response(new Uint8Array(await lebenslaufPdf('de', site!)), { headers: { 'Content-Type': 'application/pdf' } });
