// app.js - extracted site logic
// Initialize AOS
AOS.init({ once: true, offset: 50, duration: 600 });

const sheetIDs = {
  en: "1rhIC3O9J06LEGJElaaXrp9U3k1BTlszALeaw9PZP0vo",
  ar: "1BF9-_-zzHZMBWOdYDRN7-GF9GLPX1DP9iwTD58JTQPo"
};

let currentLang = "en";
let currentSheetID = sheetIDs.en;

// Toast System
function showToast(message, type = 'info') {
   const container = document.getElementById('toastContainer');
   if (!container) return;
   const toast = document.createElement('div');
   const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
   
   toast.className = `flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 transform translate-y-10 opacity-0 transition-all duration-300`;
   toast.innerHTML = `<span class="text-lg">${icon}</span> <span class="text-sm font-medium">${message}</span>`;
   
   container.appendChild(toast);
   
   // Animate in
   setTimeout(() => {
      toast.classList.remove('translate-y-10', 'opacity-0');
   }, 10);
   
   // Remove after 3s
   setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
   }, 3000);
}

// Scroll Progress & To-Top Button
const scrollProgress = document.getElementById('scrollProgress');
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', () => {
   // Progress bar
   const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
   const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
   const scrolled = (winScroll / height) * 100;
   if (scrollProgress) scrollProgress.style.width = scrolled + "%";
   
   // To top button
   if (scrollToTopBtn) {
     if (winScroll > 300) {
        scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        scrollToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
     } else {
        scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        scrollToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
     }
   }
});

if (scrollToTopBtn) scrollToTopBtn.addEventListener('click', () => {
   window.scrollTo({ top: 0, behavior: 'smooth' });
});

// AI Chat Widget Logic
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatWindow = document.getElementById('chatWindow');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
let isChatOpen = false;

function toggleChat() {
   isChatOpen = !isChatOpen;
   if (!chatWindow || !chatToggleBtn) return;
   if (isChatOpen) {
      chatWindow.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
      chatWindow.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
      chatToggleBtn.classList.add('scale-0');
      setTimeout(() => chatInput && chatInput.focus(), 300);
   } else {
      chatWindow.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
      chatWindow.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
      chatToggleBtn.classList.remove('scale-0');
   }
}

chatToggleBtn && chatToggleBtn.addEventListener('click', toggleChat);
closeChatBtn && closeChatBtn.addEventListener('click', toggleChat);

function addMessage(text, isUser = false) {
   if (!chatMessages) return;
   const msgDiv = document.createElement('div');
   msgDiv.className = `px-4 py-2.5 rounded-2xl text-sm max-w-[85%] shadow-sm ${
      isUser 
      ? 'self-end bg-blue-600 text-white rounded-tr-sm' 
      : 'self-start bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
   }`;
   msgDiv.innerHTML = text;
   chatMessages.appendChild(msgDiv);
   chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
   if (!chatMessages) return;
   const msgDiv = document.createElement('div');
   msgDiv.id = 'typingIndicator';
   msgDiv.className = 'self-start bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] flex gap-1 items-center h-10';
   msgDiv.innerHTML = `
      <div class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full typing-dot"></div>
      <div class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full typing-dot"></div>
      <div class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full typing-dot"></div>
   `;
   chatMessages.appendChild(msgDiv);
   chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
   const ind = document.getElementById('typingIndicator');
   if (ind) ind.remove();
}

// Mock AI Responses
function getMockResponse(input) {
   const text = input.toLowerCase();
   if (text.includes('hello') || text.includes('hi')) return "Hello there! How can I help you today?";
   if (text.includes('schedule') || text.includes('timetable')) return "You can find today's schedule in the 'Schedule' tab above. We pull this data live from Google Sheets.";
   if (text.includes('deadline') || text.includes('due')) return "Check the 'Deadlines' tab to see what's due. Urgent items will be marked with a red pulse.";
   if (text.includes('contact') || text.includes('email')) return "You can contact Fady Fawzy via the 'Contact' button in the navbar, or email fady.fawzy2006@gmail.com.";
   if (text.includes('dark')) return "You can toggle dark mode using the button in the top right corner!";
   return "That's a great question! I'm currently a mock AI, but in the future, I'll be connected to a real API to answer this perfectly.";
}

