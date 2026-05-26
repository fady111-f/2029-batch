// ════════════════════════════════════════════════════════
//  CMP Batch 2029 — app.js v2
//  Firebase Firestore: shared real-time data for all users
// ════════════════════════════════════════════════════════

// ── Firebase Imports ─────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ══════════════════════════════════════════════════════════
//  🔥 FIREBASE CONFIG — Replace with YOUR project values
//  (Get them from: console.firebase.google.com → Project Settings → Your apps)
// ══════════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId:         "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId:             "PASTE_YOUR_APP_ID_HERE"
};

// Initialise Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const entriesRef = collection(db, "cmp2029_entries");

// ── Local fallback content ────────────────────────────────
const localContent = {
  en: {
    news: [
      ["Orientation Day", "Orientation starts at 9 AM in Hall A. Be ready with your ID and welcome kit.", "Announcement"],
      ["Library Hours Extended", "Library now open from 8 AM to 10 PM during exam week for maximum study time.", "Update"],
      ["Sports Day 2025", "Join the sports day event on Friday on the university field — registration open!", "Event"],
      ["Midterm Reminder", "Prepare your revision notes: midterms begin next Monday in Hall C.", "Announcement"],
      ["Cloud Workshop", "Free cloud computing workshop this Thursday in Lab 5, seats are limited.", "Event"],
      ["Career Fair", "Industry partners will visit on Friday for CV review and interview prep.", "Update"]
    ],
    schedule: [
      ["Computer Architecture", "09:00 - 10:30", "Room 301"],
      ["Programming Fundamentals", "11:00 - 12:30", "Lab 2"],
      ["Mathematics II", "14:00 - 15:30", "Lecture Hall B"],
      ["Digital Logic Design", "16:00 - 17:30", "Room 402"],
      ["Physics for Engineers", "18:00 - 19:30", "Lecture Hall A"]
    ],
    deadlines: [
      ["Project Proposal", "Submit your project proposal via the portal", "Tomorrow"],
      ["Assignment 3", "Upload assignment 3 solutions", "May 28"],
      ["Lab Report", "Finish and submit the lab report", "May 29"],
      ["Team Presentation", "Prepare slides for the project group presentation.", "June 2"],
      ["Library Registration", "Renew your library membership before the end of the week.", "June 5"],
      ["Scholarship Form", "Complete the scholarship application form online.", "June 10"]
    ]
  },
  ar: {
    news: [
      ["يوم التعريف", "يبدأ يوم التعريف الساعة 9 صباحاً في القاعة أ. احضر بطاقتك وبطاقة الجامعة.", "إعلان"],
      ["ساعات المكتبة الموسعة", "المكتبة مفتوحة من 8 صباحاً حتى 10 مساءً طوال أسبوع الامتحانات.", "تحديث"],
      ["يوم الرياضة 2025", "انضم إلى فعاليات يوم الرياضة يوم الجمعة في الملعب الجامعي — التسجيل متاح الآن.", "حدث"],
      ["تذكير امتحان متوسط", "تبدأ امتحانات منتصف الفصل الأسبوع المقبل في القاعة ج. راجع ملاحظاتك اليوم.", "إعلان"],
      ["ورشة سحابية", "ورشة عمل مجانية حول الحوسبة السحابية الخميس في المعمل 5، المقاعد محدودة.", "حدث"],
      ["معرض الوظائف", "شركات تقنية تزور يوم الجمعة لمراجعة السيرة الذاتية والتحضير للمقابلات.", "تحديث"]
    ],
    schedule: [
      ["هندسة الحاسوب", "09:00 - 10:30", "قاعة 301"],
      ["أساسيات البرمجة", "11:00 - 12:30", "المعمل 2"],
      ["الرياضيات 2", "14:00 - 15:30", "قاعة المحاضرات ب"],
      ["تصميم المنطق الرقمي", "16:00 - 17:30", "قاعة 402"],
      ["فيزياء للمهندسين", "18:00 - 19:30", "القاعة أ"]
    ],
    deadlines: [
      ["اقتراح المشروع", "قدّم اقتراح مشروعك عبر البوابة الإلكترونية.", "غداً"],
      ["المهمة 3", "حمّل حلول المهمة 3 قبل الموعد النهائي.", "28 مايو"],
      ["تقرير المعمل", "أنهِ وسلّم تقرير المعمل في الموعد.", "29 مايو"],
      ["العرض الجماعي", "جهّز عرض المشروع الجماعي مع فريقك.", "2 يونيو"],
      ["تجديد المكتبة", "جدّد عضويتك في المكتبة قبل نهاية الأسبوع.", "5 يونيو"],
      ["استمارة المنحة", "املأ استمارة التقدم للمنحة عبر الإنترنت.", "10 يونيو"]
    ]
  }
};

let currentLang = "en";

// ── In-memory cache of Firestore entries ─────────────────
let firestoreEntries = [];

// ════════════════════════════════════════════════════════
//  AOS
// ════════════════════════════════════════════════════════
AOS.init({ once: true, offset: 50, duration: 650 });

