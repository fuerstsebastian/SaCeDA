/**
 * Methods & Competencies Graph
 * Generates a graph: People <-> Methods/Application Fields
 * based on the path: Person -> Project -> Method
 */

window.methodGraph = {
    // Globale Events für die Buttons
    selectAll: (type) => window.dispatchEvent(new CustomEvent('mg-select-all', { detail: { type } })),
    deselectAll: (type) => window.dispatchEvent(new CustomEvent('mg-deselect-all', { detail: { type } }))
};

window.initCompetenceGraph = function(fullData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // --- 1. DATA PREPARATION ---
    
    const peopleNodes = fullData.nodes.filter(n => n.attributes.role === 'Person');
    // Wir trennen Methoden und Anwendungsfelder für die Liste, im Graph sind sie zusammen
    const methodNodes = fullData.nodes.filter(n => n.attributes.role === 'Method');
    const fieldNodes = fullData.nodes.filter(n => n.attributes.role === 'Application Field');
    const allCompetenceNodes = [...methodNodes, ...fieldNodes];
    
    const projectNodes = fullData.nodes.filter(n => n.attributes.role === 'Project');

    const peopleMap = new Map(peopleNodes.map(n => [n.key, n]));
    const compMap = new Map(allCompetenceNodes.map(n => [n.key, n]));
    const edges = fullData.edges;

    // --- 2. HIERARCHIE AUFBAUEN (Für die Liste) ---
    // Wir suchen Eltern-Kind-Beziehungen: has_subcategory
    const hierarchy = {
        roots: [],      // Rang 1 Methoden
        children: {},   // ParentID -> [ChildNodes]
        fields: fieldNodes // Anwendungsfelder sind separat
    };

    // Initialisiere Children Map
    allCompetenceNodes.forEach(n => hierarchy.children[n.key] = []);

    // Finde Beziehungen
    edges.forEach(e => {
        if (e.attributes.relation === 'has_subcategory') {
            if (hierarchy.children[e.source]) {
                // Das Ziel ist ein Kind der Quelle
                const childNode = compMap.get(e.target);
                if(childNode) hierarchy.children[e.source].push(childNode);
            }
        }
    });

    // Finde Root Methoden (Rang 1)
    hierarchy.roots = methodNodes.filter(n => parseFloat(n.attributes.rang) === 1);

    // --- 3. KOMPETENZ-BERECHNUNG (Inference Algorithm) ---
    // Person -> Projekt -> Methode = Kante
    
    const competenceLinks = new Map(); // "PersonID-MethodID" -> LinkObj

    projectNodes.forEach(proj => {
        const connectedPeople = [];
        const connectedMethods = [];

        edges.forEach(e => {
            // Person <-> Projekt
            if (e.source === proj.key && peopleMap.has(e.target)) connectedPeople.push(peopleMap.get(e.target));
            if (e.target === proj.key && peopleMap.has(e.source)) connectedPeople.push(peopleMap.get(e.source));

            // Projekt <-> Methode/AppField
            if (e.source === proj.key && compMap.has(e.target)) connectedMethods.push(compMap.get(e.target));
            if (e.target === proj.key && compMap.has(e.source)) connectedMethods.push(compMap.get(e.source));
        });

        // Kreuzprodukt
        connectedPeople.forEach(p => {
            connectedMethods.forEach(m => {
                const linkId = `${p.key}-${m.key}`;
                if (!competenceLinks.has(linkId)) {
                    competenceLinks.set(linkId, { source: p.key, target: m.key, weight: 0 });
                }
                competenceLinks.get(linkId).weight += 1;
            });
        });
    });

    let graphNodes = [...peopleNodes, ...allCompetenceNodes];
    let graphLinks = Array.from(competenceLinks.values());

    // --- 4. D3 VISUALISIERUNG SETUP ---
    
    const width = container.clientWidth;
    const height = container.clientHeight;

    container.innerHTML = '';
    const svg = d3.select(container).append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, width, height])
        .call(d3.zoom().on("zoom", (event) => g.attr("transform", event.transform)));

    const g = svg.append("g");

    const simulation = d3.forceSimulation(graphNodes)
        .force("link", d3.forceLink(graphLinks).id(d => d.key).distance(150))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(35));

    let link = g.append("g").selectAll("line");
    let node = g.append("g").selectAll("g");

    // --- 5. STATE MANAGEMENT ---

    const activePeople = new Set(peopleNodes.map(n => n.key));
    const activeCompetencies = new Set(allCompetenceNodes.map(n => n.key));

    function updateGraph() {
        // Filter Nodes
        const visibleNodes = graphNodes.filter(n => {
            if (n.attributes.role === 'Person') return activePeople.has(n.key);
            return activeCompetencies.has(n.key);
        });

        const visibleNodeIds = new Set(visibleNodes.map(n => n.key));

        // Filter Links
        const visibleLinks = graphLinks.filter(l => 
            visibleNodeIds.has(l.source.key || l.source) && 
            visibleNodeIds.has(l.target.key || l.target)
        );

        // Update Links
        link = link.data(visibleLinks, d => `${d.source.key || d.source}-${d.target.key || d.target}`);
        link.exit().remove();
        const linkEnter = link.enter().append("line")
            .attr("stroke", "#4a86e8")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", d => Math.sqrt(d.weight) * 2);
        link = linkEnter.merge(link);

        // Update Nodes
        node = node.data(visibleNodes, d => d.key);
        node.exit().transition().duration(300).attr("opacity", 0).remove();

        const nodeEnter = node.enter().append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Circles
        nodeEnter.append("circle")
            .attr("r", d => {
                // Größe basierend auf Rang
                if (d.attributes.role === 'Person') return 15;
                const rang = parseFloat(d.attributes.rang) || 1;
                if (rang === 1) return 22;
                if (rang === 2) return 16;
                return 10;
            })
            .attr("fill", d => {
                if (d.attributes.role === 'Person') return "#e06666";
                if (d.attributes.role === 'Application Field') return "#6aa84f";
                // Methoden: Rang 1 dunkelblau, andere heller
                return parseFloat(d.attributes.rang) === 1 ? "#4a86e8" : "#75a2eb";
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        // Labels
        nodeEnter.append("text")
            .text(d => d.attributes.label)
            .attr("x", 24)
            .attr("y", 5)
            .attr("font-size", d => parseFloat(d.attributes.rang) === 1 ? "14px" : "12px")
            .attr("font-weight", d => parseFloat(d.attributes.rang) === 1 ? "bold" : "normal")
            .attr("fill", "#e8eef5")
            .style("pointer-events", "none")
            .style("font-family", "sans-serif")
            .style("text-shadow", "0 1px 3px rgba(0,0,0,0.8)");

        node = nodeEnter.merge(node);

        simulation.nodes(visibleNodes);
        simulation.force("link").links(visibleLinks);
        simulation.alpha(1).restart();
    }

    // --- 6. SIDEBAR GENERATION (Recursive Tree) ---

    // Rekursive Funktion zum Erstellen der Methoden-Liste
    function renderMethodTree(nodes, container, level = 0) {
        // Sortieren A-Z
        nodes.sort((a, b) => a.attributes.label.localeCompare(b.attributes.label));

        nodes.forEach(node => {
            const div = document.createElement('div');
            div.className = 'filter-item';
            // Einrückung basierend auf Level
            div.style.paddingLeft = `${level * 20}px`; 
            // Fettgedruckt für Rang 1
            if(level === 0) div.style.fontWeight = 'bold';
            if(level > 0) div.style.fontSize = '0.9em';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = activeCompetencies.has(node.key);
            cb.dataset.key = node.key; // Wichtig für "Select All" Update
            cb.className = 'method-cb'; // Marker Klasse

            cb.onchange = (e) => {
                if(e.target.checked) activeCompetencies.add(node.key);
                else activeCompetencies.delete(node.key);
                updateGraph();
            };

            const label = document.createElement('span');
            label.textContent = node.attributes.label;
            label.onclick = () => { cb.checked = !cb.checked; cb.onchange({target:cb}); };

            div.appendChild(cb);
            div.appendChild(label);
            container.appendChild(div);

            // Rekursion für Kinder
            const children = hierarchy.children[node.key];
            if (children && children.length > 0) {
                renderMethodTree(children, container, level + 1);
            }
        });
    }

    // Render Methods List
    const methodsListEl = document.getElementById('filter-methods-list');
    methodsListEl.innerHTML = '';
    
    // 1. Methoden Baum
    renderMethodTree(hierarchy.roots, methodsListEl, 0);

    // 2. Anwendungsfelder (Extra Sektion)
    if(hierarchy.fields.length > 0) {
        const sep = document.createElement('div');
        sep.innerHTML = '<hr style="border:0; border-top:1px solid #444; margin: 10px 0;"><strong>Anwendungsfelder</strong>';
        sep.style.padding = "5px 0";
        methodsListEl.appendChild(sep);
        renderMethodTree(hierarchy.fields, methodsListEl, 0);
    }

    // Render People List (Flat)
    const peopleListEl = document.getElementById('filter-people-list');
    peopleListEl.innerHTML = '';
    peopleNodes.sort((a, b) => a.attributes.label.localeCompare(b.attributes.label));
    
    peopleNodes.forEach(p => {
        const div = document.createElement('div');
        div.className = 'filter-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = true;
        cb.dataset.key = p.key;
        cb.className = 'person-cb';

        cb.onchange = (e) => {
            if(e.target.checked) activePeople.add(p.key);
            else activePeople.delete(p.key);
            updateGraph();
        };

        const label = document.createElement('span');
        label.textContent = p.attributes.label;
        label.onclick = () => { cb.checked = !cb.checked; cb.onchange({target:cb}); };

        div.appendChild(cb);
        div.appendChild(label);
        peopleListEl.appendChild(div);
    });

    // --- 7. EVENT HANDLERS (Fix für Select All/None) ---

    window.addEventListener('mg-select-all', (e) => {
        const type = e.detail.type; // 'people' or 'methods'
        
        if (type === 'people') {
            peopleNodes.forEach(n => activePeople.add(n.key));
            // Checkboxen visuell aktualisieren
            document.querySelectorAll('.person-cb').forEach(cb => cb.checked = true);
        } else {
            allCompetenceNodes.forEach(n => activeCompetencies.add(n.key));
            document.querySelectorAll('.method-cb').forEach(cb => cb.checked = true);
        }
        updateGraph();
    });

    window.addEventListener('mg-deselect-all', (e) => {
        const type = e.detail.type;
        
        if (type === 'people') {
            activePeople.clear();
            document.querySelectorAll('.person-cb').forEach(cb => cb.checked = false);
        } else {
            activeCompetencies.clear();
            document.querySelectorAll('.method-cb').forEach(cb => cb.checked = false);
        }
        updateGraph();
    });

    // Initial Render
    updateGraph();

    // D3 Tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x; d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
    }
};