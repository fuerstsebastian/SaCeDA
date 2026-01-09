// === KONFIGURATION & I18N ===
let currentLang = 'de';

const translations = {
    de: {
        nav_home: "Home",
        nav_projects: "Projekte",
        nav_people: "Team & Kontakt",
        nav_methods: "Kompetenzen",
        nav_teaching: "Lehre",
        
        hero_title: "SaCeDA",
        hero_text: "Willkommen am Saarland Center for Digital Archaeology. Wir erforschen die Vergangenheit mit den Methoden der Zukunft. Durch die Verbindung von modernster Datenerfassung, KI-gestützter Analyse und virtueller Rekonstruktion machen wir kulturelles Erbe nicht nur sichtbar, sondern digital erlebbar.",
        hero_btn: "Unsere Projekte entdecken",
        
        page_projects: "Projekte",
        intro_projects: "Unsere aktuellen Forschungsprojekte im Überblick.",
        projects_loading: "Projekte werden geladen...",
        more_info: "Mehr erfahren →",
        
        page_people: "Team & Kontakt",
        intro_people: "Die Köpfe hinter SaCeDA.",
        role_speaker: "Sprecherin",
        role_vice: "Stellv. Sprecher(in)",
        
        page_methods: "Methoden & Kompetenzen",
        intro_methods: "Dieses interaktive Netzwerk zeigt, welche Personen Expertise in welchen Methoden und Anwendungsfeldern besitzen. Nutzen Sie die Filter, um spezifische Verbindungen zu erforschen.",
        filter_people: "Personen",
        filter_methods: "Methoden",
        btn_all: "Alle",
        btn_none: "Keine",
        
        page_teaching: "Lehre",
        intro_teaching: "Ausbildung im Bereich Digitale Archäologie.",
        teaching_offer: "Studienangebot",
        teaching_text: "Unsere Lehrveranstaltungen vermitteln theoretische und praktische Kenntnisse im Umgang mit digitalen Methoden in der Archäologie.",
        lsf_btn: "Zum Vorlesungsverzeichnis (LSF) ↗",
        
        detail_back: "← Zurück zur Übersicht",
        detail_team: "Projektbeteiligte:",
        detail_methods: "Angewandte Methoden",
        detail_partners: "Partner & Förderung",
        detail_pubs: "Publikationen",
        missing_desc: "Keine Beschreibung verfügbar.",
        missing_summary: "Keine Zusammenfassung.",
        photo_missing: "Foto fehlt"
    },
    en: {
        nav_home: "Home",
        nav_projects: "Projects",
        nav_people: "Team & Contact",
        nav_methods: "Competencies",
        nav_teaching: "Teaching",
        
        hero_title: "SaCeDA",
        hero_text: "Welcome to the Saarland Center for Digital Archaeology. We explore the past using the methods of the future. By combining state-of-the-art data acquisition, AI-assisted analysis, and virtual reconstruction, we not only make cultural heritage visible but digitally tangible.",
        hero_btn: "Discover our projects",
        
        page_projects: "Projects",
        intro_projects: "An overview of our current research projects.",
        projects_loading: "Loading projects...",
        more_info: "Learn more →",
        
        page_people: "Team & Contact",
        intro_people: "The people behind SaCeDA.",
        role_speaker: "Spokesperson",
        role_vice: "Vice Spokesperson",
        
        page_methods: "Methods & Competencies",
        intro_methods: "This interactive network visualizes who possesses expertise in which methods and application fields. Use the filters to explore specific connections.",
        filter_people: "People",
        filter_methods: "Methods",
        btn_all: "All",
        btn_none: "None",
        
        page_teaching: "Teaching",
        intro_teaching: "Education in Digital Archaeology.",
        teaching_offer: "Study Programs",
        teaching_text: "Our courses provide theoretical and practical knowledge in handling digital methods in archaeology.",
        lsf_btn: "To Course Catalog (LSF) ↗",
        
        detail_back: "← Back to overview",
        detail_team: "Project Team:",
        detail_methods: "Applied Methods",
        detail_partners: "Partners & Funding",
        detail_pubs: "Publications",
        missing_desc: "No description available.",
        missing_summary: "No summary available.",
        photo_missing: "Photo missing"
    }
};