// ════════════════════════════════════════════════════════
//  Toast System
// ════════════════════════════════════════════════════════
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  const accent = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb';
  const isDark = document.documentElement.classList.contains('dark');

  toast.style.cssText = `
    display:flex; align-items:center; gap:10px;
    background: ${isDark ? '#1e293b' : '#ffffff'};
    color: ${isDark ? '#f1f5f9' : '#0f172a'};
    padding: 12px 18px;
    border-radius: 14px;
    box-shadow: ${isDark ? '0 8px 30px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.06)' : '0 8px 30px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.05)'};
    font-size: 0.875rem; font-weight:600;
    border-left: 4px solid ${accent};
    transform: translateY(16px); opacity:0;
    transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
    pointer-events: auto;
    min-width: 220px;
  `;
  toast.innerHTML = `<span style="font-size:1.1rem">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.transform = 'translateY(0)'; toast.style.opacity = '1'; }, 10);
  setTimeout(() => {
    toast.style.transform = 'translateY(-8px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// ════════════════════════════════════════════════════════
//  Scroll Progress & To-Top
// ════════════════════════════════════════════════════════
const scrollProgress = document.getElementById('scrollProgress');
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  if (scrollProgress) scrollProgress.style.width = ((winScroll / height) * 100) + '%';
  if (scrollToTopBtn) {
    if (winScroll > 300) {
      scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
      scrollToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
    } else {
      scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none');
      scrollToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
    }
  }
  // Navbar scrolled style
  const nav = document.querySelector('nav');
  if (nav) nav.classList.toggle('scrolled', winScroll > 30);
  updateSectionIndicator();
});
scrollToTopBtn && scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ════════════════════════════════════════════════════════
//  Particle Canvas
// ════════════════════════════════════════════════════════
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.r  = Math.random() * 2 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.o  = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.o})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 60; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    // Draw lines between close particles
    particles.forEach((p, i) => {
      particles.slice(i + 1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - d / 100)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ════════════════════════════════════════════════════════
//  Countdown Timer
// ════════════════════════════════════════════════════════
function initCountdown() {
  // Target: next semester start — adjust this date as needed
  const target = new Date('2025-09-15T09:00:00');
  const label  = document.getElementById('countdownLabel');
  const els    = {
    days:    document.getElementById('cdDays'),
    hours:   document.getElementById('cdHours'),
    minutes: document.getElementById('cdMinutes'),
    seconds: document.getElementById('cdSeconds'),
  };
  let prev = { days: '', hours: '', minutes: '', seconds: '' };

  function update() {
    const now  = new Date();
    const diff = target - now;
    if (diff <= 0) {
      if (label) label.textContent = '🎉 Semester has started!';
      Object.values(els).forEach(el => { if (el) el.textContent = '00'; });
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const fmt = n => String(n).padStart(2, '0');

    ['days','hours','minutes','seconds'].forEach(k => {
      const val = fmt(k === 'days' ? d : k === 'hours' ? h : k === 'minutes' ? m : s);
      if (els[k] && val !== prev[k]) {
        els[k].textContent = val;
        els[k].classList.add('flip');
        setTimeout(() => els[k].classList.remove('flip'), 400);
        prev[k] = val;
      }
    });
  }
  update();
  setInterval(update, 1000);
}

function updateHeroStats() {
  const students = document.getElementById('heroStudentsCount');
  const courses  = document.getElementById('heroCoursesCount');
  const groups   = document.getElementById('heroGroupsCount');
  const schedule = localContent[currentLang]?.schedule || [];
  if (students) students.textContent = '325';
  if (courses)  courses.textContent  = schedule.length.toString();
  if (groups)   groups.textContent   = '12';
}

function updateSectionIndicator() {
  const indicator = document.querySelector('.nav-section-label');
  const sections = [
    { id: 'news', label: currentLang === 'ar' ? 'الأخبار' : 'News' },
    { id: 'schedule', label: currentLang === 'ar' ? 'الجدول' : 'Schedule' },
    { id: 'deadlines', label: currentLang === 'ar' ? 'المواعيد' : 'Deadlines' }
  ];
  const threshold = window.innerHeight * 0.45;
  let activeLabel = currentLang === 'ar' ? 'الرئيسية' : 'Home';
  sections.some(section => {
    const el = document.getElementById(section.id);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    if (rect.top <= threshold && rect.bottom > threshold) {
      activeLabel = section.label;
      return true;
    }
    return false;
  });
  if (indicator) indicator.textContent = activeLabel;
  const indicatorContainer = document.getElementById('navSectionIndicator');
  if (indicatorContainer && indicatorContainer.classList.contains('hidden')) {
    indicatorContainer.classList.remove('hidden');
  }
}

// ════════════════════════════════════════════════════════
//  AI Chat Widget
// ════════════════════════════════════════════════════════
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatWindow    = document.getElementById('chatWindow');
const closeChatBtn  = document.getElementById('closeChatBtn');
const chatForm      = document.getElementById('chatForm');
const chatInput     = document.getElementById('chatInput');
const chatMessages  = document.getElementById('chatMessages');
const chatNotifBadge = document.getElementById('chatNotifBadge');
let isChatOpen = false;
let chatOpened = false;

function toggleChat() {
  isChatOpen = !isChatOpen;
  if (!chatWindow || !chatToggleBtn) return;
  if (isChatOpen) {
    chatWindow.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    chatWindow.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
    chatToggleBtn.classList.add('scale-0');
    setTimeout(() => chatInput && chatInput.focus(), 300);
    // Hide notification badge
    if (chatNotifBadge) chatNotifBadge.style.display = 'none';
    chatOpened = true;
  } else {
    chatWindow.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
    chatWindow.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
    chatToggleBtn.classList.remove('scale-0');
  }
}

chatToggleBtn && chatToggleBtn.addEventListener('click', toggleChat);
closeChatBtn  && closeChatBtn.addEventListener('click', toggleChat);

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMessage(text, isUser = false) {
  if (!chatMessages) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = `px-4 py-2.5 rounded-2xl text-sm max-w-[85%] shadow-sm leading-relaxed ${
    isUser
      ? 'self-end bg-blue-600 text-white rounded-tr-sm'
      : 'self-start bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
  }`;
  msgDiv.innerHTML = text;
  chatMessages.appendChild(msgDiv);

  // Timestamp
  const ts = document.createElement('div');
  ts.className = `chat-timestamp ${isUser ? 'self-end text-right' : 'self-start'}`;
  ts.textContent = formatTime();
  chatMessages.appendChild(ts);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  if (!chatMessages) return;
  const d = document.createElement('div');
  d.id = 'typingIndicator';
  d.className = 'self-start bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] flex gap-1 items-center h-10';
  d.innerHTML = `<div class="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div><div class="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div><div class="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>`;
  chatMessages.appendChild(d);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function removeTypingIndicator() {
  const ind = document.getElementById('typingIndicator');
  if (ind) ind.remove();
}

