/**
 * FunEmojis.app - Core Application Logic, i18n & Directory Engine
 * © 2026 FunEmojis.app. All Rights Reserved.
 */

// 🔒 Anti-Theft & Domain Lock Protection: Redirects clones to official funemojis.app
(function enforceDomainSecurity() {
  try {
    const host = window.location.hostname.toLowerCase();
    // Allow local development (file://, localhost, 127.0.0.1) and authorized hosting previews
    const isLocalOrPreview = !host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.pages.dev') || host.endsWith('.vercel.app') || host.endsWith('.netlify.app');
    const isOfficialDomain = host === 'funemojis.app' || host === 'www.funemojis.app';

    if (!isLocalOrPreview && !isOfficialDomain) {
      // Cloned domain detected! Redirect visitor immediately to official domain
      window.location.replace('https://funemojis.app' + window.location.pathname + window.location.search);
    }
  } catch (e) {}

  // Console Copyright Notice
  console.log(
    '%c✨ FunEmojis.app %c\nOfficial 1-Click Online Emoji Keyboard & Directory\n© 2026 FunEmojis.app - All Rights Reserved.\nUnauthorized distribution is prohibited under DMCA.',
    'background: linear-gradient(135deg, #4f46e5, #ec4899); color: #fff; font-size: 14px; font-weight: bold; padding: 4px 10px; border-radius: 6px;',
    'color: #4f46e5; font-size: 11px; font-weight: 600;'
  );

  // Disable Right-Click on UI elements (allow inside text inputs)
  document.addEventListener('contextmenu', (e) => {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    e.preventDefault();
  });

  // Block View Source (Ctrl+U) & Common DevTools Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
    }
  });
})();

// Parse URL Query Parameters & Path for Direct Deep Linking & SEO
const urlParams = new URLSearchParams(window.location.search);
const langParam = urlParams.get('lang');
const searchParam = urlParams.get('search') || urlParams.get('q') || urlParams.get('emoji') || '';
const pathName = window.location.pathname.toLowerCase();

// Determine default active tab based on path or hash
let initialTab = 'emojis';
if (pathName.includes('emoji-list')) initialTab = 'list';
else if (pathName.includes('generator')) initialTab = 'fonts';
else if (pathName.includes('translator')) initialTab = 'combos';
else if (window.location.hash) {
  const hash = window.location.hash.replace('#tab-', '').replace('#', '');
  if (['emojis', 'list', 'kaomoji', 'fonts', 'combos'].includes(hash)) initialTab = hash;
}

// Application State
const state = {
  activeTab: initialTab,
  activeCategory: 'all',
  listCategory: 'all',
  searchQuery: searchParam ? decodeURIComponent(searchParam).replace(/[_-]/g, ' ') : '',
  listSearchQuery: '',
  skinTone: 'default',
  emojiSize: 'standard', // 'compact', 'standard', 'large'
  language: (langParam && ['en', 'es', 'fr', 'de', 'it', 'pt', 'ar', 'ur', 'ja'].includes(langParam)) ? langParam : (localStorage.getItem('funemojis_lang') || 'en'),
  recents: JSON.parse(localStorage.getItem('funemojis_recents') || '[]'),
  favorites: JSON.parse(localStorage.getItem('funemojis_favorites') || '[]'),
  fontInputText: 'Fun Emojis Keyboard'
};

