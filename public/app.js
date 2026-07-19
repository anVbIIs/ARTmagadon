import { db } from "./firebase-config.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* ==========================================================================
   STUDIO ARTMAGADON - INTERACTIVE JAVASCRIPT
   Handles: Split-screen animations, FAQ accordions, Form auto-calculation,
   and dynamic lightbox modals for free projects.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Split-Screen Mobile Taps ---
    const panelAgnieszka = document.querySelector('.panel-agnieszka');
    const panelAgata = document.querySelector('.panel-agata');

    if (panelAgnieszka && panelAgata) {
        // Mobile Tap Support
        const panels = [panelAgnieszka, panelAgata];
        panels.forEach(panel => {
            panel.addEventListener('click', (e) => {
                // If the click is on a button or link, let it bubble
                if (e.target.closest('.panel-btn')) return;

                const isExpanded = panel.classList.contains('expanded');
                panels.forEach(p => p.classList.remove('expanded'));

                if (!isExpanded) {
                    panel.classList.add('expanded');
                }
            });
        });
    }

    // --- 2. FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close other items
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Open clicked item
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // --- 2b. Regulamin Accordion ---
    const termsItems = document.querySelectorAll('.terms-item');
    termsItems.forEach(item => {
        const question = item.querySelector('.terms-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close other items
            termsItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.terms-content').style.maxHeight = null;
            });

            // Open clicked item
            if (!isActive) {
                item.classList.add('active');
                const content = item.querySelector('.terms-content');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // --- 3. Interactive Form Area Calculation ---
    const wallWidthInput = document.getElementById('wall-width');
    const wallHeightInput = document.getElementById('wall-height');
    const areaBadge = document.getElementById('area-badge');

    const updateCalculatedArea = () => {
        const width = parseFloat(wallWidthInput.value);
        const height = parseFloat(wallHeightInput.value);

        if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
            const area = (width * height).toFixed(2);
            areaBadge.textContent = `Powierzchnia: ${area} m²`;
            areaBadge.classList.add('show');
        } else {
            areaBadge.classList.remove('show');
        }
    };

    if (wallWidthInput && wallHeightInput && areaBadge) {
        wallWidthInput.addEventListener('input', updateCalculatedArea);
        wallHeightInput.addEventListener('input', updateCalculatedArea);
    }

    // --- 4. Form Submission and mailto Generation ---
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const width = wallWidthInput.value.trim();
            const height = wallHeightInput.value.trim();
            const location = document.getElementById('wall-location').value.trim();
            const spaceTypeSelect = document.getElementById('space-type');
            const spaceType = spaceTypeSelect.options[spaceTypeSelect.selectedIndex].text;
            const wallState = document.getElementById('wall-state').value.trim();
            const budgetSelect = document.getElementById('estimated-budget');
            const budget = budgetSelect.options[budgetSelect.selectedIndex].text;

            const area = (parseFloat(width) * parseFloat(height)).toFixed(2);

            // Construct email text
            const emailSubject = "Zapytanie o wycenę muralu - Studio ARTmagadon";
            const emailBody = `Dzień dobry,

Chciał(a)bym zapytać o wycenę projektu i realizację muralu. Oto szczegóły:

- Wymiary ściany: ${width} m (szerokość) x ${height} m (wysokość)
- Łączna powierzchnia: ${area} m²
- Lokalizacja: ${location}
- Typ przestrzeni: ${spaceType}
- Stan ściany: ${wallState}
- Szacowany budżet: ${budget}

Proszę o kontakt zwrotny w celu omówienia szczegółów.

Pozdrawiam,`;

            // Open mail client with mailto
            const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            window.location.href = mailtoUrl;

            // Optional alert
            alert("Wygenerowano formularz wyceny! Twój program pocztowy powinien się otworzyć automatycznie. Proszę wpisać adres e-mail odbiorcy w polu 'Do' (adres mailowy do uzupełnienia).");
        });
    }

    // --- 5. Portfolio Modals & Lightbox ---
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalClose = document.getElementById('modal-close');

    const openModal = (htmlContent) => {
        if (modalContent && modalOverlay) {
            modalContent.innerHTML = htmlContent;
            modalOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // Lock scroll
        }
    };

    const closeModal = () => {
        if (modalOverlay) {
            modalOverlay.classList.remove('open');
            document.body.style.overflow = ''; // Unlock scroll
        }
    };

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Dynamic Artist Portfolio Loading
    window.openArtistPortfolio = (artist) => {
        let content = '';

        if (artist === 'agnieszka') {
            content = `
                <div class="portfolio-intro">
                    <span class="text-mono" style="color: var(--color-agni-yellow);">Portfolio</span>
                    <h3>Agnieszka</h3>
                    <p class="text-mono" style="margin-bottom: 20px;">Magister Sztuki (MFA) - Specjalność: Malarstwo ścienne & Geometria</p>
                    <p style="color: rgba(244, 244, 244, 0.7); line-height: 1.7; margin-bottom: 30px;">
                        Mój styl to ustrukturyzowany chaos. Łączę klasyczne techniki malarskie z komiksowym sznytem, graffiti oraz geometryczną precyzją. Moje realizacje charakteryzują się wyrazistą kreską, żywymi, podstawowymi barwami oraz zabawą perspektywą i formą w przestrzeni miejskiej.
                    </p>
                </div>
                <div class="portfolio-works-grid">
                    <div class="portfolio-work-item">
                        <img class="portfolio-work-img" src="./tła/mural_agnieszki.webp" alt="Realizacja Agnieszki">
                        <div class="manifesto-caption">Mural wielkoformatowy - Styl geometryczno-komiksowy</div>
                    </div>
                    <div class="portfolio-work-item" style="background-color: rgba(255,255,255,0.02); display: flex; align-items: center; justify-content: center; padding: 20px; border: 1px dashed var(--color-border-opacity);">
                        <div style="text-align: center; color: rgba(244,244,244,0.4);">
                            <span class="text-mono" style="display:block; margin-bottom:10px;">Wkrótce więcej</span>
                            <span>Kolejne projekty w przygotowaniu</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (artist === 'agata') {
            content = `
                <div class="portfolio-intro">
                    <span class="text-mono" style="color: var(--color-agata-turquoise);">Portfolio</span>
                    <h3>Agata</h3>
                    <p class="text-mono" style="margin-bottom: 20px;">Magister Sztuki (MFA) - Specjalność: Muralizm organiczny & Malarstwo materii</p>
                    <p style="color: rgba(244, 244, 244, 0.7); line-height: 1.7; margin-bottom: 30px;">
                        Moja twórczość karmi się naturą, mrokiem i metafizycznym niepokojem. Tworzę teksturowane kompozycje, w których roślinne formy mieszają się z głębokimi gradientami, fioletami i turkusami. Moje murale mają wprowadzać widza w stan kontemplacji i wyciszenia, tworząc harmonijny pomost między architekturą a światem przyrody.
                    </p>
                </div>
                <div class="portfolio-works-grid">
                    <div class="portfolio-work-item">
                        <img class="portfolio-work-img" src="./tła/mural_agaty.webp" alt="Realizacja Agaty">
                        <div class="manifesto-caption">Organiczny mrok - Mural leśny</div>
                    </div>
                    <div class="portfolio-work-item">
                        <img class="portfolio-work-img" src="./tła/mural_do_obrocenia_agaty.webp" alt="Realizacja Agaty - detal">
                        <div class="manifesto-caption">Tekstury i detale botaniczne</div>
                    </div>
                </div>
            `;
        }

        openModal(content);
    };

    // Fallback static database
    const staticProjectDatabase = {
        'proj-1': {
            title: 'Mroczny Portret Natury',
            desc: 'Niezrealizowany projekt cyfrowy łączący organiczne pnącza i leśne tekstury z głębokimi, hipnotyzującymi gradientami fioletu i turkusu. Doskonale sprawdzi się w nowoczesnych salonach, sypialniach lub klimatycznych lokalach gastronomicznych.',
            img: './wolne projekty na murale/1000001375_opt.webp',
            author: 'Agata',
            space: 'Wnętrze (salon, kawiarnia)',
            badgeClass: 'badge-inside',
            dimensions: 'Sugerowane: min. 3m x 2.5m',
            price: 'Projekt autorski + wykonanie'
        },
        'proj-2': {
            title: 'Elewacja Szpitalna Toruń',
            desc: 'Projekt koncepcyjny przygotowany dla placówki medycznej w Toruniu. Ustrukturyzowana kompozycja geometryczna o charakterze terapeutycznym i ożywiającym przestrzeń publiczną. Jasne, pogodne odcienie żółci, niebieskiego i bieli.',
            img: './wolne projekty na murale/2023071920szpital20torun20PPW20v4-A0720elewacja20pd_opt.webp',
            author: 'Agnieszka',
            space: 'Zewnętrzna (elewacja, mur)',
            badgeClass: 'badge-outside',
            dimensions: 'Sugerowane: min. 8m x 4m',
            price: 'Koncepcja gotowa do adaptacji'
        },
        'proj-3': {
            title: 'Kompozycja Botaniczna',
            desc: 'Delikatny i nastrojowy szkic botaniczny o wysokiej estetyce. Połączenie linearnych rysunków roślin z plamami akwarelowych gradientów w kolorach leśnego mchu i nasyconego turkusu.',
            img: './wolne projekty na murale/Grafika_bez_nazwy-3_opt.webp',
            author: 'Agata',
            space: 'Dowolna przestrzeń',
            badgeClass: 'badge-any',
            dimensions: 'Sugerowane: min. 2.5m x 2.2m',
            price: 'Dostępny od zaraz'
        },
        'proj-4': {
            title: 'Światło w Cieniu',
            desc: 'Mroczna i ekspresyjna wizja malarska skupiająca się na grze światłocienia. Głębokie kontrasty i organiczne, pfynne formy wyłaniające się z tła. Idealny projekt do wnętrz o charakterze loftowym.',
            img: './wolne projekty na murale/IMG_1372_opt.webp',
            author: 'Agata',
            space: 'Wnętrze',
            badgeClass: 'badge-inside',
            dimensions: 'Sugerowane: min. 4m x 3m',
            price: 'Wykonanie na zamówienie'
        },
        'proj-5': {
            title: 'Geometryczny Puls Miasta',
            desc: 'Wysokoenergetyczna kompozycja złożona z nachodzących na siebie kół, pasów i ostrych kątów. Wyrazisty styl komiksowy bazujący na barwach podstawowych, który tchnie życie w każdą surową ścianę biurową czy fasadę.',
            img: './wolne projekty na murale/Projekt (20231006054119)_opt.webp',
            author: 'Agnieszka',
            space: 'Wnętrze / Zewnątrz',
            badgeClass: 'badge-any',
            dimensions: 'Sugerowane: min. 5m x 3m',
            price: 'Projekt autorski + adaptacja'
        },
        'proj-6': {
            title: 'Struktura Abstrakcji',
            desc: 'Nowoczesny projekt łączący brutalistyczne szare tekstury betonowe z czystym, geometrycznym wektorem w odcieniach intensywnego błękitu i czerwieni. Świetny wybór do dynamicznych przestrzeni coworkingowych.',
            img: './wolne projekty na murale/Projekt (20250425062454)_opt.webp',
            author: 'Agnieszka',
            space: 'Wnętrze (biuro, korytarz)',
            badgeClass: 'badge-inside',
            dimensions: 'Sugerowane: min. 6m x 2.8m',
            price: 'Projekt autorski + wykonanie'
        }
    };

    // Active project database loaded from Firebase or fallbacks
    let projectDatabase = {};

    // Render projects in HTML
    const projectsGrid = document.getElementById("projects-grid");

    function renderProjects(projectsObj) {
        if (!projectsGrid) return;
        projectsGrid.innerHTML = "";
        
        let index = 0;
        for (const key in projectsObj) {
            const proj = projectsObj[key];
            // Bento Grid: Index 0, 4, 8, etc. are large
            const isLarge = (index % 4 === 0);
            const cardClass = isLarge ? "project-card large" : "project-card";
            
            const cardHtml = `
                <div class="${cardClass}" onclick="openProjectDetail('${key}')">
                    <div class="project-card-img-wrapper">
                        <img src="${proj.img}" alt="${proj.title}" class="project-card-img">
                        <div class="project-card-overlay">
                            <h3 class="project-card-title">${proj.title}</h3>
                            <span class="project-card-badge ${proj.badgeClass}">${proj.space}</span>
                        </div>
                    </div>
                </div>
            `;
            projectsGrid.insertAdjacentHTML("beforeend", cardHtml);
            index++;
        }
    }

    // Set up Realtime listener to Firestore
    try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                // If DB is empty, use static fallbacks
                projectDatabase = { ...staticProjectDatabase };
                renderProjects(projectDatabase);
            } else {
                projectDatabase = {};
                snapshot.forEach((docSnap) => {
                    projectDatabase[docSnap.id] = docSnap.data();
                });
                renderProjects(projectDatabase);
            }
        }, (error) => {
            console.warn("Firestore error, falling back to static projects:", error);
            projectDatabase = { ...staticProjectDatabase };
            renderProjects(projectDatabase);
        });
    } catch (e) {
        console.warn("Firebase not ready, using static fallback:", e);
        projectDatabase = { ...staticProjectDatabase };
        renderProjects(projectDatabase);
    }

    window.openProjectDetail = (projId) => {
        const proj = projectDatabase[projId];
        if (!proj) return;

        const content = `
            <div class="lightbox-grid">
                <div class="lightbox-img-container">
                    <img style="width:100%; height:100%; object-fit:cover;" src="${proj.img}" alt="${proj.title}">
                </div>
                <div class="lightbox-details">
                    <span class="text-mono ${proj.badgeClass} project-card-badge" style="margin-bottom: 15px;">${proj.space}</span>
                    <h3 class="lightbox-title">${proj.title}</h3>
                    <p class="lightbox-desc">${proj.desc}</p>
                    <div class="lightbox-meta">
                        <span><strong>Autorstwo:</strong> Studio ARTmagadon (${proj.author})</span>
                        <span><strong>Wymiary:</strong> ${proj.dimensions}</span>
                        <span><strong>Cena/Wycena:</strong> ${proj.price}</span>
                    </div>
                    <div class="lightbox-buy-btn" onclick="selectProjectForQuote('${proj.title}')">Chcę ten wzór na ścianie</div>
                </div>
            </div>
        `;

        openModal(content);
    };

    window.selectProjectForQuote = (projTitle) => {
        closeModal();
        
        // Scroll to form
        const quoteSection = document.getElementById('quote');
        if (quoteSection) {
            quoteSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Fill form fields or add detail to wall state
        const wallStateInput = document.getElementById('wall-state');
        if (wallStateInput) {
            wallStateInput.value = `Interesuje mnie realizacja wzoru: "${projTitle}". Stan ściany: `;
            wallStateInput.focus();
        }
    };
});