const OPENAI_API_KEY = window.OPENAI_API_KEY || null;
const OPENAI_MODEL = window.OPENAI_MODEL || 'gpt-3.5-turbo';
const OPENAI_PROXY_URL = window.OPENAI_PROXY_URL || null;

async function fetchOpenAIResponse(userInput) {
  if (!OPENAI_API_KEY && !OPENAI_PROXY_URL) return null;

  const schedule = localContent[currentLang]?.schedule || [];
  const news = localContent[currentLang]?.news || [];
  const deadlines = localContent[currentLang]?.deadlines || [];

  const makeLines = (rows) => rows.map((row, idx) => `${idx + 1}. ${row[0]} - ${row[1]}${row[2] ? ` (${row[2]})` : ''}`).join('\n');
  const prompt = `You are an assistant for Cairo University CMP Batch 2029. Answer the user's questions in the same language they use. Use the site data below and do not invent unrelated information.\n\nNews:\n${makeLines(news)}\n\nSchedule:\n${makeLines(schedule)}\n\nDeadlines:\n${makeLines(deadlines)}\n\nUser question:\n${userInput}`;

  const requestUrl = OPENAI_PROXY_URL || 'https://api.openai.com/v1/chat/completions';
  const headers = { 'Content-Type': 'application/json' };
  if (!OPENAI_PROXY_URL) headers['Authorization'] = `Bearer ${OPENAI_API_KEY}`;

  const response = await fetch(requestUrl, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-store',
    headers,
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful campus assistant for CMP Batch 2029. Answer politely and use the user language.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 350
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function getMockResponse(input) {
  const t = input.toLowerCase();
  const schedule = localContent['en']?.schedule || [];
  const news = localContent['en']?.news || [];
  const deadlines = localContent['en']?.deadlines || [];

  const listItems = (items) => items.map((item, idx) => `${idx + 1}. ${item[0]}${item[1] ? ` — ${item[1]}` : ''}`).join('\n');
  const urgentItems = deadlines.filter(d => getDaysRemaining(d[2]) <= 2).slice(0, 4);
  const answerVariants = {
    greeting: [
      "Hello! I'm your English batch assistant. I can answer questions about news, schedule, deadlines, or campus support.",
      "Hi there! Ask me about today's classes, batch news, deadlines, or admin support.",
      "Welcome! I can help with batch 2029 updates, schedule plans, urgent deadlines, or campus info."
    ],
    fallback: [
      "I can help with schedule details, deadline updates, news, or campus support.",
      "Ask me about today's classes, urgent deadlines, or the latest batch news.",
      "Need a quick update? I can share schedule highlights, deadlines, or news items.",
      "I’m here to help with batch info, like classes, deadlines, news, or campus support."
    ]
  };

  const choose = (category) => answerVariants[category][Math.floor(Math.random() * answerVariants[category].length)];

  const knowledgeBase = [
    {
      pattern: /(schedule|timetable|class|lecture|course|today's schedule|today schedule|what's on today|today plan)/i,
      reply: schedule.length > 0
        ? `Today's schedule includes:\n${listItems(schedule.slice(0, 5))}`
        : "The schedule is currently empty."
    },
    {
      pattern: /(deadline|due|assignment|homework|submission|project|final|exam|due date)/i,
      reply: urgentItems.length > 0
        ? `Urgent deadlines:\n${urgentItems.map((d, i) => `${i + 1}. ${d[0]} — ${d[2]}`).join('\n')}`
        : "No urgent deadlines found — everything is on track."
    },
    {
      pattern: /(news|announcement|update|event|latest|headline)/i,
      reply: news.length > 0
        ? `Latest news: ${news[0][0]}. ${news[0][1]}`
        : "No news is available at the moment."
    },
    {
      pattern: /(student|students|batch|member|members|how many|count|population)/i,
      reply: `There are 325 active batch members and ${schedule.length} classes scheduled today.`
    },
    {
      pattern: /(contact|email|support|help|assist|reach)/i,
      reply: "Use the 📩 Contact button in the navbar or email fady.fawzy2006@gmail.com for support."
    },
    {
      pattern: /(dark|light|theme|mode|appearance|style)/i,
      reply: "Use the 🌙 button to toggle dark mode on the page."
    },
    {
      pattern: /(admin|manage|add entry|add news|add deadline|dashboard|edit|update)/i,
      reply: "Open the ⚙️ Admin panel to add news, schedule items, or deadlines."
    },
    {
      pattern: /(language|english|arabic|switch|translate)/i,
      reply: "This assistant currently responds in English. Use the language toggle for page text if needed."
    },
    {
      pattern: /(calendar|ics|add to calendar|schedule to calendar|save event|export)/i,
      reply: "Click the 📅 icon next to a deadline to download it to your calendar."
    },
    {
      pattern: /(countdown|timer|next semester|semester starts|start date|begin)/i,
      reply: "The countdown in the hero section shows how long until next semester starts on Sep 15."
    },
    {
      pattern: /(who are you|what are you|assistant|chatbot|bot)/i,
      reply: "I'm a free English assistant for CMP Batch 2029. I can help with news, classes, deadlines, and campus info."
    },
    {
      pattern: /(when|date|time|schedule change|when does|when will)/i,
      reply: "Use the schedule and deadline sections for exact dates, and check the calendar icon for deadline entries." 
    },
    {
      pattern: /(where|location|room|building|campus|where is)/i,
      reply: "This dashboard focuses on batch updates, news, and deadlines. For campus location queries use the official university map or contact support."
    }
  ];

  if (/(hello|hi|hey|good morning|good afternoon|welcome)/i.test(t)) {
    return choose('greeting');
  }

  for (const item of knowledgeBase) {
    if (item.pattern.test(t)) {
      return item.reply;
    }
  }

  return choose('fallback');
}

chatForm && chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const val = chatInput && chatInput.value.trim();
  if (!val) return;
  addMessage(val, true);
  chatInput.value = '';
  showTypingIndicator();
  try {
    const aiText = await fetchOpenAIResponse(val);
    removeTypingIndicator();
    if (aiText) {
      addMessage(aiText);
    } else {
      addMessage(getMockResponse(val));
      showToast('Free English assistant active.', 'success');
    }
  } catch (error) {
    removeTypingIndicator();
    addMessage(getMockResponse(val));
    console.warn('OpenAI request failed:', error);
    const errorMsg = error?.message ? `OpenAI failed: ${error.message}` : 'OpenAI chat failed.';
    showToast(errorMsg, 'error');
  }
});