// DOM Element References
const elements = {
  langSelect: document.getElementById('lang-select'),
  searchInput: document.getElementById('search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  trendingChips: document.querySelectorAll('.trending-chip'),
  categoryPills: document.getElementById('category-pills'),
  sidebarCategoryNav: document.getElementById('sidebar-category-nav'),
  skinToneSelect: document.getElementById('skin-tone-select'),
  sizeToggleBtns: document.querySelectorAll('.size-toggle-btn'),
  emojiGrid: document.getElementById('emoji-grid'),
  emojiCountBadge: document.getElementById('emoji-count-badge'),
  recentsContainer: document.getElementById('recents-container'),
  recentsSection: document.getElementById('recents-section'),
  favoritesContainer: document.getElementById('favorites-container'),
  favoritesSection: document.getElementById('favorites-section'),
  workspaceInput: document.getElementById('workspace-input'),
  copyWorkspaceBtn: document.getElementById('copy-workspace-btn'),
  copyWorkspaceBtnText: document.getElementById('copy-workspace-btn-text'),
  spaceWorkspaceBtn: document.getElementById('space-workspace-btn'),
  backspaceWorkspaceBtn: document.getElementById('backspace-workspace-btn'),
  shareWorkspaceBtn: document.getElementById('share-workspace-btn'),
  clearWorkspaceBtn: document.getElementById('clear-workspace-btn'),
  charCountSpan: document.getElementById('char-count'),
  wordCountSpan: document.getElementById('word-count'),
  // Sticky Builder (Desktop)
  emojiBuilderInput: document.getElementById('emoji-builder-input'),
  builderCopyBtn: document.getElementById('builder-copy-btn'),
  builderCopyText: document.getElementById('builder-copy-text'),
  builderClearBtn: document.getElementById('builder-clear-btn'),
  builderSpaceBtn: document.getElementById('builder-space-btn'),
  builderBackspaceBtn: document.getElementById('builder-backspace-btn'),
  // Mobile Bottom Bar
  mobileCatNav: document.getElementById('mobile-cat-nav'),
  mobileSearchBtn: document.getElementById('mobile-search-btn'),
  mobileBuilderInput: document.getElementById('mobile-builder-input'),
  mobileClearBtn: document.getElementById('mobile-clear-btn'),
  mobileCopyBtn: document.getElementById('mobile-copy-btn'),
  toast: document.getElementById('toast'),
  toastText: document.getElementById('toast-text'),
  toastEmoji: document.getElementById('toast-emoji'),
  navTabs: document.querySelectorAll('.nav-tab-btn'),
  tabSections: {
    emojis: document.getElementById('tab-emojis'),
    list: document.getElementById('tab-list'),
    kaomoji: document.getElementById('tab-kaomoji'),
    fonts: document.getElementById('tab-fonts'),
    combos: document.getElementById('tab-combos')
  },
  kaomojiContainer: document.getElementById('kaomoji-container'),
  fancyFontsContainer: document.getElementById('fancy-fonts-container'),
  fontCustomInput: document.getElementById('font-custom-input'),
  combosContainer: document.getElementById('combos-container'),
  // Directory List elements
  listTableBody: document.getElementById('list-table-body'),
  listCategorySelect: document.getElementById('list-category-select'),
  listSearchInput: document.getElementById('list-search-input'),
  listCountBadge: document.getElementById('list-count-badge'),
  // Modal Elements
  emojiModal: document.getElementById('emoji-modal'),
  modalBackdrop: document.getElementById('modal-backdrop'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  modalEmojiChar: document.getElementById('modal-emoji-char'),
  modalEmojiName: document.getElementById('modal-emoji-name'),
  modalEmojiCategory: document.getElementById('modal-emoji-category'),
  modalEmojiCode: document.getElementById('modal-emoji-code'),
  modalEmojiShortcode: document.getElementById('modal-emoji-shortcode'),
  modalCopyCharBtn: document.getElementById('modal-copy-char-btn'),
  modalCopyShortcodeBtn: document.getElementById('modal-copy-shortcode-btn'),
  modalCopyCodeBtn: document.getElementById('modal-copy-code-btn'),
  modalInsertBtn: document.getElementById('modal-insert-btn')
};

// Current Modal Emoji Object
let currentModalEmoji = null;

// Get Translation Helper
function t(key) {
  const lang = state.language;
  if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
    return TRANSLATIONS[lang][key];
  }
  return TRANSLATIONS.en[key] || key;
}

// Get Localized Emoji Name Helper
function getEmojiName(item) {
  if (typeof getLocalizedEmojiName === 'function') {
    return getLocalizedEmojiName(item, state.language);
  }
  return item.name;
}

// Apply Language to UI
function applyLanguage(lang) {
  state.language = lang;
  localStorage.setItem('funemojis_lang', lang);

  // Sync URL parameter without reload for direct shareable links & Google crawlers
  try {
    const url = new URL(window.location);
    if (lang !== 'en') {
      url.searchParams.set('lang', lang);
    } else {
      url.searchParams.delete('lang');
    }
    window.history.replaceState({}, '', url);
  } catch (e) {}

  // Set HTML lang attribute & text direction
  document.documentElement.lang = lang;
  if (lang === 'ar' || lang === 'ur') {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }

  // Update Language dropdown value
  if (elements.langSelect) elements.langSelect.value = lang;

  // Update Nav tabs text
  elements.navTabs.forEach(btn => {
    const tabKey = btn.dataset.tab;
    const span = btn.querySelector('span:last-child');
    if (span && tabKey) {
      if (tabKey === 'emojis') span.textContent = t('nav_keyboard');
      else if (tabKey === 'list') span.textContent = t('nav_list');
      else if (tabKey === 'kaomoji') span.textContent = t('nav_kaomoji');
      else if (tabKey === 'fonts') span.textContent = t('nav_fonts');
      else if (tabKey === 'combos') span.textContent = t('nav_combos');
    }
  });

  // Update Announcement
  const announcement = document.querySelector('aside span');
  if (announcement) announcement.innerHTML = t('announcement');

  // Update Workspace text & buttons
  const wsTitle = document.querySelector('section[aria-label="Text and Emoji Workspace"] h1 span:first-child');
  if (wsTitle) wsTitle.textContent = t('workspace_title');

  const wsDesc = document.querySelector('section[aria-label="Text and Emoji Workspace"] p');
  if (wsDesc) wsDesc.textContent = t('workspace_desc');

  if (elements.workspaceInput) elements.workspaceInput.placeholder = t('workspace_placeholder');
  if (elements.copyWorkspaceBtn) elements.copyWorkspaceBtn.querySelector('span:last-child').textContent = t('workspace_copy');
  if (elements.clearWorkspaceBtn) elements.clearWorkspaceBtn.textContent = t('workspace_clear');

  const wsTip = document.querySelector('section[aria-label="Text and Emoji Workspace"] .text-xs.text-slate-400');
  if (wsTip) wsTip.textContent = t('workspace_tip');

  // Update Search input placeholder
  if (elements.searchInput) elements.searchInput.placeholder = t('search_placeholder');
  if (elements.listSearchInput) elements.listSearchInput.placeholder = t('list_search_placeholder');

  // Update Section Headers
  const listH2 = document.querySelector('#tab-list h2 span');
  if (listH2) listH2.textContent = t('list_title');
  const listP = document.querySelector('#tab-list p');
  if (listP) listP.textContent = t('list_desc');

  const kaoH2 = document.querySelector('#tab-kaomoji h2');
  if (kaoH2) kaoH2.textContent = t('kaomoji_title');
  const kaoP = document.querySelector('#tab-kaomoji p');
  if (kaoP) kaoP.textContent = t('kaomoji_desc');

  const fontH2 = document.querySelector('#tab-fonts h2');
  if (fontH2) fontH2.textContent = t('fonts_title');
  const fontP = document.querySelector('#tab-fonts p');
  if (fontP) fontP.textContent = t('fonts_desc');

  const comboH2 = document.querySelector('#tab-combos h2');
  if (comboH2) comboH2.textContent = t('combos_title');
  const comboP = document.querySelector('#tab-combos p');
  if (comboP) comboP.textContent = t('combos_desc');

  // Re-render categories, emojis grid, and list
  renderCategories();
  renderEmojis();
  renderEmojiList();
  renderKaomojis();
  renderFancyFonts();
  renderCombos();
}

// Show Toast Notification
let toastTimeout;
function showToast(message, icon = '📋') {
  if (!elements.toast) return;
  elements.toastText.textContent = message;
  elements.toastEmoji.textContent = icon;
  elements.toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2200);
}

// Copy to Clipboard Utility
async function copyText(text, visualElement = null, toastLabel = null) {
  const finalToast = toastLabel || t('toast_copied');
  try {
    await navigator.clipboard.writeText(text);
    if (visualElement) {
      visualElement.classList.add('clicked');
      setTimeout(() => visualElement.classList.remove('clicked'), 700);
    }
    showToast(finalToast, text.slice(0, 3));
    addToRecents(text);
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(finalToast, text.slice(0, 3));
      addToRecents(text);
    } catch (fallbackErr) {
      showToast('Failed to copy', '⚠️');
    }
    document.body.removeChild(textarea);
  }
}

