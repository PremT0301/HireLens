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
            <section className="container" style={{
                minHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                paddingTop: "6rem",
                position: "relative",
                perspective: "1000px" // For 3D context
            }}>

                {/* Abstract Floating 3D Shape Behind Text */}
                <motion.div
                    animate={{
                        rotate: [0, 10, -10, 0],
                        translateY: [0, -20, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: "absolute",
                        top: "20%",
                        width: "600px",
                        height: "600px",
                        background: "radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 60%)",
                        borderRadius: "50%",
                        zIndex: 0,
                        filter: "blur(40px)"
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ maxWidth: "900px", position: "relative", zIndex: 2 }}
                >
                    <Badge />

                    <h1 className="title-lg" style={{ marginBottom: "1.5rem", fontSize: "clamp(3rem, 5vw, 4.5rem)" }}>
                        Hire Smarter. <br />
                        <span className="gradient-text">Get Hired Faster.</span>
                    </h1>

                    <p className="text-subtle" style={{
                        fontSize: "1.25rem",
                        maxWidth: "700px",
                        margin: "0 auto 3rem",
                        lineHeight: "1.7"
                    }}>
                        AI-powered resume analysis, skill gap insights, and intelligent recruitment—built for modern hiring.
                    </p>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link to="/signup" className="btn-primary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
                            Explore as Applicant <ArrowRight size={18} />
                        </Link>
                        <Link to="/signup" className="btn-ghost" style={{
                            padding: "14px 28px",
                            fontSize: "1rem",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-secondary)"
                        }}>
                            Explore as Recruiter
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ================= VALUE PROPOSITION ================= */}
            <Section title="Why SmartHireAI">
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

            {/* ================= TRUST SECTION ================= */}
            <section className="container" style={{ padding: "4rem 0", textAlign: "center", opacity: 0.8 }}>
                <p className="text-subtle" style={{ marginBottom: "2rem", fontWeight: 600, letterSpacing: "1px" }}>
                    TRUSTED TECHNOLOGY STACK
                </p>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "2rem",
                    flexWrap: "wrap",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--text-secondary)"
                }}>
                    <span>React 18</span>
                    <span>.NET 8 Web API</span>
                    <span>Python (SpaCy/BERT)</span>
                    <span>SQL Server</span>
                </div>
                <div style={{ marginTop: "3rem", display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 20px", background: "rgba(34,197,94,0.1)", borderRadius: "30px", color: "var(--success)" }}>
                    <Shield size={18} />
                    <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Enterprise-Grade Privacy & Explainability</span>
                </div>
            </section>

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
