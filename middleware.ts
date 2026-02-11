import { next } from '@vercel/edge';

// Mapeamento de países para idiomas
// Baseado nos códigos ISO 3166-1 alpha-2
const COUNTRY_LANG_MAP: Record<string, string> = {
  // Espanhol (default Europa + América Latina)
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'CL': 'es',
  'PE': 'es', 'VE': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es',
  'BO': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es', 'SV': 'es',
  'NI': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es', 'PR': 'es',
  'GQ': 'es', 'AD': 'es',

  // Português
  'BR': 'pt-BR', 'PT': 'pt-BR', 'AO': 'pt-BR', 'MZ': 'pt-BR',
  'CV': 'pt-BR', 'GW': 'pt-BR', 'TL': 'pt-BR', 'ST': 'pt-BR',

  // Inglês
  'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', 'NZ': 'en',
  'IE': 'en', 'ZA': 'en', 'JM': 'en', 'TT': 'en', 'BB': 'en',
  'GY': 'en', 'BZ': 'en', 'SG': 'en', 'PH': 'en', 'IN': 'en',
  'PK': 'en', 'NG': 'en', 'GH': 'en', 'KE': 'en',

  // Alemão
  'DE': 'de', 'AT': 'de', 'CH': 'de', 'LI': 'de', 'LU': 'de',
};

const DEFAULT_LANG = 'es';

export default function middleware(request: Request) {
  // Ler o país do header do Vercel (geo-IP automático)
  const country = request.headers.get('x-vercel-ip-country') || '';
  
  // Mapear país para idioma
  const detectedLang = COUNTRY_LANG_MAP[country] || DEFAULT_LANG;

  // Criar resposta com cookie de idioma detectado
  const response = next();
  
  // Definir cookie com o idioma detectado (1 dia de duração)
  // O i18n.js no client-side lerá esse cookie
  response.headers.set(
    'Set-Cookie',
    `detected-lang=${detectedLang}; Path=/; Max-Age=86400; SameSite=Lax`
  );

  return response;
}

// Configurar em quais paths o middleware deve rodar
export const config = {
  matcher: '/',
};