// Add Emoji to Recents
function addToRecents(emoji) {
  if (!emoji || emoji.length > 8) return;
  let updated = state.recents.filter(e => e !== emoji);
  updated.unshift(emoji);
  if (updated.length > 24) updated = updated.slice(0, 24);
  state.recents = updated;
  localStorage.setItem('funemojis_recents', JSON.stringify(state.recents));
  renderRecents();
}

// Toggle Favorite
function toggleFavorite(emoji) {
  let updated = [...state.favorites];
  if (updated.includes(emoji)) {
    updated = updated.filter(e => e !== emoji);
    showToast(t('toast_removed_fav'), '💔');
  } else {
    updated.unshift(emoji);
    showToast(t('toast_added_fav'), '❤️');
  }
  state.favorites = updated;
  localStorage.setItem('funemojis_favorites', JSON.stringify(state.favorites));
  renderFavorites();
}

// Workspace & Builder Synchronization
function syncBuilderInputs(val) {
  if (elements.workspaceInput && elements.workspaceInput.value !== val) {
    elements.workspaceInput.value = val;
  }
  if (elements.emojiBuilderInput && elements.emojiBuilderInput.value !== val) {
    elements.emojiBuilderInput.value = val;
  }
  if (elements.mobileBuilderInput && elements.mobileBuilderInput.value !== val) {
    elements.mobileBuilderInput.value = val;
  }
  if (elements.mobileClearBtn) {
    elements.mobileClearBtn.classList.toggle('hidden', !val);
  }
  updateWorkspaceCounts();
}

function appendEmojiToBuilder(char) {
  const current = (elements.emojiBuilderInput ? elements.emojiBuilderInput.value : '') || 
                  (elements.workspaceInput ? elements.workspaceInput.value : '') || '';
  const updated = current + char;
  syncBuilderInputs(updated);
}

function clearAllBuilderText() {
  syncBuilderInputs('');
}

function updateWorkspaceCounts() {
  const text = (elements.emojiBuilderInput ? elements.emojiBuilderInput.value : '') ||
               (elements.workspaceInput ? elements.workspaceInput.value : '') || '';
  if (elements.charCountSpan) elements.charCountSpan.textContent = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  if (elements.wordCountSpan) elements.wordCountSpan.textContent = words;
}

function insertIntoWorkspace(char) {
  appendEmojiToBuilder(char);
}

function backspaceInWorkspace() {
  const val = (elements.workspaceInput ? elements.workspaceInput.value : '') ||
              (elements.emojiBuilderInput ? elements.emojiBuilderInput.value : '') || '';
  if (!val) return;
  const graphemes = Array.from(val);
  graphemes.pop();
  syncBuilderInputs(graphemes.join(''));
}

function spaceInWorkspace() {
  appendEmojiToBuilder(' ');
}

async function shareWorkspace() {
  const text = (elements.workspaceInput ? elements.workspaceInput.value.trim() : '') ||
               (elements.emojiBuilderInput ? elements.emojiBuilderInput.value.trim() : '') || '';
  const shareData = {
    title: 'FunEmojis.app - Online Emoji Keyboard',
    text: text || 'Create, copy & paste trending emojis on https://funemojis.app',
    url: 'https://funemojis.app'
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      showToast('Shared successfully!', '🚀');
    } catch (err) {
      if (err.name !== 'AbortError') {
        copyText(text || shareData.url, null, 'Copied link for sharing!');
      }
    }
  } else {
    copyText(text || shareData.url, null, 'Copied text to clipboard for sharing!');
  }
}