// Helper: Text holen
function t(key) {
    return translations[currentLang][key] || key;
}

// Globale Datenspeicher
let store = {
    network: null,
    projects: null,
    links: null
};

// Initialisierung
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupNavigation();
    updateStaticTexts();
    renderPage('home');
});

// Sprachumschaltung
function toggleLanguage() {
    currentLang = currentLang === 'de' ? 'en' : 'de';
    document.getElementById('lang-toggle').textContent = currentLang === 'de' ? 'EN' : 'DE';
    updateStaticTexts();
    
    // Aktuelle Seite neu rendern
    const activeLink = document.querySelector('.nav-links a.active');
    const page = activeLink ? activeLink.getAttribute('data-page') : 'home';
    renderPage(page);
}

function updateStaticTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}

async function loadData() {
    try {
        const [netRes, projRes, linkRes] = await Promise.all([
            fetch('data/network.json'),
            fetch('data/projects.json'),
            fetch('data/external-links.json')
        ]);
        
        store.network = await netRes.json();
        store.links = await linkRes.json();
        store.projects = projRes.ok ? await projRes.json() : { projects: [] }; 
        
    } catch (e) {
        console.error("Fehler beim Laden der Daten", e);
        store.projects = { projects: [] };
        store.links = {};
    }
}

function setupNavigation() {
    document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
            renderPage(page);
        });
    });
    
    document.querySelector('.logo').addEventListener('click', () => {
        renderPage('home');
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        document.querySelector('[data-page="home"]').classList.add('active');
    });

    document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);
}

function renderPage(pageName) {
    const main = document.getElementById('app-content');
    main.innerHTML = '';
    main.className = '';
    window.scrollTo(0, 0);

    if (pageName === 'home') {
        renderHome(main);
    } else {
        const container = document.createElement('div');
        container.className = 'container';
        main.appendChild(container);

        switch(pageName) {
            case 'projects': renderProjectsList(container); break;
            case 'people': renderPeople(container); break;
            case 'methods': renderMethods(container); break;
            case 'teaching': renderTeaching(container); break;
        }
    }
}

// --- RENDER HOME ---
function renderHome(container) {
    container.innerHTML = `
        <div class="hero-section">
            <canvas id="hero-canvas"></canvas>
            <div class="hero-content">
                <h1 class="hero-title">${t('hero_title')}</h1>
                <p class="hero-text">${t('hero_text')}</p>
                <a href="#" onclick="document.querySelector('[data-page=\\'projects\\']').click(); return false;" class="hero-btn">${t('hero_btn')}</a>
            </div>
        </div>
    `;
    initHeroAnimation();
}