chatForm && chatForm.addEventListener('submit', (e) => {
   e.preventDefault();
   const val = chatInput && chatInput.value.trim();
   if (!val) return;
   
   addMessage(val, true);
   if (chatInput) chatInput.value = '';
   
   showTypingIndicator();
   
   setTimeout(() => {
      removeTypingIndicator();
      addMessage(getMockResponse(val));
   }, 1000 + Math.random() * 1000);
});

// Tabs Logic
const tabs = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => {
      t.classList.remove("text-blue-700", "bg-white", "shadow-sm", "dark:bg-slate-700", "dark:text-blue-300", "active");
      t.classList.add("text-gray-600", "dark:text-gray-400");
    });
    tab.classList.remove("text-gray-600", "dark:text-gray-400");
    tab.classList.add("text-blue-700", "bg-white", "shadow-sm", "dark:bg-slate-700", "dark:text-blue-300", "active");
    
    contents.forEach(c => c.classList.remove("active"));
    document.getElementById(tab.dataset.tab).classList.add("active");
    AOS.refresh();
  });
});

// Dark Mode Logic
const darkBtn = document.getElementById("darkToggle");
const htmlEl = document.documentElement;

function applyTheme(isDark, silent = false) {
  if (isDark) {
    htmlEl.classList.add("dark");
    if (darkBtn) darkBtn.innerHTML = '<span>☀️</span> <span class="hidden sm:inline">Light</span>';
    if (darkBtn) {
      darkBtn.classList.remove('bg-slate-800', 'text-white');
      darkBtn.classList.add('bg-white', 'text-slate-900');
    }
    if(!silent) showToast('Dark Mode Enabled');
  } else {
    htmlEl.classList.remove("dark");
    if (darkBtn) darkBtn.innerHTML = '<span>🌙</span> <span class="hidden sm:inline">Dark</span>';
    if (darkBtn) {
      darkBtn.classList.add('bg-slate-800', 'text-white');
      darkBtn.classList.remove('bg-white', 'text-slate-900');
    }
    if(!silent) showToast('Light Mode Enabled');
  }
}

if (localStorage.getItem("theme") === "dark") {
  applyTheme(true, true);
}

darkBtn && darkBtn.addEventListener("click", () => {
  const isDark = !htmlEl.classList.contains("dark");
  applyTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Contact Modal Logic
const contactBtn = document.getElementById("contactBtn");
const contactModal = document.getElementById("contactModal");
const closeContactIcon = document.getElementById("closeContactIcon");
const contactModalInner = document.getElementById("contactModalInner");
const contactFormModal = document.getElementById("contactFormModal");
const adminBtn = document.getElementById("adminBtn");
const adminModal = document.getElementById("adminModal");
const closeAdminIcon = document.getElementById("closeAdminIcon");
const adminModalInner = document.getElementById("adminModalInner");
const adminForm = document.getElementById("adminForm");

function openModal() {
  if (!contactModal) return;
  contactModal.classList.remove("hidden");
  contactModal.classList.add("flex");
  setTimeout(() => {
    contactModalInner.classList.remove("scale-95", "opacity-0");
    contactModalInner.classList.add("scale-100", "opacity-100");
  }, 10);
}

function closeModal() {
  if (!contactModalInner) return;
  contactModalInner.classList.remove("scale-100", "opacity-100");
  contactModalInner.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    contactModal.classList.add("hidden");
    contactModal.classList.remove("flex");
  }, 300);
}

function openAdminModal() {
  if (!adminModal) return;
  adminModal.classList.remove("hidden");
  adminModal.classList.add("flex");
  setTimeout(() => {
    adminModalInner.classList.remove("scale-95", "opacity-0");
    adminModalInner.classList.add("scale-100", "opacity-100");
  }, 10);
}

