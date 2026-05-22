/**
 * Valorant Crosshair Vault - Main Application Logic
 */

// Default data to populate if vault is empty
const defaultCrosshairs = [
    {
        id: 'default-tenz',
        name: 'TenZ',
        code: '0;s;1;P;c;5;h;0;m;1;0l;4;0o;2;0a;1;0f;0;1b;0',
        category: 'pro',
        description: 'Populární nastavení od jednoho z nejznámějších pro-hráčů na světě.',
        creator: 'TenZ'
    },
    {
        id: 'default-aspas',
        name: 'aspas',
        code: '0;s;1;P;o;1;d;1;0b;0;1b;0;S;c;0',
        category: 'pro',
        description: 'Minimalistická bílá tečka s obrysem, kterou používá legendární aspas.',
        creator: 'aspas'
    },
    {
        id: 'default-boaster',
        name: 'Boaster',
        code: '0;s;1;P;c;1;o;1;d;1;0l;0;0o;2;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;S;c;1;o;1',
        category: 'pro',
        description: 'Zelená tečka s obrysem od IGL týmu Fnatic.',
        creator: 'Boaster'
    },
    {
        id: 'default-shroud',
        name: 'Shroud',
        code: '0;P;o;0.506;d;1;z;1;0t;1;0l;4;0o;2;0a;1;0f;0;1b;0',
        category: 'pro',
        description: 'Bílá tečka s tenkými vnitřními linkami od FPS legendy Shrouda.',
        creator: 'Shroud'
    },
    {
        id: 'default-smiley',
        name: 'Smajlík (Smiley Face)',
        code: '0;P;c;4;t;2;o;1;d;1;z;3;a;0;f;0;0t;10;0l;2;0o;2;0a;1;0f;0;1b;0',
        category: 'fun',
        description: 'Zábavný crosshair ve tvaru smajlíka pro pobavení spoluhráčů.',
        creator: 'Komunita'
    },
    {
        id: 'default-heart',
        name: 'Srdíčko (Heart)',
        code: '0;P;c;6;o;0.1;m;1;0t;5;0l;3;0o;1;0a;0.7;0f;0;1t;1;1l;5;1o;0;1a;0.7;1m;0;1f;0',
        category: 'fun',
        description: 'Růžové srdíčko. Ukaž nepřátelům trochu lásky, než je zneškodníš.',
        creator: 'Komunita'
    },
    {
        id: 'default-square',
        name: 'Čtverec (Square)',
        code: '0;P;c;1;o;1;0t;10;0l;1;0o;5;0a;1;0f;0;1l;0;1o;0;1a;1;1m;0;1f;0',
        category: 'fun',
        description: 'Jednoduchý zelený box, který přesně rámuje hlavu nepřítele.',
        creator: 'Komunita'
    }
];

// App State
let crosshairs = [];
let currentFilter = 'all';
let searchQuery = '';
let globalBackground = 'dark'; // default preview background

// DOM Elements
const vaultGrid = document.getElementById('vault-grid');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const addBtn = document.getElementById('add-btn');
const modal = document.getElementById('add-modal');
const closeModalBtn = document.getElementById('close-modal');
const addForm = document.getElementById('add-form');
const toastContainer = document.getElementById('toast-container');

// Preview DOM elements inside Modal
const previewCanvas = document.getElementById('modal-preview-canvas');
const previewCodeInput = document.getElementById('code');
const previewBgSelect = document.getElementById('preview-bg-select');
const codeFeedback = document.getElementById('code-feedback');
const submitBtn = document.getElementById('submit-btn');

// Initialize App
function init() {
    // Load data from localStorage or use defaults
    const saved = localStorage.getItem('valorant_crosshairs');
    if (saved) {
        try {
            crosshairs = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load localStorage data, fallback to defaults', e);
            crosshairs = [...defaultCrosshairs];
        }
    } else {
        crosshairs = [...defaultCrosshairs];
        saveToStorage();
    }
    
    // Setup Event Listeners
    setupEventListeners();
    
    // Render Grid
    renderGrid();
    
    // Initialize Modal Live Preview
    updateModalPreview();
}

