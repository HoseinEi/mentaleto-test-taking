import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import TelegramBotCta from "../components/TelegramBotCta";
import { HOMEPAGE_SEO } from "../config/seo";

export default function Home() {
    return (
        <>
            <Helmet>
                <title>{HOMEPAGE_SEO.title}</title>
                <meta name="description" content={HOMEPAGE_SEO.description} />
                {HOMEPAGE_SEO.keywords && (
                    <meta name="keywords" content={HOMEPAGE_SEO.keywords} />
                )}
                {HOMEPAGE_SEO.robots && (
                    <meta name="robots" content={HOMEPAGE_SEO.robots} />
                )}

                {HOMEPAGE_SEO.canonicalUrl && (
                    <link rel="canonical" href={HOMEPAGE_SEO.canonicalUrl} />
                )}

                {/* Open Graph */}
                {HOMEPAGE_SEO.og?.type && (
                    <meta property="og:type" content={HOMEPAGE_SEO.og.type} />
                )}
                {HOMEPAGE_SEO.og?.title && (
                    <meta property="og:title" content={HOMEPAGE_SEO.og.title} />
                )}
                {HOMEPAGE_SEO.og?.description && (
                    <meta
                        property="og:description"
                        content={HOMEPAGE_SEO.og.description}
                    />
                )}
                {HOMEPAGE_SEO.og?.url && (
                    <meta property="og:url" content={HOMEPAGE_SEO.og.url} />
                )}
                {HOMEPAGE_SEO.og?.image && (
                    <meta property="og:image" content={HOMEPAGE_SEO.og.image} />
                )}
                {HOMEPAGE_SEO.og?.locale && (
                    <meta property="og:locale" content={HOMEPAGE_SEO.og.locale} />
                )}
                {HOMEPAGE_SEO.og?.siteName && (
                    <meta
                        property="og:site_name"
                        content={HOMEPAGE_SEO.og.siteName}
                    />
                )}

                {/* Twitter */}
                {HOMEPAGE_SEO.twitter?.card && (
                    <meta name="twitter:card" content={HOMEPAGE_SEO.twitter.card} />
                )}
                {HOMEPAGE_SEO.twitter?.title && (
                    <meta name="twitter:title" content={HOMEPAGE_SEO.twitter.title} />
                )}
                {HOMEPAGE_SEO.twitter?.description && (
                    <meta
                        name="twitter:description"
                        content={HOMEPAGE_SEO.twitter.description}
                    />
                )}
                {HOMEPAGE_SEO.twitter?.image && (
                    <meta name="twitter:image" content={HOMEPAGE_SEO.twitter.image} />
                )}
            </Helmet>

            <header className="my-4">
                <h1>تست‌های منتالتو</h1>
                <p className="lead mb-0">
                    تست‌های روان‌شناسی و شخصیت‌شناسی را آنلاین انجام دهید و نتیجه را
                    به‌صورت فایل PDF از طریق ربات تلگرام دریافت کنید.
                </p>
            </header>

            <section className="my-4">
                <div className="row g-4">
                    <div className="col-md-8">
                        <article>
                            <h2>تست بلبین (Belbin)</h2>
                            <p className="mb-2">
                                تست بلبین به شما کمک می‌کند نقش‌های تیمی و سبک همکاری
                                خود را بهتر بشناسید. این تست برای مدیران، تیم‌ها و
                                مشاوران منابع انسانی کاربردی است.
                            </p>
                            <p className="mb-3">
                                برای دریافت لینک اختصاصی و شروع تست، ابتدا ربات تلگرام
                                منتالتو را باز کنید.
                            </p>

                            <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
                                <Link to="/test/belbin_9_individual" className="btn btn-primary">
                                    اطلاعات و شروع تست بلبین
                                </Link>
                                <div className="flex-grow-1" />
                            </div>
                        </article>
                    </div>

                    <div className="col-md-4">
                        <aside className="card">
                            <div className="card-body">
                                <h5 className="card-title">مزایا</h5>
                                <ul className="mb-3">
                                    <li>تکمیل آنلاین و ساده</li>
                                    <li>پرداخت آنلاین</li>
                                    <li>دریافت گزارش PDF در تلگرام</li>
                                    <li>پشتیبانی و راهنمایی</li>
                                </ul>
                                <TelegramBotCta
                                    buttonText="شروع از طریق ربات تلگرام"
                                    className="mt-2"
                                />
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
