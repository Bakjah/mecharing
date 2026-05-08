// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// KONFIGURASI FIREBASE ANDA (Ganti dengan milik Anda dari Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const alarmRef = ref(db, 'alarmSystem/status');

// Elements
const body = document.body;
const systemText = document.getElementById('system-text');
const triggerBtn = document.getElementById('trigger-btn');
const stopBtn = document.getElementById('stop-btn');
const alarmSound = document.getElementById('alarm-sound');

let titleInterval = null;

// Meminta izin notifikasi browser
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// FUNGSI UNTUK MENGUBAH STATUS DI DATABASE
const updateAlarmStatus = (isActive) => {
    set(alarmRef, {
        active: isActive,
        timestamp: Date.now()
    });
};

// MENDENGARKAN PERUBAHAN REALTIME DARI FIREBASE
onValue(alarmRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.active === true) {
        startLocalAlarm();
    } else {
        stopLocalAlarm();
    }
});

function startLocalAlarm() {
    body.classList.add('alarm-active');
    systemText.innerText = "ALARM ACTIVE!";
    alarmSound.play().catch(e => console.log("User interaction required for audio"));
    
    // Notifikasi Browser
    if (Notification.permission === "granted") {
        new Notification("⚠️ SECURITY ALERT!", { body: "Alarm has been triggered!" });
    }

    // Tab Berkedip
    if (!titleInterval) {
        titleInterval = setInterval(() => {
            document.title = document.title === "!!! ALARM !!!" ? "Realtime Alarm" : "!!! ALARM !!!";
        }, 500);
    }
}

function stopLocalAlarm() {
    body.classList.remove('alarm-active');
    systemText.innerText = "SAFE";
    alarmSound.pause();
    alarmSound.currentTime = 0;
    
    // Hentikan tab berkedip
    clearInterval(titleInterval);
    titleInterval = null;
    document.title = "Realtime Alarm System";
}

// Event Listeners
triggerBtn.addEventListener('click', () => updateAlarmStatus(true));
stopBtn.addEventListener('click', () => updateAlarmStatus(false));