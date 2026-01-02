// SaCeDA Network Visualization

// Configuration
const CONFIG = {
  dataUrl: 'data/network.json',
  linksUrl: 'data/external-links.json',
  svgWidth: 8000,
  svgHeight: 6000,
  nodeRadius: {
    method_rank1: 80,
    method_rank2: 35,
    method_rank3: 20,
    other: 36
  },
  colors: {
    'Method': '#4a86e8',
    'Project': '#8e7cc3',
    'Person': '#e06666',
    'Institution': '#f6b26b',
    'Application Field': '#6aa84f',
    'Teaching': '#45818e'
  }
};

// State
let networkData = null;
let externalLinks = {};
let svg = null;
let nodesGroup = null;
let edgesGroup = null;
let currentOpenParent = null;

// Initialize
async function init() {
  try {
    // Load data
    const [networkResponse, linksResponse] = await Promise.all([
      fetch(CONFIG.dataUrl),
      fetch(CONFIG.linksUrl).catch(() => ({ json: () => ({}) }))
    ]);
    
    networkData = await networkResponse.json();
    externalLinks = await linksResponse.json();
    
    // Setup SVG
    setupSVG();
    
    // Calculate layout
    calculateLayout();
    
    // Render network
    renderNetwork();
    
    // Setup controls
    setupControls();
    
    // Hide loading
    document.getElementById('loading').style.display = 'none';
    
  } catch (error) {
    console.error('Error initializing network:', error);
    alert('Failed to load network data. Please check the console for details.');
  }
}

// Setup SVG
function setupSVG() {
  svg = document.getElementById('network-svg');
  svg.setAttribute('viewBox', `0 0 ${CONFIG.svgWidth} ${CONFIG.svgHeight}`);
  svg.innerHTML = `
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g id="edges-group"></g>
    <g id="nodes-group"></g>
  `;
  
  edgesGroup = document.getElementById('edges-group');
  nodesGroup = document.getElementById('nodes-group');
}

// Calculate layout positions
function calculateLayout() {
  const nodes = networkData.nodes;
  
  // Group nodes by role
  const groups = {
    'Method': { x: 2000, y: 3000, nodes: [] },
    'Project': { x: 5500, y: 3000, nodes: [] },
    'Person': { x: 6500, y: 3000, nodes: [] },
    'Institution': { x: 7000, y: 1500, nodes: [] },
    'Application Field': { x: 4000, y: 3000, nodes: [] },
    'Teaching': { x: 1000, y: 1500, nodes: [] }
  };
  
  // Sort nodes into groups
  nodes.forEach(node => {
    const role = node.attributes.role;
    const rang = parseFloat(node.attributes.rang);
    
    if (role === 'Method') {
      if (rang === 1) {
        groups['Method'].nodes.push(node);
      }
    } else {
      groups[role]?.nodes.push(node);
    }
  });
  
  // Position nodes within groups
  Object.entries(groups).forEach(([role, group]) => {
    const nodeCount = group.nodes.length;
    const radius = 400 + nodeCount * 20;
    
    group.nodes.forEach((node, i) => {
      const angle = (i / nodeCount) * Math.PI * 2;
      node.x = group.x + Math.cos(angle) * radius;
      node.y = group.y + Math.sin(angle) * radius;
    });
  });
  
  // Position Method rank 2 and 3 nodes (initially hidden)
  nodes.forEach(node => {
    if (node.attributes.role === 'Method') {
      const rang = parseFloat(node.attributes.rang);
      if (rang === 2 || rang === 3) {
        node.x = 2000;
        node.y = 3000;
      }
    }
  });
}

// Build hierarchy map
function buildHierarchy() {
  const hierarchy = {};
  
  networkData.edges.forEach(edge => {
    if (edge.attributes?.relation === 'has_subcategory') {
      if (!hierarchy[edge.source]) {
        hierarchy[edge.source] = [];
      }
      hierarchy[edge.source].push(edge.target);
    }
  });
  
  return hierarchy;
}

