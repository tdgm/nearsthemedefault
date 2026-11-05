import { loadAllManifests } from '../manifest';
import { aiReferralScript } from './ai-referral';

/**
 * Server Component: injeta o script de atribuicao so quando o contrato liga
 * `geo.attribution.trackAiReferrals`. Fica no fim do <body> (nao bloqueia o
 * render) e pesa menos de 1 KB no HTML, fora do bundle de JS.
 */
export function AiReferralScript() {
  const { trackAiReferrals, referrerPatterns } = loadAllManifests().contracts.geo.attribution;
  if (!trackAiReferrals || referrerPatterns.length === 0) return null;
  return <script dangerouslySetInnerHTML={{ __html: aiReferralScript(referrerPatterns) }} />;
}
