/**
 * server.js
 * ─────────────────────────────────────────────────────────────
 * The Fifth Element backend:
 *  - Static file serving
 *  - REST CRUD for all content (backed by Firebase Realtime DB)
 * ─────────────────────────────────────────────────────────────
 */

// Load .env for local dev. dotenv is a no-op when vars are already in the environment.
try { require('dotenv').config(); } catch (_) {}

const express   = require('express');
const path      = require('path');
const admin     = require('firebase-admin');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Firebase Realtime Database ──────────────────────────────── */
// Uses application default credentials when deployed, or falls
// back to unauthenticated REST if no service-account JSON is set.
let db;
try {
    let credential = null;
    
    // Only use Application Default Credentials when deployed (e.g. on Vercel)
    if (process.env.VERCEL) {
        credential = admin.credential.applicationDefault();
    }
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(serviceAccount);
        } catch (e) {
            console.warn('  ⚠ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e.message);
        }
    }

    if (credential) {
        if (!admin.apps.length) {
            admin.initializeApp({
                databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://punktuate-default-rtdb.firebaseio.com',
                credential: credential,
            });
        }
        db = admin.database();
        console.log('  ✓ Firebase Admin connected');
    } else {
        console.warn('  ⚠ No credentials provided, falling back to REST API');
        db = null;
    }
} catch (err) {
    console.warn('  ⚠ Firebase Admin unavailable, falling back to REST:', err.message);
    db = null;
}

/* ── Firebase helpers (REST fallback when Admin SDK unavailable) */
const FB_URL = (process.env.FIREBASE_DATABASE_URL || 'https://punktuate-default-rtdb.firebaseio.com').replace(/\/$/, '');

// Wraps fetch with a timeout so Firebase REST calls don't hang forever locally
async function fetchWithTimeout(url, options = {}, ms = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        return res;
    } finally {
        clearTimeout(timer);
    }
}

async function fbRead(collection) {
    if (db) {
        const snap = await db.ref(collection).once('value');
        const val  = snap.val();
        if (!val) return [];
        // Firebase stores objects keyed by push-ID; convert to array
        return Object.entries(val).map(([key, v]) => ({ _fbKey: key, ...v }));
    }
    // Unauthenticated REST (works when Firebase rules allow read)
    const res  = await fetchWithTimeout(`${FB_URL}/${collection}.json`);
    const val  = await res.json();
    if (!val) return [];
    if (val.error) throw new Error(`Firebase REST error: ${val.error}`);
    return Object.entries(val).map(([key, v]) => ({ _fbKey: key, ...v }));
}

async function fbPush(collection, data) {
    if (db) {
        const ref = await db.ref(collection).push(data);
        return { _fbKey: ref.key, ...data };
    }
    const res  = await fetchWithTimeout(`${FB_URL}/${collection}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.error) throw new Error(`Firebase REST error: ${json.error}`);
    return { _fbKey: json.name, ...data };
}

async function fbSet(collection, fbKey, data) {
    if (db) {
        await db.ref(`${collection}/${fbKey}`).set(data);
        return data;
    }
    const res = await fetchWithTimeout(`${FB_URL}/${collection}/${fbKey}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.error) throw new Error(`Firebase REST error: ${json.error}`);
    return data;
}

async function fbDelete(collection, fbKey) {
    if (db) {
        await db.ref(`${collection}/${fbKey}`).remove();
        return;
    }
    const res = await fetchWithTimeout(`${FB_URL}/${collection}/${fbKey}.json`, { method: 'DELETE' });
    const json = await res.json();
    if (json && json.error) throw new Error(`Firebase REST error: ${json.error}`);
    return;
}

