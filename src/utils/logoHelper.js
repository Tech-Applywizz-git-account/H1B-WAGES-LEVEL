/**
 * Resilience-First Company Logo Resolver.
 * Uses official CDNs and Wikipedia for 100% uptime, bypassing blocked 3rd party domains.
 * Optimized for a 100% clean console by providing silent fallbacks.
 */
export const getCompanyLogo = (companyName) => {
    if (!companyName) return null;

    const company = companyName.trim()
        .replace(/^the\s+/i, '')
        .split(' (')[0]
        .split(' - ')[0]
        .split(' / ')[0]
        .split(', ')[0]
        .split(' & ')[0]
        .split(' AT ')[0]
        .trim();

    const lc = company.toLowerCase();

    // ── MAJOR SPONSORS: Using official non-blocked CDNs ──────────────────────
    const officialLogos = {
        'google': 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png',
        'microsoft': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
        'amazon': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        'meta': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
        'facebook': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg',
        'apple': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
        'netflix': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
        'tesla': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
        'uber': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
        'ford': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg',
        'geico': 'https://upload.wikimedia.org/wikipedia/commons/0/03/Geico_logo.svg',
        'american express': 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg',
        'capital one': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Capital_One_logo.svg',
        'anthropic': 'https://www.anthropic.com/favicon.ico',
        'openai': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
        'cisco': 'https://upload.wikimedia.org/wikipedia/commons/6/64/Cisco_logo.svg',
        'visa': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
        'vanguard': 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Vanguard_logo.svg',
        'klaviyo': 'https://upload.wikimedia.org/wikipedia/commons/2/22/Klaviyo_logo.svg',
        'agoda': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Agoda_logo.svg',
        'monzo': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Monzo_logo.svg',
        'ups': 'https://upload.wikimedia.org/wikipedia/commons/b/b0/United_Parcel_Service_logo_2014.svg',
        'etsy': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg',
        'bayer': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Bayer-cross.svg',
        'cdk global': 'https://www.cdkglobal.com/favicon.ico',
        'bill.com': 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Bill.com_logo.svg',
        'zania': 'https://zania.ai/apple-touch-icon.png',
        'verkada': 'https://www.verkada.com/favicon.ico',
        'hirenza': 'https://hirenza.in/apple-touch-icon.png',
        'latitude ai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Latitude_AI_Logo.png/512px-Latitude_AI_Logo.png',
        'palo alto networks': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/PaloAltoNetworks_2020_Logo.svg/512px-PaloAltoNetworks_2020_Logo.svg.png',
        'university of pittsburgh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/University_of_Pittsburgh_wordmark.png/512px-University_of_Pittsburgh_wordmark.png',
        'zurich north america': 'https://www.google.com/s2/favicons?domain=zurichna.com&sz=128&default=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fc%2Fca%2F1x1.png',
        'bright vision technologies': 'https://www.google.com/s2/favicons?domain=bvteck.com&sz=128&default=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fc%2Fca%2F1x1.png',
        'kohler ventures': 'https://www.google.com/s2/favicons?domain=kohler.com&sz=128&default=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fc%2Fca%2F1x1.png'
    };

    // ── DOMAIN CORRECTIONS: For companies where the guessing logic fails ────────
    const domainCorrections = {
        'hirenza': 'hirenza.in',
        'palo alto networks': 'paloaltonetworks.com',
        'university of pittsburgh': 'pitt.edu',
        'latitude ai': 'latitude.ai',
        'zurich north america': 'zurichna.com'
    };

    if (officialLogos[lc]) return officialLogos[lc];
    for (const [key, url] of Object.entries(officialLogos)) {
        if (lc.includes(key)) return url;
    }

    // ── DYNAMIC FALLBACK: Use Google Favicon Service (Resilient & Globally Accessible) ──
    const noisyWords = ['inc', 'corp', 'ltd', 'llc', 'group', 'services', 'systems', 'consulting', 'solutions'];
    const suffixRegex = new RegExp(`\\s+(${noisyWords.join('|')})`, 'gi');

    // Check corrections first for domain guessing
    if (domainCorrections[lc]) {
        const silentFallback = encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png');
        return `https://www.google.com/s2/favicons?domain=${domainCorrections[lc]}&sz=128&default=${silentFallback}`;
    }

    let domainGuess = company.toLowerCase().replace(suffixRegex, '').replace(/[^a-z0-9]/g, '').trim();
    if (!domainGuess || domainGuess.length < 2) return null;

    // Use Google's service with a BLANK PIXEL as default to avoid 404 logs.
    const silentFallback = encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png');
    return `https://www.google.com/s2/favicons?domain=${domainGuess}.com&sz=128&default=${silentFallback}`;
};
