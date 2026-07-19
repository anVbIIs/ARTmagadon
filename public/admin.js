import { auth, db, storage } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    doc, 
    deleteDoc, 
    query, 
    orderBy, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// DOM Elements
const loadingOverlay = document.getElementById("loading-overlay");
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

const projectForm = document.getElementById("project-form");
const projTitle = document.getElementById("proj-title");
const projAuthor = document.getElementById("proj-author");
const projSpace = document.getElementById("proj-space");
const projDimensions = document.getElementById("proj-dimensions");
const projPrice = document.getElementById("proj-price");
const projDesc = document.getElementById("proj-desc");
const projImage = document.getElementById("proj-image");
const fileLabelText = document.getElementById("file-label-text");
const dashboardAlert = document.getElementById("dashboard-alert");
const projectsContainer = document.getElementById("projects-list-container");

// Helper to show/hide loading
function showLoading(show) {
    if (show) loadingOverlay.classList.add("active");
    else loadingOverlay.classList.remove("active");
}

// Helper to show alert messages
function showAlert(message, type = "success") {
    dashboardAlert.textContent = message;
    dashboardAlert.className = `alert-msg ${type}`;
    dashboardAlert.style.display = "block";
    
    // Scroll to alert
    dashboardAlert.scrollIntoView({ behavior: "smooth" });

    // Hide after 5 seconds
    setTimeout(() => {
        dashboardAlert.style.display = "none";
    }, 5000);
}

// --- 1. AUTHENTICATION CONTROLLER ---

// Check auth state
showLoading(true);
onAuthStateChanged(auth, (user) => {
    showLoading(false);
    if (user) {
        // User logged in -> show dashboard
        authSection.style.display = "none";
        dashboardSection.classList.add("active");
        loadProjects(); // Start listening for updates
    } else {
        // User logged out -> show auth screen
        dashboardSection.classList.remove("active");
        authSection.style.display = "flex";
        projectsContainer.innerHTML = "";
    }
});

// Login Form Submit
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.style.display = "none";
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    showLoading(true);
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            showLoading(false);
            loginForm.reset();
        })
        .catch((error) => {
            showLoading(false);
            console.error("Login error:", error);
            loginError.textContent = "Błędne dane logowania. Spróbuj ponownie.";
            loginError.style.display = "block";
        });
});

// Logout Button Click
logoutBtn.addEventListener("click", () => {
    showLoading(true);
    signOut(auth)
        .then(() => {
            showLoading(false);
        })
        .catch((error) => {
            showLoading(false);
            console.error("Logout error:", error);
        });
});

// --- 2. FILE UPLOAD VISUALS ---

projImage.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
        fileLabelText.textContent = `Wybrany plik: ${e.target.files[0].name}`;
        fileLabelText.style.color = "var(--color-agni-yellow)";
    } else {
        fileLabelText.textContent = "Kliknij lub przeciągnij plik tutaj";
        fileLabelText.style.color = "";
    }
});

// --- 3. PROJECT CRUD OPERATIONS ---

// Add Project Form Submit
projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = projTitle.value.trim();
    const author = projAuthor.value;
    const space = projSpace.value;
    const dimensions = projDimensions.value.trim();
    const price = projPrice.value.trim();
    const desc = projDesc.value.trim();
    const file = projImage.files[0];

    if (!file) {
        showAlert("Wybierz zdjęcie projektu!", "error");
        return;
    }

    // Determine badge class based on space selection
    let badgeClass = "badge-any";
    if (space.includes("Wnętrze")) badgeClass = "badge-inside";
    else if (space.includes("Zewnętrzna")) badgeClass = "badge-outside";

    showLoading(true);

    try {
        // 1. Upload file to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const storageRef = ref(storage, `projects/${fileName}`);

        const uploadResult = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(uploadResult.ref);

        // 2. Add document metadata to Firestore
        await addDoc(collection(db, "projects"), {
            title,
            author,
            space,
            badgeClass,
            dimensions,
            price,
            desc,
            img: downloadUrl,
            storagePath: `projects/${fileName}`, // Keep path to delete later
            createdAt: Date.now()
        });

        showLoading(false);
        showAlert("Projekt został dodany pomyślnie!");
        
        // Reset form
        projectForm.reset();
        fileLabelText.textContent = "Kliknij lub przeciągnij plik tutaj";
        fileLabelText.style.color = "";

    } catch (error) {
        showLoading(false);
        console.error("Error saving project:", error);
        showAlert(`Wystąpił błąd podczas dodawania projektu: ${error.message}`, "error");
    }
});

// Load Projects and listen to updates
let unsubscribeProjects = null;
function loadProjects() {
    // Unsubscribe from previous listener if active
    if (unsubscribeProjects) {
        unsubscribeProjects();
    }

    const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));

    unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
        projectsContainer.innerHTML = "";

        if (snapshot.empty) {
            projectsContainer.innerHTML = `
                <p class="text-mono" style="color: rgba(244,244,244,0.3); text-align: center; padding: 40px 0;">
                    Brak dodanych projektów. Strona wyświetli projekty domyślne.
                </p>
            `;
            return;
        }

        snapshot.forEach((docSnap) => {
            const project = docSnap.data();
            const id = docSnap.id;

            const itemHtml = `
                <div class="admin-project-item">
                    <img class="admin-project-thumb" src="${project.img}" alt="${project.title}">
                    <div class="admin-project-info">
                        <h4>${project.title}</h4>
                        <p>${project.author} • ${project.space}</p>
                    </div>
                    <button class="admin-btn admin-btn-danger delete-btn" data-id="${id}" data-storage="${project.storagePath || ''}">
                        Usuń
                    </button>
                </div>
            `;
            projectsContainer.insertAdjacentHTML("beforeend", itemHtml);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", handleDeleteProject);
        });
    }, (error) => {
        console.error("Firestore loading error:", error);
        projectsContainer.innerHTML = `
            <p class="text-mono error" style="text-align: center; padding: 40px 0; color: var(--color-agni-red);">
                Błąd ładowania danych: ${error.message}
            </p>
        `;
    });
}

// Delete Project
async function handleDeleteProject(e) {
    const docId = e.target.dataset.id;
    const storagePath = e.target.dataset.storage;

    if (!confirm("Czy na pewno chcesz usunąć ten projekt ze strony?")) {
        return;
    }

    showLoading(true);

    try {
        // 1. Delete document from Firestore
        await deleteDoc(doc(db, "projects", docId));

        // 2. Delete file from Storage if path exists
        if (storagePath) {
            const fileRef = ref(storage, storagePath);
            await deleteObject(fileRef);
        }

        showLoading(false);
        showAlert("Projekt został usunięty.");
    } catch (error) {
        showLoading(false);
        console.error("Error deleting project:", error);
        showAlert(`Błąd podczas usuwania projektu: ${error.message}`, "error");
    }
}
