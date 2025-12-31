// App names
export const APP_NAME_FA = "منتالتو";
export const APP_NAME_EN = "Mentaleto";

// Telegram bot
export const TELEGRAM_BOT_USERNAME = "mentaletoBot";
export const TELEGRAM_BOT_HANDLE = "@mentaletoBot";

// Deep links to the bot
export const TELEGRAM_BOT_DEEPLINK_WEB = `https://t.me/${TELEGRAM_BOT_USERNAME}`;
export const TELEGRAM_BOT_DEEPLINK_APP = `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}`;

// Main sites (can be overridden by env if needed)
export const MAIN_SITE_URL =
    import.meta.env.VITE_MAIN_SITE_URL || "https://mentaleto.ir";

export const TEST_TAKING_ORIGIN =
    import.meta.env.VITE_TEST_TAKING_ORIGIN || "https://test-taking.mentaleto.ir";