// ════════════════════════════════════════════════════════
//  Tabs
// ════════════════════════════════════════════════════════
const tabs     = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    contents.forEach(c => c.classList.remove("active"));
    document.getElementById(tab.dataset.tab).classList.add("active");
    AOS.refresh();
  });
});

// ════════════════════════════════════════════════════════
//  Dark Mode
// ════════════════════════════════════════════════════════
const darkBtn = document.getElementById("darkToggle");
const htmlEl  = document.documentElement;

function applyTheme(isDark, silent = false) {
  if (isDark) {
    htmlEl.classList.add("dark");
    if (darkBtn) darkBtn.innerHTML = '<span>☀️</span> <span class="hidden sm:inline">Light</span>';
    if (darkBtn) { darkBtn.classList.remove('bg-slate-900','text-white'); darkBtn.classList.add('bg-white','text-slate-900'); }
    if (!silent) showToast('Dark Mode Enabled');
  } else {
    htmlEl.classList.remove("dark");
    if (darkBtn) darkBtn.innerHTML = '<span>🌙</span> <span class="hidden sm:inline">Dark</span>';
    if (darkBtn) { darkBtn.classList.add('bg-slate-900','text-white'); darkBtn.classList.remove('bg-white','text-slate-900'); }
    if (!silent) showToast('Light Mode Enabled');
  }
}

if (localStorage.getItem("theme") === "dark") applyTheme(true, true);

darkBtn && darkBtn.addEventListener("click", () => {
  const isDark = !htmlEl.classList.contains("dark");
  applyTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ════════════════════════════════════════════════════════
//  Contact Modal
// ════════════════════════════════════════════════════════
const contactBtn       = document.getElementById("contactBtn");
const contactModal     = document.getElementById("contactModal");
const closeContactIcon = document.getElementById("closeContactIcon");
const contactModalInner = document.getElementById("contactModalInner");
const contactFormModal  = document.getElementById("contactFormModal");

function openModal() {
  if (!contactModal) return;
  contactModal.classList.remove("hidden"); contactModal.classList.add("flex");
  setTimeout(() => {
    contactModalInner.classList.remove("scale-95", "opacity-0");
    contactModalInner.classList.add("scale-100", "opacity-100");
  }, 10);
}
function closeModal() {
  if (!contactModalInner) return;
  contactModalInner.classList.remove("scale-100", "opacity-100");
  contactModalInner.classList.add("scale-95", "opacity-0");
  setTimeout(() => { contactModal.classList.add("hidden"); contactModal.classList.remove("flex"); }, 300);
}
window.closeModal = closeModal;

contactBtn        && contactBtn.addEventListener("click", openModal);
closeContactIcon  && closeContactIcon.addEventListener("click", closeModal);
contactModal      && contactModal.addEventListener("click", e => { if (e.target === contactModal) closeModal(); });

contactFormModal && contactFormModal.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById('contactName')?.value.trim();
  if (!document.getElementById('contactMessage')?.value.trim()) return showToast('Please enter a message', 'error');
  closeModal();
  showToast(`Thank you${name ? ', ' + name : ''}! Message received ✅`, 'success');
  contactFormModal.reset();
});

// ════════════════════════════════════════════════════════
//  Admin Modal
// ════════════════════════════════════════════════════════
const adminBtn        = document.getElementById("adminBtn");
const adminModal      = document.getElementById("adminModal");
const closeAdminIcon  = document.getElementById("closeAdminIcon");
const adminModalInner = document.getElementById("adminModalInner");
const adminForm       = document.getElementById("adminForm");

function openAdminModal() {
  if (!adminModal) return;
  adminModal.classList.remove("hidden"); adminModal.classList.add("flex");
  setTimeout(() => {
    adminModalInner.classList.remove("scale-95", "opacity-0");
    adminModalInner.classList.add("scale-100", "opacity-100");
  }, 10);
}
function closeAdminModal() {
  if (!adminModalInner) return;
  adminModalInner.classList.remove("scale-100", "opacity-100");
  adminModalInner.classList.add("scale-95", "opacity-0");
  setTimeout(() => { adminModal.classList.add("hidden"); adminModal.classList.remove("flex"); }, 300);
}
window.closeAdminModal = closeAdminModal;

