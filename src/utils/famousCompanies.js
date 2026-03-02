// src/utils/famousCompanies.js
// A curated list of top/famous H1B sponsoring companies for prioritization.
// Based on volume and brand recognition.

export const FAMOUS_COMPANIES = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Facebook', 'Apple', 'Netflix', 'Tesla', 'NVIDIA',
    'Adobe', 'Oracle', 'Salesforce', 'Intel', 'IBM', 'Cisco', 'Uber', 'Lyft', 'Airbnb', 'PayPal',
    'LinkedIn', 'Twitter', 'TikTok', 'Spotify', 'Shopify', 'Twilio', 'Zoom', 'Slack',
    'JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Bank of America', 'Wells Fargo', 'Citigroup', 'Visa', 'Mastercard', 'American Express',
    'Deloitte', 'Ernst & Young', 'EY', 'PricewaterhouseCoopers', 'PwC', 'KPMG', 'Accenture',
    'Tata Consultancy', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'HCL', 'Capgemini',
    'Walmart', 'Target', 'The Walt Disney', 'Disney', 'Nike', 'Starbucks', 'Pepsi', 'Coca-Cola',
    'Boeing', 'SpaceX', 'Lockheed Martin', 'Ford', 'General Motors', 'Pfizer', 'Johnson & Johnson',
    'Intuit', 'Stripe', 'ServiceNow', 'Workday', 'Block', 'Square', 'Snap', 'Pinterest', 'Reddit',
    'Dropbox', 'Coinbase', 'Robinhood', 'Wayfair', 'Zillow', 'Expedia'
];

/**
 * Checks if a company name matches any in the famous list.
 * Case-insensitive "contains" matching.
 */
export const isFamous = (name) => {
    if (!name) return false;
    const n = name.toLowerCase();
    return FAMOUS_COMPANIES.some(f => {
        const famousLower = f.toLowerCase();
        // Use word boundaries or exact matches for short strings to avoid false positives
        if (famousLower.length <= 3) {
            const regex = new RegExp(`\\b${famousLower}\\b`, 'i');
            return regex.test(n);
        }
        return n.includes(famousLower);
    });
};
