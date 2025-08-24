import telebot
import yt_dlp
import os

# التوكن و الايدي
TOKEN = "8245302373:AAHguRRl4DFhQwyhLuvfoumH10lL1KiZ8Lk"
OWNER_ID = 1846035771
bot = telebot.TeleBot(TOKEN)

# مسار التخزين المؤقت
DOWNLOAD_PATH = "downloads"
if not os.path.exists(DOWNLOAD_PATH):
    os.makedirs(DOWNLOAD_PATH)

# أمر start
@bot.message_handler(commands=['start'])
def start(message):
    if message.chat.id == OWNER_ID:
        bot.reply_to(message, "🚀 أهلا حكيم! البوت جاهز للتحميل من أي موقع ✅\nارسل الرابط فقط.")
    else:
        bot.reply_to(message, "🚫 انت مش صاحب البوت")

# استقبال أي رابط
@bot.message_handler(func=lambda m: m.text and m.text.startswith("http"))
def download_media(message):
    if message.chat.id != OWNER_ID:
        bot.reply_to(message, "🚫 هذا البوت خاص بالمالك فقط")
        return

    url = message.text.strip()
    bot.reply_to(message, f"⏳ جاري التحميل...\n{url}")

    try:
        ydl_opts = {
            "outtmpl": f"{DOWNLOAD_PATH}/%(title).50s.%(ext)s",
            "format": "best",
            "noplaylist": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            file_path = ydl.prepare_filename(info)

        # لو الملف كبير فيديو → نرسل صوت أو صورة بدل
        if file_path.endswith((".mp4", ".mkv", ".webm")):
            if os.path.getsize(file_path) < 50 * 1024 * 1024:  # أقل من 50MB
                with open(file_path, "rb") as f:
                    bot.send_video(message.chat.id, f)
            else:
                bot.send_message(message.chat.id, "⚠️ الملف كبير جدًا، صعب أرسله هنا.")
        elif file_path.endswith((".mp3", ".m4a", ".wav")):
            with open(file_path, "rb") as f:
                bot.send_audio(message.chat.id, f)
        elif file_path.endswith((".jpg", ".png", ".jpeg")):
            with open(file_path, "rb") as f:
                bot.send_photo(message.chat.id, f)
        else:
            with open(file_path, "rb") as f:
                bot.send_document(message.chat.id, f)

        os.remove(file_path)

    except Exception as e:
        bot.send_message(message.chat.id, f"❌ خطأ: {str(e)}")

# تشغيل البوت
print("🚀 البوت شغال الآن ...")
bot.infinity_polling()