adminBtn       && adminBtn.addEventListener("click", openAdminModal);
closeAdminIcon && closeAdminIcon.addEventListener("click", closeAdminModal);
adminModal     && adminModal.addEventListener("click", e => { if (e.target === adminModal) closeAdminModal(); });

// ════════════════════════════════════════════════════════
//  Language
// ════════════════════════════════════════════════════════
const translations = {
  en: {
    siteTitle:"CMP Batch 2029",
    heroTitle:"Welcome to CMP <br class='hidden sm:block'>Batch 2029",
    heroDesc:"Your central hub for the latest news, schedules, and important deadlines. Stay connected and ahead.",
    tabNews:"📢 News", tabSchedule:"📅 Schedule", tabDeadlines:"⏰ Deadlines",
    newsTitle:"<span class='section-icon section-icon-blue'>📢</span> Latest News",
    scheduleTitle:"<span class='section-icon section-icon-green'>📅</span> Today's Schedule",
    deadlinesTitle:"<span class='section-icon section-icon-red'>⏰</span> Deadlines",
    courseTh:"Course", timeTh:"Time", locationTh:"Location",
    dCourse:"Course", dTask:"Task", dDeadline:"Deadline",
    footerText:"© 2025 All Rights Reserved — Batch 2029 — Fady Fawzy",
    modalTitle:"Get in Touch",
    countdownLabel:"⏳ Countdown to next semester"
  },
  ar: {
    siteTitle:"دفعة ٢٠٢٩",
    heroTitle:"مرحباً بكم في <br class='hidden sm:block'>دفعة ٢٠٢٩",
    heroDesc:"وجهتك المركزية لأحدث الأخبار، الجداول، والمواعيد النهائية الهامة. ابق على تواصل.",
    tabNews:"📢 الأخبار", tabSchedule:"📅 الجدول", tabDeadlines:"⏰ المواعيد",
    newsTitle:"<span class='section-icon section-icon-blue'>📢</span> أحدث الأخبار",
    scheduleTitle:"<span class='section-icon section-icon-green'>📅</span> جدول اليوم",
    deadlinesTitle:"<span class='section-icon section-icon-red'>⏰</span> المواعيد الهامة",
    courseTh:"المادة", timeTh:"الوقت", locationTh:"المكان",
    dCourse:"المادة", dTask:"المهمة", dDeadline:"الموعد",
    footerText:"© ٢٠٢٥ جميع الحقوق محفوظة — دفعة ٢٠٢٩ — فادي فوزي",
    modalTitle:"تواصل معنا",
    countdownLabel:"⏳ العد التنازلي حتى الفصل القادم"
  }
};

const langBtn = document.getElementById("langToggle");

function updateLang(lang, silent = false) {
  for (let key in translations[lang]) {
    const el = document.getElementById(key);
    if (el) el.innerHTML = translations[lang][key];
  }
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  if (lang === 'ar') {
    document.body.style.fontFamily = "'Tajawal', 'Inter', sans-serif";
    if (!document.getElementById('arFont')) {
      const link = document.createElement('link');
      link.id = 'arFont';
      link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  } else {
    document.body.style.fontFamily = "'Inter', sans-serif";
  }
  document.getElementById("newsLoading")?.classList.remove("hidden");
  document.getElementById("newsList")?.classList.add("hidden");
  loadAllData();
  if (!silent) showToast(lang === 'ar' ? 'تم التغيير إلى العربية' : 'Switched to English');
}

langBtn && langBtn.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "ar" : "en";
  updateLang(currentLang);
  langBtn.innerHTML = currentLang === "en" ? '<span>🌐</span> عربي' : '<span>🌐</span> English';
});

updateLang(currentLang, true);

// ════════════════════════════════════════════════════════
//  Data Loading
// ════════════════════════════════════════════════════════
async function loadSheet(sheetName) {
  return localContent[currentLang]?.[sheetName.toLowerCase()] || [];
}

// ════════════════════════════════════════════════════════
//  Firebase: Save / Delete / Real-time listener
// ════════════════════════════════════════════════════════
async function saveAdminEntry(entry) {
  try {
    await addDoc(entriesRef, { ...entry, createdAt: serverTimestamp() });
  } catch (err) {
    console.error("Firestore write error:", err);
    showToast("Failed to save. Check Firebase config.", "error");
  }
}

async function deleteAdminEntry(docId) {
  try {
    await deleteDoc(doc(db, "cmp2029_entries", docId));
  } catch (err) {
    console.error("Firestore delete error:", err);
    showToast("Failed to delete entry.", "error");
  }
}

async function clearAdminEntries() {
  if (!confirm("Clear ALL shared entries for everyone?")) return;
  const { getDocs } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const s = await getDocs(entriesRef);
  const deletes = [];
  s.forEach(d => deletes.push(deleteDoc(doc(db, "cmp2029_entries", d.id))));
  await Promise.all(deletes);
  showToast('All entries cleared for everyone', 'success');
}

// Real-time listener
function startRealtimeListener() {
  const q = query(entriesRef, orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    firestoreEntries = [];
    snapshot.forEach(d => firestoreEntries.push({ _id: d.id, ...d.data() }));
    renderAdminEntries();
    renderAdminEntryList();
  }, (err) => {
    console.warn("Firestore listener error:", err.message);
  });
}

