import { docs } from '@/lib/docs';
import { docsLlmsFullText } from '@/lib/docs/docsLlmsFullText';
import { discoveryHeaders } from '@/lib/llms/discoveryHeaders';
import { discoveryOptions } from '@/lib/llms/discoveryOptions';

export const dynamic = 'force-static';
export async function GET() {
  return new Response(await docsLlmsFullText(docs), { headers: discoveryHeaders('text/plain; charset=utf-8') });
}
export const OPTIONS = discoveryOptions;
