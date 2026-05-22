/**
 * Valorant Crosshair Parser & Renderer
 * Handles decoding Valorant crosshair codes and drawing them to a canvas.
 */

const defaultSettings = {
    // General
    color: 0, // 0 = White
    customColor: '#ffffff',
    outlineOpacity: 0.5,
    outlineThickness: 1,
    centerDot: 0, // 0 = Off, 1 = On
    centerDotThickness: 2,
    centerDotOpacity: 1.0,
    
    // Inner Lines
    innerLinesShow: 1, // 1 = On, 0 = Off
    innerLineThickness: 2,
    innerLineLength: 6,
    innerLineOffset: 4,
    innerLineOpacity: 1.0,
    
    // Outer Lines
    outerLinesShow: 1, // 1 = On, 0 = Off
    outerLineThickness: 2,
    outerLineLength: 6,
    outerLineOffset: 10,
    outerLineOpacity: 1.0
};

const colorMap = {
    0: '#ffffff', // White
    1: '#00ff00', // Green
    2: '#7fff00', // Yellow Green
    3: '#adff2f', // Green Yellow
    4: '#ffff00', // Yellow
    5: '#00ffff', // Cyan
    6: '#ff00ff', // Pink
    7: '#ff0000', // Red
};

/**
 * Parses a Valorant crosshair code string into a config object.
 * @param {string} code 
 * @returns {object} Parsed configuration
 */
function parseValorantCode(code) {
    // Start with a clean copy of default settings
    const config = JSON.parse(JSON.stringify(defaultSettings));
    
    if (!code || typeof code !== 'string') return config;
    
    const parts = code.trim().split(';');
    if (parts[0] !== '0') return config; // Invalid format
    
    let section = '';
    
    for (let i = 1; i < parts.length; i++) {
        const key = parts[i];
        if (key === 'P' || key === 'S' || key === 'A' || key === 's') {
            section = key;
            continue;
        }
        
        // We only parse Primary crosshair settings (marked as 'P')
        if (section !== 'P') continue;
        
        if (i + 1 < parts.length) {
            const val = parts[i + 1];
            // If the next token is a section key, skip
            if (['P', 'S', 'A', 's'].includes(val)) {
                continue;
            }
            
            const numVal = parseFloat(val);
            
            switch (key) {
                case 'c': config.color = parseInt(val, 10); break;
                case 'u': 
                    let hex = val;
                    if (!hex.startsWith('#')) hex = '#' + hex;
                    // If 8 characters hex (with alpha), take the first 7 (#RRGGBB) for simple solid colors
                    if (hex.length === 9) hex = hex.substring(0, 7);
                    config.customColor = hex;
                    break;
                case 'o': config.outlineOpacity = numVal; break;
                case 'h': config.outlineThickness = parseInt(val, 10); break;
                case 'd': config.centerDot = parseInt(val, 10); break;
                case 'z': config.centerDotThickness = parseInt(val, 10); break;
                case 'a': config.centerDotOpacity = numVal; break;
                
                // Inner lines
                case '0b': config.innerLinesShow = parseInt(val, 10); break;
                case '0t': config.innerLineThickness = parseInt(val, 10); break;
                case '0l': config.innerLineLength = parseInt(val, 10); break;
                case '0o': config.innerLineOffset = parseInt(val, 10); break;
                case '0a': config.innerLineOpacity = numVal; break;
                
                // Outer lines
                case '1b': config.outerLinesShow = parseInt(val, 10); break;
                case '1t': config.outerLineThickness = parseInt(val, 10); break;
                case '1l': config.outerLineLength = parseInt(val, 10); break;
                case '1o': config.outerLineOffset = parseInt(val, 10); break;
                case '1a': config.outerLineOpacity = numVal; break;
            }
            i++; // Skip the value
        }
    }
    
    return config;
}

/**
 * Gets the CSS hex color from parsed config
 * @param {object} config 
 * @returns {string} Hex color
 */
function getCrosshairColor(config) {
    if (config.color === 8) {
        return config.customColor || '#ffffff';
    }
    return colorMap[config.color] || '#ffffff';
}

/**
 * Renders a crosshair on the provided Canvas context.
 * @param {HTMLCanvasElement} canvas 
 * @param {object} config Parsed config
 * @param {string} backgroundType 'green' | 'dark' | 'game'
 */
