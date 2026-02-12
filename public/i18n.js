// ==========================================
// INTERNATIONALIZATION (i18n) - Equipilates Europa
// Auto-detecção de idioma via geo-IP + browser language
// Fallback: Espanhol (es)
// ==========================================

// Cache para as traduções
const I18N = {};

// Idiomas suportados
const SUPPORTED_LANGS = ['pt-BR', 'en', 'es', 'de'];

// Idioma padrão para Europa
const DEFAULT_LANG = 'es';

// Flag para indicar se as traduções estão carregadas
let translationsReady = false;

// ==========================================
// DETECÇÃO AUTOMÁTICA DE IDIOMA
// ==========================================

// Ler cookie
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

// Detectar idioma automaticamente
// Prioridade: 1. Escolha manual (localStorage) → 2. Idioma do browser → 3. Geo-IP (Vercel) → 4. Espanhol
function detectLanguage() {
    // 1. Escolha manual já salva pelo usuário
    const saved = localStorage.getItem('language');
    if (saved && SUPPORTED_LANGS.includes(saved)) {
        return saved;
    }

    // 2. Idioma do navegador (prioridade principal)
    const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || ''];
    for (const bl of browserLangs) {
        const lang = bl.toLowerCase();
        if (lang.startsWith('pt')) return 'pt-BR';
        if (lang.startsWith('es')) return 'es';
        if (lang.startsWith('en')) return 'en';
        if (lang.startsWith('de')) return 'de';
    }

    // 3. Cookie definido pelo Vercel Edge Middleware (geo-IP / localização)
    const geoCookie = getCookie('detected-lang');
    if (geoCookie && SUPPORTED_LANGS.includes(geoCookie)) {
        return geoCookie;
    }

    // 4. Fallback: Espanhol
    return DEFAULT_LANG;
}

// Idioma detectado
let currentLang = detectLanguage();

// ==========================================
// FUNÇÕES DE TRADUÇÃO
// ==========================================

// Função para carregar traduções de arquivo JSON
async function loadTranslations(lang) {
    if (I18N[lang]) {
        return I18N[lang];
    }
    
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const translations = await response.json();
        I18N[lang] = translations;
        return translations;
    } catch (error) {
        console.error(`Error loading translations for ${lang}:`, error);
        return {};
    }
}

// Pré-carregar todas as traduções
async function preloadAllTranslations() {
    const promises = SUPPORTED_LANGS.map(lang => loadTranslations(lang));
    await Promise.all(promises);
    translationsReady = true;
}

// Função para obter texto traduzido
function t(key) {
    const translations = I18N[currentLang] || I18N[DEFAULT_LANG] || {};
    return translations[key] || key;
}

// Função para aplicar traduções na página
function applyI18nStrings() {
    const translations = I18N[currentLang] || {};
    
    if (Object.keys(translations).length === 0) {
        console.warn('No translations found for:', currentLang);
        return;
    }
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = translations[key];
        
        if (translation && typeof translation === 'string') {
            el.textContent = translation;
        }
    });
    
    // Também aplicar em placeholders se existirem
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translation = translations[key];
        
        if (translation && typeof translation === 'string') {
            el.setAttribute('placeholder', translation);
        }
    });
    
    // Atualizar seletor de idioma visual (se existir)
    updateLanguageSelector();
}

// Atualizar visual do seletor de idioma
function updateLanguageSelector() {
    // Atualizar botões/flags do seletor
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-lang') === currentLang);
    });
    
    // Atualizar o texto do botão de idioma atual (se existir)
    const currentFlag = document.querySelector('.current-lang-flag');
    const currentName = document.querySelector('.current-lang-name');
    const flags = { 'pt-BR': '🇧🇷', 'en': '🇬🇧', 'es': '🇪🇸', 'de': '🇩🇪' };
    const names = { 'pt-BR': 'PT', 'en': 'EN', 'es': 'ES', 'de': 'DE' };
    
    if (currentFlag) currentFlag.textContent = flags[currentLang] || '🇪🇸';
    if (currentName) currentName.textContent = names[currentLang] || 'ES';
}

// Função principal para trocar idioma (SÍNCRONA se traduções já carregadas)
function changeLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) {
        console.warn('Unsupported language:', lang);
        return;
    }
    
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Se as traduções já estiverem carregadas, aplicar imediatamente
    if (I18N[lang]) {
        applyI18nStrings();
        document.documentElement.lang = lang === 'pt-BR' ? 'pt-BR' : lang;
    } else {
        // Carregar e depois aplicar (fallback)
        loadTranslations(lang).then(() => {
            applyI18nStrings();
            document.documentElement.lang = lang === 'pt-BR' ? 'pt-BR' : lang;
        });
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Pré-carregar todas as traduções
    await preloadAllTranslations();
    
    // Aplicar traduções no idioma detectado
    applyI18nStrings();
    
    // Atualizar o atributo lang do HTML
    document.documentElement.lang = currentLang === 'pt-BR' ? 'pt-BR' : currentLang;
});

// Exportar funções para uso global
window.changeLanguage = changeLanguage;
window.t = t;
window.I18N = I18N;
window.applyI18nStrings = applyI18nStrings;
window.detectLanguage = detectLanguage;
window.currentLang = currentLang;