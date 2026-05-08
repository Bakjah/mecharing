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
                <p>Status: <strong>${user.status.toUpperCase()}</strong></p>
                ${user.status === 'online' ? `<button class="btn btn-danger" onclick="window.makeCall('${id}')">CALL</button>` : ''}
                ${user.status === 'otw' ? `<span class="status-otw-text">🏃 Sedang Menuju Lokasi</span>` : ''}
            `;
            userListDiv.appendChild(card);
        }
    });
    window.makeCall = (id) => update(ref(db, `users/${id}`), { isCalling: true });

} else {
    const loginBtn = document.getElementById('login-btn');
    const userSelect = document.getElementById('user-select');
    const overlay = document.getElementById('alarm-overlay');
    const audio = document.getElementById('alarm-sound');
    const otwBtn = document.getElementById('otw-btn');
    const stopBtn = document.getElementById('stop-alarm-btn');

    loginBtn.onclick = () => {
        const id = userSelect.value;
        const userRef = ref(db, `users/${id}`);
        
        update(userRef, { status: "online", isCalling: false });
        onDisconnect(userRef).update({ status: "offline", isCalling: false });

        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('status-section').classList.remove('hidden');
        document.getElementById('display-username').innerText = userSelect.options[userSelect.selectedIndex].text;

        onValue(userRef, (snap) => {
            const data = snap.val();
            if (data?.isCalling === true) {
                overlay.classList.remove('hidden');
                audio.play().catch(() => {});
            } else {
                overlay.classList.add('hidden');
                audio.pause();
                audio.currentTime = 0;
            }
            
            // Update UI status di halaman client sendiri
            const indicator = document.getElementById('status-indicator');
            indicator.className = `status-badge ${data.status}`;
            indicator.innerText = data.status.toUpperCase();
        });
    };

    otwBtn.onclick = () => {
        update(ref(db, `users/${userSelect.value}`), { status: "otw", isCalling: false });
    };

    stopBtn.onclick = () => {
        update(ref(db, `users/${userSelect.value}`), { isCalling: false });
    };

    document.getElementById('logout-btn').onclick = () => location.reload();
}