// Render network
function renderNetwork() {
  const hierarchy = buildHierarchy();
  
  renderEdges();
  
  networkData.nodes.forEach(node => {
    const role = node.attributes.role;
    const rang = parseFloat(node.attributes.rang);
    const isMethod = role === 'Method';
    const isHidden = isMethod && rang > 1;
    
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.classList.add('node');
    nodeGroup.setAttribute('data-id', node.key);
    nodeGroup.setAttribute('data-role', role);
    nodeGroup.setAttribute('data-rang', rang || '0');
    
    if (isHidden) {
      nodeGroup.classList.add('hidden');
    }
    
    if (isMethod && rang === 1) {
      nodeGroup.classList.add('method-rank-1');
    }
    
    if (hierarchy[node.key]) {
      nodeGroup.classList.add('has-children');
    }
    
    const radius = getNodeRadius(role, rang);
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.classList.add('node-circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', CONFIG.colors[role] || '#666');
    
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.classList.add('node-label');
    label.setAttribute('x', node.x);
    label.setAttribute('y', node.y + 5);
    label.textContent = wrapText(node.attributes.label, 15);
    
    nodeGroup.appendChild(circle);
    nodeGroup.appendChild(label);
    
    nodeGroup.addEventListener('click', () => handleNodeClick(node, hierarchy));
    
    nodesGroup.appendChild(nodeGroup);
  });
}