async function fbBulkSave(collection, items) {
    if (db) {
        await db.ref(collection).set(null);
        for (const item of items) {
            await db.ref(collection).push(item);
        }
    } else {
        await fetchWithTimeout(`${FB_URL}/${collection}.json`, { method: 'DELETE' });
        for (const item of items) {
            await fetchWithTimeout(`${FB_URL}/${collection}.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
        }
    }
}


/* ── Middleware ─────────────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Static files
app.use(express.static(path.join(__dirname)));

/* ── Content CRUD routes ─────────────────────────────────────── */
const COLLECTIONS = ['influencers', 'founders', 'faces', 'careers', 'announcements', 'journals'];

COLLECTIONS.forEach(name => {

    // GET /api/:collection  — list all
    app.get(`/api/${name}`, async (req, res) => {
        try {
            const items = await fbRead(name);
            res.json(items);
        } catch (err) {
            console.error(`GET /api/${name}:`, err.message);
            res.status(500).json({ error: 'Failed to read data', detail: err.message });
        }
    });

    // POST /api/:collection  — create
    app.post(`/api/${name}`, async (req, res) => {
        try {
            const data    = { id: Date.now().toString(36) + Math.random().toString(36).slice(2), ...req.body };
            const created = await fbPush(name, data);
            res.status(201).json(created);
        } catch (err) {
            console.error(`POST /api/${name}:`, err.message);
            res.status(500).json({ error: 'Failed to save data', detail: err.message });
        }
    });

    // PUT /api/:collection/:id  — update by logical id field (upsert supported)
    app.put(`/api/${name}/:id`, async (req, res) => {
        try {
            const items  = await fbRead(name);
            const item   = items.find(i => i.id === req.params.id || i._fbKey === req.params.id);
            
            if (item) {
                const updated = { ...item, ...req.body };
                await fbSet(name, item._fbKey, updated);
                res.json(updated);
            } else {
                // Item not found in DB — this often happens with hardcoded "default" items.
                // We perform an "upsert" by creating it now.
                const data = { ...req.body };
                if (!data.id) data.id = req.params.id; // ensure logical ID is kept
                const created = await fbPush(name, data);
                res.status(201).json(created);
            }
        } catch (err) {
            console.error(`PUT /api/${name}/${req.params.id}:`, err.message);
            res.status(500).json({ error: 'Failed to update data', detail: err.message });
        }
    });

    // DELETE /api/:collection/:id
    app.delete(`/api/${name}/:id`, async (req, res) => {
        try {
            const items = await fbRead(name);
            const item  = items.find(i => i.id === req.params.id || i._fbKey === req.params.id);
            // If item not found in Firebase, it's a frontend-only default — treat as already deleted
            if (!item) return res.json({ success: true, note: 'Item was not in database (default data)' });
            await fbDelete(name, item._fbKey);
            res.json({ success: true });
        } catch (err) {
            console.error(`DELETE /api/${name}/${req.params.id}:`, err.message);
            res.status(500).json({ error: 'Failed to delete data', detail: err.message });
        }
    });

    // PUT /api/:collection  — replace entire collection (bulk save from admin)
    app.put(`/api/${name}`, async (req, res) => {
        try {
            const items = Array.isArray(req.body) ? req.body : [];
            await fbBulkSave(name, items);
            res.json({ success: true, count: items.length });
        } catch (err) {
            console.error(`PUT /api/${name} (bulk):`, err.message);
            res.status(500).json({ error: 'Failed to save collection', detail: err.message });
        }
    });
});



// Removed SPA fallback to prevent intercepting static file 404s on Vercel

/* ── Database Seeding ────────────────────────────────────────── */
async function seedDatabaseIfEmpty() {
    if (!db && !FB_URL) {
        console.warn('  ⚠ Firebase database URL is not configured. Seeding skipped.');
        return;
    }
    console.log('  ✦ Seeding database if empty...');
    
    const seedData = {
        influencers: [
            {
                id: '1',
                name: 'Vartika Vashista',
                username: 'vartikavashista',
                followers: '50K',
                bio: 'Fashion & lifestyle influencer based in Mumbai',
                link: 'https://instagram.com/vartikavashista',
                image: 'Influencers/Vartika Vashista/Vartika.jpeg',
                platform: 'Instagram'
            },
            {
                id: '2',
                name: 'Aditi Fadtare',
                username: 'aditifadtare',
                followers: '35K',
                bio: 'Content creator & digital marketer',
                link: 'https://instagram.com/aditifadtare',
                image: 'Influencers/Aditi Fadtare/Aditi.jpeg',
                platform: 'Instagram'
            },
            {
                id: '3',
                name: 'Dhanshri Dake',
                username: 'dhanshridake',
                followers: '28K',
                bio: 'Lifestyle & travel influencer',
                link: 'https://instagram.com/dhanshridake',
                image: 'Influencers/Dhanshri Dake/Dhanashri.jpeg',
                platform: 'Instagram'
            },
            {
                id: '4',
                name: 'Osbert Dsouza',
                username: 'osbertdsouza',
                followers: '42K',
                bio: 'Fitness & wellness content creator',
                link: 'https://instagram.com/osbertdsouza',
                image: 'Influencers/Osbert Dsouza/Osbert.jpeg',
                platform: 'Instagram'
            },
            {
                id: '5',
                name: 'Shruti Dange',
                username: 'shrutidange',
                followers: '38K',
                bio: 'Beauty & fashion influencer',
                link: 'https://instagram.com/shrutidange',
                image: 'Influencers/Shruti Dange/Shruti Dange.jpeg',
                platform: 'Instagram'
            }
        ],
        founders: [
            {
                id: '1',
                name: 'Arya Pawar',
                title: 'Founder, The Fifth Element',
                image: 'aryapic.png'
            }
        ],
        careers: [
            {
                id: '1',
                position: 'Graphic Designer',
                email: 'aryapawar@thefifthelement.in'
            },
            {
                id: '2',
                position: 'Video Editor',
                email: 'aryapawar@thefifthelement.in'
            }
        ],
        journals: [
            {
                id: '1',
                title: 'Why Most Influencer Campaigns Fail.',
                readTime: '3 min read',
                description: '(And how we fix broken execution)',
                link: 'influencer-campaigns-fail.html',
                image: ''
            },
            {
                id: '2',
                title: "Creators Don't Miss Deadlines. Systems Do.",
                readTime: '4 min read',
                description: '(Building reliability at scale)',
                link: 'systems-not-creators.html',
                image: ''
            },
            {
                id: '3',
                title: 'Virality is Luck. Consistency is Strategy.',
                readTime: '3 min read',
                description: '(Why brands should stop chasing trends)',
                link: 'consistency-over-virality.html',
                image: ''
            }
        ]
    };

    for (const [collection, defaults] of Object.entries(seedData)) {
        try {
            const currentItems = await fbRead(collection);
            // Always overwrite founders and faces to ensure correct branding
            if (collection === 'founders' || collection === 'faces' || currentItems.length === 0) {
                console.log(`  → Seeding ${collection}...`);
                // Wipe existing data
                if (db) {
                    await db.ref(collection).set(null);
                } else {
                    await fetchWithTimeout(`${FB_URL}/${collection}.json`, { method: 'DELETE' });
                }
                // Seed new data
                for (const item of defaults) {
                    await fbPush(collection, item);
                }
                console.log(`  ✓ Seeded ${defaults.length} items to ${collection}`);
            } else {
                console.log(`  → ${collection} already has ${currentItems.length} items, skipping seed.`);
            }
        } catch (err) {
            console.error(`  ⚠ Failed to check/seed ${collection}:`, err.message);
        }
    }
}

// Run database seeding asynchronously
seedDatabaseIfEmpty().catch(err => console.error('  ⚠ Seeding error:', err.message));

/* ── Start (local dev only — Vercel uses module.exports) ─────── */
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n  ✦ THE FIFTH ELEMENT server`);
        console.log(`  → http://localhost:${PORT}`);
        console.log(`  → Firebase: ${process.env.FIREBASE_DATABASE_URL}\n`);
    });
}

// Export for Vercel serverless
module.exports = app;
