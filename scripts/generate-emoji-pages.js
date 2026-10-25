const fs = require('fs');
const path = require('path');
const { EMOJI_DATA, EMOJI_CATEGORIES } = require('../js/emoji-data.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'emoji');
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');
const SITEMAP_EMOJIS_PATH = path.join(__dirname, '..', 'sitemap-emojis.xml');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Category map
const catMap = {};
EMOJI_CATEGORIES.forEach(c => {
  catMap[c.id] = c.name;
});

// Helper for slug
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Encoding helpers
function getHtmlEntityDec(char) {
  return Array.from(char).map(c => `&#${c.codePointAt(0)};`).join('');
}

function getHtmlEntityHex(char) {
  return Array.from(char).map(c => `&#x${c.codePointAt(0).toString(16).toUpperCase()};`).join('');
}

function getUtf8Hex(char) {
  return Buffer.from(char, 'utf8').toString('hex').toUpperCase().match(/../g).join(' ');
}

// Escape HTML
function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Editorial description generator
function getEditorialMeaning(emoji) {
  const name = emoji.name;
  const char = emoji.char;
  const cat = emoji.cat;
  const keywords = emoji.keywords || [];
  const kwList = keywords.slice(0, 4).join(', ');

  if (cat === 'flags') {
    const country = name.replace(/^Flag:\s*/i, '').trim();
    return `The <strong>${escapeHtml(name)}</strong> emoji (${char}) depicts the official national flag of <strong>${escapeHtml(country)}</strong>. It is commonly used in social media profiles, international sports events, travel vlogs, cultural celebrations, and patriotic conversations across Instagram, Twitter/X, TikTok, and WhatsApp.`;
  }
  if (cat === 'smileys') {
    return `The <strong>${escapeHtml(name)}</strong> emoji (${char}) is widely used to express ${escapeHtml(kwList || 'emotions and reactions')}. It is one of the most popular emoticons across messaging apps, helping convey tone, personality, humor, and feeling in text chats, Instagram captions, TikTok comments, and Discord servers.`;
  }
  if (cat === 'animals') {
    return `The <strong>${escapeHtml(name)}</strong> emoji (${char}) portrays a ${escapeHtml(kwList || 'creature from the animal kingdom')}. It is often used when discussing wildlife, favorite pets, nature photography, environmental awareness, or cute animal moments on social feeds.`;
  }
  if (cat === 'food') {
    return `The <strong>${escapeHtml(name)}</strong> emoji (${char}) represents appetizing ${escapeHtml(kwList || 'food and drink items')}. Frequently used by foodies, chefs, and coffee lovers in recipe posts, restaurant reviews, dinner invitations, and culinary lifestyle stories.`;
  }
  if (cat === 'activities') {
    return `The <strong>${escapeHtml(name)}</strong> emoji (${char}) illustrates ${escapeHtml(kwList || 'sports, games, and active hobbies')}. Widely shared by athletes, fitness enthusiasts, gamers, and sports fans during live matches, workout sessions, and tournament celebrations.`;
  }
  if (cat === 'travel') {
    return `The <strong>${escapeHtml(name)}</strong> emoji (${char}) highlights ${escapeHtml(kwList || 'travel destinations, vehicles, and scenery')}. Great for vacation stories, airport check-ins, road trips, and exploring new cities around the world.`;
  }
  if (cat === 'objects') {
    return `The <strong>${escapeHtml(name)}</strong> emoji (${char}) signifies ${escapeHtml(kwList || 'everyday tools, technology, and objects')}. Commonly used in work updates, tech discussions, lifestyle posts, and creative digital designs.`;
  }
  if (cat === 'symbols') {
    return `The <strong>${escapeHtml(name)}</strong> emoji (${char}) stands for ${escapeHtml(kwList || 'symbolic meanings, love, and indicators')}. Highly popular for decorating social media bios, emphasizing key points, aesthetic formatting, and expressing deep sentiments.`;
  }
  return `The <strong>${escapeHtml(name)}</strong> emoji (${char}) is an official Unicode symbol associated with ${escapeHtml(kwList || 'various expressions and themes')}. Ready to copy and paste directly into any modern device, app, or website.`;
}

// Pre-compute slugs
const emojiList = EMOJI_DATA.map(e => ({
  ...e,
  slug: toSlug(e.name),
  catName: catMap[e.cat] || 'Symbols & Signs'
}));

// Function to find related emojis
function getRelatedEmojis(currentEmoji, maxCount = 12) {
  const currentKeywords = new Set(currentEmoji.keywords || []);
  const candidates = emojiList.filter(e => e.slug !== currentEmoji.slug);

  // Score candidates
  const scored = candidates.map(e => {
    let score = 0;
    if (e.cat === currentEmoji.cat) score += 5;
    if (e.keywords) {
      e.keywords.forEach(k => {
        if (currentKeywords.has(k)) score += 3;
      });
    }
    return { emoji: e, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxCount).map(s => s.emoji);
}

// Generate single HTML page
function generatePage(emoji) {
  const { char, name, cat, code, shortcode, keywords, slug, catName } = emoji;
  const decEntity = getHtmlEntityDec(char);
  const hexEntity = getHtmlEntityHex(char);
  const utf8Hex = getUtf8Hex(char);
  const related = getRelatedEmojis(emoji, 12);
  const editorial = getEditorialMeaning(emoji);

  const pageTitle = `${char} ${escapeHtml(name)} Emoji — Copy &amp; Paste | FunEmojis`;
  const canonicalUrl = `https://funemojis.app/emoji/${slug}`;
  const metaDesc = `Copy and paste the ${escapeHtml(name)} Emoji (${char}) with 1-click. Codepoints (${escapeHtml(code)}), shortcode (${escapeHtml(shortcode)}), meaning, technical specs, and copy button for Instagram, TikTok, and Discord.`;

  const relatedHtml = related.map(rel => `
    <a href="/emoji/${rel.slug}" class="group p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition text-center flex flex-col items-center justify-center gap-1.5 active:scale-95">
      <span class="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">${rel.char}</span>
      <span class="text-[11px] font-medium text-slate-600 group-hover:text-indigo-600 truncate w-full px-1">${escapeHtml(rel.name)}</span>
    </a>
  `).join('');

  const keywordsPills = (keywords || []).map(kw => `
    <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">#${escapeHtml(kw)}</span>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow">

  <!-- OpenGraph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${char} ${escapeHtml(name)} Emoji — Copy &amp; Paste">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="FunEmojis.app">
  <meta property="og:image" content="https://funemojis.app/og-image.svg">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${char} ${escapeHtml(name)} Emoji — Copy &amp; Paste">
  <meta name="twitter:description" content="${metaDesc}">
  <meta name="twitter:image" content="https://funemojis.app/og-image.svg">

  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22 100 100%22><text y=%22.9em%22 font-size=%2290%22>${char}</text></svg>">
  <meta name="theme-color" content="#4f46e5">

  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css?v=2.2">

  <!-- Schema.org Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "${canonicalUrl}#webpage",
        "url": "${canonicalUrl}",
        "name": "${char} ${escapeHtml(name)} Emoji — Copy & Paste",
        "description": "${metaDesc}",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://funemojis.app/#website",
          "name": "FunEmojis.app",
          "url": "https://funemojis.app"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://funemojis.app/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Emoji List",
            "item": "https://funemojis.app/emoji-list"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "${escapeHtml(name)}",
            "item": "${canonicalUrl}"
          }
        ]
      },
      {
        "@type": "DefinedTerm",
        "name": "${char} ${escapeHtml(name)}",
        "termCode": "${escapeHtml(code)}",
        "inDefinedTermSet": "Unicode Standard",
        "description": "Unicode ${escapeHtml(name)} emoji (${char}) codepoint ${escapeHtml(code)} with shortcode ${escapeHtml(shortcode)}."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I copy and paste the ${escapeHtml(name)} Emoji?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Click the big 'Copy Emoji' button on this page to immediately copy ${char} to your clipboard, then paste it into Instagram, TikTok, Discord, WhatsApp, or any text box."
            }
          },
          {
            "@type": "Question",
            "name": "What is the Unicode codepoint and shortcode for ${escapeHtml(name)}?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Unicode codepoint is ${escapeHtml(code)} and the standard shortcode is ${escapeHtml(shortcode)}."
            }
          }
        ]
      }
    ]
  }
  </script>
</head>

<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">

  <!-- Header Navigation -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Brand Logo -->
      <a href="/" class="flex items-center gap-2.5 group" title="FunEmojis.app - Home">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
          ✨
        </div>
        <div>
          <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            FunEmojis<span class="text-slate-800">.app</span>
          </span>
          <span class="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest text-indigo-500 ml-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">
            Directory
          </span>
        </div>
      </a>

      <nav class="flex items-center gap-1.5 sm:gap-2">
        <a href="/" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition">
          ⌨️ Keyboard
        </a>
        <a href="/kaomoji" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition">
          🌸 Kaomoji
        </a>
        <a href="/emoji-list" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition">
          📑 Emojis List
        </a>
        <a href="/generator" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition">
          𝓕 Generator
        </a>
        <a href="/translator" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition">
          ✨ Combos
        </a>
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
    
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-slate-400 mb-6 flex-wrap" aria-label="Breadcrumb">
      <a href="/" class="hover:text-indigo-600 transition">Home</a>
      <span>/</span>
      <a href="/emoji-list" class="hover:text-indigo-600 transition">Emoji List</a>
      <span>/</span>
      <span class="text-slate-600">${escapeHtml(catName)}</span>
      <span>/</span>
      <span class="text-indigo-600 font-medium">${escapeHtml(name)}</span>
    </nav>

    <!-- Hero Card: Big Emoji + 1-Click Copy -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 mb-8 text-center relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-50 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Emoji Display -->
      <div class="relative inline-block mb-4">
        <button
          id="hero-copy-btn"
          class="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-slate-50 hover:bg-indigo-50/50 border-2 border-slate-200 hover:border-indigo-400 flex items-center justify-center text-7xl sm:text-8xl shadow-inner transition-all transform hover:scale-105 active:scale-95 cursor-pointer mx-auto group"
          title="Click to copy ${escapeHtml(name)} ${char}"
          data-copy="${escapeHtml(char)}"
        >
          <span class="select-none">${char}</span>
        </button>
        <span class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm pointer-events-none whitespace-nowrap">
          Click to Copy
        </span>
      </div>

      <!-- Name & Badge -->
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-4">
        ${char} ${escapeHtml(name)} Emoji
      </h1>
      <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
        Official Unicode emoji with shortcode <code class="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs">${escapeHtml(shortcode)}</code> and codepoint <code class="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs">${escapeHtml(code)}</code>.
      </p>

      <!-- Primary Action Buttons -->
      <div class="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6">
        <button
          class="copy-trigger-btn px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer"
          data-copy="${escapeHtml(char)}"
        >
          <span>📋</span> Copy ${char} Emoji
        </button>
        <button
          class="copy-trigger-btn px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          data-copy="${escapeHtml(shortcode)}"
          title="Copy shortcode ${escapeHtml(shortcode)}"
        >
          <span>💬</span> Copy Shortcode
        </button>
        <button
          class="copy-trigger-btn px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          data-copy="${escapeHtml(code)}"
          title="Copy Unicode codepoint ${escapeHtml(code)}"
        >
          <span>🔢</span> Copy Hex (${escapeHtml(code)})
        </button>
      </div>
    </div>

    <!-- Meaning & Editorial Guide -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 mb-8">
      <h2 class="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span>📖</span> What Does ${char} ${escapeHtml(name)} Mean?
      </h2>
      <div class="text-sm text-slate-600 leading-relaxed space-y-3">
        <p>${editorial}</p>
        <p>
          Whether you are posting a status update, sending a direct message, or styling your social media handle, this emoji works across all major platforms including Apple iOS, Google Android, Windows 11, macOS, Discord, Instagram, and WhatsApp.
        </p>
      </div>

      <!-- Keyword Tags -->
      <div class="mt-6 pt-5 border-t border-slate-100">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Related Search Tags</h3>
        <div class="flex flex-wrap gap-1.5">
          ${keywordsPills}
        </div>
      </div>
    </div>

    <!-- Technical Specifications Table -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 mb-8">
      <h2 class="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span>⚙️</span> Technical Specifications &amp; Codepoints
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full text-xs sm:text-sm text-left">
          <tbody class="divide-y divide-slate-100">
            <tr>
              <th class="py-3 px-3 font-semibold text-slate-500 w-1/3">Emoji Character</th>
              <td class="py-3 px-3 font-mono text-xl text-slate-900">${char}</td>
            </tr>
            <tr>
              <th class="py-3 px-3 font-semibold text-slate-500">Official Unicode Name</th>
              <td class="py-3 px-3 font-medium text-slate-900">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <th class="py-3 px-3 font-semibold text-slate-500">Unicode Codepoint</th>
              <td class="py-3 px-3 font-mono text-indigo-600 font-semibold">${escapeHtml(code)}</td>
            </tr>
            <tr>
              <th class="py-3 px-3 font-semibold text-slate-500">Shortcode</th>
              <td class="py-3 px-3 font-mono text-slate-800">${escapeHtml(shortcode)}</td>
            </tr>
            <tr>
              <th class="py-3 px-3 font-semibold text-slate-500">Category</th>
              <td class="py-3 px-3 font-medium text-slate-900">${escapeHtml(catName)}</td>
            </tr>
            <tr>
              <th class="py-3 px-3 font-semibold text-slate-500">HTML Entity (Decimal)</th>
              <td class="py-3 px-3 font-mono text-slate-700 select-all">${escapeHtml(decEntity)}</td>
            </tr>
            <tr>
              <th class="py-3 px-3 font-semibold text-slate-500">HTML Entity (Hex)</th>
              <td class="py-3 px-3 font-mono text-slate-700 select-all">${escapeHtml(hexEntity)}</td>
            </tr>
            <tr>
              <th class="py-3 px-3 font-semibold text-slate-500">UTF-8 Hex Bytes</th>
              <td class="py-3 px-3 font-mono text-slate-700 select-all">${escapeHtml(utf8Hex)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- How to Copy & Paste Guide -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 mb-8">
      <h2 class="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span>💡</span> How to Use &amp; Type ${char} ${escapeHtml(name)}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
          <h3 class="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <span>📱</span> iPhone &amp; Android
          </h3>
          <p>
            Tap the "Copy Emoji" button above, then tap and hold inside any messaging app, social bio, or caption and select <strong>Paste</strong>.
          </p>
        </div>
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
          <h3 class="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <span>💻</span> Windows PC &amp; Mac
          </h3>
          <p>
            Press <kbd class="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-xs">Win + .</kbd> on Windows or <kbd class="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-xs">Cmd + Ctrl + Space</kbd> on Mac, or simply click our 1-click copy button.
          </p>
        </div>
      </div>
    </div>

    <!-- Related Emojis -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>✨</span> Related Emojis in ${escapeHtml(catName)}
        </h2>
        <a href="/emoji-list" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          View All &rarr;
        </a>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        ${relatedHtml}
      </div>
    </div>

    <!-- CTA Banner to Full Keyboard -->
    <div class="rounded-3xl bg-gradient-to-r from-indigo-600 to-pink-600 p-8 text-white text-center shadow-lg mb-8">
      <h2 class="text-2xl font-extrabold mb-2">Explore 1,000+ Emojis &amp; Kaomoji</h2>
      <p class="text-sm text-indigo-100 max-w-md mx-auto mb-6">
        Search, filter, and combine thousands of emojis, aesthetic Japanese kaomoji text faces, and fancy bio fonts in one place.
      </p>
      <a href="/" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-indigo-600 font-bold text-sm shadow hover:bg-indigo-50 active:scale-95 transition">
        <span>⌨️</span> Open Emoji Keyboard
      </a>
    </div>

  </main>

  <!-- Footer -->
  <footer class="mt-auto border-t border-slate-200 bg-white">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
      <p>&copy; 2026 FunEmojis.app. All rights reserved. 1-Click Emoji Keyboard &amp; Directory.</p>
      <div class="flex flex-wrap gap-4">
        <a href="/" class="hover:text-indigo-600">Emoji Keyboard</a>
        <a href="/kaomoji" class="hover:text-indigo-600">Kaomoji</a>
        <a href="/emoji-list" class="hover:text-indigo-600">Emojis List</a>
        <a href="/generator" class="hover:text-indigo-600">Fancy Fonts</a>
        <a href="/translator" class="hover:text-indigo-600">Combos</a>
        <a href="/about.html" class="hover:text-indigo-600">About</a>
        <a href="/contact.html" class="hover:text-indigo-600">Contact</a>
        <a href="/privacy-policy.html" class="hover:text-indigo-600">Privacy Policy</a>
      </div>
    </div>
  </footer>

  <!-- Toast Notification Box -->
  <div id="toast" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl text-sm font-medium">
    <span id="toast-emoji">📋</span>
    <span id="toast-text">Copied to clipboard!</span>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const toast = document.getElementById('toast');
      const toastText = document.getElementById('toast-text');
      const toastEmoji = document.getElementById('toast-emoji');

      function copyText(val, label) {
        navigator.clipboard.writeText(val).then(() => {
          showToast(val, label);
        }).catch(() => {
          const ta = document.createElement('textarea');
          ta.value = val;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast(val, label);
        });
      }

      function showToast(val, label) {
        toastText.textContent = label ? \`Copied \${label}: \${val}\` : \`Copied: \${val}\`;
        toastEmoji.textContent = '✨';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      }

      // Hero button
      const heroBtn = document.getElementById('hero-copy-btn');
      if (heroBtn) {
        heroBtn.addEventListener('click', () => {
          copyText(heroBtn.dataset.copy, 'Emoji');
        });
      }

      // Other copy buttons
      document.querySelectorAll('.copy-trigger-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          copyText(btn.dataset.copy);
        });
      });
    });
  </script>
</body>
</html>`;
}

// Generate all pages
console.log(`Generating pages for ${emojiList.length} emojis...`);
let count = 0;
emojiList.forEach(emoji => {
  const html = generatePage(emoji);
  const filePath = path.join(OUTPUT_DIR, `${emoji.slug}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  count++;
});
console.log(`Successfully generated ${count} emoji HTML pages in /emoji/ directory!`);

// Generate updated sitemap.xml
console.log('Generating sitemap.xml with core pages and all emoji pages...');

const today = new Date().toISOString().split('T')[0];

const coreUrls = [
  { loc: 'https://funemojis.app/', priority: '1.00', changefreq: 'daily' },
  { loc: 'https://funemojis.app/kaomoji', priority: '0.95', changefreq: 'daily' },
  { loc: 'https://funemojis.app/emoji-list', priority: '0.95', changefreq: 'daily' },
  { loc: 'https://funemojis.app/generator', priority: '0.90', changefreq: 'daily' },
  { loc: 'https://funemojis.app/translator', priority: '0.90', changefreq: 'daily' },
  { loc: 'https://funemojis.app/about.html', priority: '0.70', changefreq: 'monthly' },
  { loc: 'https://funemojis.app/contact.html', priority: '0.70', changefreq: 'monthly' },
  { loc: 'https://funemojis.app/privacy-policy.html', priority: '0.60', changefreq: 'monthly' },
  { loc: 'https://funemojis.app/terms-of-service.html', priority: '0.60', changefreq: 'monthly' }
];

const emojiUrls = emojiList.map(e => ({
  loc: `https://funemojis.app/emoji/${e.slug}`,
  priority: (e.cat === 'smileys' || e.cat === 'symbols' || e.name.includes('Heart') || e.name.includes('Skull') || e.name.includes('Fire')) ? '0.85' : '0.75',
  changefreq: 'weekly'
}));

function buildSitemapXml(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
              http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

// Write complete combined sitemap.xml
const fullSitemapXml = buildSitemapXml([...coreUrls, ...emojiUrls]);
fs.writeFileSync(SITEMAP_PATH, fullSitemapXml, 'utf8');
console.log(`Updated sitemap.xml with ${coreUrls.length + emojiUrls.length} total URLs.`);

// Also write dedicated sitemap-emojis.xml
const emojiOnlySitemapXml = buildSitemapXml(emojiUrls);
fs.writeFileSync(SITEMAP_EMOJIS_PATH, emojiOnlySitemapXml, 'utf8');
console.log(`Generated sitemap-emojis.xml with ${emojiUrls.length} emoji URLs.`);
