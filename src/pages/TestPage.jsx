import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import Loading from "../components/Loading";

import NoToken from "./states/NoToken";
import InvalidToken from "./states/InvalidToken";
import UsedToken from "./states/UsedToken";
import ExpiredToken from "./states/ExpiredToken";
import ValidToken from "./states/ValidToken";
import NotFound from "./states/NotFound";

import PublicTestInfo from "../components/PublicTestInfo";
import { validateToken } from "../services/tokenService";
import { fetchTestDefinition } from "../services/testDefinitionService";
import tests from "../tests";
import { getTestPageSeo } from "../config/seo";

export default function TestPage() {
    const { testId } = useParams();
    const [searchParams] = useSearchParams();

    const [state, setState] = useState("loading");
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [definition, setDefinition] = useState(null);
    const [prefill, setPrefill] = useState(null);
    const [definitionState, setDefinitionState] = useState("idle");

    const token = searchParams.get("token") || "";
    const test = tests[testId];

    // Unknown test id -> 404 page
    if (!test) {
        return <NotFound />;
    }

    useEffect(() => {
        if (!token) {
            setState("no-token");
            setData(null);
            setError(null);
            setDefinition(null);
            setPrefill(null);
            setDefinitionState("idle");
            return;
        }

        let cancelled = false;

        async function run() {
            setState("loading");
            setError(null);

            try {
                const result = await validateToken(token);
                if (cancelled) return;

                setState(result.state);
                setData(result.data || null);
                // For tests with remote definitions (e.g. Belbin), fetch the public definition + prefill
                if (result.state === "valid" && test?.definitionSource === "remote") {
                    setDefinitionState("loading");
                    setDefinition(null);
                    setPrefill(null);

                    const defRes = await fetchTestDefinition({ testId: test.id, token });
                    if (cancelled) return;

                    if (defRes.state === "ok") {
                        setDefinitionState("ok");
                        setDefinition(defRes.definition);
                        setPrefill(defRes.prefill || {});
                    } else {
                        setDefinitionState("error");
                        // Map definition errors to the same UI states
                        if (defRes.state === "not-found") setState("not-found");
                        else if (defRes.state === "invalid") setState("invalid");
                        else if (defRes.state === "used") setState("used");
                        else if (defRes.state === "expired") setState("expired");
                        else setState("error");
                    }
                } else {
                    // local tests (MBTI sample) still work without remote definition
                    setDefinitionState("idle");
                    setDefinition(null);
                    setPrefill(null);
                }
            } catch (err) {
                if (cancelled) return;
                console.error("Validate token failed", err);
                setState("error");
                setError(
                    "در بررسی لینک شما مشکلی پیش آمد. لطفاً دوباره تلاش کنید."
                );
                setDefinitionState("error");
                setDefinition(null);
                setPrefill(null);
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [token]);

    const seo = getTestPageSeo(test);

    return (
        <>
            <Helmet>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
                {seo.keywords && <meta name="keywords" content={seo.keywords} />}

                {/* Prevent indexing of tokenized links */}
                <meta
                    name="robots"
                    content={token ? "noindex,nofollow" : (seo.robots || "index,follow")}
                />

                {seo.canonicalUrl && !token && (
                    <link rel="canonical" href={seo.canonicalUrl} />
                )}

                {/* Open Graph */}
                {seo.og?.type && <meta property="og:type" content={seo.og.type} />}
                {seo.og?.title && <meta property="og:title" content={seo.og.title} />}
                {seo.og?.description && (
                    <meta
                        property="og:description"
                        content={seo.og.description}
                    />
                )}
                {seo.og?.url && <meta property="og:url" content={seo.og.url} />}
                {seo.og?.image && <meta property="og:image" content={seo.og.image} />}
                {seo.og?.locale && (
                    <meta property="og:locale" content={seo.og.locale} />
                )}
                {seo.og?.siteName && (
                    <meta property="og:site_name" content={seo.og.siteName} />
                )}

                {/* Twitter */}
                {seo.twitter?.card && (
                    <meta name="twitter:card" content={seo.twitter.card} />
                )}
                {seo.twitter?.title && (
                    <meta name="twitter:title" content={seo.twitter.title} />
                )}
                {seo.twitter?.description && (
                    <meta
                        name="twitter:description"
                        content={seo.twitter.description}
                    />
                )}
                {seo.twitter?.image && (
                    <meta name="twitter:image" content={seo.twitter.image} />
                )}
            </Helmet>

            <PublicTestInfo test={test} />

            {state === "no-token" && <NoToken />}

            {state === "loading" && <Loading />}

            {state === "valid" && (
                test?.definitionSource === "remote" ? (
                    definitionState === "loading" ? (
                        <Loading />
                    ) : (
                        <ValidToken
                            data={data}
                            test={test}
                            token={token}
                            definition={definition}
                            prefill={prefill}
                        />
                    )
                ) : (
                    <ValidToken
                        data={data}
                        test={test}
                        token={token}
                    />
                )
            )}

            {state === "invalid" && <InvalidToken />}
            {state === "used" && <UsedToken />}
            {state === "expired" && <ExpiredToken />}
            {state === "not-found" && <NotFound />}

            {state === "error" && (
                <div className="alert alert-danger mt-4">
                    {error ||
                        "اشکالی در سیستم به‌وجود آمده است. لطفاً کمی بعد دوباره تلاش کنید."}
                </div>
            )}
        </>
    );
}
