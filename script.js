import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, update, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLtc4TqcFve3aVKluyVy8EvhCJ9wQOCfs",
  authDomain: "myfrist-22b3e.firebaseapp.com",
  databaseURL: "https://myfrist-22b3e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myfrist-22b3e",
  storageBucket: "myfrist-22b3e.firebasestorage.app",
  messagingSenderId: "893072627803",
  appId: "1:893072627803:web:5a6e93cdc36b8867f3877e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const isOperator = document.title.includes("Operator");

if (isOperator) {
    // --- LOGIKA HALAMAN OPERATOR (INDEX) ---
    const userListDiv = document.getElementById('user-list');

    onValue(ref(db, 'users'), (snapshot) => {
        userListDiv.innerHTML = "";
        const data = snapshot.val();
        for (let id in data) {
            const user = data[id];
            const card = document.createElement('div');
            card.className = `user-card ${user.status}`;
            card.innerHTML = `
                <h3>${user.username}</h3>
                <p>${user.status.toUpperCase()}</p>
                ${user.status === 'online' ? `<button class="btn btn-danger" onclick="window.makeCall('${id}')">CALL</button>` : ''}
            `;
            userListDiv.appendChild(card);
        }
    });

    window.makeCall = (id) => {
        update(ref(db, `users/${id}`), { isCalling: true });
    };

} else {
    // --- LOGIKA HALAMAN CLIENT (PAGE) ---
    const loginBtn = document.getElementById('login-btn');
    const userSelect = document.getElementById('user-select');
    const overlay = document.getElementById('alarm-overlay');
    const audio = document.getElementById('alarm-sound');
    const stopBtn = document.getElementById('stop-alarm-btn');

    loginBtn.onclick = () => {
        const id = userSelect.value;
        const userRef = ref(db, `users/${id}`);

        // Set Online
        update(userRef, { status: "online", isCalling: false });
        onDisconnect(userRef).update({ status: "offline", isCalling: false });

        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('status-section').classList.remove('hidden');
        document.getElementById('display-username').innerText = userSelect.options[userSelect.selectedIndex].text;

        // Pantau Panggilan
        onValue(userRef, (snap) => {
            if (snap.val()?.isCalling === true) {
                overlay.classList.remove('hidden');
                audio.play().catch(() => console.log("Klik layar untuk suara"));
            } else {
                overlay.classList.add('hidden');
                audio.pause();
                audio.currentTime = 0;
            }
        });
    };

    stopBtn.onclick = () => {
        const id = userSelect.value;
        update(ref(db, `users/${id}`), { isCalling: false });
    };

    document.getElementById('logout-btn').onclick = () => {
        location.reload(); // Refresh akan otomatis memicu onDisconnect
    };
}