// Save to localStorage
function saveToStorage() {
    localStorage.setItem('valorant_crosshairs', JSON.stringify(crosshairs));
}

// Setup all event listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderGrid();
    });
    
    // Category filters
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderGrid();
        });
    });
    
    // Modal toggle
    addBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
        // Reset form
        addForm.reset();
        previewCodeInput.value = '0;P;c;5;h;0;0l;4;0o;2;0a;1;0f;0;1b;0'; // Shroud's/Default Cyan
        updateModalPreview();
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Form submit
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const code = document.getElementById('code').value.trim();
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();
        
        if (!validateCode(code)) {
            showToast('Kód nemá správný formát Valorant zaměřovače!', 'error');
            return;
        }
        
        const newCrosshair = {
            id: 'custom-' + Date.now(),
            name,
            code,
            category,
            description: description || 'Vlastní uložený zaměřovač.',
            creator: 'Uživatel'
        };
        
        crosshairs.unshift(newCrosshair); // add to top
        saveToStorage();
        closeModal();
        renderGrid();
        showToast('Zaměřovač úspěšně přidán do trezoru!');
    });
    
    // Realtime preview inside modal
    previewCodeInput.addEventListener('input', updateModalPreview);
    previewBgSelect.addEventListener('change', updateModalPreview);
}

// Close modal function
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Validate Valorant Code
function validateCode(code) {
    if (!code) return false;
    const clean = code.trim();
    // Valorant codes must start with "0;" and contain sections like "P"
    return clean.startsWith('0;') && clean.includes(';');
}

// Update Live Preview inside Modal
function updateModalPreview() {
    const code = previewCodeInput.value.trim();
    const bgType = previewBgSelect.value;
    
    if (validateCode(code)) {
        codeFeedback.textContent = 'Kód je validní ✔';
        codeFeedback.className = 'feedback success';
        submitBtn.disabled = false;
        
        const config = window.parseValorantCode(code);
        window.renderCrosshairOnCanvas(previewCanvas, config, bgType);
    } else {
        codeFeedback.textContent = 'Neplatný kód (musí začínat "0;") ✖';
        codeFeedback.className = 'feedback error';
        submitBtn.disabled = true;
        
        // Render empty canvas or question mark
        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.fillStyle = '#181e25';
        ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        
        ctx.fillStyle = '#ff4655';
        ctx.font = '24px Oswald, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', previewCanvas.width / 2, previewCanvas.height / 2);
    }
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    let icon = '';
    if (type === 'success') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
    } else {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
    }
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Trigger entrance animation
    setTimeout(() => toast.classList.add('show'), 50);
    
    // Auto-remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Render the grid of crosshairs
