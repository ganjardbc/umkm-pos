/**
 * Theme Service
 * Handles theme persistence, loading, and management
 */

export type ThemeName = 'default' | 'blue' | 'green' | 'red';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  cssFile: string;
  description?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    tertiary: string;
  };
}

export interface ThemeState {
  currentTheme: ThemeName;
  isDarkMode: boolean;
  lastChanged: number;
}

const STORAGE_KEY = 'umkm-pos-theme';
const DARK_MODE_KEY = 'umkm-pos-dark-mode';
const THEME_HISTORY_KEY = 'umkm-pos-theme-history';

export const THEMES: Record<ThemeName, ThemeConfig> = {
  default: {
    name: 'default',
    label: 'Blue (Default)',
    cssFile: '/src/assets/styles/variables.css',
    description: 'Cool blue tones - default theme',
    colors: {
      primary: '#09637E',
      secondary: '#088395',
      accent: '#7AB2B2',
      tertiary: '#EBF4F6',
    },
  },
  blue: {
    name: 'blue',
    label: 'Deep Blue',
    cssFile: '/src/assets/styles/variables-blue.css',
    description: 'Deep blue professional theme',
    colors: {
      primary: '#0F2854',
      secondary: '#1C4D8D',
      accent: '#4988C4',
      tertiary: '#BDE8F5',
    },
  },
  green: {
    name: 'green',
    label: 'Natural Green',
    cssFile: '/src/assets/styles/variables-green.css',
    description: 'Natural green earthy tones',
    colors: {
      primary: '#3D8D7A',
      secondary: '#B3D8A8',
      accent: '#FBFFE4',
      tertiary: '#A3D1C6',
    },
  },
  red: {
    name: 'red',
    label: 'Warm Red',
    cssFile: '/src/assets/styles/variables-red.css',
    description: 'Warm earthy red tones',
    colors: {
      primary: '#952323',
      secondary: '#A73121',
      accent: '#DAD4B5',
      tertiary: '#F2E8C6',
    },
  },
};

class ThemeService {
  private currentTheme: ThemeName = 'default';
  private isDarkMode: boolean = false;
  private themeHistory: ThemeName[] = [];
  private listeners: Set<(state: ThemeState) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load theme preferences from localStorage
   */
  private loadFromStorage(): void {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    const savedDarkMode = localStorage.getItem(DARK_MODE_KEY);
    const savedHistory = localStorage.getItem(THEME_HISTORY_KEY);

    if (savedTheme && THEMES[savedTheme]) {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = 'default';
    }

    if (savedDarkMode !== null) {
      this.isDarkMode = savedDarkMode === 'true';
    } else {
      // Detect system preference
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (savedHistory) {
      try {
        this.themeHistory = JSON.parse(savedHistory);
      } catch {
        this.themeHistory = [this.currentTheme];
      }
    } else {
      this.themeHistory = [this.currentTheme];
    }
  }

  /**
   * Save theme preferences to localStorage
   */
  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, this.currentTheme);
    localStorage.setItem(DARK_MODE_KEY, this.isDarkMode.toString());
    localStorage.setItem(THEME_HISTORY_KEY, JSON.stringify(this.themeHistory));
  }

  /**
   * Apply theme to document
   */
  private applyTheme(): void {
    this.loadThemeCss(THEMES[this.currentTheme].cssFile);

    if (this.isDarkMode) {
      document.documentElement.classList.add('my-app-dark');
    } else {
      document.documentElement.classList.remove('my-app-dark');
    }

    this.notifyListeners();
  }

  /**
   * Load theme CSS file dynamically
   */
  private loadThemeCss(cssFile: string): void {
    const existingLink = document.getElementById('theme-variables');
    if (existingLink) {
      existingLink.remove();
    }

    const link = document.createElement('link');
    link.id = 'theme-variables';
    link.rel = 'stylesheet';
    link.href = cssFile;
    document.head.appendChild(link);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const state: ThemeState = {
      currentTheme: this.currentTheme,
      isDarkMode: this.isDarkMode,
      lastChanged: Date.now(),
    };
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * Set active theme
   */
  setTheme(themeName: ThemeName): void {
    if (THEMES[themeName] && this.currentTheme !== themeName) {
      this.currentTheme = themeName;
      this.addToHistory(themeName);
      this.saveToStorage();
      this.applyTheme();
    }
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.saveToStorage();
    this.applyTheme();
  }

  /**
   * Set dark mode to specific state
   */
  setDarkMode(value: boolean): void {
    if (this.isDarkMode !== value) {
      this.isDarkMode = value;
      this.saveToStorage();
      this.applyTheme();
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): ThemeConfig {
    return THEMES[this.currentTheme];
  }

  /**
   * Get current theme name
   */
  getCurrentThemeName(): ThemeName {
    return this.currentTheme;
  }

  /**
   * Get dark mode state
   */
  getDarkMode(): boolean {
    return this.isDarkMode;
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): ThemeConfig[] {
    return Object.values(THEMES);
  }

  /**
   * Get theme by name
   */
  getTheme(name: ThemeName): ThemeConfig | null {
    return THEMES[name] || null;
  }

  /**
   * Get theme history
   */
  getThemeHistory(): ThemeName[] {
    return [...this.themeHistory];
  }

  /**
   * Add theme to history
   */
  private addToHistory(themeName: ThemeName): void {
    // Remove if already in history
    const index = this.themeHistory.indexOf(themeName);
    if (index > -1) {
      this.themeHistory.splice(index, 1);
    }
    // Add to beginning
    this.themeHistory.unshift(themeName);
    // Keep only last 10
    if (this.themeHistory.length > 10) {
      this.themeHistory.pop();
    }
  }

  /**
   * Clear theme history
   */
  clearHistory(): void {
    this.themeHistory = [this.currentTheme];
    this.saveToStorage();
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(listener: (state: ThemeState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Initialize theme (apply saved preferences)
   */
  initialize(): void {
    this.applyTheme();
  }

  /**
   * Reset to default theme
   */
  reset(): void {
    this.currentTheme = 'default';
    this.isDarkMode = false;
    this.saveToStorage();
    this.applyTheme();
  }

  /**
   * Export current theme state
   */
  exportState(): ThemeState {
    return {
      currentTheme: this.currentTheme,
      isDarkMode: this.isDarkMode,
      lastChanged: Date.now(),
    };
  }

  /**
   * Import theme state
   */
  importState(state: Partial<ThemeState>): void {
    if (state.currentTheme && THEMES[state.currentTheme]) {
      this.currentTheme = state.currentTheme;
    }
    if (state.isDarkMode !== undefined) {
      this.isDarkMode = state.isDarkMode;
    }
    this.saveToStorage();
    this.applyTheme();
  }
}

// Singleton instance
export const themeService = new ThemeService();
