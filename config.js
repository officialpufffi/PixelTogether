class Config {
    constructor(configPath = 'config.json') {
        this.configPath = configPath;
        this.configData = null;
    }

    async loadConfig() {
        if (!this.configData) {
            try {
                const response = await fetch(this.configPath);
                if (!response.ok) {
                    throw new Error(`Failed to load config: ${response.statusText}`);
                }
                this.configData = await response.json();
            } catch (error) {
                console.error('Error loading config:', error);
                throw error;
            }
        }
    }

    async getTitle() {
        await this.loadConfig();
        return this.configData.title || 'PixelTogether';
    }

    async getIP() {
        await this.loadConfig();
        return this.configData.ip || '127.0.0.1';
    }

    async getPort() {
        await this.loadConfig();
        return this.configData.port || 80;
    }
    async getCanvasConfig() {
        const response = await fetch('./config.json');
        const data = await response.json();
        return { width: data.canvasWidth, height: data.canvasHeight };
    }
}

export const config = new Config();