function closeAdminModal() {
  if (!adminModalInner) return;
  adminModalInner.classList.remove("scale-100", "opacity-100");
  adminModalInner.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    adminModal.classList.add("hidden");
    adminModal.classList.remove("flex");
  }, 300);
}

contactBtn && contactBtn.addEventListener("click", openModal);
adminBtn && adminBtn.addEventListener("click", openAdminModal);
closeContactIcon && closeContactIcon.addEventListener("click", closeModal);
closeAdminIcon && closeAdminIcon.addEventListener("click", closeAdminModal);
contactModal && contactModal.addEventListener("click", (e) => { if (e.target === contactModal) closeModal(); });
adminModal && adminModal.addEventListener("click", (e) => { if (e.target === adminModal) closeAdminModal(); });

contactFormModal && contactFormModal.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById('contactName')?.value.trim();
  const email = document.getElementById('contactEmail')?.value.trim();
  const message = document.getElementById('contactMessage')?.value.trim();
  if (!message) return showToast('Please enter a message', 'error');
  closeModal();
  showToast(`Thank you${name ? ', ' + name : ''}! Your message was received.`, 'success');
  if (contactFormModal) contactFormModal.reset();
});

adminForm && adminForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const type = document.getElementById('adminType')?.value;
  const primary = document.getElementById('adminPrimary')?.value.trim();
  const secondary = document.getElementById('adminSecondary')?.value.trim();
  const tertiary = document.getElementById('adminTertiary')?.value.trim();
  if (!type || !primary || !secondary || !tertiary) return showToast('Please fill all admin fields', 'error');
  saveAdminEntry({ id: Date.now(), type, primary, secondary, tertiary });
  closeAdminModal();
  showToast('Entry saved for the site', 'success');
  loadAllData();
});

const clearAdminEntriesBtn = document.getElementById('clearAdminEntriesBtn');
clearAdminEntriesBtn && clearAdminEntriesBtn.addEventListener('click', clearAdminEntries);

// Language switch logic
const translations = {
  en: { siteTitle:"CMP Batch 2029", heroTitle:"Welcome to CMP <br class='hidden sm:block'>Batch 2029", heroDesc:"Your central hub for the latest news, schedules, and important deadlines. Stay connected and ahead.", heroBtn:"Explore Now <svg class='w-6 h-6 animate-bounce inline ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 14l-7 7m0 0l-7-7m7 7V3'></path></svg>", tabNews:"News", tabSchedule:"Schedule", tabDeadlines:"Deadlines", newsTitle:"<span class='p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm'>📢</span> Latest News", scheduleTitle:"<span class='p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm'>📅</span> Today's Schedule", deadlinesTitle:"<span class='p-2.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl shadow-sm'>⏰</span> Deadlines", courseTh:"Course", timeTh:"Time", locationTh:"Location", dCourse:"Course", dTask:"Task", dDeadline:"Deadline", footerText:"© 2025 All Rights Reserved - Batch 2029 - Fady Fawzy", modalTitle:"Get in Touch" },
  ar: { siteTitle:"دفعة ٢٠٢٩", heroTitle:"مرحباً بكم في <br class='hidden sm:block'>دفعة ٢٠٢٩", heroDesc:"وجهتك المركزية لأحدث الأخبار، الجداول، والمواعيد النهائية الهامة. ابق على تواصل.", heroBtn:"استكشف الآن <svg class='w-6 h-6 animate-bounce inline mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 14l-7 7m0 0l-7-7m7 7V3'></path></svg>", tabNews:"الأخبار", tabSchedule:"الجدول", tabDeadlines:"المواعيد الهامة", newsTitle:"<span class='p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm'>📢</span> أحدث الأخبار", scheduleTitle:"<span class='p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm'>📅</span> جدول اليوم", deadlinesTitle:"<span class='p-2.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl shadow-sm'>⏰</span> المواعيد الهامة", courseTh:"المادة", timeTh:"الوقت", locationTh:"المكان", dCourse:"المادة", dTask:"المهمة", dDeadline:"الموعد", footerText:"© ٢٠٢٥ جميع الحقوق محفوظة - دفعة ٢٠٢٩ - فادي فوزي", modalTitle:"تواصل معنا" }
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
     if(!document.getElementById('arFont')) {
         const link = document.createElement('link');
         link.id = 'arFont';
         link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap';
         link.rel = 'stylesheet';
         document.head.appendChild(link);
     }
  } else {
     document.body.style.fontFamily = "'Inter', sans-serif";
  }

  currentSheetID = sheetIDs[lang];
  document.getElementById("newsLoading").classList.remove("hidden");
  document.getElementById("newsList").classList.add("hidden");
  loadAllData();
  
  if(!silent) {
     showToast(lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Switched to English');
  }
}

