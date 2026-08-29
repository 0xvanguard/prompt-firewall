// ============================================================
// 🎯 FREEBUFF DEMO SYSTEM v2.0 - BETA ILIMITADA
// Demo sin límite de uso, solo límite de tiempo
// ============================================================

const DemoSystem = {
    // Configuración
    config: {
        maxUsage: 999999,      // Ilimitado en beta
        timeLimit: 600,        // 10 minutos en segundos (más tiempo para beta)
        projectId: '',
        projectName: '',
        upgradeUrl: '#',
        proPrice: '$29/mes',
        isBeta: true,          // Modo beta activado
    },

    // Estado
    state: {
        usageCount: 0,
        timeRemaining: 600,
        isPro: false,
        isBlocked: false,
        timerInterval: null,
        isBeta: true,
    },

    // Inicializar
    init(projectId, projectName, options = {}) {
        this.config.projectId = projectId;
        this.config.projectName = projectName;
        Object.assign(this.config, options);

        this.loadState();
        this.createDemoUI();

        if (!this.state.isPro && !this.state.isBlocked) {
            this.startTimer();
        }

        setInterval(() => this.saveState(), 30000);

        console.log(`🎯 Beta Demo initialized: ${projectName}`);
        console.log(`   ⏱️ Tiempo: ${this.formatTime(this.state.timeRemaining)}`);
        console.log(`   🔓 Modo: Beta Ilimitado`);
    },

    // Cargar estado
    loadState() {
        const key = `demo_${this.config.projectId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            const data = JSON.parse(saved);
            this.state.usageCount = data.usageCount || 0;
            this.state.timeRemaining = data.timeRemaining || this.config.timeLimit;
            this.state.isPro = data.isPro || false;
            this.state.isBeta = data.isBeta !== false;

            if (this.state.timeRemaining <= 0 && !this.state.isPro) {
                this.state.timeRemaining = this.config.timeLimit;
                this.state.isBlocked = false; // Beta: reinicia
            }
        }
    },

    // Guardar estado
    saveState() {
        const key = `demo_${this.config.projectId}`;
        localStorage.setItem(key, JSON.stringify({
            usageCount: this.state.usageCount,
            timeRemaining: this.state.timeRemaining,
            isPro: this.state.isPro,
            isBeta: this.state.isBeta,
            lastSaved: Date.now(),
        }));
    },

    // Usar función (siempre permite en beta)
    use() {
        if (this.state.isPro) return true;
        if (this.state.isBlocked) {
            this.showTimeUpModal();
            return false;
        }
        this.state.usageCount++;
        this.saveState();
        this.updateUI();
        return true;
    },

    // Iniciar timer
    startTimer() {
        this.state.timerInterval = setInterval(() => {
            if (this.state.isPro) {
                clearInterval(this.state.timerInterval);
                return;
            }

            this.state.timeRemaining--;
            this.updateUI();

            if (this.state.timeRemaining <= 0) {
                this.state.isBlocked = true;
                this.showTimeUpModal();
                clearInterval(this.state.timerInterval);
                this.saveState();
            }

            // Advertencias
            if (this.state.timeRemaining === 120) {
                this.showWarning('⏰ Quedan 2 minutos de beta');
            }
            if (this.state.timeRemaining === 60) {
                this.showWarning('⚠️ Queda 1 minuto');
            }
            if (this.state.timeRemaining === 30) {
                this.showWarning('🔥 30 segundos restantes');
            }
        }, 1000);
    },

    // Formatear tiempo
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Crear UI
    createDemoUI() {
        if (document.getElementById('demo-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'demo-banner';
        banner.innerHTML = `
            <style>
                #demo-banner {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 9999;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border-bottom: 2px solid #00ff88;
                    padding: 10px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
                #demo-banner .demo-left {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                #demo-banner .demo-badge {
                    background: linear-gradient(135deg, #00ff88, #00aaff);
                    color: #000;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    animation: pulse 2s infinite;
                }
                #demo-banner .demo-beta-tag {
                    background: rgba(138,43,226,0.2);
                    color: #8a2be2;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 700;
                    border: 1px solid rgba(138,43,226,0.3);
                }
                #demo-banner .demo-timer {
                    color: #00ff88;
                    font-size: 18px;
                    font-weight: 700;
                    font-family: 'Courier New', monospace;
                }
                #demo-banner .demo-usage {
                    color: #888;
                    font-size: 12px;
                }
                #demo-banner .demo-usage span {
                    color: #00ff88;
                    font-weight: 600;
                }
                #demo-banner .demo-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                #demo-banner .demo-upgrade {
                    background: linear-gradient(135deg, #ff4757, #ff6b81);
                    color: #fff;
                    padding: 6px 16px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-decoration: none;
                }
                #demo-banner .demo-upgrade:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255,71,87,0.4);
                }
                #demo-banner .demo-close {
                    background: transparent;
                    border: 1px solid #444;
                    color: #888;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s;
                }
                #demo-banner .demo-close:hover {
                    border-color: #ff4757;
                    color: #ff4757;
                }
                #demo-banner.warning { border-bottom-color: #ffa500; }
                #demo-banner.warning .demo-timer { color: #ffa500; }
                #demo-banner.critical { border-bottom-color: #ff4757; animation: pulse-danger 0.5s infinite; }
                #demo-banner.critical .demo-timer { color: #ff4757; }
                body { padding-top: 50px !important; }
                @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.7} }
                @keyframes pulse-danger { 0%,100%{opacity:1}50%{opacity:0.5} }
            </style>
            <div class="demo-left">
                <span class="demo-badge">🎯 DEMO</span>
                <span class="demo-beta-tag">BETA</span>
                <span class="demo-timer" id="demo-timer">${this.formatTime(this.state.timeRemaining)}</span>
                <span class="demo-usage">Usos: <span id="demo-usage-count">${this.state.usageCount}</span> (ilimitados)</span>
            </div>
            <div class="demo-right">
                <a href="${this.config.upgradeUrl}" class="demo-upgrade">
                    ⭐ Pro (${this.config.proPrice})
                </a>
                <button class="demo-close" onclick="DemoSystem.dismissBanner()" title="Ocultar">×</button>
            </div>
        `;

        document.body.prepend(banner);
        this.updateUI();
    },

    // Actualizar UI
    updateUI() {
        const timer = document.getElementById('demo-timer');
        const usage = document.getElementById('demo-usage-count');
        const banner = document.getElementById('demo-banner');

        if (timer) timer.textContent = this.formatTime(this.state.timeRemaining);
        if (usage) usage.textContent = this.state.usageCount;

        if (banner) {
            banner.className = '';
            if (this.state.isBlocked) {
                banner.classList.add('critical');
            } else if (this.state.timeRemaining <= 60) {
                banner.classList.add('warning');
            } else if (this.state.timeRemaining <= 120) {
                banner.classList.add('warning');
            }
        }
    },

    // Modal tiempo agotado
    showTimeUpModal() {
        const overlay = document.createElement('div');
        overlay.id = 'demo-blocked-overlay';
        overlay.innerHTML = `
            <style>
                #demo-blocked-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    background: rgba(0,0,0,0.92);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                }
                #demo-blocked-overlay .blocked-card {
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border: 2px solid #8a2be2;
                    border-radius: 20px;
                    padding: 3rem;
                    text-align: center;
                    max-width: 500px;
                    width: 90%;
                    animation: slideUp 0.3s ease;
                }
                #demo-blocked-overlay h2 {
                    color: #8a2be2;
                    font-size: 1.8rem;
                    margin: 1rem 0 0.5rem;
                }
                #demo-blocked-overlay .beta-tag {
                    display: inline-block;
                    background: rgba(138,43,226,0.2);
                    color: #8a2be2;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    border: 1px solid rgba(138,43,226,0.3);
                }
                #demo-blocked-overlay p {
                    color: #888;
                    margin: 1rem 0 2rem;
                    line-height: 1.6;
                }
                #demo-blocked-overlay .upgrade-btn {
                    background: linear-gradient(135deg, #00ff88, #00aaff);
                    color: #000;
                    padding: 14px 36px;
                    border-radius: 12px;
                    border: none;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin: 5px;
                    text-decoration: none;
                    display: inline-block;
                }
                #demo-blocked-overlay .upgrade-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0,255,136,0.4);
                }
                #demo-blocked-overlay .reset-btn {
                    background: transparent;
                    color: #888;
                    padding: 14px 28px;
                    border-radius: 12px;
                    border: 1px solid #444;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin: 5px;
                }
                #demo-blocked-overlay .reset-btn:hover {
                    border-color: #8a2be2;
                    color: #8a2be2;
                }
                #demo-blocked-overlay .features {
                    text-align: left;
                    margin: 1.5rem 0;
                    padding: 1rem;
                    background: rgba(0,0,0,0.3);
                    border-radius: 10px;
                }
                #demo-blocked-overlay .feature {
                    color: #00ff88;
                    padding: 6px 0;
                    font-size: 13px;
                }
                @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
            </style>
            <div class="blocked-card">
                <span class="beta-tag">BETA</span>
                <div style="font-size:4rem;margin-top:1rem;">⏱️</div>
                <h2>Tiempo de Beta Agotado</h2>
                <p>Tu sesión beta de 10 minutos ha terminado.<br>
                   Desbloquea acceso completo con Pro.</p>
                <div class="features">
                    <div class="feature">✅ Usos ilimitados</div>
                    <div class="feature">✅ Sin límite de tiempo</div>
                    <div class="feature">✅ API completa</div>
                    <div class="feature">✅ Soporte prioritario</div>
                    <div class="feature">✅ Actualizaciones de por vida</div>
                </div>
                <a href="${this.config.upgradeUrl}" class="upgrade-btn">
                    ⭐ Actualizar a Pro (${this.config.proPrice})
                </a>
                <br><br>
                <button class="reset-btn" onclick="DemoSystem.resetDemo()">
                    🔄 Reiniciar beta (10 min más)
                </button>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    // Advertencia
    showWarning(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed;top:60px;right:20px;z-index:10001;
            background:linear-gradient(135deg,#8a2be2,#6a1fb0);color:#fff;
            padding:12px 20px;border-radius:10px;font-weight:600;
            animation:slideIn 0.3s ease;box-shadow:0 4px 15px rgba(138,43,226,0.4);
        `;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    // Ocultar banner
    dismissBanner() {
        const banner = document.getElementById('demo-banner');
        if (banner) {
            banner.style.transform = 'translateY(-100%)';
            banner.style.transition = 'transform 0.3s ease';
            setTimeout(() => banner.remove(), 300);
        }
    },

    // Reiniciar demo
    resetDemo() {
        const key = `demo_${this.config.projectId}`;
        localStorage.removeItem(key);
        this.state.usageCount = 0;
        this.state.timeRemaining = this.config.timeLimit;
        this.state.isBlocked = false;

        const overlay = document.getElementById('demo-blocked-overlay');
        if (overlay) overlay.remove();

        this.createDemoUI();
        this.startTimer();
        this.showWarning('🔄 Beta reiniciada - 10 minutos');
    },

    // Activar Pro
    activatePro() {
        this.state.isPro = true;
        this.saveState();
        const banner = document.getElementById('demo-banner');
        if (banner) banner.remove();
        const overlay = document.getElementById('demo-blocked-overlay');
        if (overlay) overlay.remove();
        clearInterval(this.state.timerInterval);
        console.log('🎉 Pro activado');
    },
};

// Auto-inicializar
if (typeof DEMO_CONFIG !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        DemoSystem.init(DEMO_CONFIG.id, DEMO_CONFIG.name, DEMO_CONFIG.options);
    });
}
