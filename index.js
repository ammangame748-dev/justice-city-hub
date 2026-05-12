const express = require('express');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const app = express();
puppeteer.use(StealthPlugin());

// الإعدادات الأساسية
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ================= DATABASE =================
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hsamhmaydh4_db_user:xls5Av4Nr4a5PA7W@cluster0.wjnh8d0.mongodb.net/BlackListDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ متصل بالداتابيز بنجاح'))
    .catch(err => console.error('❌ خطأ في الاتصال بالداتابيز:', err));

// ================= MODELS =================
const Streamer = mongoose.model('KickConfig', new mongoose.Schema({
    kickUsername: String,
    twitterUrl: { type: String, default: '' },
    isLive: { type: Boolean, default: false },
    viewers: { type: Number, default: 0 },
    profilePic: String
}));

const Application = mongoose.model('Application', new mongoose.Schema({
    kickUsername: String,
    discordName: String,
    status: { type: String, default: 'pending' }
}));

// ================= PUPPETEER UPDATE FUNCTION (سريع وموفر للرام) =================
async function updateStatus() {
    console.log("🚀 جاري التحديث السريع عبر المتصفح...");
    const streamers = await Streamer.find({});
    if (streamers.length === 0) return;

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
                '--single-process'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
        });

        const page = await browser.newPage();

        // منع تحميل الصور والستايلات لتسريع العملية 10 أضعاف
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        for (const streamer of streamers) {
            try {
                const cleanName = streamer.kickUsername.trim().toLowerCase();
                // تصحيح الرابط بإضافة /
                await page.goto(`https://kick.com{cleanName}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

                // انتظر ثانيتين فقط بدل 7 (الصفحة الآن خفيفة جداً)
                await new Promise(r => setTimeout(r, 2000));

                const statusData = await page.evaluate(() => {
                    // الكشف عن حالة البث بطريقة أسرع
                    const isLive = document.body.innerText.includes('LIVE') || !!document.querySelector('.bg-red-600');

                    // جلب عدد المشاهدين
                    const viewersEl = document.querySelector('span[class*="viewer-count"]') || document.querySelector('.v-live-indicator');
                    let vCount = 0;
                    if (viewersEl) {
                        vCount = parseInt(viewersEl.innerText.replace(/[^0-9]/g, '')) || 0;
                    }

                    return { isLive: isLive, viewers: vCount };
                });

                await Streamer.updateOne(
                    { _id: streamer._id },
                    {
                        $set: {
                            isLive: statusData.isLive,
                            viewers: statusData.viewers
                        }
                    }
                );
                console.log(`✅ ${cleanName} | بث: ${statusData.isLive} | مشاهدين: ${statusData.viewers}`);

            } catch (err) {
                console.error(`❌ خطأ في ${streamer.kickUsername}:`, err.message);
            }
        }
    } catch (error) {
        console.error("❌ خطأ متصفح رئيسي:", error.message);
    } finally {
        if (browser) await browser.close();
    }
}

// تحديث كل 5 دقائق
setInterval(updateStatus, 300000);
updateStatus();

// ================= ROUTES =================

app.get('/', async (req, res) => {
    try {
        const streamersData = await Streamer.find({}).sort({ isLive: -1, viewers: -1 }) || [];
        const stats = {
            totalStreamers: streamersData.length || 0,
            liveNow: streamersData.filter(s => s.isLive).length || 0,
            totalViewers: streamersData.reduce((a, b) => a + (b.viewers || 0), 0) || 0
        };
        res.render('index', { streamers: streamersData, services: streamersData, stats: stats });
    } catch (err) {
        res.status(500).send("Error loading home page");
    }
});

app.post('/apply', async (req, res) => {
    try {
        const { kickUser, discordName } = req.body;
        const clean = kickUser.trim();
        await Application.create({ kickUsername: clean, discordName });
        res.send("<script>alert('✅ تم إرسال طلبك!'); window.location='/';</script>");
    } catch (err) { res.status(500).send("Error applying"); }
});

app.get('/admin-justice', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌");
    const apps = await Application.find({ status: 'pending' });
    const streamers = await Streamer.find({});
    res.render('admin', { apps, streamers });
});

app.get('/admin/accept/:id', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌");
    const appData = await Application.findByIdAndDelete(req.params.id);
    if (appData) {
        await Streamer.updateOne({ kickUsername: appData.kickUsername }, { $set: { kickUsername: appData.kickUsername } }, { upsert: true });
    }
    res.redirect('/admin-justice?pass=1234');
});

app.post('/admin/update-twitter/:id', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌");
    await Streamer.findByIdAndUpdate(req.params.id, { twitterUrl: req.body.twitterUrl });
    res.redirect('/admin-justice?pass=1234');
});

app.get('/admin/delete-streamer/:id', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌");
    await Streamer.findByIdAndDelete(req.params.id);
    res.redirect('/admin-justice?pass=1234');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 السيرفر يعمل على: ${PORT}`));