// ════════════════════════════════════════════════════════
//  Admin Form Submit
// ════════════════════════════════════════════════════════
adminForm && adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const type      = document.getElementById('adminType')?.value;
  const primary   = document.getElementById('adminPrimary')?.value.trim();
  const secondary = document.getElementById('adminSecondary')?.value.trim();
  const tertiary  = document.getElementById('adminTertiary')?.value.trim();
  if (!type || !primary || !secondary || !tertiary) return showToast('Please fill all fields', 'error');

  const btn = adminForm.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  await saveAdminEntry({ id: Date.now(), type, primary, secondary, tertiary });

  if (btn) { btn.disabled = false; btn.innerHTML = '💾 Save Entry'; }
  closeAdminModal();
  showToast('✅ Entry saved — visible to everyone!', 'success');
  if (adminForm) adminForm.reset();
});

const clearAdminEntriesBtn = document.getElementById('clearAdminEntriesBtn');
clearAdminEntriesBtn && clearAdminEntriesBtn.addEventListener('click', clearAdminEntries);

// ════════════════════════════════════════════════════════
//  Render Admin Entries (from Firestore cache)
// ════════════════════════════════════════════════════════
function renderAdminEntries() {
  document.querySelectorAll('[data-admin-entry]').forEach(el => el.remove());
  const entries       = firestoreEntries;
  const newsList      = document.getElementById('newsList');
  const scheduleGrid  = document.getElementById('scheduleGrid');
  const deadlineCards = document.getElementById('deadlineCards');
  const noNewsFound   = document.getElementById('noNewsFound');

  if (newsList && entries.some(e => e.type === 'news')) {
    newsList.classList.remove('hidden');
    noNewsFound?.classList.add('hidden');
  }

  entries.forEach(entry => {
    if (entry.type === 'news' && newsList) {
      newsList.insertAdjacentHTML('afterbegin', `
        <div data-admin-entry="true" class="news-card" data-type="Announcement" data-aos="fade-up">
          <div class="news-card-icon news-card-icon-announcement">📢</div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2">${entry.primary}</h3>
            <span class="admin-badge">Admin</span>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">${entry.secondary}</p>
          <div class="news-card-date">
            <span>📅</span> Just now
            ${entry._id ? `<button onclick="window._deleteEntry('${entry._id}')" class="ml-auto text-xs text-red-400 hover:text-red-600 font-semibold">✕ Remove</button>` : ''}
          </div>
        </div>
      `);
    }
    if (entry.type === 'schedule' && scheduleGrid) {
      scheduleGrid.insertAdjacentHTML('afterbegin', `
        <div data-admin-entry="true" class="schedule-card" style="border-color:rgba(251,191,36,0.35)">
          <div class="schedule-time-badge" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-color:#fde68a">
            <span class="schedule-time-icon">🕐</span>
            <span class="schedule-time-text" style="color:#d97706">${entry.secondary}</span>
          </div>
          <div class="schedule-course">
            <div class="schedule-course-name">${entry.primary}</div>
            <div class="schedule-course-location">📍 ${entry.tertiary}</div>
          </div>
          <span class="admin-badge">${entry._id ? `<button onclick="window._deleteEntry('${entry._id}')" class="text-xs text-red-400 hover:text-red-600 font-bold">✕</button>` : ''}</span>
        </div>
      `);
    }
    if (entry.type === 'deadline' && deadlineCards) {
      deadlineCards.insertAdjacentHTML('afterbegin', `
        <div data-admin-entry="true" class="deadline-card">
          <div class="deadline-icon-area deadline-icon-normal">⏳</div>
          <div class="deadline-info">
            <div class="deadline-course-name">${entry.primary}</div>
            <div class="deadline-task-desc">${entry.secondary}</div>
            <div class="deadline-progress-wrap">
              <div class="deadline-progress-bar-bg">
                <div class="deadline-progress-bar-fill normal-fill" style="width:50%"></div>
              </div>
              <div class="deadline-days-left">Deadline: ${entry.tertiary}</div>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="deadline-badge deadline-normal">⏳ ${entry.tertiary}</span>
            ${entry._id ? `<button onclick="window._deleteEntry('${entry._id}')" class="text-xs text-red-400 hover:text-red-600 font-bold">✕ Remove</button>` : ''}
          </div>
        </div>
      `);
    }
  });
}

// Global delete handler
window._deleteEntry = async (docId) => {
  if (!confirm("Delete this entry for everyone?")) return;
  await deleteAdminEntry(docId);
  showToast('Entry deleted', 'success');
};

function renderAdminEntryList() {
  const entryList = document.getElementById('adminEntryList');
  if (!entryList) return;
  entryList.innerHTML = '';
  const entries = firestoreEntries;
  if (entries.length === 0) {
    entryList.innerHTML = '<p class="text-xs text-slate-400 dark:text-slate-500">No shared entries yet. Add one above — it appears for all batch members instantly.</p>';
    return;
  }
  entries.slice(0, 8).forEach(entry => {
    const label = entry.type.charAt(0).toUpperCase() + entry.type.slice(1);
    const date  = entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleDateString() : new Date(entry.id).toLocaleDateString();
    entryList.insertAdjacentHTML('beforeend', `
      <div class="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs uppercase font-bold tracking-wide text-slate-400">${label}</span>
            <span class="text-xs text-slate-400">${date}</span>
          </div>
          <div class="text-sm text-slate-800 dark:text-slate-200 font-semibold truncate">${entry.primary}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 truncate">${entry.secondary}</div>
        </div>
        ${entry._id ? `<button onclick="window._deleteEntry('${entry._id}')" class="text-xs text-red-400 hover:text-red-600 font-bold shrink-0 mt-1">✕</button>` : ''}
      </div>
    `);
  });
}