langBtn && langBtn.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "ar" : "en";
  updateLang(currentLang);
  langBtn.innerHTML = currentLang === "en" ? '<span>🌐</span> عربي' : '<span>🌐</span> English';
});

updateLang(currentLang, true);

// Google Sheets Data Loading
async function loadSheet(sheetName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${currentSheetID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    return json.table.rows.map(r => r.c.map(c => c ? (c.f ?? c.v ?? "") : ""));
  } catch (error) {
    console.error("Error loading sheet data:", error);
    return [];
  }
}

function getSavedEntries() {
  try {
    return JSON.parse(localStorage.getItem('cmp2029AdminEntries') || '[]');
  } catch {
    return [];
  }
}

function saveAdminEntry(entry) {
  const items = getSavedEntries();
  items.unshift(entry);
  localStorage.setItem('cmp2029AdminEntries', JSON.stringify(items));
}

function renderAdminEntries() {
  document.querySelectorAll('[data-admin-entry]').forEach(el => el.remove());
  const entries = getSavedEntries();
  const newsList = document.getElementById('newsList');
  const scheduleBody = document.getElementById('scheduleBody');
  const deadlinesBody = document.getElementById('deadlinesBody');
  const noNewsFound = document.getElementById('noNewsFound');

  if (newsList && entries.some(entry => entry.type === 'news')) {
    newsList.classList.remove('hidden');
    noNewsFound?.classList.add('hidden');
  }

  entries.forEach(entry => {
    if (entry.type === 'news' && newsList) {
      newsList.insertAdjacentHTML('afterbegin', `
        <div data-admin-entry="true" class="hover-card bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full" data-aos="fade-up">
          <div class="mb-4">
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight">${entry.primary}</h3>
            <span class="inline-block mt-3 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg tracking-wide uppercase">Admin</span>
          </div>
          <p class="text-base text-gray-600 dark:text-gray-400 flex-grow leading-relaxed">${entry.secondary}</p>
        </div>
      `);
    }
    if (entry.type === 'schedule' && scheduleBody) {
      scheduleBody.insertAdjacentHTML('afterbegin', `
        <tr data-admin-entry="true" class="bg-amber-50 dark:bg-amber-500/10">
          <td class="py-5 px-8 font-semibold text-gray-800 dark:text-gray-200">${entry.primary}</td>
          <td class="py-5 px-8 text-sm text-gray-600 dark:text-gray-400">${entry.secondary}</td>
          <td class="py-5 px-8 text-sm text-gray-600 dark:text-gray-400">${entry.tertiary}</td>
        </tr>
      `);
    }
    if (entry.type === 'deadline' && deadlinesBody) {
      deadlinesBody.insertAdjacentHTML('afterbegin', `
        <tr data-admin-entry="true" class="transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/50 group">
          <td class="py-5 px-8 font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">${entry.primary}</td>
          <td class="py-5 px-8 text-sm font-medium text-gray-600 dark:text-gray-400">${entry.secondary}</td>
          <td class="py-5 px-8 text-sm flex items-center">
            <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-600/20 text-amber-700 dark:text-amber-200 font-semibold shadow-sm transition-colors">
              ⏳ ${entry.tertiary}
            </span>
          </td>
        </tr>
      `);
    }
  });
}

