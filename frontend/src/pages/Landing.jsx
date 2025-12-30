import React from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Brain,
    Users,
    LineChart,
    Shield,
    Star
} from "lucide-react";
import { motion } from "framer-motion";
import ThreeDTiltCard from "../components/ui/ThreeDTiltCard";

/* ======================================================
   LANDING PAGE (Redesigned with 3D)
====================================================== */

const Landing = () => {
    return (
        <div className="page-transition aurora-bg" style={{ minHeight: "100vh" }}>

            {/* ================= HERO SECTION ================= */}
            <section className="hero-wrapper">
                <div className="hero-grid">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ zIndex: 2 }}
                    >
                        <Badge />

                        <h1 className="title-lg" style={{ marginBottom: "1.5rem", fontSize: "clamp(3rem, 5vw, 4.5rem)" }}>
                            Hire Smarter. <br />
                            <span className="gradient-text">Get Hired Faster.</span>
                        </h1>

                        <p className="text-subtle" style={{
                            fontSize: "1.25rem",
                            maxWidth: "600px",
                            marginBottom: "2.5rem",
                            lineHeight: "1.7"
                        }}>
                            The AI-powered recruitment platform that bridges the gap between talent and opportunity.
                            <b> Instant analysis, real skills, zero bias.</b>
                        </p>

                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "flex-start" }}>
                            <Link to="/login" className="btn-primary" style={{ padding: "14px 28px", fontSize: "1.1rem", textDecoration: 'none' }}>
                                Get Started Free <ArrowRight size={20} />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Visuals (3D Composition) */}
                    <div style={{ position: "relative", height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {/* Background Abstract Blur */}
                        <div style={{
                            position: "absolute",
                            width: "120%",
                            height: "120%",
                            background: "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
                            filter: "blur(60px)",
                            zIndex: 0
                        }}></div>

                        {/* Floating Card 1: Match Score */}
                        <motion.div
                            className="floating-card float-slow"
                            style={{ top: "10%", right: "10%", width: "220px" }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                <div style={{ background: "rgba(34, 197, 94, 0.1)", padding: "8px", borderRadius: "8px", color: "var(--success)" }}>
                                    <Brain size={20} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>AI Match</h4>
                                    <span className="text-subtle" style={{ fontSize: "0.75rem" }}>Frontend Developer</span>
                                </div>
                            </div>
                            <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ width: "95%", height: "100%", background: "var(--success)" }}></div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                                <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>95%</span>
                                <span className="text-subtle" style={{ fontSize: "0.8rem" }}>Highly Relevant</span>
                            </div>
                        </motion.div>

                        {/* Floating Card 2: Main Profile */}
                        <motion.div
                            className="floating-card float-medium"
                            style={{ width: "280px", zIndex: 3 }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #FF6B6B, #FF8E53)" }}></div>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Sarah Jenkins</h3>
                                    <p className="text-subtle" style={{ fontSize: "0.85rem" }}>Senior UX Designer</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                <span className="badge badge-success">React</span>
                                <span className="badge badge-warning">Figma</span>
                                <span className="badge">TypeScript</span>
                            </div>
                        </motion.div>

                        {/* Floating Card 3: ATS Score */}
                        <motion.div
                            className="floating-card float-fast"
                            style={{ bottom: "15%", left: "5%", width: "200px" }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "50%",
                                    border: "3px solid var(--primary)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.9rem", fontWeight: 700
                                }}>
                                    88
                                </div>
                                <div>
                                    <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>ATS Score</h4>
                                    <p className="text-subtle" style={{ fontSize: "0.75rem" }}>Resume Optimized</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ================= VALUE PROPOSITION ================= */}
            <Section title="Why HireLens AI">
                <Grid>
                    <ThreeDTiltCard>
                        <FeatureCard
                            icon={<Brain size={32} className="text-primary" />}
                            title="AI Resume Intelligence"
                            desc="Understand resumes beyond keywords using NLP & BERT to classify roles accurately."
                            color="var(--primary)"
                        />
                    </ThreeDTiltCard>
                    <ThreeDTiltCard>
                        <FeatureCard
                            icon={<LineChart size={32} className="text-secondary" />}
                            title="Transparent Gap Analysis"
                            desc="Know exactly why a resume matches—or doesn’t—with detailed fit scores."
                            color="var(--secondary)"
                        />
                    </ThreeDTiltCard>
                    <ThreeDTiltCard>
                        <FeatureCard
                            icon={<Users size={32} className="text-success" />}
                            title="Smarter Hiring Decisions"
                            desc="Rank candidates by real skill relevance, distinct from simple buzzword matching."
                            color="var(--success)"
                        />
                    </ThreeDTiltCard>
                </Grid>
            </Section>

            {/* ================= HOW IT WORKS (Timeline) ================= */}
            <Section title="How It Works">
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <TimelineItem step="01" title="Upload Resume" desc="Securely parse text for AI processing." />
                    <TimelineItem step="02" title="AI Analysis" desc="NER & BERT extract skills and classify role." />
                    <TimelineItem step="03" title="Skill Gap & Fit Score" desc="See your match percentage instantly." />
                    <TimelineItem step="04" title="Match Jobs" desc="Find roles aligned with your true potential." last />
                </div>
            </Section>



            {/* ================= CTA ================= */}
            <motion.section
                className="container"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{ padding: "8rem 0", textAlign: "center" }}
            >
                <h2 className="title-lg" style={{ marginBottom: "1.5rem" }}>
                    Ready to Transform Hiring?
                </h2>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Link to="/signup" className="btn-primary" style={{ padding: "16px 32px", fontSize: "1.1rem" }}>
                        Start Free Now <ArrowRight size={20} />
                    </Link>
                </div>
            </motion.section>
        </div>
    );
};

/* ======================================================
   COMPONENTS
====================================================== */

const Section = ({ title, children }) => (
    <section className="container" style={{ padding: "6rem 0" }}>
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

const FeatureCard = ({ icon, title, desc, color }) => (
    <div
        className="glass-panel"
        style={{ padding: "2.5rem", height: "100%", pointerEvents: "none" }} // Pointer events none so hover goes to TiltWrapper
    >
        <div style={{
            color: color,
            marginBottom: "1.5rem",
            background: `color-mix(in srgb, ${color} 10%, transparent)`,
            width: "fit-content",
            padding: "12px",
            borderRadius: "12px"
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>{title}</h3>
        <p className="text-subtle" style={{ lineHeight: 1.6 }}>{desc}</p>
    </div>
);

const TimelineItem = ({ step, title, desc, last }) => (
    <div style={{ display: "flex", gap: "2rem", paddingBottom: last ? 0 : "3rem", position: "relative" }}>
        {!last && <div style={{
            position: "absolute",
            left: "24px",
            top: "50px",
            bottom: "0",
            width: "2px",
            background: "var(--border-color)"
        }}></div>}

        <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--primary)",
            flexShrink: 0,
            zIndex: 1
        }}>
            {step}
        </div>
        <div>
            <h4 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>{title}</h4>
            <p className="text-subtle">{desc}</p>
        </div>
    </div>
);

const Badge = () => (
    <div className="badge badge-success" style={{ marginBottom: "2rem", padding: "8px 16px", borderRadius: "30px" }}>
        <Star size={14} style={{ marginRight: "8px" }} />
        AI-Powered Career Intelligence
    </div>
);

export default Landing;