// ════════════════════════════════════════════════════════
//  Schedule helper: is a class happening now?
// ════════════════════════════════════════════════════════
function isCurrentClass(timeStr) {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const match = timeStr.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
  if (!match) return false;
  const start = parseInt(match[1]) * 60 + parseInt(match[2]);
  const end   = parseInt(match[3]) * 60 + parseInt(match[4]);
  return currentMins >= start && currentMins <= end;
}

// ════════════════════════════════════════════════════════
//  Deadline helper: days remaining
// ════════════════════════════════════════════════════════
function getDaysRemaining(whenStr) {
  const lower = whenStr.toLowerCase();
  if (lower.includes('today') || lower.includes('اليوم')) return 0;
  if (lower.includes('tomorrow') || lower.includes('غداً') || lower.includes('غدا')) return 1;
  if (lower.includes('end of week') || lower.includes('نهاية الأسبوع')) return 5;
  const parsed = Date.parse(whenStr);
  if (!isNaN(parsed)) {
    const diff = Math.ceil((parsed - Date.now()) / 86400000);
    return Math.max(0, diff);
  }
  return 14; // default: 2 weeks
}

// ════════════════════════════════════════════════════════
//  News card type mapping
// ════════════════════════════════════════════════════════
function getCardMeta(type) {
  const map = {
    'Announcement': { icon: '📢', iconClass: 'news-card-icon-announcement', badgeClass: 'news-badge-announcement' },
    'إعلان':        { icon: '📢', iconClass: 'news-card-icon-announcement', badgeClass: 'news-badge-announcement' },
    'Event':        { icon: '🎉', iconClass: 'news-card-icon-event',        badgeClass: 'news-badge-event' },
    'حدث':          { icon: '🎉', iconClass: 'news-card-icon-event',        badgeClass: 'news-badge-event' },
    'Update':       { icon: '📝', iconClass: 'news-card-icon-update',       badgeClass: 'news-badge-update' },
    'تحديث':        { icon: '📝', iconClass: 'news-card-icon-update',       badgeClass: 'news-badge-update' },
  };
  return map[type] || { icon: '📌', iconClass: 'news-card-icon-announcement', badgeClass: 'news-badge-announcement' };
}