function renderGrid() {
    vaultGrid.innerHTML = '';
    
    // Filter crosshairs
    const filtered = crosshairs.filter(item => {
        // Category filter
        if (currentFilter !== 'all' && item.category !== currentFilter) {
            return false;
        }
        // Search filter
        if (searchQuery) {
            const nameMatch = item.name.toLowerCase().includes(searchQuery);
            const descMatch = item.description.toLowerCase().includes(searchQuery);
            const creatorMatch = item.creator.toLowerCase().includes(searchQuery);
            return nameMatch || descMatch || creatorMatch;
        }
        return true;
    });
    
    if (filtered.length === 0) {
        vaultGrid.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <p>Nebyly nalezeny žádné zaměřovače odpovídající vyhledávání.</p>
            </div>
        `;
        return;
    }
    
    // Create card for each crosshair
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = `vault-card category-${item.category}`;
        card.dataset.id = item.id;
        
        // Map category tags for Czech localization
        let categoryLabel = 'Vlastní';
        let categoryClass = 'badge-custom';
        if (item.category === 'pro') {
            categoryLabel = 'Pro Hráč';
            categoryClass = 'badge-pro';
        } else if (item.category === 'fun') {
            categoryLabel = 'Zábavný';
            categoryClass = 'badge-fun';
        }
        
        card.innerHTML = `
            <div class="card-preview-wrapper">
                <canvas class="card-canvas" width="160" height="160"></canvas>
                <div class="preview-controls">
                    <button class="bg-toggle-btn active" data-bg="dark" title="Tmavé pozadí"></button>
                    <button class="bg-toggle-btn" data-bg="green" title="Zelené plátno"></button>
                    <button class="bg-toggle-btn" data-bg="game" title="Herní prostředí"></button>
                </div>
            </div>
            <div class="card-info">
                <div class="card-header">
                    <h3 class="card-title">${item.name}</h3>
                    <span class="badge ${categoryClass}">${categoryLabel}</span>
                </div>
                <p class="card-desc">${item.description}</p>
                <div class="card-meta">
                    <span class="card-creator">Tvůrce: <strong>${item.creator}</strong></span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary copy-code-btn" data-code="${item.code}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M7 6V3C7 2.44772 7.44772 2 8 2H20C20.5523 2 21 2.44772 21 3V15C21 15.5523 20.5523 16 20 16H17V19C17 19.5523 16.5523 20 16 20H4C3.44772 20 3 19.5523 3 19V7C3 6.44772 3.44772 6 4 6H7ZM9 6H16C16.5523 6 17 6.44772 17 7V14H19V4H9V6ZM5 8V18H15V8H5Z"/>
                        </svg>
                        Kopírovat kód
                    </button>
                    ${item.id.startsWith('custom-') ? `
                        <button class="btn btn-danger delete-btn" title="Smazat zaměřovač">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        vaultGrid.appendChild(card);
        
        // Render initial canvas for this card
        const canvas = card.querySelector('.card-canvas');
        const parsedConfig = window.parseValorantCode(item.code);
        window.renderCrosshairOnCanvas(canvas, parsedConfig, 'dark');
        
        // Wire up bg toggles for this card
        const bgButtons = card.querySelectorAll('.bg-toggle-btn');
        bgButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                bgButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const selectedBg = btn.dataset.bg;
                window.renderCrosshairOnCanvas(canvas, parsedConfig, selectedBg);
            });
        });
        
        // Wire up copy button
        const copyBtn = card.querySelector('.copy-code-btn');
        copyBtn.addEventListener('click', () => {
            copyToClipboard(item.code, copyBtn);
        });
        
        // Wire up delete button if present
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Opravdu chcete smazat zaměřovač "${item.name}"?`)) {
                    deleteCrosshair(item.id);
                }
            });
        }
    });
}

// Copy Code to Clipboard logic with fallback
function copyToClipboard(text, buttonElement) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(buttonElement);
        }).catch(err => {
            fallbackCopy(text, buttonElement);
        });
    } else {
        fallbackCopy(text, buttonElement);
    }
}

function fallbackCopy(text, buttonElement) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(buttonElement);
        } else {
            showToast('Kopírování selhalo. Zkopírujte kód ručně.', 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed', err);
        showToast('Kopírování selhalo.', 'error');
    }
    
    document.body.removeChild(textArea);
}

function showCopySuccess(buttonElement) {
    const originalHtml = buttonElement.innerHTML;
    buttonElement.classList.add('copied');
    buttonElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
        </svg>
        Kopírováno!
    `;
    
    showToast('Kód zaměřovače zkopírován do schránky!');
    
    setTimeout(() => {
        buttonElement.classList.remove('copied');
        buttonElement.innerHTML = originalHtml;
    }, 1500);
}

// Delete Crosshair logic
function deleteCrosshair(id) {
    crosshairs = crosshairs.filter(item => item.id !== id);
    saveToStorage();
    renderGrid();
    showToast('Zaměřovač byl smazán.', 'success');
}

// Run init on load
window.addEventListener('DOMContentLoaded', init);
