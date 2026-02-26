import React from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Brain,
    Users,
    LineChart,
    Shield,
    Star,
    Play,
    CheckCircle
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import ThreeDTiltCard from "../components/ui/ThreeDTiltCard";

/* ======================================================
   LANDING PAGE (Redesigned with 3D)
====================================================== */

const Landing = () => {
    const { scrollY } = useScroll();

    // Parallax logic for floating cards
    const yFloatSlow = useTransform(scrollY, [0, 500], [0, -50]);
    const yFloatMedium = useTransform(scrollY, [0, 500], [0, -100]);
    const yFloatFast = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <div className="page-transition aurora-bg" style={{ minHeight: "100vh", position: "relative" }}>
            {/* Organic Glow Elements */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100vh",
                overflow: "hidden",
                pointerEvents: "none",
                zIndex: 0
            }}>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: "absolute",
                        top: "10%",
                        left: "10%",
                        width: "40vw",
                        height: "40vw",
                        background: "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
                        filter: "blur(80px)"
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -40, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: "absolute",
                        bottom: "20%",
                        right: "5%",
                        width: "35vw",
                        height: "35vw",
                        background: "radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)",
                        filter: "blur(100px)"
                    }}
                />
            </div>

            {/* ================= HERO SECTION (Apna-Style) ================= */}
            <section className="hero-wrapper" style={{ padding: "100px 0 60px", position: "relative", zIndex: 1 }}>
                <div className="container">
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1.1fr 0.9fr",
                        gap: "4rem",
                        alignItems: "center"
                    }}>
                        {/* Left Side: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 style={{
                                fontSize: "clamp(3.5rem, 5.5vw, 4.5rem)",
                                fontWeight: 800,
                                lineHeight: 1.1,
                                marginBottom: "1.5rem",
                                color: "var(--text-primary)",
                                letterSpacing: "-0.04em"
                            }}>
                                Hire Smarter. <br />
                                <span className="gradient-text">Get Hired Faster.</span>
                            </h1>
                            <p className="text-subtle" style={{
                                fontSize: "1.25rem",
                                marginBottom: "2.5rem",
                                maxWidth: "600px",
                                lineHeight: 1.6
                            }}>
                                The AI-powered recruitment platform that bridges the gap between talent and opportunity.
                                <span style={{ display: "block", color: "var(--text-primary)", fontWeight: 600, marginTop: "0.5rem" }}>
                                    Instant analysis, real skills, zero bias.
                                </span>
                            </p>

                            <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "4rem" }}>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link to="/signup" className="btn-primary" style={{ padding: "18px 40px", fontSize: "1.1rem" }}>
                                        Get Started Free <ArrowRight size={22} />
                                    </Link>
                                </motion.div>
                            </div>

                            {/* Stats Row */}
                            <div style={{ display: "flex", gap: "4rem", borderTop: "1px solid var(--border-color)", paddingTop: "2.5rem" }}>
                                <StatItem value="6.5 Crore+" label="Active Candidates" />
                                <StatItem value="7.5 Lakh+" label="Trust Enterprises" />
                                <StatItem value="4000+" label="Daily Hires" />
                            </div>
                        </motion.div>

                        {/* Right Side: Elevated Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ position: "relative" }}
                        >
                            {/* Main Dashboard Container */}
                            <div className="glass-panel" style={{
                                height: "640px",
                                borderRadius: "32px",
                                position: "relative",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                padding: "2rem",
                                background: "linear-gradient(135deg, var(--glass-bg), rgba(255, 255, 255, 0.4))",
                                boxShadow: "var(--shadow-xl), inset 0 0 60px rgba(255, 255, 255, 0.3)",
                                border: "1px solid var(--glass-border)",
                                backdropFilter: "blur(20px)"
                            }}>
                                {/* Abstract AI Background Pattern */}
                                <div style={{
                                    position: "absolute",
                                    inset: 0,
                                    backgroundImage: `
                                        radial-gradient(circle at 2px 2px, var(--border-color) 1px, transparent 0),
                                        linear-gradient(to right, var(--border-color) 1px, transparent 1px),
                                        linear-gradient(to bottom, var(--border-color) 1px, transparent 1px)
                                    `,
                                    backgroundSize: "40px 40px, 100px 100px, 100px 100px",
                                    opacity: 0.1,
                                    zIndex: 0
                                }}></div>

                                {/* Floating Glow Orbs */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.1, 0.2, 0.1]
                                    }}
                                    transition={{ duration: 8, repeat: Infinity }}
                                    style={{
                                        position: "absolute",
                                        top: "20%",
                                        right: "10%",
                                        width: "200px",
                                        height: "200px",
                                        background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
                                        filter: "blur(60px)",
                                        zIndex: 0,
                                        pointerEvents: "none"
                                    }}
                                />

                                {/* Stacked Components Layer */}
                                <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    {/* Middle: Main Candidate Card */}
                                    <motion.div
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        className="glass-panel"
                                        style={{
                                            padding: "1.5rem",
                                            background: "var(--bg-secondary)",
                                            border: "1px solid var(--glass-border)",
                                            boxShadow: "var(--shadow-lg)"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
                                            <div style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius: "16px",
                                                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontWeight: 800,
                                                fontSize: "1.5rem"
                                            }}>SJ</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Sarah Jenkins</div>
                                                    <span className="badge badge-success" style={{ fontSize: "0.65rem" }}>TOP 2% CANDIDATE</span>
                                                </div>
                                                <div className="text-subtle" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                                    Cloud Architect <span style={{ opacity: 0.5 }}>•</span> San Francisco, CA
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                <SkillBar label="AWS" value={95} />
                                                <SkillBar label="Kubernetes" value={88} />
                                                <SkillBar label="Go" value={82} />
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.02)", borderRadius: "16px", padding: "10px" }}>
                                                <RadarChart />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Bottom: Insights & Timeline */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1rem", flex: 1 }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            <div className="glass-panel" style={{ padding: "1rem", background: "rgba(37, 99, 235, 0.05)", border: "1px dashed var(--primary)", flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--primary)" }}>
                                                    <Brain size={16} />
                                                    <span style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>AI Insight</span>
                                                </div>
                                                <p style={{ fontSize: "0.8rem", lineHeight: 1.4, color: "var(--text-secondary)" }}>
                                                    "Strong <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Cloud-Native alignment</span> detected.
                                                    Exceptional architecture patterns in Go."
                                                </p>
                                            </div>
                                            <div className="glass-panel" style={{ padding: "0.75rem 1rem", background: "var(--bg-secondary)" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <CheckCircle size={18} color="var(--primary)" />
                                                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>ATS Optimised</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="glass-panel" style={{ padding: "1.25rem", background: "var(--bg-secondary)" }}>
                                            <div style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Analysis Timeline</div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                <TimelineStep label="Resume parsed" completed />
                                                <TimelineStep label="Skills extracted" completed />
                                                <TimelineStep label="Role classified" completed />
                                                <TimelineStep label="Match computed" active />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ================= TRUST LOGOS SECTION ================= */}
            <section style={{
                padding: "60px 0 20px",
                borderTop: "1px solid var(--border-color)",
                borderBottom: "1px solid var(--border-color)",
                overflow: "hidden",
                background: "var(--bg-secondary)",
                position: "relative"
            }}>
                <div className="container">
                    <p style={{
                        textAlign: "center",
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        marginBottom: "3rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        opacity: 0.8
                    }}>
                        Trusted by 1000+ Global Enterprises
                    </p>

                    <div className="logo-slider" style={{
                        overflow: "hidden",
                        position: "relative",
                        width: "100%",
                        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
                    }}>
                        <div className="logo-track" style={{
                            display: "flex",
                            width: "max-content",
                            animation: "logo-scroll 25s linear infinite",
                            gap: "80px",
                            padding: "10px 0",
                            alignItems: "center"
                        }}>
                            {/* Original Set */}
                            <TrustLogo name="Accenture" slug="accenture" />
                            <TrustLogo name="TCS" slug="tcs" />
                            <TrustLogo name="Infosys" slug="infosys" />
                            <TrustLogo name="minutemailer" slug="minutemailer" />
                            <TrustLogo name="anydesk" slug="anydesk" />
                            <TrustLogo name="ferrari" slug="ferrari" />
                            <TrustLogo name="rockstargames" slug="rockstargames" />
                            <TrustLogo name="ollama" slug="ollama" />
                            <TrustLogo name="shopee" slug="shopee" />
                            <TrustLogo name="republicofgamers" slug="republicofgamers" />
                            <TrustLogo name="vsco" slug="vsco" />
                            <TrustLogo name="ufc" slug="ufc" />
                            <TrustLogo name="starbucks" slug="starbucks" />
                            <TrustLogo name="spotify" slug="spotify" />
                            <TrustLogo name="paramountplus" slug="paramountplus" />


                            {/* Duplicated Set for Infinite Loop */}
                            <TrustLogo name="Accenture" slug="accenture" />
                            <TrustLogo name="TCS" slug="tcs" />
                            <TrustLogo name="Infosys" slug="infosys" />
                            <TrustLogo name="minutemailer" slug="minutemailer" />
                            <TrustLogo name="anydesk" slug="anydesk" />
                            <TrustLogo name="ferrari" slug="ferrari" />
                            <TrustLogo name="rockstargames" slug="rockstargames" />
                            <TrustLogo name="ollama" slug="ollama" />
                            <TrustLogo name="shopee" slug="shopee" />
                            <TrustLogo name="republicofgamers" slug="republicofgamers" />
                            <TrustLogo name="vsco" slug="vsco" />
                            <TrustLogo name="ufc" slug="ufc" />
                            <TrustLogo name="starbucks" slug="starbucks" />
                            <TrustLogo name="spotify" slug="spotify" />
                            <TrustLogo name="paramountplus" slug="paramountplus" />

                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes logo-scroll {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }
                    .logo-track:hover {
                        animation-play-state: paused;
                    }
                    @media (max-width: 768px) {
                        .logo-track {
                            gap: 40px !important;
                        }
                    }
                `}</style>
            </section>

            {/* ================= FEATURES GRID (3-Column) ================= */}
            <section style={{ position: "relative", overflow: "hidden" }}>
                <Section title="Why HireLens AI">
                    <Grid>
                        <ThreeDTiltCard>
                            <FeatureCard
                                icon={<Brain size={32} />}
                                title="AI Resume Intelligence"
                                desc="Understand resumes beyond keywords using NLP & BERT to classify roles accurately."
                                color="var(--primary)"
                            />
                        </ThreeDTiltCard>
                        <ThreeDTiltCard>
                            <FeatureCard
                                icon={<LineChart size={32} />}
                                title="Transparent Gap Analysis"
                                desc="Know exactly why a resume matches—or doesn’t—with detailed fit scores."
                                color="var(--secondary)"
                            />
                        </ThreeDTiltCard>
                        <ThreeDTiltCard>
                            <FeatureCard
                                icon={<Users size={32} />}
                                title="Smarter Hiring Decisions"
                                desc="Rank candidates by real skill relevance, distinct from simple buzzword matching."
                                color="var(--success)"
                            />
                        </ThreeDTiltCard>
                    </Grid>
                </Section>
            </section>

            <section style={{ background: "var(--bg-secondary)", padding: "4rem 0 3rem" }}>
                <div className="container">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            textAlign: "center",
                            fontSize: "2.5rem",
                            fontWeight: 800,
                            marginBottom: "4rem",
                            letterSpacing: "-0.02em"
                        }}
                    >
                        How It Works
                    </motion.h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>
                        {/* Left side: Steps */}
                        <div>
                            <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
                                {/* Vertical Line */}
                                <div style={{ position: "absolute", left: "26px", top: "40px", bottom: "40px", width: "2px", background: "var(--border-color)" }}></div>

                                <TimelineItem
                                    step="1"
                                    title="Upload Resume"
                                    desc="Securely parse text for AI processing. Our engine extracts every detail with precision."
                                />
                                <TimelineItem
                                    step="2"
                                    title="AI Analysis"
                                    desc="NER & BERT extract skills and classify role. We understand the nuances of your professional journey."
                                />
                                <TimelineItem
                                    step="3"
                                    title="Skill Gap & Fit Score"
                                    desc="See your match percentage instantly. Get transparent feedback on how you align with requirements."
                                />
                                <TimelineItem
                                    step="4"
                                    title="Match Jobs"
                                    desc="Find roles aligned with your true potential. Let our AI guide you to the perfect opportunity."
                                    last
                                />
                            </div>
                        </div>

                        {/* Right side: Visual Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="glass-panel"
                            style={{ height: "500px", padding: "1rem", borderRadius: "32px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
                        >
                            <div style={{
                                width: "80%", height: "80%",
                                background: "var(--bg-primary)",
                                borderRadius: "20px",
                                boxShadow: "var(--shadow-lg)",
                                display: "flex", flexDirection: "column", padding: "1.5rem"
                            }}>
                                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1rem", display: "flex", gap: "10px" }}>
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f56" }}></div>
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e" }}></div>
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#27c93f" }}></div>
                                </div>
                                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--primary-light)" }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ height: "10px", width: "60%", background: "var(--border-color)", borderRadius: "5px", marginBottom: "8px" }}></div>
                                        <div style={{ height: "8px", width: "40%", background: "var(--border-color)", opacity: 0.5, borderRadius: "4px" }}></div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, background: "rgba(0,0,0,0.02)", borderRadius: "10px", padding: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                                        <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>AI Analysis Report</div>
                                        <div style={{ color: "var(--success)", fontWeight: 800, fontSize: "0.8rem" }}>COMPLETE</div>
                                    </div>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} style={{ height: "6px", width: `${Math.random() * 40 + 50}%`, background: "var(--border-color)", borderRadius: "3px", marginBottom: "10px", opacity: 0.6 }}></div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ================= TESTIMONIALS SECTION ================= */}
            <Section title="What People Say">
                <Grid>
                    <TestimonialCard
                        name="Alex Rivera"
                        role="Head of HR, TechFlow"
                        quote="HireLens has completely eliminated our resume screening bottleneck. The skill matching is incredibly accurate."
                    />
                    <TestimonialCard
                        name="Sarah Chen"
                        role="Senior Recruiter, Global Systems"
                        quote="The transparent gap analysis is a game-changer. Both candidates and hiring managers love the clarity."
                    />
                    <TestimonialCard
                        name="Michael Park"
                        role="Software Architect"
                        quote="As a candidate, finding jobs that actually match my skills has never been easier. The AI truly understands my background."
                    />
                </Grid>
            </Section>

            {/* ================= FAQ SECTION ================= */}
            <Section title="Frequently Asked Questions">
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <FAQItem
                        question="Is HireLens AI ATS-compliant?"
                        answer="Yes, our parsing engine is designed to handle all modern ATS formats and ensures full compatibility with enterprise recruitment software."
                    />
                    <FAQItem
                        question="How accurate is the skill matching?"
                        answer="We use advanced BERT models and Natural Language Processing to understand context, achieving over 95% accuracy in role and skill classification."
                    />
                    <FAQItem
                        question="Can I use it for free?"
                        answer="Absolutely! We offer a generous free tier for individuals and a trial period for enterprises to test our API capabilities."
                    />
                    <FAQItem
                        question="Does it support different languages?"
                        answer="Currently, we offer premium support for English, with multi-language parsing capabilities rolling out for major European and Asian languages."
                    />
                </div>
            </Section>



            {/* ================= FINAL CTA ================= */}
            <section style={{ padding: "20px 0", position: "relative", overflow: "hidden" }}>
                <div className="container" style={{ position: "relative", zIndex: 1 }}>
                    <div className="glass-panel" style={{
                        padding: "3.5rem",
                        borderRadius: "24px",
                        background: "var(--primary)",
                        color: "white",
                        textAlign: "center",
                        boxShadow: "0 20px 40px rgba(37, 99, 235, 0.2)"
                    }}>
                        <h2 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1.5rem", letterSpacing: "-0.03em" }}>
                            Ready to Transform Hiring?
                        </h2>
                        <p style={{ fontSize: "1.15rem", opacity: 0.9, marginBottom: "2.5rem", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
                            Join 2,000+ companies hiring with HireLens AI. Get started with our enterprise parsing engine today.
                        </p>

                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link to="/signup" className="btn-primary" style={{
                                    background: "white",
                                    color: "var(--primary)",
                                    padding: "16px 40px",
                                    fontSize: "1.1rem",
                                    border: "none",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                }}>
                                    Start Free Now <ArrowRight size={22} />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

/* ======================================================
   COMPONENTS
====================================================== */

const Section = ({ title, children }) => (
    <section className="container" style={{ padding: "3rem 0 3rem" }}>
        <div className="section-divider"></div>
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
                textAlign: "center",
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "4rem"
            }}
        >
            {title}
        </motion.h2>
        {children}
    </section>
);

const Grid = ({ children }) => (
    <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2rem"
    }}>
        {children}
    </div>
);

const FeatureCard = ({ icon, title, desc, color }) => {
    return (
        <motion.div
            className="glass-panel"
            style={{
                padding: "2.5rem",
                height: "100%",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                position: "relative",
                overflow: "hidden"
            }}
            whileHover="hover"
        >
            <motion.div
                style={{
                    color: color,
                    marginBottom: "1.5rem",
                    background: `color-mix(in srgb, ${color} 12%, transparent)`,
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all var(--transition-smooth)"
                }}
                variants={{
                    hover: {
                        scale: 1.1,
                        rotate: 5,
                        backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`
                    }
                }}
            >
                {icon}
            </motion.div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "1rem" }}>{title}</h3>
            <p className="text-subtle" style={{ lineHeight: 1.7, fontSize: "1.05rem" }}>{desc}</p>

            {/* Decoration Glow */}
            <div style={{
                position: "absolute",
                bottom: "-20%",
                right: "-10%",
                width: "100px",
                height: "100px",
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                opacity: 0.1,
                zIndex: -1
            }}></div>
        </motion.div>
    );
};

