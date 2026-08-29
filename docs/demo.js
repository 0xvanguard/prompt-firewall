// ============================================================
// 🎯 FREEBUFF DEMO SYSTEM v1.0
// Sistema de demo limitada por tiempo y uso
// ============================================================

const DemoSystem = {
    // Configuración
    config: {
        maxUsage: 3,           // Usos máximos por sesión
        timeLimit: 300,        // 5 minutos en segundos
        projectId: '',         // Se establece por proyecto
        projectName: '',       // Nombre del proyecto
        upgradeUrl: '#',       // URL de upgrade
        proPrice: '$29/mes',   // Precio Pro
    },

    // Estado
    state: {
        usageCount: 0,
        timeRemaining: 300,
        isPro: false,
        isBlocked: false,
        timerInterval: null,
    },

    // Inicializar demo
    init(projectId, projectName, options = {}) {
        this.config.projectId = projectId;
        this.config.projectName = projectName;
        Object.assign(this.config, options);

        // Cargar estado desde localStorage
        this.loadState();

        // Crear UI de demo
        this.createDemoUI();

        // Iniciar timer si no es Pro
        if (!this.state.isPro) {
            this.startTimer();
        }

        // Auto-guardar cada 30 segundos
        setInterval(() => this.saveState(), 30000);

        console.log(`🎯 Demo System initialized for ${projectName}`);
        console.log(`   Usos: ${this.state.usageCount}/${this.config.maxUsage}`);
        console.log(`   Tiempo: ${this.formatTime(this.state.timeRemaining)}`);
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

            // Si el tiempo se agotó, reiniciar
            if (this.state.timeRemaining <= 0 && !this.state.isPro) {
                this.state.timeRemaining = this.config.timeLimit;
                this.state.usageCount = 0;
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
            lastSaved: Date.now(),
        }));
    },

    // Usar una función (incrementa contador)
    use() {
        if (this.state.isPro) return true;
        if (this.state.isBlocked) {
            this.showBlockedMessage();
            return false;
        }
        if (this.state.usageCount >= this.config.maxUsage) {
            this.state.isBlocked = true;
            this.showBlockedMessage();
            this.saveState();
            return false;
        }

        this.state.usageCount++;
        this.saveState();
        this.updateUI();

        console.log(`🎯 Uso ${this.state.usageCount}/${this.config.maxUsage}`);

        if (this.state.usageCount >= this.config.maxUsage) {
            setTimeout(() => this.showUpgradeModal(), 500);
        }

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
                this.showBlockedMessage();
                clearInterval(this.state.timerInterval);
                this.saveState();
            }

            // Advertencia a los 60 segundos
            if (this.state.timeRemaining === 60) {
                this.showWarning('⏰ Queda 1 minuto de demo');
            }

            // Advertencia a los 30 segundos
            if (this.state.timeRemaining === 30) {
                this.showWarning('⚠️ Quedan 30 segundos');
            }
        }, 1000);
    },

    // Formatear tiempo
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Crear UI de demo
    createDemoUI() {
        // Verificar si ya existe
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
                    padding: 12px 20px;
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
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                #demo-banner .demo-timer {
                    color: #00ff88;
                    font-size: 18px;
                    font-weight: 700;
                    font-family: 'Courier New', monospace;
                }
                #demo-banner .demo-usage {
                    color: #888;
                    font-size: 13px;
                }
                #demo-banner .demo-usage span {
                    color: #00ff88;
                    font-weight: 600;
                }
                #demo-banner .demo-right {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                #demo-banner .demo-upgrade {
                    background: linear-gradient(135deg, #ff4757, #ff6b81);
                    color: #fff;
                    padding: 8px 20px;
                    border-radius: 8px;
                    border: none;
                    font-size: 14px;
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
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.3s;
                }
                #demo-banner .demo-close:hover {
                    border-color: #ff4757;
                    color: #ff4757;
                }
                #demo-banner.warning {
                    border-bottom-color: #ffa500;
                    animation: pulse-warning 1s infinite;
                }
                #demo-banner.blocked {
                    border-bottom-color: #ff4757;
                    background: linear-gradient(135deg, #2e1a1a, #1e1621);
                }
                @keyframes pulse-warning {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                /* Ajustar contenido para hacer espacio al banner */
                body { padding-top: 60px !important; }
            </style>
            <div class="demo-left">
                <span class="demo-badge">🎯 DEMO</span>
                <span class="demo-timer" id="demo-timer">${this.formatTime(this.state.timeRemaining)}</span>
                <span class="demo-usage">Usos: <span id="demo-usage-count">${this.state.usageCount}</span>/${this.config.maxUsage}</span>
            </div>
            <div class="demo-right">
                <a href="${this.config.upgradeUrl}" class="demo-upgrade">
                    ⭐ Actualizar a Pro (${this.config.proPrice})
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
                banner.classList.add('blocked');
            } else if (this.state.timeRemaining <= 60) {
                banner.classList.add('warning');
            }
        }
    },

    // Mostrar mensaje de bloqueo
    showBlockedMessage() {
        const overlay = document.createElement('div');
        overlay.id = 'demo-blocked-overlay';
        overlay.innerHTML = `
            <style>
                #demo-blocked-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    background: rgba(0,0,0,0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                }
                #demo-blocked-overlay .blocked-card {
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border: 2px solid #ff4757;
                    border-radius: 20px;
                    padding: 3rem;
                    text-align: center;
                    max-width: 500px;
                    width: 90%;
                    animation: slideUp 0.3s ease;
                }
                #demo-blocked-overlay .blocked-icon {
                    font-size: 5rem;
                    margin-bottom: 1rem;
                }
                #demo-blocked-overlay h2 {
                    color: #ff4757;
                    font-size: 1.8rem;
                    margin-bottom: 0.5rem;
                }
                #demo-blocked-overlay p {
                    color: #888;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }
                #demo-blocked-overlay .blocked-features {
                    text-align: left;
                    margin-bottom: 2rem;
                }
                #demo-blocked-overlay .blocked-feature {
                    color: #00ff88;
                    padding: 8px 0;
                    font-size: 14px;
                }
                #demo-blocked-overlay .blocked-feature::before {
                    content: '✅ ';
                }
                #demo-blocked-overlay .upgrade-btn {
                    background: linear-gradient(135deg, #00ff88, #00aaff);
                    color: #000;
                    padding: 15px 40px;
                    border-radius: 12px;
                    border: none;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin: 5px;
                }
                #demo-blocked-overlay .upgrade-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0,255,136,0.4);
                }
                #demo-blocked-overlay .reset-btn {
                    background: transparent;
                    color: #888;
                    padding: 15px 30px;
                    border-radius: 12px;
                    border: 1px solid #444;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin: 5px;
                }
                #demo-blocked-overlay .reset-btn:hover {
                    border-color: #00ff88;
                    color: #00ff88;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>
            <div class="blocked-card">
                <div class="blocked-icon">🔒</div>
                <h2>Demo Agotada</h2>
                <p>Has utilizado todos los usos gratuitos de esta demo.<br>
                   Desbloquea el acceso completo con Pro.</p>
                <div class="blocked-features">
                    <div class="blocked-feature">Usos ilimitados</div>
                    <div class="blocked-feature">Sin límite de tiempo</div>
                    <div class="blocked-feature">Soporte prioritario</div>
                    <div class="blocked-feature">API completa</div>
                </div>
                <a href="${this.config.upgradeUrl}" class="upgrade-btn">
                    ⭐ Actualizar a Pro (${this.config.proPrice})
                </a>
                <br><br>
                <button class="reset-btn" onclick="DemoSystem.resetDemo()">
                    🔄 Reiniciar demo (borrar datos)
                </button>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    // Mostrar advertencia
    showWarning(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: linear-gradient(135deg, #ffa500, #ff8c00);
            color: #000;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10001;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(255,165,0,0.4);
        `;
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    },

    // Mostrar modal de upgrade
    showUpgradeModal() {
        this.showWarning('⚠️ Has alcanzado el límite de usos gratuitos');
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

        // Remover overlay
        const overlay = document.getElementById('demo-blocked-overlay');
        if (overlay) overlay.remove();

        // Recrear UI
        this.createDemoUI();
        this.startTimer();

        this.showWarning('🔄 Demo reiniciada - 3 usos y 5 minutos');
    },

    // Activar Pro (para testing)
    activatePro() {
        this.state.isPro = true;
        this.saveState();

        // Remover banner
        const banner = document.getElementById('demo-banner');
        if (banner) banner.remove();

        // Remover overlay
        const overlay = document.getElementById('demo-blocked-overlay');
        if (overlay) overlay.remove();

        clearInterval(this.state.timerInterval);
        console.log('🎉 Pro activado - acceso completo');
    },
};

// Auto-inicializar si hay configuración
if (typeof DEMO_CONFIG !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        DemoSystem.init(DEMO_CONFIG.id, DEMO_CONFIG.name, DEMO_CONFIG.options);
    });
}