// Smooth Category Scroll (with search/filter reset)
function scrollToCategory(catId) {
  if (state.searchQuery) {
    state.searchQuery = '';
    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.clearSearchBtn) elements.clearSearchBtn.classList.add('hidden');
    renderEmojis();
  }
  if (state.activeCategory !== 'all') {
    state.activeCategory = 'all';
    renderCategories();
    renderEmojis();
  }
  setTimeout(() => {
    const target = document.getElementById(`category-${catId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 60);
}

// Active Category Scroll Spy (IntersectionObserver)
let categoryObserver = null;
function setupCategoryObserver() {
  if (!('IntersectionObserver' in window)) return;
  if (categoryObserver) categoryObserver.disconnect();

  const sidebarLinks = elements.sidebarCategoryNav ? Array.from(elements.sidebarCategoryNav.querySelectorAll('.sidebar-cat-link')) : [];
  const mobileCatBtns = elements.mobileCatNav ? Array.from(elements.mobileCatNav.querySelectorAll('.mobile-cat-btn')) : [];

  categoryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('category-', '');
        sidebarLinks.forEach(link => {
          const isActive = link.dataset.category === id;
          link.classList.toggle('active', isActive);
        });
        mobileCatBtns.forEach(btn => {
          const isActive = btn.dataset.category === id;
          btn.classList.toggle('active', isActive);
        });
      }
    });
  }, { rootMargin: '-100px 0px -65% 0px', threshold: 0 });

  document.querySelectorAll('.category-section').forEach(sec => {
    categoryObserver.observe(sec);
  });
}

// Render Categories Across Desktop Sidebar, Mobile Pills, and Mobile Bottom Bar
function renderCategories() {
  const realCats = EMOJI_CATEGORIES.filter(c => c.id !== 'all');

  // 1. Mobile & Tablet Category Pills
  if (elements.categoryPills) {
    elements.categoryPills.innerHTML = EMOJI_CATEGORIES.map(cat => {
      const localizedName = t(`cat_${cat.id}`);
      return `
        <button
          class="category-pill px-3.5 py-1.5 rounded-full font-semibold text-xs transition-all flex items-center gap-1.5 border ${
            state.activeCategory === cat.id
              ? 'active bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
          }"
          data-category="${cat.id}"
          title="${localizedName}"
        >
          <span>${cat.icon}</span>
          <span>${localizedName}</span>
        </button>
      `;
    }).join('');

    elements.categoryPills.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.dataset.category;
        renderCategories();
        renderEmojis();
      });
    });
  }

  // 2. Desktop Sticky Sidebar
  if (elements.sidebarCategoryNav) {
    elements.sidebarCategoryNav.innerHTML = realCats.map(cat => {
      const localizedName = t(`cat_${cat.id}`) || cat.name;
      const count = EMOJI_DATA.filter(em => em.cat === cat.id).length;
      return `
        <a
          href="#category-${cat.id}"
          class="sidebar-cat-link flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 no-underline"
          data-category="${cat.id}"
        >
          <div class="flex items-center gap-2">
            <span class="text-base">${cat.icon}</span>
            <span>${localizedName}</span>
          </div>
          <span class="sidebar-cat-count text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-mono">
            ${count}
          </span>
        </a>
      `;
    }).join('');

    elements.sidebarCategoryNav.querySelectorAll('.sidebar-cat-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToCategory(link.dataset.category);
      });
    });
  }

  // 3. Mobile Fixed Bottom Bar Categories
  if (elements.mobileCatNav) {
    const searchBtn = elements.mobileCatNav.querySelector('#mobile-search-btn');
    const catButtonsHtml = realCats.map(cat => `
      <button
        class="mobile-cat-btn flex items-center justify-center min-w-[34px] h-8 text-base rounded-lg border border-slate-200 bg-slate-100 text-slate-700 shrink-0 transition"
        data-category="${cat.id}"
        aria-label="${cat.name}"
        title="${cat.name}"
      >
        ${cat.icon}
      </button>
    `).join('');

    elements.mobileCatNav.innerHTML = '';
    if (searchBtn) elements.mobileCatNav.appendChild(searchBtn);
    elements.mobileCatNav.insertAdjacentHTML('beforeend', catButtonsHtml);

    elements.mobileCatNav.querySelectorAll('.mobile-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        scrollToCategory(btn.dataset.category);
      });
    });
  }
}

// Apply Skin Tone Modifier to Emoji
function applySkinTone(char, toneId) {
  if (toneId === 'default') return char;
  const tone = SKIN_TONES.find(t => t.id === toneId);
  if (!tone || !tone.modifier) return char;
  return char + tone.modifier;
}

// Smart Multi-Word & Multilingual Search Helper
function matchesSearch(item, query) {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase().trim();
  const localizedName = (getEmojiName(item) || '').toLowerCase();
  const itemName = (item.name || '').toLowerCase();
  const shortcode = (item.shortcode || '').toLowerCase();
  const code = (item.code || '').toLowerCase();
  const keywords = (item.keywords || []).map(k => k.toLowerCase()).join(' ');
  const localizedKws = (typeof getLocalizedKeywords === 'function' ? getLocalizedKeywords(item, state.language) : []).map(k => k.toLowerCase()).join(' ');
  
  const allText = `${item.char} ${localizedName} ${itemName} ${shortcode} ${code} ${keywords} ${localizedKws}`;

  // Direct phrase or character match
  if (allText.includes(normalizedQuery)) return true;

  // Multi-word token matching (all words in search query must match, handles spaces, underscores, and hyphens)
  const terms = normalizedQuery.split(/[\s_\-]+/).filter(Boolean);
  if (terms.length > 1) {
    return terms.every(term => allText.includes(term));
  }

  return false;
}

// Helper to render individual emoji keyboard tile HTML
function renderEmojiCard(item) {
  const displayChar = applySkinTone(item.char, state.skinTone);
  const isFav = state.favorites.includes(displayChar);
  const localizedName = getEmojiName(item);

  return `
    <div class="emoji-card group relative">
      <button
        class="emoji-btn emoji-tile w-full aspect-square flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 shadow-xs hover:shadow-md text-2xl sm:text-3xl font-emoji cursor-pointer"
        data-emoji="${displayChar}"
        data-rawchar="${item.char}"
        data-name="${localizedName}"
        data-tooltip="${localizedName}"
        aria-label="${localizedName}"
      >
        ${displayChar}
      </button>
      <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10 pointer-events-auto">
        <button
          class="fav-toggle text-[11px] p-0.5 rounded hover:scale-125 transition cursor-pointer"
          data-fav-emoji="${displayChar}"
          title="${isFav ? 'Remove favorite' : 'Add favorite'}"
        >
          ${isFav ? '❤️' : '🤍'}
        </button>
        <button
          class="info-modal-btn text-[10px] p-0.5 rounded hover:scale-125 transition cursor-pointer"
          data-char="${displayChar}"
          data-rawchar="${item.char}"
          title="Emoji Details"
        >
          ℹ️
        </button>
      </div>
    </div>
  `;
}

// Bind interactive click events on rendered emoji cards
function bindEmojiGridEvents() {
  if (!elements.emojiGrid) return;

  elements.emojiGrid.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji;
      const name = btn.dataset.name;
      copyText(emoji, btn, `${t('toast_copied')} "${emoji}" (${name})`);
      appendEmojiToBuilder(emoji);
      addToRecents(emoji);
    });
  });

  elements.emojiGrid.querySelectorAll('.fav-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.favEmoji);
      renderEmojis();
    });
  });

  elements.emojiGrid.querySelectorAll('.info-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rawChar = btn.dataset.rawchar;
      const emojiObj = EMOJI_DATA.find(em => em.char === rawChar);
      if (emojiObj) {
        openEmojiModal(emojiObj, btn.dataset.char);
      }
    });
  });

  elements.emojiGrid.querySelectorAll('.reset-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeCategory = 'all';
      renderCategories();
      renderEmojis();
    });
  });

  setupCategoryObserver();
}

// Render Emojis Category-Wise with Section Headers & Count Badges
function renderEmojis() {
  if (!elements.emojiGrid) return;
  const query = state.searchQuery.toLowerCase().trim();

  // 1. Search Query Mode: Render flat search results
  if (query) {
    const filtered = EMOJI_DATA.filter(item => matchesSearch(item, query));
    if (elements.emojiCountBadge) elements.emojiCountBadge.textContent = `${filtered.length} emojis found`;

    if (filtered.length === 0) {
      elements.emojiGrid.innerHTML = `
        <div class="py-16 text-center text-slate-500">
          <div class="text-5xl mb-3">🔍</div>
          <p class="text-lg font-semibold">No emojis found for "${state.searchQuery}"</p>
          <p class="text-sm mt-1">Try searching for keywords like "happy", "heart", "fire", "cat", "fuego", "aag".</p>
          <button id="reset-search-btn" class="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
            Clear Search
          </button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-search-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.searchQuery = '';
          elements.searchInput.value = '';
          if (elements.clearSearchBtn) elements.clearSearchBtn.classList.add('hidden');
          renderEmojis();
        });
      }
      return;
    }

    elements.emojiGrid.innerHTML = `
      <div class="mb-4 flex items-center justify-between pb-2 border-b border-slate-200">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500">Search Results (${filtered.length})</h3>
        <button id="clear-search-link" class="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">Clear Search</button>
      </div>
      <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-9 gap-2 sm:gap-2.5">
        ${filtered.map(renderEmojiCard).join('')}
      </div>
    `;

    const clearLink = document.getElementById('clear-search-link');
    if (clearLink) {
      clearLink.addEventListener('click', () => {
        state.searchQuery = '';
        elements.searchInput.value = '';
        if (elements.clearSearchBtn) elements.clearSearchBtn.classList.add('hidden');
        renderEmojis();
      });
    }

    bindEmojiGridEvents();
    return;
  }

  // 2. Specific Category Mode (User clicked single category pill)
  if (state.activeCategory !== 'all') {
    const catObj = EMOJI_CATEGORIES.find(c => c.id === state.activeCategory) || { name: state.activeCategory, icon: '✨' };
    const localizedCatName = t(`cat_${catObj.id}`) || catObj.name;
    const filtered = EMOJI_DATA.filter(item => item.cat === state.activeCategory);

    if (elements.emojiCountBadge) elements.emojiCountBadge.textContent = `${filtered.length} emojis`;

    elements.emojiGrid.innerHTML = `
      <div class="category-block">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <h3 class="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span class="text-2xl">${catObj.icon}</span>
            <span>${localizedCatName}</span>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">${filtered.length} emojis</span>
          </h3>
          <button class="reset-category-btn text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
            ← Show All Categories
          </button>
        </div>
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-9 gap-2 sm:gap-2.5">
          ${filtered.map(renderEmojiCard).join('')}
        </div>
      </div>
    `;

    bindEmojiGridEvents();
    return;
  }

  // 3. Category-Wise Display (All Categories with Dedicated Sections & Headers)
  if (elements.emojiCountBadge) elements.emojiCountBadge.textContent = `${EMOJI_DATA.length} emojis`;

  const realCategories = EMOJI_CATEGORIES.filter(c => c.id !== 'all');

  elements.emojiGrid.innerHTML = realCategories.map(cat => {
    const localizedCatName = t(`cat_${cat.id}`) || cat.name;
    const catItems = EMOJI_DATA.filter(item => item.cat === cat.id);
    if (catItems.length === 0) return '';

    return `
      <section id="category-${cat.id}" class="category-section category-section-anchor">
        <div class="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-200 bg-white/95 sticky top-28 z-20 py-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">${cat.icon}</span>
            <h3 class="text-base font-extrabold text-slate-800 tracking-tight">${localizedCatName}</h3>
          </div>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
            ${catItems.length} emojis
          </span>
        </div>
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-9 gap-2 sm:gap-2.5">
          ${catItems.map(renderEmojiCard).join('')}
        </div>
      </section>
    `;
  }).join('');

  bindEmojiGridEvents();
}