// ════════════════════════════════════════════════════════
//  Load Static Data + merge with Firestore entries
// ════════════════════════════════════════════════════════
function loadAllData() {
  // Update stats bar
  const newsData  = localContent[currentLang]?.news || [];
  const schedData = localContent[currentLang]?.schedule || [];
  const dlData    = localContent[currentLang]?.deadlines || [];
  const statsNews = document.getElementById('statsNewsCount');
  const statsSched = document.getElementById('statsScheduleCount');
  const statsDl   = document.getElementById('statsDeadlineCount');
  if (statsNews)  statsNews.textContent  = newsData.length + firestoreEntries.filter(e => e.type === 'news').length;
  if (statsSched) statsSched.textContent = schedData.length + firestoreEntries.filter(e => e.type === 'schedule').length;
  if (statsDl)    statsDl.textContent    = dlData.length + firestoreEntries.filter(e => e.type === 'deadline').length;

  // ── News ──────────────────────────────────────────
  loadSheet("News").then(rows => {
    const newsList    = document.getElementById("newsList");
    const newsLoading = document.getElementById("newsLoading");
    const noNewsFound = document.getElementById("noNewsFound");
    const searchInput = document.getElementById("searchNews");

    let allNews = rows.filter(r => r[0]);
    if (newsLoading) newsLoading.classList.add("hidden");
    if (newsList) newsList.classList.remove("hidden");

    renderNews(allNews);

    if (searchInput) {
      searchInput.oninput = e => {
        const q = e.target.value.toLowerCase();
        renderNews(allNews.filter(r => (r[0] + " " + r[1]).toLowerCase().includes(q)));
      };
    }

    function renderNews(list) {
      if (!newsList) return;
      newsList.innerHTML = "";
      if (list.length === 0) {
        noNewsFound?.classList.remove("hidden");
      } else {
        noNewsFound?.classList.add("hidden");
        list.forEach((r, index) => {
          const meta = getCardMeta(r[2]);
          const card = document.createElement("div");
          card.className = "news-card";
          card.setAttribute('data-type', r[2] || 'Announcement');
          card.setAttribute('data-aos', 'fade-up');
          card.setAttribute('data-aos-delay', (index % 3) * 90);
          const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dayLabel = currentLang === 'ar' ? 'اليوم' : 'Today';
          card.innerHTML = `
            <div class="news-card-icon ${meta.iconClass}">${meta.icon}</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2">${r[0]}</h3>
              ${r[2] ? `<span class="news-badge ${meta.badgeClass}">${r[2]}</span>` : ''}
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">${r[1]}</p>
            <div class="news-card-date">
              <span>📅</span> ${dayLabel} · ${timeStamp}
            </div>
          `;
          newsList.appendChild(card);
        });
      }
      renderAdminEntries();
      AOS.refresh();
    }
  });

  // ── Schedule ──────────────────────────────────────
  loadSheet("Schedule").then(rows => {
    const grid = document.getElementById("scheduleGrid");
    if (!grid) return;
    grid.innerHTML = "";
    if (rows.length === 0) {
      grid.innerHTML = `<div class="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">No schedule available for today.</div>`;
    } else {
      rows.forEach((r, i) => {
        if (!r[0]) return;
        const isCurrent = isCurrentClass(r[1] || '');
        const card = document.createElement('div');
        card.className = `schedule-card${isCurrent ? ' current-class' : ''}`;
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', i * 80);
        card.innerHTML = `
          <div class="schedule-time-badge">
            <span class="schedule-time-icon">🕐</span>
            <span class="schedule-time-text">${r[1]}</span>
          </div>
          <div class="schedule-course">
            <div class="schedule-course-name">${r[0]}</div>
            <div class="schedule-course-location">📍 ${r[2]}</div>
          </div>
          ${isCurrent ? `<span class="schedule-now-badge"><span class="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>LIVE</span>` : ''}
        `;
        grid.appendChild(card);
      });
    }
    renderAdminEntries();
  });

  // ── Deadlines ─────────────────────────────────────
  loadSheet("Deadlines").then(rows => {
    const container = document.getElementById("deadlineCards");
    if (!container) return;
    container.innerHTML = "";
    if (rows.length === 0) {
      container.innerHTML = `<div class="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">No deadlines available.</div>`;
    } else {
      // Sort by urgency
      const sorted = [...rows].filter(r => r[0]).sort((a, b) => getDaysRemaining(a[2]) - getDaysRemaining(b[2]));
      sorted.forEach((r, i) => {
        const days = getDaysRemaining(r[2]);
        const isUrgent = days <= 1;
        const isWarn   = days <= 3 && !isUrgent;
        const progress = Math.max(5, Math.min(100, 100 - (days / 14) * 100));
        const fillClass = isUrgent ? 'urgent-fill' : isWarn ? 'warn-fill' : 'normal-fill';
        const badgeClass = isUrgent ? 'deadline-urgent' : 'deadline-normal';
        const iconClass  = isUrgent ? 'deadline-icon-urgent' : 'deadline-icon-normal';
        const icon       = isUrgent ? '🔥' : '⏳';
        const daysLabel  = days === 0 ? 'Due Today!' : days === 1 ? 'Due Tomorrow!' : `${days} days remaining`;
        const cE = (r[0] || '').replace(/`/g,"\\`").replace(/\$/g,"\\$");
        const tE = (r[1] || '').replace(/`/g,"\\`").replace(/\$/g,"\\$");
        const wE = (r[2] || '').replace(/`/g,"\\`").replace(/\$/g,"\\$");

        const card = document.createElement('div');
        card.className = `deadline-card${isUrgent ? ' urgent' : ''}`;
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', i * 80);
        card.innerHTML = `
          <div class="deadline-icon-area ${iconClass}">${icon}</div>
          <div class="deadline-info">
            <div class="deadline-course-name">${r[0]} ${isUrgent ? '<span class="urgent-dot"></span>' : ''}</div>
            <div class="deadline-task-desc">${r[1]}</div>
            <div class="deadline-progress-wrap">
              <div class="deadline-progress-bar-bg">
                <div class="deadline-progress-bar-fill ${fillClass}" style="width:${progress}%"></div>
              </div>
              <div class="deadline-days-left">${daysLabel}</div>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            <span class="deadline-badge ${badgeClass}">${icon} ${r[2]}</span>
            <button class="calendar-btn" aria-label="Add to calendar" title="Add to calendar" onclick="downloadICS('${cE}','${tE}','${wE}')">📅</button>
          </div>
        `;
        container.appendChild(card);
      });
    }
    renderAdminEntries();
    renderAdminEntryList();
  });
}

// ════════════════════════════════════════════════════════
//  Calendar (.ics) download
// ════════════════════════════════════════════════════════
window.downloadICS = function(course, task, when) {
  try {
    const title = `${course} - ${task}`.trim();
    const now = new Date();
    let start = new Date();
    const parsed = Date.parse(when);
    if (!isNaN(parsed)) { start = new Date(parsed); } else { start.setDate(start.getDate()+1); start.setHours(9,0,0,0); }
    const end = new Date(start.getTime() + 60*60*1000);
    const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CMP2029//EN\nBEGIN:VEVENT\nUID:${Date.now()}@cmp2029.local\nDTSTAMP:${fmt(now)}\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${title}\nDESCRIPTION:${when}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${course.replace(/\s+/g,'_')||'event'}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast('📅 Calendar event downloaded!', 'success');
  } catch (err) { showToast('Failed to create calendar event', 'error'); }
};

// ════════════════════════════════════════════════════════
//  Keyboard shortcuts
// ════════════════════════════════════════════════════════
window.addEventListener('keydown', e => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (e.key === 'c' || e.key === 'C') toggleChat();
  if (e.key === 'd' || e.key === 'D') { const d = !htmlEl.classList.contains('dark'); applyTheme(d); localStorage.setItem('theme', d?'dark':'light'); }
  if (e.key === 't' || e.key === 'T') window.scrollTo({ top: 0, behavior: 'smooth' });
  if (e.key === 's' || e.key === 'S') { const el = document.getElementById('searchNews'); if (el) el.focus(); }
  if (e.key === '1') document.getElementById('tabNews')?.click();
  if (e.key === '2') document.getElementById('tabSchedule')?.click();
  if (e.key === '3') document.getElementById('tabDeadlines')?.click();
  if (e.key === 'Escape') { closeModal(); closeAdminModal(); if (isChatOpen) toggleChat(); }
});

// ════════════════════════════════════════════════════════
//  Boot — init all systems
// ════════════════════════════════════════════════════════
initParticles();
initCountdown();
updateHeroStats();
startRealtimeListener();
loadAllData();
updateSectionIndicator();

// Show chat notification badge after 3s (if not already opened)
setTimeout(() => {
  if (!chatOpened && chatNotifBadge) {
    chatNotifBadge.style.display = 'flex';
  }
}, 3000);

// ════════════════════════════════════════════════════════
//  Service Worker
// ════════════════════════════════════════════════════════
if ("serviceWorker" in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("SW registered"))
      .catch(err => console.log("SW failed:", err));
  });
}