function renderAdminEntryList() {
  const entryList = document.getElementById('adminEntryList');
  const entries = getSavedEntries();
  if (!entryList) return;
  entryList.innerHTML = '';
  if (entries.length === 0) {
    entryList.innerHTML = '<p class="text-xs text-slate-500 dark:text-slate-400">No saved entries yet. Add one to see it live in the tabs.</p>';
    return;
  }

  entries.slice(0, 6).forEach(entry => {
    const label = entry.type.charAt(0).toUpperCase() + entry.type.slice(1);
    entryList.insertAdjacentHTML('beforeend', `
      <div class="rounded-2xl bg-slate-50 dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-700">
        <div class="flex items-center justify-between gap-2 mb-2 text-xs uppercase font-semibold tracking-wide text-slate-500 dark:text-slate-400">
          <span>${label}</span>
          <span>${new Date(entry.id).toLocaleDateString()}</span>
        </div>
        <div class="text-sm text-slate-800 dark:text-slate-200 font-semibold">${entry.primary}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400">${entry.secondary}</div>
        <div class="text-xs mt-1 text-slate-500 dark:text-slate-400">${entry.tertiary}</div>
      </div>
    `);
  });
}

function clearAdminEntries() {
  localStorage.removeItem('cmp2029AdminEntries');
  renderAdminEntries();
  renderAdminEntryList();
  showToast('Admin entries cleared', 'success');
}