// Render Recents
function renderRecents() {
  if (!elements.recentsContainer || !elements.recentsSection) return;
  if (state.recents.length === 0) {
    elements.recentsSection.classList.add('hidden');
    return;
  }
  elements.recentsSection.classList.remove('hidden');
  elements.recentsContainer.innerHTML = state.recents.map(emoji => `
    <button
      class="emoji-btn text-2xl p-2 rounded-lg bg-slate-100 hover:bg-indigo-50 transition"
      data-emoji="${emoji}"
      title="Click to copy ${emoji}"
    >
      ${emoji}
    </button>
  `).join('');

  elements.recentsContainer.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      copyText(btn.dataset.emoji, btn, `${t('toast_copied')} "${btn.dataset.emoji}"`);
    });
  });
}

// Render Favorites
function renderFavorites() {
  if (!elements.favoritesContainer || !elements.favoritesSection) return;
  if (state.favorites.length === 0) {
    elements.favoritesSection.classList.add('hidden');
    return;
  }
  elements.favoritesSection.classList.remove('hidden');
  elements.favoritesContainer.innerHTML = state.favorites.map(emoji => `
    <div class="relative group inline-block">
      <button
        class="emoji-btn text-2xl p-2 rounded-lg bg-slate-100 hover:bg-pink-50 transition"
        data-emoji="${emoji}"
        title="Click to copy ${emoji}"
      >
        ${emoji}
      </button>
      <button
        class="remove-fav-btn absolute -top-1.5 -right-1.5 hidden group-hover:flex w-4 h-4 bg-red-500 text-white rounded-full items-center justify-center text-[9px]"
        data-remove-emoji="${emoji}"
        title="Remove favorite"
      >
        ✕
      </button>
    </div>
  `).join('');

  elements.favoritesContainer.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      copyText(btn.dataset.emoji, btn, `${t('toast_copied')} "${btn.dataset.emoji}"`);
    });
  });

  elements.favoritesContainer.querySelectorAll('.remove-fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.removeEmoji);
      renderEmojis();
    });
  });
}