// Render edges
function renderEdges() {
  networkData.edges.forEach(edge => {
    const sourceNode = networkData.nodes.find(n => n.key === edge.source);
    const targetNode = networkData.nodes.find(n => n.key === edge.target);
    
    if (!sourceNode || !targetNode) return;
    
    const isHierarchy = edge.attributes?.relation === 'has_subcategory';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('edge');
    
    if (isHierarchy) {
      path.classList.add('hierarchy');
    }
    
    path.setAttribute('data-source', edge.source);
    path.setAttribute('data-target', edge.target);
    
    const d = calculateCurvedPath(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
    path.setAttribute('d', d);
    
    const sourceRang = parseFloat(sourceNode.attributes.rang);
    const targetRang = parseFloat(targetNode.attributes.rang);
    if ((sourceNode.attributes.role === 'Method' && sourceRang > 1) ||
        (targetNode.attributes.role === 'Method' && targetRang > 1)) {
      path.classList.add('hidden');
    }
    
    edgesGroup.appendChild(path);
  });
}

// Calculate curved path between two points
function calculateCurvedPath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  const cx = (x1 + x2) / 2 + dy * 0.2;
  const cy = (y1 + y2) / 2 - dx * 0.2;
  
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

// Get node radius based on role and rank
function getNodeRadius(role, rang) {
  if (role === 'Method') {
    if (rang === 1) return CONFIG.nodeRadius.method_rank1;
    if (rang === 2) return CONFIG.nodeRadius.method_rank2;
    if (rang === 3) return CONFIG.nodeRadius.method_rank3;
  }
  return CONFIG.nodeRadius.other;
}

// Wrap text for long labels
function wrapText(text, maxLength) {
  if (text.length <= maxLength) return text;
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  
  return lines.slice(0, 2).join('\n') + (lines.length > 2 ? '...' : '');
}

// Handle node click
function handleNodeClick(node, hierarchy) {
  const role = node.attributes.role;
  const children = hierarchy[node.key];
  
  if (role === 'Method' && children) {
    toggleMethodChildren(node.key, children);
    return;
  }
  
  const link = getNodeLink(node);
  if (link) {
    window.open(link, '_blank');
  }
}

// Toggle method children (accordion)
function toggleMethodChildren(parentKey, childKeys) {
  const parentNode = networkData.nodes.find(n => n.key === parentKey);
  const hierarchy = buildHierarchy();
  
  const firstChild = document.querySelector(`[data-id="${childKeys[0]}"]`);
  const isVisible = firstChild && !firstChild.classList.contains('hidden');
  
  if (isVisible) {
    hideMethodChildren(childKeys);
    currentOpenParent = null;
  } else {
    if (currentOpenParent && currentOpenParent !== parentKey) {
      const prevChildren = hierarchy[currentOpenParent];
      if (prevChildren) {
        hideMethodChildren(prevChildren);
      }
    }
    
    showMethodChildren(parentKey, childKeys, parentNode);
    currentOpenParent = parentKey;
  }
}

// Show method children with animation
function showMethodChildren(parentKey, childKeys, parentNode) {
  const hierarchy = buildHierarchy();
  
  childKeys.forEach((childKey, index) => {
    const childNode = networkData.nodes.find(n => n.key === childKey);
    const childElement = document.querySelector(`[data-id="${childKey}"]`);
    
    if (!childElement || !childNode) return;
    
    const angle = (index / childKeys.length) * Math.PI * 2;
    const distance = 250;
    childNode.x = parentNode.x + Math.cos(angle) * distance;
    childNode.y = parentNode.y + Math.sin(angle) * distance;
    
    const circle = childElement.querySelector('circle');
    const label = childElement.querySelector('text');
    circle.setAttribute('cx', childNode.x);
    circle.setAttribute('cy', childNode.y);
    label.setAttribute('x', childNode.x);
    label.setAttribute('y', childNode.y + 5);
    
    setTimeout(() => {
      childElement.classList.remove('hidden');
      updateEdgeVisibility(childKey);
      
      if (hierarchy[childKey]) {
        childElement.classList.add('has-children');
      }
    }, index * 50);
  });
}

// Hide method children
function hideMethodChildren(childKeys) {
  const hierarchy = buildHierarchy();
  
  childKeys.forEach(childKey => {
    const childElement = document.querySelector(`[data-id="${childKey}"]`);
    if (childElement) {
      childElement.classList.add('hidden');
      updateEdgeVisibility(childKey);
      
      const grandchildren = hierarchy[childKey];
      if (grandchildren) {
        hideMethodChildren(grandchildren);
      }
    }
  });
}

// Update edge visibility
function updateEdgeVisibility(nodeKey) {
  const edges = document.querySelectorAll(`[data-source="${nodeKey}"], [data-target="${nodeKey}"]`);
  edges.forEach(edge => {
    const source = edge.getAttribute('data-source');
    const target = edge.getAttribute('data-target');
    
    const sourceNode = document.querySelector(`[data-id="${source}"]`);
    const targetNode = document.querySelector(`[data-id="${target}"]`);
    
    const sourceHidden = sourceNode?.classList.contains('hidden');
    const targetHidden = targetNode?.classList.contains('hidden');
    
    if (sourceHidden || targetHidden) {
      edge.classList.add('hidden');
    } else {
      edge.classList.remove('hidden');
    }
  });
}

// Get node link
function getNodeLink(node) {
  const role = node.attributes.role;
  const label = node.attributes.label;
  
  if (externalLinks[label]) {
    return externalLinks[label];
  }
  
  if (role === 'Project') {
    const slug = label.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `projects/${slug}.html`;
  }
  
  return null;
}

// Setup controls (filter checkboxes)
function setupControls() {
  const checkboxes = document.querySelectorAll('#controls input[type="checkbox"]');
  
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const role = checkbox.getAttribute('data-role');
      const isChecked = checkbox.checked;
      
      const nodes = document.querySelectorAll(`[data-role="${role}"]`);
      nodes.forEach(node => {
        const rang = parseFloat(node.getAttribute('data-rang'));
        if (role !== 'Method' || rang === 1) {
          if (isChecked) {
            node.classList.remove('hidden');
          } else {
            node.classList.add('hidden');
          }
        }
      });
      
      document.querySelectorAll('.node').forEach(node => {
        const nodeKey = node.getAttribute('data-id');
        updateEdgeVisibility(nodeKey);
      });
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}