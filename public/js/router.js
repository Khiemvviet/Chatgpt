class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = '';
        
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }

    addRoute(route, templateId, callback) {
        this.routes[route] = { templateId, callback };
    }

    async handleRouteChange() {
        const hash = window.location.hash.slice(1) || 'home';
        this.currentRoute = hash;

        if (this.routes[hash]) {
            const { templateId, callback } = this.routes[hash];
            await this.loadTemplate(templateId);
            if (callback) callback();
        } else {
            await this.loadTemplate('home');
        }
    }

    async loadTemplate(templateId) {
        try {
            const response = await fetch(`/${templateId}.html`);
            const content = await response.text();
            document.getElementById('app-content').innerHTML = content;
            
            // Initialize charts if we're on project page
            if (templateId === 'project') {
                this.initializeCharts();
            }
        } catch (error) {
            console.error('Error loading template:', error);
            document.getElementById('app-content').innerHTML = '<div class="page"><h1>Page Not Found</h1></div>';
        }
    }

    initializeCharts() {
        if (typeof initializeResultCharts === 'function') {
            initializeResultCharts();
        }
    }
}

const router = new Router();

// Define routes
router.addRoute('home', 'home', () => {
    updateAssistant('Welcome to the ChatGPT Efficiency Evaluation Project!');
});

router.addRoute('about', 'about', () => {
    updateAssistant('Learn more about me and my background.');
});

router.addRoute('education', 'education', () => {
    updateAssistant('Here\'s my educational journey and qualifications.');
});

router.addRoute('experience', 'experience', () => {
    updateAssistant('Check out my professional experience and skills.');
});

router.addRoute('project', 'project', () => {
    updateAssistant('Explore the ChatGPT efficiency analysis results and methodology.');
});