const TimelineItem = ({ step, title, desc, last }) => (
    <motion.div
        style={{ display: "flex", gap: "2.5rem", paddingBottom: last ? 0 : "4.5rem", position: "relative" }}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
    >
        {/* Step Indicator */}
        <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--bg-primary)",
                border: "2px solid var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--primary)",
                boxShadow: "0 0 20px rgba(37, 99, 235, 0.15)"
            }}>
                {step}
            </div>
        </div>

        <div style={{ paddingTop: "10px" }}>
            <h4 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-primary)" }}>{title}</h4>
            <p className="text-subtle" style={{ lineHeight: 1.6, fontSize: "1.1rem" }}>{desc}</p>
        </div>
    </motion.div>
);


const StatItem = ({ value, label }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
        <div className="text-subtle" style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    </div>
);

const TrustLogo = ({ name, slug, color }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        style={{
            cursor: "pointer",
            flexShrink: 0,
            padding: "0 20px"
        }}
    >
        <img
            src={`https://cdn.simpleicons.org/${slug}`}
            alt={name}
            style={{
                height: "40px",
                width: "auto",
                // filter: "grayscale(1) brightness(0.8)",
                opacity: 1,
                transition: "all 0.3s ease",
            }}
        // onMouseEnter={(e) => {
        //     e.currentTarget.style.filter = "grayscale(0) brightness(1)";
        //     e.currentTarget.style.opacity = "1";
        // }}
        // onMouseLeave={(e) => {
        //     e.currentTarget.style.filter = "grayscale(1) brightness(0.8)";
        //     e.currentTarget.style.opacity = "0.5";
        // }}
        />
    </motion.div>
);