function loadAllData() {
  loadSheet("News").then(rows => {
    const newsList = document.getElementById("newsList");
    const newsLoading = document.getElementById("newsLoading");
    const noNewsFound = document.getElementById("noNewsFound");
    const searchInput = document.getElementById("searchNews");
    
    let allNews = rows.filter(r => r[0]); 
    
    newsLoading.classList.add("hidden");
    newsList.classList.remove("hidden");
    
    renderNews(allNews);

    if (searchInput) {
      searchInput.oninput = e => {
        const q = e.target.value.toLowerCase();
        const filtered = allNews.filter(r => (r[0] + " " + r[1]).toLowerCase().includes(q));
        renderNews(filtered);
      };
    }

    function renderNews(list) {
      newsList.innerHTML = "";
      if (list.length === 0) {
         noNewsFound.classList.remove("hidden");
      } else {
         noNewsFound.classList.add("hidden");
         list.forEach((r, index) => {
           const card = document.createElement("div");
           // Add AOS data attributes and Vanilla Tilt class
           card.className = "hover-card bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full";
           card.setAttribute('data-aos', 'fade-up');
           card.setAttribute('data-aos-delay', (index % 3) * 100);
           card.setAttribute('data-tilt', '');
           card.setAttribute('data-tilt-max', '5');
           card.setAttribute('data-tilt-speed', '400');
           card.setAttribute('data-tilt-glare', 'true');
           card.setAttribute('data-tilt-max-glare', '0.2');
           
           card.innerHTML = `
             <div class="mb-4">
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight">${r[0]}</h3>
                ${r[2] ? `<span class="inline-block mt-3 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg tracking-wide uppercase">${r[2]}</span>` : ''}
             </div>
             <p class="text-base text-gray-600 dark:text-gray-400 flex-grow leading-relaxed">${r[1]}</p>
           `;
           newsList.appendChild(card);
         });
         // Initialize tilt for new cards
         VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
      }
      AOS.refresh();
    }
  });

  loadSheet("Schedule").then(rows => {
    const scheduleBody = document.getElementById("scheduleBody");
    if (!scheduleBody) return;
    scheduleBody.innerHTML = "";
    if (rows.length === 0) {
      scheduleBody.innerHTML = `\n<tr><td colspan="3" class="py-8 text-center text-gray-500">No schedule available.</td></tr>`;
    } else {
      rows.forEach(r => {
        if (r[0]) {
          scheduleBody.innerHTML += `
            <tr class="group hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
              <td class="py-5 px-8 font-semibold text-gray-800 dark:text-gray-200">${r[0]}</td>
              <td class="py-5 px-8 text-sm text-gray-600 dark:text-gray-400">${r[1]}</td>
              <td class="py-5 px-8 text-sm text-gray-600 dark:text-gray-400">${r[2]}</td>
            </tr>`;
        }
      });
    }
  });

  loadSheet("Deadlines").then(rows => {
    const body = document.getElementById("deadlinesBody");
    body.innerHTML = "";
    if (rows.length === 0) {
       body.innerHTML = `\n<tr><td colspan="3" class="py-8 text-center text-gray-500">No deadlines available.</td></tr>`;
    } else {
      rows.forEach(r => {
        if(r[0]) {
            const isUrgent = (r[2] || '').toLowerCase().includes('today') || (r[2] || '').toLowerCase().includes('tomorrow');
            // build a safe escaped values for use in onclick
            const courseEsc = (r[0] || '').replace(/`/g, "\\`").replace(/\$/g, "\\$");
            const taskEsc = (r[1] || '').replace(/`/g, "\\`").replace(/\$/g, "\\$");
            const whenEsc = (r[2] || '').replace(/`/g, "\\`").replace(/\$/g, "\\$");
            body.innerHTML += `
              <tr class="transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/50 group">
                <td class="py-5 px-8 font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                   ${r[0]}
                   ${isUrgent ? '<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>' : ''}
                </td>
                <td class="py-5 px-8 text-sm font-medium text-gray-600 dark:text-gray-400">${r[1]}</td>
                <td class="py-5 px-8 text-sm flex items-center">
                   <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${isUrgent ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'} font-semibold shadow-sm transition-colors group-hover:bg-white dark:group-hover:bg-slate-600">
                     ${isUrgent ? '🔥' : '⏳'} ${r[2]}
                   </span>
                   <button class="calendar-btn" aria-label="Add to calendar" title="Add to calendar" onclick="downloadICS('${courseEsc}', '${taskEsc}', '${whenEsc}')">📅</button>
                </td>
              </tr>`;
        }
      });
    }
    renderAdminEntries();
    renderAdminEntryList();
  });
  
}

// Add-to-calendar helper
function downloadICS(course, task, when) {
  try {
    const title = `${course} - ${task}`.trim();
    const now = new Date();
    let start = new Date();
    const parsed = Date.parse(when);
    if (!isNaN(parsed)) {
      start = new Date(parsed);
    } else {
      start.setDate(start.getDate() + 1);
      start.setHours(9,0,0,0);
    }

    const end = new Date(start.getTime() + 60*60*1000);
    function formatDate(d) {
      return d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
    }

    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CMP2029//EN\nBEGIN:VEVENT\nUID:${Date.now()}@cmp2029.local\nDTSTAMP:${formatDate(now)}\nDTSTART:${formatDate(start)}\nDTEND:${formatDate(end)}\nSUMMARY:${title}\nDESCRIPTION:${when}\nEND:VEVENT\nEND:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.replace(/\s+/g,'_') || 'event'}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Calendar event downloaded', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to create calendar event', 'error');
  }
}

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (e.key === 'c' || e.key === 'C') { toggleChat(); showToast('Toggled chat (c)'); }
  if (e.key === 'd' || e.key === 'D') { const isDark = !document.documentElement.classList.contains('dark'); applyTheme(isDark); localStorage.setItem('theme', isDark ? 'dark' : 'light'); }
  if (e.key === 't' || e.key === 'T') { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  if (e.key === 's' || e.key === 'S') { const el = document.getElementById('searchNews'); if (el) { el.focus(); showToast('Focused search (s)'); } }
});

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("SW registered"))
      .catch(err => console.log("SW failed:", err));
  });
}
