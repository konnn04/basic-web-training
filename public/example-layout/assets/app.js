/* ===== EXAMPLE LAYOUT - Shared JS ===== */

// Tooltip system (fixed: không tắt khi hover vào con, vị trí sát chuột)
let tooltipEl = null;
let currentProtoEl = null;

function createTooltip() {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'prototype-tooltip';
    document.body.appendChild(tooltipEl);
}

function showTooltip(e, el) {
    if (currentProtoEl === el && tooltipEl.classList.contains('show')) return;
    currentProtoEl = el;

    const name = el.getAttribute('data-prototype');
    const term = el.getAttribute('data-term') || '';
    const desc = el.getAttribute('data-desc') || '';

    let html = '<div class="tt-name"><i class="bi bi-info-circle"></i> ' + name + '</div>';
    if (term) html += '<div class="tt-term"><i class="bi bi-code-slash"></i> ' + term + '</div>';
    if (desc) html += '<div class="tt-desc">' + desc + '</div>';

    tooltipEl.innerHTML = html;
    tooltipEl.classList.add('show');

    // Đặt tooltip gần vị trí chuột
    const pad = 14;
    let left = e.clientX + pad;
    let top = e.clientY + pad;

    const tw = tooltipEl.offsetWidth;
    const th = tooltipEl.offsetHeight;
    const ww = window.innerWidth;
    const wh = window.innerHeight;

    if (left + tw > ww - 10) left = e.clientX - tw - pad;
    if (top + th > wh - 10) top = e.clientY - th - pad;
    if (left < 5) left = 5;
    if (top < 5) top = 5;

    tooltipEl.style.top = top + 'px';
    tooltipEl.style.left = left + 'px';
}

function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('show');
    currentProtoEl = null;
}

function initPrototypeTooltips() {
    createTooltip();

    document.addEventListener('mouseover', function(e) {
        const el = e.target.closest('[data-prototype]');
        if (!el) {
            hideTooltip();
            return;
        }
        showTooltip(e, el);
    });

    document.addEventListener('mousemove', function(e) {
        if (!currentProtoEl || !tooltipEl.classList.contains('show')) return;
        // Cập nhật vị trí tooltip theo chuột (mượt hơn)
        const pad = 14;
        let left = e.clientX + pad;
        let top = e.clientY + pad;
        const tw = tooltipEl.offsetWidth;
        const th = tooltipEl.offsetHeight;
        if (left + tw > window.innerWidth - 10) left = e.clientX - tw - pad;
        if (top + th > window.innerHeight - 10) top = e.clientY - th - pad;
        if (left < 5) left = 5;
        if (top < 5) top = 5;
        tooltipEl.style.top = top + 'px';
        tooltipEl.style.left = left + 'px';
    });

    document.addEventListener('mouseout', function(e) {
        const el = e.target.closest('[data-prototype]');
        if (!el || el !== currentProtoEl) {
            // Kiểm tra xem có đang chuyển sang element prototype khác không
            const related = e.relatedTarget;
            if (related && related.closest('[data-prototype]') === currentProtoEl) return;
            hideTooltip();
        }
    });

    document.addEventListener('scroll', hideTooltip, { passive: true });
}

// Dark/Light toggle
function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    const saved = localStorage.getItem('example_layout_theme');
    if (saved === 'dark') {
        document.body.classList.add('dark');
        btn.innerHTML = '<i class="bi bi-sun-fill"></i>';
    }

    btn.addEventListener('click', function() {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('example_layout_theme', isDark ? 'dark' : 'light');
        btn.innerHTML = isDark ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
    });
}

// Init
document.addEventListener('DOMContentLoaded', function() {
    initPrototypeTooltips();
    initThemeToggle();
});
