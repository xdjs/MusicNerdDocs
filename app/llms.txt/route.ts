import { docs } from '@/lib/docs';
import { discoveryHeaders } from '@/lib/llms/discoveryHeaders';
import { discoveryOptions } from '@/lib/llms/discoveryOptions';
import { getLlmsText } from '@/lib/llms/getLlmsText';

export const dynamic = 'force-static';
export function GET() {
  return new Response(getLlmsText(docs), { headers: discoveryHeaders('text/plain; charset=utf-8') });
}
export const OPTIONS = discoveryOptions;
