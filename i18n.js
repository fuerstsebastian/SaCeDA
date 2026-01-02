// Internationalization (i18n) System for SaCeDA Network

const translations = {
  en: {
    subtitle: "Saarland Center for Digital Archaeology",
    filterLabel: "Show / Hide:",
    methods: "Methods",
    projects: "Projects",
    people: "People",
    institutions: "Institutions",
    fields: "Application Fields",
    teaching: "Teaching",
    hint: "💡 Click on blue method nodes to reveal subcategories",
    loading: "Loading network...",
    
    // Node role labels
    "Method": "Method",
    "Project": "Project",
    "Person": "Person",
    "Institution": "Institution",
    "Application Field": "Application Field",
    "Teaching": "Teaching"
  },
  de: {
    subtitle: "Saarland Center for Digital Archaeology",
    filterLabel: "Anzeigen / Ausblenden:",
    methods: "Methoden",
    projects: "Projekte",
    people: "Personen",
    institutions: "Institutionen",
    fields: "Anwendungsfelder",
    teaching: "Lehre",
    hint: "💡 Klicken Sie auf blaue Methoden-Knoten, um Unterkategorien anzuzeigen",
    loading: "Netzwerk wird geladen...",
    
    // Node role labels
    "Method": "Methode",
    "Project": "Projekt",
    "Person": "Person",
    "Institution": "Institution",
    "Application Field": "Anwendungsfeld",
    "Teaching": "Lehre"
  }
};

// Current language (default: English)
let currentLang = 'en';

// Initialize i18n
function initI18n() {
  // Check localStorage for saved language preference
  const savedLang = localStorage.getItem('saceda-lang');
  if (savedLang && translations[savedLang]) {
    currentLang = savedLang;
  }
  
  // Apply translations
  applyTranslations();
  
  // Update language button
  updateLangButton();
  
  // Add event listener to language toggle
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', toggleLanguage);
  }
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
}

// Toggle between languages
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'de' : 'en';
  localStorage.setItem('saceda-lang', currentLang);
  applyTranslations();
  updateLangButton();
  
  // Trigger event for other scripts to update
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
}

// Update language button text
function updateLangButton() {
  const langText = document.getElementById('lang-text');
  if (langText) {
    langText.textContent = currentLang === 'en' ? 'DE' : 'EN';
  }
}

// Get translation for a key
function t(key) {
  return translations[currentLang][key] || key;
}

// Get current language
function getCurrentLang() {
  return currentLang;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

// Export for use in other scripts
window.i18n = {
  t,
  getCurrentLang,
  translations
};