// src/config/seo.js
import { TEST_TAKING_ORIGIN } from "./app";

export const SITE_NAME = "منتالتو";

export const SITE_DEFAULT_TITLE = "منتالتو | تست‌های آنلاین روانشناسی و شخصیت";
export const SITE_DEFAULT_DESCRIPTION = "در منتالتو می‌توانید تست‌های روان‌شناسی و شخصیت‌شناسی را آنلاین انجام دهید، پرداخت کنید و نتیجه را به‌صورت فایل PDF از طریق ربات تلگرام دریافت کنید.";

export const SITE_DEFAULT_KEYWORDS = [
    "منتالتو",
    "تست روانشناسی",
    "تست روانشناسی آنلاین",
    "تست شخصیت",
    "تست شخصیت شناسی",
    "تست بلبین",
    "Belbin",
    "نقش‌های تیمی",
    "گزارش PDF",
].join(", ");

/**
 * Build a canonical absolute URL (no query params).
 */
export function buildCanonicalUrl(pathname = "/") {
    const origin = (TEST_TAKING_ORIGIN || "").replace(/\/$/, "") || "https://test-taking.mentaleto.ir";
    const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `${origin}${path}`;
}

export const SITE_DEFAULT_OG_IMAGE = "/icon-512x512.png";

export function buildOgImageUrl(pathname = SITE_DEFAULT_OG_IMAGE) {
    // Ensure OG image is absolute
    return buildCanonicalUrl(pathname);
}

// Homepage
export const HOMEPAGE_SEO = {
    title: "منتالتو | تست بلبین آنلاین و گزارش PDF",
    description: "تست بلبین (Belbin) را آنلاین انجام دهید و گزارش نقش‌های تیمی خود را به‌صورت PDF دریافت کنید. شروع از طریق ربات تلگرام منتالتو.",
    keywords: SITE_DEFAULT_KEYWORDS,
    robots: "index,follow",
    canonicalUrl: buildCanonicalUrl("/"),
    og: {
        type: "website",
        title: "منتالتو | تست بلبین آنلاین",
        description:
            "تست بلبین را آنلاین انجام دهید و گزارش PDF نقش‌های تیمی خود را دریافت کنید.",
        url: buildCanonicalUrl("/"),
        image: buildOgImageUrl(),
        locale: "fa_IR",
        siteName: SITE_NAME,
    },
    twitter: {
        card: "summary",
        title: "منتالتو | تست بلبین آنلاین",
        description:
            "انجام آنلاین تست بلبین و دریافت گزارش PDF از طریق تلگرام.",
        image: buildOgImageUrl(),
    },
};

// Generic helpers
export function getTestPageTitle(testTitle) {
    if (!testTitle) return SITE_DEFAULT_TITLE;
    return `تست ${testTitle} آنلاین | ${SITE_NAME}`;
}

export function getTestPageDescription(testTitle) {
    if (!testTitle) return SITE_DEFAULT_DESCRIPTION;
    return `تست ${testTitle} را آنلاین انجام دهید، پرداخت کنید و نتیجه را به‌صورت فایل PDF از طریق ربات تلگرام دریافت کنید.`;
}

export function getTestPageKeywords(testTitle) {
    const base = [
        "منتالتو",
        "تست روانشناسی آنلاین",
        "تست شخصیت",
        "تست بلبین",
        "Belbin",
    ];
    if (testTitle) {
        base.push(`تست ${testTitle}`);
        base.push(`تست آنلاین ${testTitle}`);
    }
    return base.join(", ");
}

// Main helper for test pages
export function getTestPageSeo(test) {
    if (!test) {
        return {
            title: SITE_DEFAULT_TITLE,
            description: SITE_DEFAULT_DESCRIPTION,
            keywords: SITE_DEFAULT_KEYWORDS,
            robots: "index,follow",
            canonicalUrl: buildCanonicalUrl("/"),
            og: {
                type: "website",
                title: SITE_DEFAULT_TITLE,
                description: SITE_DEFAULT_DESCRIPTION,
                url: buildCanonicalUrl("/"),
                image: buildOgImageUrl(),
                locale: "fa_IR",
                siteName: SITE_NAME,
            },
            twitter: {
                card: "summary",
                title: SITE_DEFAULT_TITLE,
                description: SITE_DEFAULT_DESCRIPTION,
                image: buildOgImageUrl(),
            },
        };
    }

    const title = (test.seo && test.seo.title) || getTestPageTitle(test.title);

    const description = (test.seo && test.seo.description) || getTestPageDescription(test.title);

    const keywords = (test.seo && test.seo.keywords) || getTestPageKeywords(test.title);

    const canonicalUrl = buildCanonicalUrl(`/test/${test.id}`);

    return {
        title,
        description,
        keywords,
        robots: "index,follow",
        canonicalUrl,
        og: {
            type: "website",
            title,
            description,
            url: canonicalUrl,
            image: buildOgImageUrl(),
            locale: "fa_IR",
            siteName: SITE_NAME,
        },
        twitter: {
            card: "summary",
            title,
            description,
            image: buildOgImageUrl(),
        },
    };
}

// For pre-pay, payment result, etc.
export const TRANSACTIONAL_NOINDEX = {
    robots: "noindex,nofollow",
};
