<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم | Black List</title>
    <link rel="icon" type="image/png" href="/black.png">
    <link rel="stylesheet" href="/style.css">
</head>

<body style="padding: 40px 10%;">

    <div class="animated-bg"></div>

    <header style="text-align: center; margin-bottom: 50px;">
        <h1 style="color: var(--neon-blue); text-shadow: 0 0 15px var(--neon-blue);">لوحة عدالة بلاك ليست</h1>
        <p style="color: #888;">إدارة طلبات الانضمام والستريمرز الحاليين</p>
    </header>

    <!-- قسم طلبات الانضمام الجديدة -->
    <section>
        <h2 style="color: #fff; border-right: 4px solid var(--neon-blue); padding-right: 15px;">طلبات معلقة (<%= apps.length %>)</h2>
        <div class="cards-grid" style="grid-template-columns: 1fr;">
            <% if (apps.length === 0) { %>
                <p style="color: #555; text-align: center;">لا توجد طلبات جديدة حالياً...</p>
            <% } %>
            <% apps.forEach(app => { %>
                <div class="card" style="height: 80px; border-color: #ffcc00;">
                    <div class="card-content" style="flex-direction: row; display: flex; justify-content: space-around; width: 100%; align-items: center;">
                        <div style="text-align: right;">
                            <h3 style="font-size: 20px;"><%= app.kickUsername %></h3>
                            <small style="color: #888;">ديسكورد: <%= app.discordName %></small>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <a href="/admin/accept/<%= app._id %>?pass=1234" class="watch-btn" style="background: #53fc18;">✅ قبول</a>
                            <a href="/admin/reject/<%= app._id %>?pass=1234" class="watch-btn" style="background: #ff4b4b; color: white;">❌ رفض</a>
                        </div>
                    </div>
                </div>
            <% }) %>
        </div>
    </section>

    <hr style="margin: 50px 0; border: 0; border-top: 1px solid #222;">

    <!-- قسم إدارة الستريمرز الحاليين -->
    <section>
        <h2 style="color: #fff; border-right: 4px solid #ff4b4b; padding-right: 15px;">إدارة الستريمرز الحاليين</h2>
        <div class="cards-grid" style="grid-template-columns: 1fr;">
            <% streamers.forEach(s => { %>
                <div class="card" style="min-height: 100px; height: auto; border-color: var(--neon-blue); padding: 15px 0;">
                    <div class="card-content" style="flex-direction: row; display: flex; justify-content: space-around; width: 100%; align-items: center; flex-wrap: wrap; gap: 15px;">
                        
                        <!-- معلومات الستريمر -->
                        <div style="display: flex; align-items: center; gap: 15px; min-width: 200px;">
                            <img src="<%= s.profilePic || '/black.png' %>" style="width: 50px; height: 50px; border-radius: 50%; border: 1px solid var(--neon-blue);">
                            <h3 style="font-size: 20px;"><%= s.kickUsername %></h3>
                        </div>

                        <!-- إضافة/تعديل تويتر -->
                        <form action="/admin/update-twitter/<%= s._id %>?pass=1234" method="POST" style="display: flex; gap: 8px;">
                            <input type="text" name="twitterUrl" value="<%= s.twitterUrl || '' %>" placeholder="رابط تويتر (X)" 
                                   style="background: #111; color: white; border: 1px solid var(--neon-blue); border-radius: 6px; padding: 6px 12px; font-size: 13px; width: 200px;">
                            <button type="submit" style="background: var(--neon-blue); color: black; border: none; border-radius: 6px; cursor: pointer; padding: 6px 15px; font-weight: bold;">💾 حفظ</button>
                        </form>

                        <!-- زر الطرد -->
                        <a href="/admin/delete-streamer/<%= s._id %>?pass=1234" class="watch-btn"
                            style="background: #333; color: #ff4b4b; border: 1px solid #ff4b4b;"
                            onclick="return confirm('هل أنت متأكد من طرد هذا الستريمر؟')">🗑️ طرد</a>
                    </div>
                </div>
            <% }) %>
        </div>
    </section>

    <div style="text-align: center; margin-top: 50px;">
        <a href="/" style="color: var(--neon-blue); text-decoration: none;">← العودة للموقع الرئيسي</a>
    </div>

</body>
</html>