// Render Complete Emojis List Directory (Table View)
function renderEmojiList() {
  if (!elements.listTableBody) return;
  const query = (state.listSearchQuery || '').toLowerCase().trim();
  const catFilter = state.listCategory;

  let filtered = EMOJI_DATA.filter(item => {
    const matchesCat = catFilter === 'all' || item.cat === catFilter;
    if (!matchesCat) return false;
    return matchesSearch(item, query);
  });

  if (elements.listCountBadge) {
    elements.listCountBadge.textContent = `${filtered.length} ${t('list_title')}`;
  }

  if (filtered.length === 0) {
    elements.listTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-12 text-center text-slate-500">
          <div class="text-4xl mb-2">🔍</div>
          <p class="text-base font-semibold">No emojis found matching "${state.listSearchQuery}"</p>
          <p class="text-xs mt-1">Try another keyword or change the category filter.</p>
        </td>
      </tr>
    `;
    return;
  }

  elements.listTableBody.innerHTML = filtered.map(item => {
    const categoryName = t(`cat_${item.cat}`) || item.cat;
    const localizedName = getEmojiName(item);
    const localizedKeywords = typeof getLocalizedKeywords === 'function' 
      ? getLocalizedKeywords(item, state.language) 
      : (item.keywords || []);

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
        <!-- Emoji Icon -->
        <td class="py-3 px-4 text-center">
          <button
            class="list-emoji-btn text-2xl sm:text-3xl p-1 rounded-lg hover:bg-indigo-50 transition"
            data-emoji="${item.char}"
            data-name="${localizedName}"
            title="Click to copy ${item.char}"
          >
            ${item.char}
          </button>
        </td>

        <!-- Emoji Name & Keywords -->
        <td class="py-3 px-4">
          <div class="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <span>${localizedName}</span>
          </div>
          <div class="text-xs text-slate-400 mt-0.5">
            ${localizedKeywords.slice(0, 5).join(', ')}
          </div>
        </td>

        <!-- Category -->
        <td class="py-3 px-4 hidden md:table-cell">
          <span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
            ${categoryName}
          </span>
        </td>

        <!-- Shortcode & Codepoint -->
        <td class="py-3 px-4 font-mono text-xs text-slate-600 hidden sm:table-cell">
          <div class="text-indigo-600 font-semibold cursor-pointer hover:underline copy-shortcode-btn" data-text="${item.shortcode}" title="Copy shortcode">
            ${item.shortcode || '-'}
          </div>
          <div class="text-slate-400 text-[11px] mt-0.5">
            ${item.code || '-'}
          </div>
        </td>

        <!-- Action Copy Buttons -->
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button
              class="copy-char-btn px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
              data-emoji="${item.char}"
              data-name="${localizedName}"
            >
              ${t('btn_copy')}
            </button>
            <button
              class="details-btn px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition hidden sm:inline-block"
              data-char="${item.char}"
              title="View full details"
            >
              ${t('btn_info')}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind Table Actions
  elements.listTableBody.querySelectorAll('.list-emoji-btn, .copy-char-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji;
      const name = btn.dataset.name;
      copyText(emoji, btn, `${t('toast_copied')} "${emoji}" (${name})`);
    });
  });

  elements.listTableBody.querySelectorAll('.copy-shortcode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      copyText(btn.dataset.text, btn, `Copied shortcode: ${btn.dataset.text}`);
    });
  });

  elements.listTableBody.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const char = btn.dataset.char;
      const emojiObj = EMOJI_DATA.find(em => em.char === char);
      if (emojiObj) openEmojiModal(emojiObj, char);
    });
  });
}

// Open Emoji Detail Modal with Localized Details
function openEmojiModal(emojiObj, displayChar) {
  if (!elements.emojiModal) return;
  currentModalEmoji = { ...emojiObj, displayChar: displayChar || emojiObj.char };
  const localizedName = getEmojiName(emojiObj);

  elements.modalEmojiChar.textContent = currentModalEmoji.displayChar;
  elements.modalEmojiName.textContent = localizedName;
  
  const catName = t(`cat_${emojiObj.cat}`) || emojiObj.cat;
  elements.modalEmojiCategory.textContent = catName;
  elements.modalEmojiCode.textContent = emojiObj.code || 'Unicode';
  elements.modalEmojiShortcode.textContent = emojiObj.shortcode || `:${emojiObj.name.toLowerCase().replace(/\s+/g, '_')}:`;

  if (elements.modalCopyCharBtn) elements.modalCopyCharBtn.querySelector('span:last-child').textContent = t('modal_copy_emoji');
  if (elements.modalCopyShortcodeBtn) elements.modalCopyShortcodeBtn.textContent = t('modal_copy_shortcode');
  if (elements.modalCopyCodeBtn) elements.modalCopyCodeBtn.textContent = t('modal_copy_unicode');
  if (elements.modalInsertBtn) elements.modalInsertBtn.textContent = `✍️ ${t('modal_add_editor')}`;

  elements.emojiModal.classList.remove('hidden');
}

function closeEmojiModal() {
  if (!elements.emojiModal) return;
  elements.emojiModal.classList.add('hidden');
}

// Render Kaomojis
function renderKaomojis() {
  if (!elements.kaomojiContainer) return;
  elements.kaomojiContainer.innerHTML = KAOMOJI_CATEGORIES.map(category => `
    <div class="mb-8">
      <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span>
        ${category.name}
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        ${category.items.map(kao => `
          <button
            class="kaomoji-btn p-3 rounded-xl bg-white border border-slate-200 text-sm md:text-base font-mono font-medium text-slate-700 hover:border-pink-500 hover:shadow-md transition text-center"
            data-kaomoji="${kao}"
            title="Click to copy"
          >
            ${kao}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');

  elements.kaomojiContainer.querySelectorAll('.kaomoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      copyText(btn.dataset.kaomoji, btn, `Copied Kaomoji: ${btn.dataset.kaomoji}`);
    });
  });
}

// Render Fancy Fonts
function renderFancyFonts() {
  if (!elements.fancyFontsContainer) return;
  const inputText = state.fontInputText || 'Fun Emojis Keyboard';

  elements.fancyFontsContainer.innerHTML = FANCY_FONTS.map(font => {
    const transformed = font.convert(inputText);
    return `
      <div class="font-row flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm transition">
        <div class="min-w-0 pr-4">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">${font.name}</div>
          <div class="text-lg sm:text-xl font-medium text-slate-800 break-words">${transformed}</div>
        </div>
        <button
          class="copy-font-btn flex-shrink-0 px-4 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg text-sm font-semibold transition"
          data-text="${transformed}"
        >
          ${t('btn_copy')}
        </button>
      </div>
    `;
  }).join('');

  elements.fancyFontsContainer.querySelectorAll('.copy-font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      copyText(btn.dataset.text, btn, 'Copied styled font!');
    });
  });
}

// Render Combos
function renderCombos() {
  if (!elements.combosContainer) return;
  elements.combosContainer.innerHTML = EMOJI_COMBOS.map(section => `
    <div class="mb-8">
      <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
        ${section.category}
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${section.combos.map(combo => `
          <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div class="text-2xl mb-1">${combo.text}</div>
              <div class="text-xs font-medium text-slate-500">${combo.title}</div>
            </div>
            <button
              class="copy-combo-btn px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition"
              data-combo="${combo.text}"
            >
              ${t('btn_copy')}
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  elements.combosContainer.querySelectorAll('.copy-combo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      copyText(btn.dataset.combo, btn, `Copied combo: ${btn.dataset.combo}`);
    });
  });
}

// Switch Navigation Tabs
function switchTab(tabId) {
  state.activeTab = tabId;
  elements.navTabs.forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active-tab');
    } else {
      btn.classList.remove('active-tab');
    }
  });

  Object.keys(elements.tabSections).forEach(key => {
    if (key === tabId) {
      elements.tabSections[key].classList.remove('hidden');
    } else {
      elements.tabSections[key].classList.add('hidden');
    }
  });

  if (tabId === 'list') renderEmojiList();
  if (tabId === 'kaomoji') renderKaomojis();
  if (tabId === 'fonts') renderFancyFonts();
  if (tabId === 'combos') renderCombos();
}

// Setup Event Listeners
function setupEventListeners() {
  // Language Selector
  if (elements.langSelect) {
    elements.langSelect.addEventListener('change', (e) => {
      applyLanguage(e.target.value);
    });
  }

  // Search Input in Keyboard
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (elements.clearSearchBtn) {
        if (state.searchQuery) elements.clearSearchBtn.classList.remove('hidden');
        else elements.clearSearchBtn.classList.add('hidden');
      }
      renderEmojis();
    });
  }

  // Clear Search
  if (elements.clearSearchBtn) {
    elements.clearSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      elements.searchInput.value = '';
      elements.clearSearchBtn.classList.add('hidden');
      renderEmojis();
      elements.searchInput.focus();
    });
  }

  // Skin Tone Selector
  if (elements.skinToneSelect) {
    elements.skinToneSelect.addEventListener('change', (e) => {
      state.skinTone = e.target.value;
      renderEmojis();
    });
  }

  // Emoji Grid Size Toggle
  elements.sizeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.dataset.size;
      state.emojiSize = size;
      elements.sizeToggleBtns.forEach(b => b.classList.remove('bg-indigo-100', 'text-indigo-600'));
      btn.classList.add('bg-indigo-100', 'text-indigo-600');
      
      elements.emojiGrid.className = elements.emojiGrid.className.replace(/grid-(compact|standard|large)/g, '');
      elements.emojiGrid.classList.add(`grid-${size}`);
    });
  });

  // Trending Quick Search Chips
  document.querySelectorAll('.trending-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.dataset.query;
      state.searchQuery = query;
      if (elements.searchInput) elements.searchInput.value = query;
      if (elements.clearSearchBtn) elements.clearSearchBtn.classList.remove('hidden');
      renderEmojis();
    });
  });

  // Workspace & Sticky Builder Actions
  if (elements.workspaceInput) {
    elements.workspaceInput.addEventListener('input', (e) => {
      syncBuilderInputs(e.target.value);
    });
  }

  if (elements.emojiBuilderInput) {
    elements.emojiBuilderInput.addEventListener('input', (e) => {
      syncBuilderInputs(e.target.value);
    });
  }

  if (elements.builderCopyBtn) {
    elements.builderCopyBtn.addEventListener('click', () => {
      const text = (elements.emojiBuilderInput ? elements.emojiBuilderInput.value : '') ||
                   (elements.workspaceInput ? elements.workspaceInput.value : '');
      if (!text.trim()) {
        showToast(t('toast_editor_empty'), 'ℹ️');
        return;
      }
      copyText(text, elements.builderCopyBtn, 'Copied all emojis!');
      if (elements.builderCopyText) {
        const orig = elements.builderCopyText.textContent;
        elements.builderCopyText.textContent = 'Copied! ✓';
        setTimeout(() => { elements.builderCopyText.textContent = orig; }, 1500);
      }
    });
  }

  if (elements.builderClearBtn) {
    elements.builderClearBtn.addEventListener('click', () => {
      clearAllBuilderText();
      showToast('Cleared message', '🧹');
    });
  }

  if (elements.builderSpaceBtn) {
    elements.builderSpaceBtn.addEventListener('click', () => {
      appendEmojiToBuilder(' ');
    });
  }

  if (elements.builderBackspaceBtn) {
    elements.builderBackspaceBtn.addEventListener('click', () => {
      backspaceInWorkspace();
    });
  }

  // Mobile Bottom Action Bar
  if (elements.mobileBuilderInput) {
    elements.mobileBuilderInput.addEventListener('input', (e) => {
      syncBuilderInputs(e.target.value);
    });
  }

  if (elements.mobileCopyBtn) {
    elements.mobileCopyBtn.addEventListener('click', () => {
      const text = (elements.mobileBuilderInput ? elements.mobileBuilderInput.value : '') ||
                   (elements.workspaceInput ? elements.workspaceInput.value : '');
      if (!text.trim()) {
        showToast(t('toast_editor_empty'), 'ℹ️');
        return;
      }
      copyText(text, elements.mobileCopyBtn, 'Copied all emojis!');
    });
  }

  if (elements.mobileClearBtn) {
    elements.mobileClearBtn.addEventListener('click', () => {
      clearAllBuilderText();
    });
  }

  if (elements.mobileSearchBtn) {
    elements.mobileSearchBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (elements.searchInput) {
          elements.searchInput.focus();
        }
      }, 300);
    });
  }

  if (elements.copyWorkspaceBtn) {
    elements.copyWorkspaceBtn.addEventListener('click', () => {
      const text = elements.workspaceInput.value;
      if (!text.trim()) {
        showToast(t('toast_editor_empty'), 'ℹ️');
        return;
      }
      copyText(text, elements.copyWorkspaceBtn, t('toast_copied'));
    });
  }

  if (elements.spaceWorkspaceBtn) {
    elements.spaceWorkspaceBtn.addEventListener('click', spaceInWorkspace);
  }

  if (elements.backspaceWorkspaceBtn) {
    elements.backspaceWorkspaceBtn.addEventListener('click', backspaceInWorkspace);
  }

  if (elements.shareWorkspaceBtn) {
    elements.shareWorkspaceBtn.addEventListener('click', shareWorkspace);
  }

  if (elements.clearWorkspaceBtn) {
    elements.clearWorkspaceBtn.addEventListener('click', () => {
      clearAllBuilderText();
      showToast('Cleared editor', '🧹');
    });
  }

  // Nav Tabs Click
  elements.navTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // List Directory Search & Category Filter
  if (elements.listSearchInput) {
    elements.listSearchInput.addEventListener('input', (e) => {
      state.listSearchQuery = e.target.value;
      renderEmojiList();
    });
  }

  if (elements.listCategorySelect) {
    elements.listCategorySelect.addEventListener('change', (e) => {
      state.listCategory = e.target.value;
      renderEmojiList();
    });
  }

  // Modal Action Buttons
  if (elements.closeModalBtn) {
    elements.closeModalBtn.addEventListener('click', closeEmojiModal);
  }
  if (elements.modalBackdrop) {
    elements.modalBackdrop.addEventListener('click', closeEmojiModal);
  }

  if (elements.modalCopyCharBtn) {
    elements.modalCopyCharBtn.addEventListener('click', () => {
      if (currentModalEmoji) {
        copyText(currentModalEmoji.displayChar, elements.modalCopyCharBtn, `Copied ${currentModalEmoji.displayChar}`);
      }
    });
  }

  if (elements.modalCopyShortcodeBtn) {
    elements.modalCopyShortcodeBtn.addEventListener('click', () => {
      if (currentModalEmoji && currentModalEmoji.shortcode) {
        copyText(currentModalEmoji.shortcode, elements.modalCopyShortcodeBtn, `Copied shortcode: ${currentModalEmoji.shortcode}`);
      }
    });
  }

  if (elements.modalCopyCodeBtn) {
    elements.modalCopyCodeBtn.addEventListener('click', () => {
      if (currentModalEmoji && currentModalEmoji.code) {
        copyText(currentModalEmoji.code, elements.modalCopyCodeBtn, `Copied Unicode: ${currentModalEmoji.code}`);
      }
    });
  }

  if (elements.modalInsertBtn) {
    elements.modalInsertBtn.addEventListener('click', () => {
      if (currentModalEmoji) {
        insertIntoWorkspace(currentModalEmoji.displayChar);
        showToast(`Inserted ${currentModalEmoji.displayChar} into editor`, '✍️');
      }
    });
  }

  // Font Custom Input
  if (elements.fontCustomInput) {
    elements.fontCustomInput.addEventListener('input', (e) => {
      state.fontInputText = e.target.value;
      renderFancyFonts();
    });
  }

  // Global Keyboard shortcut '/' to search
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.emojiModal && !elements.emojiModal.classList.contains('hidden')) {
      closeEmojiModal();
      return;
    }

    if (e.key === '/' && document.activeElement !== elements.searchInput && document.activeElement !== elements.workspaceInput && document.activeElement !== elements.fontCustomInput && document.activeElement !== elements.listSearchInput) {
      e.preventDefault();
      if (state.activeTab === 'list' && elements.listSearchInput) {
        elements.listSearchInput.focus();
        elements.listSearchInput.select();
      } else {
        elements.searchInput.focus();
        elements.searchInput.select();
      }
    }
  });
}

// Initialise App
function initApp() {
  document.documentElement.classList.remove('dark');
  document.documentElement.setAttribute('data-theme', 'light');
  localStorage.removeItem('funemojis_theme');

  applyLanguage(state.language);
  renderRecents();
  renderFavorites();
  setupEventListeners();
  updateWorkspaceCounts();

  // If path or hash opened a specific tab (e.g. /emoji-list, /generator, /translator)
  if (state.activeTab && state.activeTab !== 'emojis') {
    switchTab(state.activeTab);
  }

  // If a search query was passed via URL (e.g. from 404 redirect of old indexed URLs)
  if (state.searchQuery && elements.searchInput) {
    elements.searchInput.value = state.searchQuery;
    if (elements.clearSearchBtn) elements.clearSearchBtn.classList.remove('hidden');
    renderEmojis();

    // If there is an exact or close match, auto-open emoji detail modal
    const normalizedQuery = state.searchQuery.toLowerCase().trim();
    const cleanQuery = normalizedQuery.replace(/[\s_\-]+/g, ' ');
    const exactMatch = EMOJI_DATA.find(item => {
      const iName = item.name.toLowerCase();
      const iShort = (item.shortcode || '').toLowerCase().replace(/[:\s_\-]/g, '');
      const qNoSpace = cleanQuery.replace(/\s+/g, '');
      return (
        iName === normalizedQuery ||
        iName === cleanQuery ||
        iName.replace(/[\s_\-]+/g, ' ') === cleanQuery ||
        iShort === qNoSpace ||
        item.char === normalizedQuery ||
        (item.keywords && item.keywords.some(k => k.toLowerCase() === normalizedQuery || k.toLowerCase() === cleanQuery))
      );
    });
    if (exactMatch) {
      setTimeout(() => {
        openEmojiModal(exactMatch, exactMatch.char);
      }, 250);
    }
  }
}

// Expose navigation functions globally for footer and cross-component links
function jumpToCategory(catId) {
  if (state.activeTab !== 'emojis') {
    switchTab('emojis');
  }
  if (state.activeCategory !== 'all') {
    state.activeCategory = 'all';
    renderCategories();
    renderEmojis();
  }
  setTimeout(() => {
    scrollToCategory(catId);
  }, 100);
}

window.switchTab = switchTab;
window.jumpToCategory = jumpToCategory;
window.scrollToCategory = scrollToCategory;

document.addEventListener('DOMContentLoaded', initApp);
