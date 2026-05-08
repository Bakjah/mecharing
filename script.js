import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, update, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Menggunakan Config yang baru saja Anda dapatkan
const firebaseConfig = {
  apiKey: "AIzaSyCLtc4TqcFve3aVKluyVy8EvhCJ9wQOCfs",
  authDomain: "myfrist-22b3e.firebaseapp.com",
  databaseURL: "https://myfrist-22b3e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myfrist-22b3e",
  storageBucket: "myfrist-22b3e.firebasestorage.app",
  messagingSenderId: "893072627803",
  appId: "1:893072627803:web:5a6e93cdc36b8867f3877e",
  measurementId: "G-F2V0L229DF"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Cek apakah ini halaman Operator (index.html) atau Client (page.html)
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
                <p>Status: ${user.status.toUpperCase()}</p>
                ${user.status === 'online' ? `<button class="btn btn-danger" onclick="window.triggerCall('${id}')">CALL USER</button>` : ''}
            `;
            userListDiv.appendChild(card);
        }
    });

    window.triggerCall = (id) => {
        update(ref(db, `users/${id}`), { isCalling: true });
    };

} else {
    const loginBtn = document.getElementById('login-btn');
    const userSelect = document.getElementById('user-select');
    const overlay = document.getElementById('alarm-overlay');
    const audio = document.getElementById('alarm-sound');
    const stopBtn = document.getElementById('stop-alarm-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginBtn) {
        loginBtn.onclick = () => {
            const selectedID = userSelect.value;
            const userRef = ref(db, `users/${selectedID}`);

            update(userRef, { status: "online", isCalling: false });
            onDisconnect(userRef).update({ status: "offline", isCalling: false });

            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('status-section').classList.remove('hidden');
            document.getElementById('display-username').innerText = userSelect.options[userSelect.selectedIndex].text;

            onValue(userRef, (snap) => {
                const val = snap.val();
                if (val && val.isCalling === true) {
                    overlay.classList.remove('hidden');
                    audio.play().catch(() => console.log("Klik layar untuk aktifkan suara"));
                }
            });
        };
    }

    if (stopBtn) {
        stopBtn.onclick = () => {
            overlay.classList.add('hidden');
            audio.pause();
            audio.currentTime = 0;
            const selectedID = userSelect.value;
            update(ref(db, `users/${selectedID}`), { isCalling: false });
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            const selectedID = userSelect.value;
            update(ref(db, `users/${selectedID}`), { status: "offline", isCalling: false }).then(() => {
                location.reload();
            });
        };
    }
}