const express = require('express');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// ✅ تم إزالة مكتبة Pusher لأنها تسبب الخطأ ولست بحاجة لها مع وجود دالة التحديث الدوري
const app = express();

puppeteer.use(StealthPlugin());

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// ================= DATABASE =================
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hsamhmaydh4_db_user:xls5Av4Nr4a5PA7W@cluster0.wjnh8d0.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ متصل بالداتابيز بنجاح'))
  .catch(err => console.error('❌ خطأ في الاتصال:', err));

// ================= MODELS =================
const Streamer = mongoose.model('KickConfig', new mongoose.Schema({
  kickUsername: String,
  isLive: { type: Boolean, default: false },
  viewers: { type: Number, default: 0 },
  profilePic: String
}));

const Application = mongoose.model('Application', new mongoose.Schema({
  kickUsername: String,
  discordName: String,
  status: { type: String, default: 'pending' }
}));

async function updateStatus() {
  console.log("🔄 جاري التحديث...");
  const streamers = await Streamer.find({});
  if (streamers.length === 0) return;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });

    const page = await browser.newPage();
    // إعداد User Agent ليبدو كمتصفح حقيقي
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    for (const streamer of streamers) {
      try {
        const cleanName = streamer.kickUsername.trim().toLowerCase();
        await page.goto(`https://kick.com/${cleanName}`, { waitUntil: 'networkidle2', timeout: 60000 });

        // انتظر قليلاً لتحميل محتوى الـ React
        await new Promise(r => setTimeout(r, 5000));

        const statusData = await page.evaluate(() => {
          // 1. فحص هل يوجد كلمة "LIVE" في الصفحة داخل حاوية البث
          const liveBadge = document.querySelector('.v-live-indicator') || 
                            document.querySelector('.bg-red-600') || // غالباً لون علامة اللايف أحمر
                            document.body.innerText.includes('LIVE');

          // 2. محاولة جلب عدد المشاهدين
          const viewersEl = document.querySelector('.v-live-indicator__viewer-count') || 
                            document.querySelector('.viewer-count span');
          
          // 3. جلب صورة البروفايل (لأنك قلت أنها لا تظهر)
          const imgEl = document.querySelector('img[alt*="Avatar"]') || 
                        document.querySelector('.profile-picture img');

          let vCount = 0;
          if (viewersEl) {
              vCount = parseInt(viewersEl.innerText.replace(/[^0-9]/g, '')) || 0;
          }

          return { 
            isLive: !!liveBadge && vCount > 0, // إذا في علامة لايف ومشاهدات أكثر من 0
            viewers: vCount,
            profilePic: imgEl ? imgEl.src : null
          };
        });

        await Streamer.updateOne(
          { _id: streamer._id },
          { $set: { 
              isLive: statusData.isLive, 
              viewers: statusData.viewers,
              profilePic: statusData.profilePic || streamer.profilePic // احتفظ بالقديمة إذا لم يجد جديدة
          }}
        );
        console.log(`✅ ${cleanName} | لايف: ${statusData.isLive} | صورة: ${!!statusData.profilePic}`);

      } catch (err) {
        console.error(`❌ خطأ في فحص ${streamer.kickUsername}:`, err.message);
      }
    }
  } catch (error) {
    console.error("❌ خطأ متصفح:", error.message);
  } finally {
    if (browser) await browser.close();
  }
}



// تحديث كل 3 دقائق (180000 مللي ثانية)
setInterval(updateStatus,300000);

// تشغيل الفحص فور تشغيل السيرفر
updateStatus();

// ================= ROUTES =================
app.get('/', async (req, res) => {
  const streamers = await Streamer.find({}).sort({ isLive: -1, viewers: -1 });
  const stats = {
    totalStreamers: streamers.length,
    liveNow: streamers.filter(s => s.isLive).length,
    totalViewers: streamers.reduce((a, b) => a + (b.viewers || 0), 0)
  };
  res.render('index', { streamers, stats });
});
// راوت لرفض الطلبات
app.get('/admin/reject/:id', async (req, res) => {
  if (req.query.pass !== "1234") return res.status(403).send("❌ غير مصرح");
  await Application.findByIdAndDelete(req.params.id);
  res.redirect('/admin-justice?pass=1234');
});

// راوت لطرد/حذف ستريمر موجود أصلاً
app.get('/admin/delete-streamer/:id', async (req, res) => {
  if (req.query.pass !== "1234") return res.status(403).send("❌ غير مصرح");
  await Streamer.findByIdAndDelete(req.params.id);
  res.redirect('/admin-justice?pass=1234');
});

app.post('/apply', async (req, res) => {
  const { kickUser, discordName } = req.body;
  if (!kickUser) return res.send("الاسم مطلوب");
  const clean = kickUser.trim();
  await Application.deleteMany({ kickUsername: clean });
  await Application.create({ kickUsername: clean, discordName });
  res.send("<script>alert('✅ تم إرسال طلبك!'); window.location='/';</script>");
});

app.get('/admin-justice', async (req, res) => {
  if (req.query.pass !== "1234") return res.status(403).send("❌ غير مصرح");
  const apps = await Application.find({ status: 'pending' });
  const streamers = await Streamer.find({});
  res.render('admin', { apps, streamers });
});

app.get('/admin/accept/:id', async (req, res) => {
  const appData = await Application.findByIdAndDelete(req.params.id);
  if (appData) {
    await Streamer.updateOne(
      { kickUsername: appData.kickUsername },
      { $set: { kickUsername: appData.kickUsername } },
      { upsert: true }
    );
    // ✅ حذفنا استدعاء updateStatus من هنا لحماية السيرفر من الانهيار
  }
  res.redirect('/admin-justice?pass=1234');
});

// ✅ راوت رفض طلبات الانضمام
app.get('/admin/reject/:id', async (req, res) => {
  if (req.query.pass !== "1234") return res.status(403).send("❌ غير مصرح");
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.redirect('/admin-justice?pass=1234');
  } catch (err) {
    res.send("خطأ في الحذف: " + err.message);
  }
});

// ✅ راوت طرد/حذف ستريمر موجود بالموقع
app.get('/admin/delete-streamer/:id', async (req, res) => {
  if (req.query.pass !== "1234") return res.status(403).send("❌ غير مصرح");
  try {
    await Streamer.findByIdAndDelete(req.params.id);
    res.redirect('/admin-justice?pass=1234');
  } catch (err) {
    res.send("خطأ في الحذف: " + err.message);
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 السيرفر شغال بنجاح على المنفذ ${PORT}`);
});