function renderCrosshairOnCanvas(canvas, config, backgroundType = 'dark') {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, w, h);
    
    // Draw background
    if (backgroundType === 'green') {
        ctx.fillStyle = '#00ff4c'; // Neon Green screen
        ctx.fillRect(0, 0, w, h);
    } else if (backgroundType === 'game') {
        // Draw a simulated Valorant game scene background (dusty grey/yellow brick wall look)
        ctx.fillStyle = '#7a766f';
        ctx.fillRect(0, 0, w, h);
        
        // Add a mock grid pattern for in-game feel
        ctx.strokeStyle = '#63605a';
        ctx.lineWidth = 1;
        
        const gridSize = 16;
        for (let x = 0; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
        
        // Draw a subtle target dummy or contrast lines in the center area
        ctx.fillStyle = '#a83232'; // Reddish target color
        ctx.beginPath();
        ctx.arc(w/2, h/2, 24, 0, Math.PI * 2);
        ctx.globalAlpha = 0.15;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        ctx.strokeStyle = '#a83232';
        ctx.beginPath();
        ctx.arc(w/2, h/2, 24, 0, Math.PI * 2);
        ctx.globalAlpha = 0.25;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    } else {
        // Dark background (theme background)
        ctx.fillStyle = '#181e25'; 
        ctx.fillRect(0, 0, w, h);
        
        // Draw crosshair reference center indicator (very subtle dot, transparent)
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(w/2 - 1, h/2 - 1, 2, 2);
    }
    
    // Center point
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    
    const color = getCrosshairColor(config);
    const hasOutline = config.outlineOpacity > 0 && config.outlineThickness > 0;
    const outlineThick = config.outlineThickness;
    const outlineOpacity = config.outlineOpacity;
    
    // -------------------------------------------------------------
    // Helper to draw a rectangle with outline
    // -------------------------------------------------------------
    function drawRectWithOutline(x, y, rectW, rectH, rectColor, opacity, isOutlinePass) {
        if (isOutlinePass) {
            if (hasOutline) {
                ctx.fillStyle = '#000000';
                ctx.globalAlpha = outlineOpacity;
                // Draw outline expanded by outlineThick on all sides
                // Note: using Math.floor to keep things pixel perfect
                ctx.fillRect(
                    Math.floor(x - outlineThick), 
                    Math.floor(y - outlineThick), 
                    Math.floor(rectW + 2 * outlineThick), 
                    Math.floor(rectH + 2 * outlineThick)
                );
            }
        } else {
            ctx.fillStyle = rectColor;
            ctx.globalAlpha = opacity;
            ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(rectW), Math.floor(rectH));
        }
    }
    
    // -------------------------------------------------------------
    // Helper to draw all elements
    // -------------------------------------------------------------
    function drawElements(isOutlinePass) {
        // 1. Center Dot
        if (config.centerDot === 1) {
            const z = config.centerDotThickness;
            const dotOpacity = config.centerDotOpacity;
            const dx = cx - z / 2;
            const dy = cy - z / 2;
            drawRectWithOutline(dx, dy, z, z, color, dotOpacity, isOutlinePass);
        }
        
        // 2. Inner Lines
        if (config.innerLinesShow === 1) {
            const t = config.innerLineThickness;
            const l = config.innerLineLength;
            const o = config.innerLineOffset;
            const lineOpacity = config.innerLineOpacity;
            
            // Left
            drawRectWithOutline(cx - o - l, cy - t / 2, l, t, color, lineOpacity, isOutlinePass);
            // Right
            drawRectWithOutline(cx + o, cy - t / 2, l, t, color, lineOpacity, isOutlinePass);
            // Top
            drawRectWithOutline(cx - t / 2, cy - o - l, t, l, color, lineOpacity, isOutlinePass);
            // Bottom
            drawRectWithOutline(cx - t / 2, cy + o, t, l, color, lineOpacity, isOutlinePass);
        }
        
        // 3. Outer Lines
        if (config.outerLinesShow === 1) {
            const t = config.outerLineThickness;
            const l = config.outerLineLength;
            const o = config.outerLineOffset;
            const lineOpacity = config.outerLineOpacity;
            
            // Left
            drawRectWithOutline(cx - o - l, cy - t / 2, l, t, color, lineOpacity, isOutlinePass);
            // Right
            drawRectWithOutline(cx + o, cy - t / 2, l, t, color, lineOpacity, isOutlinePass);
            // Top
            drawRectWithOutline(cx - t / 2, cy - o - l, t, l, color, lineOpacity, isOutlinePass);
            // Bottom
            drawRectWithOutline(cx - t / 2, cy + o, t, l, color, lineOpacity, isOutlinePass);
        }
    }
    
    // Draw in two passes so outlines are always behind all colored lines
    if (hasOutline) {
        drawElements(true); // Pass 1: Outlines
    }
    drawElements(false);    // Pass 2: Fill lines
    
    // Reset global properties
    ctx.globalAlpha = 1.0;
}

// Export functions for browser environment
window.parseValorantCode = parseValorantCode;
window.renderCrosshairOnCanvas = renderCrosshairOnCanvas;
window.getCrosshairColor = getCrosshairColor;
