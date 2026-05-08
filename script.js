import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getDatabase,
    ref,
    onValue,
    update,
    onDisconnect
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBpKmLeUj6XACRQuecJdG0t2AK-BGDyt5w",
    authDomain: "myfrist-22b3e.firebaseapp.com",
    databaseURL: "https://myfrist-22b3e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "myfrist-22b3e",
    storageBucket: "myfrist-22b3e.firebasestorage.app",
    messagingSenderId: "893072627803",
    appId: "1:893072627803:web:5a6e93cdc36b8867f3877e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const isOperator = document.title.toLowerCase().includes("operator");

function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast show";
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

async function getHash(text) {
    const cleanText = text.trim().toLowerCase();
    const encoder = new TextEncoder();
    const data = encoder.encode(cleanText);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const MASTER_HASH = "d295f3500f6895062de780b07f1c00f6ba84901dc109b3d87afb40978a799b35";

if (isOperator) {
    const userListDiv = document.getElementById("user-list");
    let lastStatuses = {};

    onValue(ref(db, "users"), (snapshot) => {
        userListDiv.innerHTML = "";
        const data = snapshot.val();
        if (!data) return;

        for (let id in data) {
            const user = data[id];
        
            if (lastStatuses[id] === 'online' && user.status === 'otw') {
                showToast(`🚀 ${user.username} sedang menuju lokasi!`);
            }
            lastStatuses[id] = user.status;

            const card = document.createElement("div");
            card.className = `user-card ${user.status}`;
            card.innerHTML = `
                <h3>${user.username}</h3>
                <small>${user.status.toUpperCase()}</small>
                <div style="margin-top:20px;">
                    ${user.status === "online" 
                        ? `<button class="btn btn-danger" onclick="window.makeCall('${id}')">CALL NOW</button>` 
                        : ""
                    }
                    ${user.status === "otw" 
                        ? `<p style="color:#fbbf24; font-weight:800; margin:0;">📍 SEDANG MENUJU LOKASI</p>` 
                        : ""
                    }
                </div>
            `;
            userListDiv.appendChild(card);
        }
    });

    window.makeCall = (id) => {
        update(ref(db, `users/${id}`), { isCalling: true });
    };

} else {
    const loginBtn = document.getElementById("login-btn");
    const userSelect = document.getElementById("user-select");
    const loginSection = document.getElementById("login-section");
    const statusSection = document.getElementById("status-section");
    const displayUsername = document.getElementById("display-username");
    const statusIndicator = document.getElementById("status-indicator");
    const overlay = document.getElementById("alarm-overlay");
    const audio = document.getElementById("alarm-sound");
    const arrivedBtn = document.getElementById("arrived-btn");

    let currentUserId = null;

    loginBtn.onclick = async () => {
        const pin = prompt("Masukkan PIN Akses:");
        if (!pin) return;
        const hashedInput = await getHash(pin);
        if (hashedInput !== MASTER_HASH) {
            alert("❌ PIN SALAH!");
            return;
        }

        const id = userSelect.value;
        currentUserId = id;
        const username = userSelect.options[userSelect.selectedIndex].text;
        const userRef = ref(db, `users/${id}`);

        update(userRef, { username: username, status: "online", isCalling: false });
        onDisconnect(userRef).update({ status: "offline", isCalling: false });

        loginSection.classList.add("hidden");
        statusSection.classList.remove("hidden");
        displayUsername.innerText = username;

        onValue(userRef, (snapshot) => {
            const val = snapshot.val();
            if (!val) return;
            if (val.isCalling) {
                overlay.classList.remove("hidden");
                audio.loop = true;
                audio.play().catch(() => { });
            } else {
                overlay.classList.add("hidden");
                audio.pause();
                audio.currentTime = 0;
            }
            statusIndicator.className = `status-badge ${val.status}`;
            statusIndicator.innerText = val.status.toUpperCase();
            if (val.status === "otw") arrivedBtn.classList.remove("hidden");
            else arrivedBtn.classList.add('hidden');
        });
    };

    document.getElementById("otw-btn").onclick = () => {
        update(ref(db, `users/${currentUserId}`), { status: "otw", isCalling: false });
    };

    arrivedBtn.onclick = () => {
        update(ref(db, `users/${currentUserId}`), { status: "online" });
    };

    document.getElementById("stop-alarm-btn").onclick = () => {
        update(ref(db, `users/${currentUserId}`), { isCalling: false });
    };

    document.getElementById("logout-btn").onclick = () => {
        update(ref(db, `users/${currentUserId}`), { status: "offline", isCalling: false });
        location.reload();
    };
}