function initHeroAnimation() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];

    function resize() {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for(let i=0; i<60; i++) {
        particles.push({
            x: Math.random() * width, y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }

    function animate() {
        if(!document.getElementById('hero-canvas')) return;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#4a86e8'; ctx.strokeStyle = 'rgba(74, 134, 232, 0.15)';

        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if(p.x < 0 || p.x > width) p.vx *= -1;
            if(p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            for(let j=i+1; j<particles.length; j++) {
                const p2 = particles[j];
                const dist = Math.sqrt(Math.pow(p.x-p2.x,2) + Math.pow(p.y-p2.y,2));
                if(dist < 150) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                }
            }
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// --- RENDER PROJECTS ---
function renderProjectsList(container) {
    const list = store.projects.projects || [];
    // Sortierung (Sprachabhängig Titel)
    list.sort((a, b) => {
        const titleA = (a.title[currentLang] || a.title['de'] || a.id).toLowerCase();
        const titleB = (b.title[currentLang] || b.title['de'] || b.id).toLowerCase();
        return titleA.localeCompare(titleB);
    });

    let html = `
        <h1 class="page-title">${t('page_projects')}</h1>
        <div class="section-intro">${t('intro_projects')}</div>
        <div class="projects-grid">
    `;

    if(list.length === 0) {
        html += `<p>${t('projects_loading')}</p>`;
    } else {
        list.forEach(p => {
            const imgBase = `images/projects/${p.id}/${p.id}_1`;
            const title = p.title[currentLang] || p.title['de'] || "Unbenanntes Projekt";
            const summary = p.summary[currentLang] || p.summary['de'] || "";
            
            html += `
                <div class="project-card" onclick="renderProjectDetail('${p.id}')">
                    <div style="height: 180px; position: relative; background: #2a3548;">
                        <img src="${imgBase}.jpg" style="width:100%; height:100%; object-fit:cover;" onerror="if(this.src.endsWith('.jpg')){ this.src=this.src.replace('.jpg','.png'); } else { this.style.display='none'; }">
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${title}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${summary}</p>
                        <div style="margin-top: 1rem; color: var(--accent); font-size: 0.9rem; font-weight: bold;">${t('more_info')}</div>
                    </div>
                </div>
            `;
        });
    }
    html += `</div>`;
    container.innerHTML = html;
}

function renderProjectDetail(projectId) {
    const project = store.projects.projects.find(p => p.id === projectId);
    const main = document.getElementById('app-content');
    
    main.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'container';
    main.appendChild(container);
    
    if (!project) return;
    window.scrollTo(0, 0);

    const title = project.title[currentLang] || project.title['de'] || project.id;
    const summary = project.summary[currentLang] || project.summary['de'] || t('missing_summary');
    const desc = project.description[currentLang] || project.description['de'] || t('missing_desc');
    const methods = project.methods || [];
    
    // Partner & Pubs Language Fallback
    const partners = typeof project.partners === 'object' ? (project.partners[currentLang] || project.partners['de']) : project.partners;
    const pubs = typeof project.publications === 'object' ? (project.publications[currentLang] || project.publications['de']) : project.publications;

    const img1Base = `images/projects/${project.id}/${project.id}_1`;
    const img2Base = `images/projects/${project.id}/${project.id}_2`;

    const createImgHtml = (basePath, label) => `
        <img src="${basePath}.jpg" style="width:100%; height:250px; object-fit:cover; border-radius:8px;" onerror="if(this.src.endsWith('.jpg')){ this.src=this.src.replace('.jpg','.png'); } else { this.style.display='none'; this.nextElementSibling.style.display='flex'; }">
        <div style="display:none; background:#2a3548; width:100%; height:250px; align-items:center; justify-content:center; color:#a0b0c8; border-radius:8px;">${label} (${t('photo_missing')})</div>
    `;

    let teamHtml = '';
    if (project.team && project.team.length > 0) {
        const teamLinks = project.team.map(member => {
            const name = typeof member === 'string' ? member : member.name;
            let url = (typeof member === 'object' && member.url) ? member.url : (store.links[name] || '#');
            return url !== '#' ? `<a href="${url}" target="_blank" style="color:var(--accent); text-decoration:none; border-bottom:1px dotted var(--accent);">${name}</a>` : name;
        });
        teamHtml = `<div style="margin-bottom: 2rem; color: var(--text-muted); font-size: 1.1rem;"><strong>${t('detail_team')}</strong> ${teamLinks.join(', ')}</div>`;
    }

    let pubsHtml = '';
    if (pubs && pubs.length > 0) {
        pubsHtml = `
            <div style="margin-top: 3rem; border-top: 1px solid var(--border); padding-top: 2rem;">
                <h3 style="margin-bottom: 1rem; font-size: 1.2rem; color: #f6b26b;">${t('detail_pubs')}</h3>
                <ul style="padding-left: 1rem; color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;">
                    ${pubs.map(pub => `<li style="margin-bottom: 0.5rem;">${pub}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <button onclick="renderPage('projects')" class="back-btn">${t('detail_back')}</button>
        </div>
        <div class="project-detail">
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--text-main); line-height: 1.2;">${title}</h1>
            ${teamHtml}
            <div class="detail-grid">
                <div class="detail-content">
                    <div style="font-style: italic; font-size: 1.2rem; line-height: 1.6; color: #e8eef5; margin-bottom: 2rem; border-left: 3px solid var(--accent); padding-left: 1rem;">${summary}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <div>${createImgHtml(img1Base, 'Foto 1')}</div>
                        <div>${createImgHtml(img2Base, 'Foto 2')}</div>
                    </div>
                    <div style="font-size: 1.05rem; line-height: 1.8; color: #d0d7e2;">${desc}</div>
                    ${pubsHtml}
                </div>
                <div class="detail-sidebar">
                    ${methods.length > 0 ? `
                        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 1.5rem;">
                            <h3 style="color: var(--accent); margin-bottom: 1rem; font-size: 1.1rem;">${t('detail_methods')}</h3>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                ${methods.map(m => `<span style="background: rgba(74, 134, 232, 0.15); color: #4a86e8; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem;">${m}</span>`).join('')}
                            </div>
                        </div>` : ''}
                    ${partners ? `
                        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border);">
                            <h3 style="color: #f6b26b; margin-bottom: 1rem; font-size: 1.1rem;">${t('detail_partners')}</h3>
                            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">${partners}</p>
                        </div>` : ''}
                </div>
            </div>
        </div>
    `;
}

// --- RENDER PEOPLE ---
function renderPeople(container) {
    container.innerHTML = `
        <h1 class="page-title">${t('page_people')}</h1>
        <div class="section-intro">${t('intro_people')}</div>
        <div class="team-columns-wrapper" id="team-wrapper"></div>
    `;

    const wrapper = document.getElementById('team-wrapper');
    const institutions = store.network.nodes.filter(n => n.attributes.role === 'Institution');
    const people = store.network.nodes.filter(n => n.attributes.role === 'Person');

    institutions.forEach(inst => {
        const instName = inst.attributes.label;
        let members = people.filter(p => {
            return store.network.edges.some(e => 
                (e.target === inst.key && e.source === p.key) || 
                (e.source === inst.key && e.target === p.key)
            );
        });

        if (instName === "UdS | VFG") {
            members = members.filter(p => p.attributes.label !== "Steve Bödecker" && p.attributes.label !== "Simon Matzerath");
        }

        members.sort((a, b) => {
            const nameA = a.attributes.label;
            const nameB = b.attributes.label;
            let scoreA = 0, scoreB = 0;
            
            if (nameA === "Sabine Hornung" && instName === "UdS | VFG") scoreA = 100;
            if (nameB === "Sabine Hornung" && instName === "UdS | VFG") scoreB = 100;
            if (nameA === "Katharina Meinecke" && instName.includes("Klassische")) scoreA = 100;
            if (nameB === "Katharina Meinecke" && instName.includes("Klassische")) scoreB = 100;
            if (nameA === "Simon Matzerath" && instName.includes("Landesdenkmalamt")) scoreA = 100;
            if (nameB === "Simon Matzerath" && instName.includes("Landesdenkmalamt")) scoreB = 100;

            if (scoreA !== scoreB) return scoreB - scoreA;
            return nameA.localeCompare(nameB);
        });

        const col = document.createElement('div');
        col.className = 'team-column';
        let html = `<h2>${instName}</h2>`;
        
        members.forEach(person => {
            const name = person.attributes.label;
            const url = store.links[name] || '#';
            let roleHtml = '';
            
            if (name === "Sabine Hornung" && instName === "UdS | VFG") roleHtml = `<div class="pc-role">${t('role_speaker')}</div>`;
            if (name === "Katharina Meinecke" && instName.includes("Klassische")) roleHtml = `<div class="pc-role">${t('role_vice')}</div>`;
            if (name === "Simon Matzerath" && instName.includes("Landesdenkmalamt")) roleHtml = `<div class="pc-role">${t('role_vice')}</div>`;

            const lastName = name.split(' ').pop();
            const imgBase = `images/heads/${lastName}`;
            const initials = name.split(' ').map(n=>n[0]).join('');

            html += `
                <a href="${url}" target="_blank" class="person-card-wide" style="text-decoration:none;">
                    <img src="${imgBase}.jpg" class="pc-img" onerror="if(this.src.endsWith('.jpg')){ this.src=this.src.replace('.jpg','.png'); } else { this.onerror=null; this.parentNode.innerHTML='<div class=\\'pc-img\\'>${initials}</div>' + this.parentNode.innerHTML.substring(this.outerHTML.length); }">
                    <div class="pc-info">
                        ${roleHtml}
                        <h3>${name}</h3>
                        <span class="pc-link">${url !== '#' ? 'Profil ↗' : ''}</span>
                    </div>
                </a>
            `;
        });
        col.innerHTML = html;
        if(members.length > 0) wrapper.appendChild(col);
    });
}

// --- RENDER METHODS (NEW LAYOUT) ---
function renderMethods(container) {
    container.innerHTML = `
        <h1 class="page-title">${t('page_methods')}</h1>
        <div class="section-intro">${t('intro_methods')}</div>
        
        <div class="methods-wrapper">
            <!-- Linke Spalte: Methoden Filter -->
            <div class="methods-sidebar">
                <div class="sidebar-header">
                    <h3>${t('filter_methods')}</h3>
                </div>
                <div class="sidebar-controls">
                    <button class="control-btn" onclick="methodGraph.selectAll('methods')">${t('btn_all')}</button>
                    <button class="control-btn" onclick="methodGraph.deselectAll('methods')">${t('btn_none')}</button>
                </div>
                <div class="sidebar-list" id="filter-methods-list"></div>
            </div>

            <!-- Mitte: Netzwerk -->
            <div id="methods-canvas-container"></div>

            <!-- Rechte Spalte: Personen Filter -->
            <div class="methods-sidebar right">
                <div class="sidebar-header">
                    <h3>${t('filter_people')}</h3>
                </div>
                <div class="sidebar-controls">
                    <button class="control-btn" onclick="methodGraph.selectAll('people')">${t('btn_all')}</button>
                    <button class="control-btn" onclick="methodGraph.deselectAll('people')">${t('btn_none')}</button>
                </div>
                <div class="sidebar-list" id="filter-people-list"></div>
            </div>
        </div>
    `;

    // Startet die Berechnung des neuen Graphen (siehe methods-graph.js)
    if(window.initCompetenceGraph) {
        window.initCompetenceGraph(store.network, 'methods-canvas-container');
    }
}

function renderTeaching(container) {
    container.innerHTML = `
        <h1 class="page-title">${t('page_teaching')}</h1>
        <div class="section-intro">${t('intro_teaching')}</div>
        <div style="background: var(--bg-card); padding: 2rem; border-radius: 8px; border: 1px solid var(--border);">
            <h3>${t('teaching_offer')}</h3>
            <p style="margin: 1rem 0; color: var(--text-muted); line-height: 1.6;">${t('teaching_text')}</p>
            <a href="https://www.lsf.uni-saarland.de/" target="_blank" style="display: inline-block; background: var(--accent); color: white; padding: 0.8rem 1.5rem; border-radius: 4px; text-decoration: none; font-weight: bold; margin-top: 1rem;">${t('lsf_btn')}</a>
        </div>
    `;
}