const SkillBar = ({ label, value }) => (
    <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--primary)" }}>{value}%</span>
        </div>
        <div style={{ height: "6px", width: "100%", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ height: "100%", background: `linear-gradient(to right, var(--primary), var(--secondary))` }}
            />
        </div>
    </div>
);

const RadarChart = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ opacity: 0.8 }}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="var(--border-color)" strokeWidth="0.5" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="var(--border-color)" strokeWidth="0.5" />
        <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 1 }}
            d="M50 20 L80 40 L70 80 L30 75 L20 45 Z"
            fill="rgba(37, 99, 235, 0.2)"
            stroke="var(--primary)"
            strokeWidth="2"
        />
    </svg>
);

const TimelineStep = ({ label, completed, active }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: completed ? "var(--success)" : active ? "var(--primary)" : "var(--border-color)",
            boxShadow: active ? "0 0 8px var(--primary)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            {completed && <CheckCircle size={8} color="white" />}
        </div>
        <span style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: active ? "var(--text-primary)" : "var(--text-secondary)",
            opacity: completed ? 0.7 : 1
        }}>{label}</span>
    </div>
);

const TestimonialCard = ({ name, role, quote }) => (
    <motion.div
        className="glass-panel"
        style={{ padding: "2rem", height: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}
        whileHover={{ y: -5 }}
    >
        <div style={{ display: "flex", color: "var(--warning)", gap: "2px" }}>
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
        </div>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.6, fontStyle: "italic", color: "var(--text-primary)" }}>"{quote}"</p>
        <div>
            <div style={{ fontWeight: 800, fontSize: "1rem" }}>{name}</div>
            <div className="text-subtle" style={{ fontSize: "0.85rem" }}>{role}</div>
        </div>
    </motion.div>
);

const FAQItem = ({ question, answer }) => (
    <motion.div
        style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1.5rem" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
    >
        <h4 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-primary)" }}>{question}</h4>
        <p className="text-subtle" style={{ lineHeight: 1.6 }}>{answer}</p>
    </motion.div>
);

export default Landing;
