import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, onDisconnect, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 1. PASTE FIREBASE CONFIG ANDA DI SINI
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "project-anda.firebaseapp.com",
    databaseURL: "https://project-anda.firebaseio.com",
    projectId: "project-anda",
    storageBucket: "project-anda.appspot.com",
    messagingSenderId: "0000000000",
    appId: "1:0000000:web:000000"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Menentukan Halaman
const isOperator = document.title.includes("Operator");

// --- LOGIKA OPERATOR (index.html) ---
if (isOperator) {
    const userListDiv = document.getElementById('user-list');

    onValue(ref(db, 'users'), (snapshot) => {
        userListDiv.innerHTML = "";
        const data = snapshot.val();
        if (!data) {
            userListDiv.innerHTML = "<p>Tidak ada user online.</p>";
            return;
        }

        Object.keys(data).forEach(key => {
            const user = data[key];
            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <h3>${user.username}</h3>
                <button class="btn btn-danger call-btn" data-id="${key}">CALL USER</button>
            `;
            userListDiv.appendChild(card);

            card.querySelector('.call-btn').onclick = () => {
                update(ref(db, `users/${key}`), { isCalling: true });
            };
        });
    });
}

// --- LOGIKA CLIENT (page.html) ---
else {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const stopBtn = document.getElementById('stop-alarm-btn');
    const usernameInput = document.getElementById('username-input');
    const overlay = document.getElementById('alarm-overlay');
    const audio = document.getElementById('alarm-sound');
    
    let userKey = null;

    loginBtn.onclick = () => {
        const name = usernameInput.value.trim();
        if (!name) return alert("Masukkan nama!");

        const newUserRef = push(ref(db, 'users'));
        userKey = newUserRef.key;

        const userData = { username: name, isCalling: false };
        set(newUserRef, userData);

        // Auto Logout saat tutup tab
        onDisconnect(newUserRef).remove();

        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('status-section').classList.remove('hidden');
        document.getElementById('display-username').innerText = name;

        // Listen Panggilan
        onValue(newUserRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.isCalling) {
                overlay.classList.remove('hidden');
                audio.play();
                document.title = "!!! DIPANGGIL !!!";
            }
        });
    };

    stopBtn.onclick = () => {
        overlay.classList.add('hidden');
        audio.pause();
        audio.currentTime = 0;
        document.title = "Client - Realtime Caller";
        update(ref(db, `users/${userKey}`), { isCalling: false });
    };

    logoutBtn.onclick = () => {
        remove(ref(db, `users/${userKey}`)).then(() => location.reload());
    };
}