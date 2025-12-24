import React from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Brain,
    Users,
    Briefcase,
    LineChart,
    CheckCircle,
    Star,
    MessageSquare,
    Newspaper,
    Mic,
    Cpu,
    Network
} from "lucide-react";
import { motion } from "framer-motion";

/* ======================================================
   LANDING
====================================================== */

const Landing = () => {
    return (
        <div className="page-transition" style={{ position: "relative", overflow: "hidden" }}>
            {/* ================= BACKGROUND LAYERS ================= */}
            <Background />

            {/* ================= HERO ================= */}
            <section style={heroSection}>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{ textAlign: "center", position: "relative", zIndex: 2 }}
                >
                    <Badge />

                    <h1 style={heroTitle}>
                        AI-Driven Hiring <br />
                        <span className="gradient-text">From Resume to Interview</span>
                    </h1>

                    <p style={heroSubtitle}>
                        SmartHireAI is an intelligent recruitment ecosystem that understands
                        resumes, predicts job fit, explains skill gaps, delivers market insights,
                        and prepares candidates for interviews — end to end.
                    </p>

                    <div style={heroActions}>
                        <Link to="/signup" className="btn-primary-glow" style={primaryBtn}>
                            Get Started <ArrowRight size={20} />
                        </Link>
                        <Link to="/features" style={secondaryBtn}>
                            Explore Platform
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ================= WHY ================= */}
            <Section title="Why SmartHireAI">
                <Grid>
                    <TiltCard
                        icon={<Brain size={30} color="#a78bfa" />}
                        title="AI Resume Intelligence"
                        desc="SpaCy NER extracts skills & experience while BERT classifies real career roles."
                    />
                    <TiltCard
                        icon={<LineChart size={30} color="#60a5fa" />}
                        title="Skill Gap & ATS Analysis"
                        desc="Clear fit score, missing skills, and actionable ATS improvement guidance."
                    />
                    <TiltCard
                        icon={<Users size={30} color="#34d399" />}
                        title="Applicant & Recruiter Portals"
                        desc="Applicants gain clarity. Recruiters rank talent by AI fit — not keywords."
                    />
                </Grid>
            </Section>

            {/* ================= HOW IT WORKS ================= */}
            <Section title="How It Works">
                <Grid>
                    <StepCard step="01" icon={<CheckCircle />} title="Upload Resume"
                        desc="Resume text is extracted securely and prepared for AI processing." />
                    <StepCard step="02" icon={<Cpu />} title="AI Resume Analysis"
                        desc="NER extracts skills & experience. BERT classifies your role domain." />
                    <StepCard step="03" icon={<LineChart />} title="Gap & ATS Insights"
                        desc="Fit score, missing skills, and ATS readiness insights are generated." />
                    <StepCard step="04" icon={<Briefcase />} title="Smart Job Matching"
                        desc="Discover jobs aligned with your AI profile before applying." />
                    <StepCard step="05" icon={<Newspaper />} title="News & Market Insights"
                        desc="Live industry news and hiring trends to guide career decisions." />
                    <StepCard step="06" icon={<Mic />} title="Interview Copilot"
                        desc="AI-generated technical & behavioral interview practice." />
                    <StepCard step="07" icon={<MessageSquare />} title="Guidance & Communication"
                        desc="Transparent feedback, recommendations, and career guidance." />
                </Grid>
            </Section>

            {/* ================= CTA ================= */}
            <motion.section
                style={ctaSection}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <h2 style={{ fontSize: "2.6rem", fontWeight: 800 }}>
                    Your Complete AI Hiring Companion
                </h2>
                <p style={ctaText}>
                    Resume analysis, job matching, market insights, and interview prep —
                    all powered by real AI.
                </p>
                <Link to="/signup" className="btn-primary-glow" style={primaryBtn}>
                    Start Free <ArrowRight size={20} />
                </Link>
            </motion.section>
        </div>
    );
};

/* ======================================================
   BACKGROUND (KEY PART)
====================================================== */

const Background = () => (
    <div style={bgWrapper}>
        {/* Soft gradient base */}
        <div style={bgGradient} />

        {/* Floating Orbs */}
        <FloatingOrb color="rgba(124,58,237,0.35)" size={520} top="-20%" left="10%" />
        <FloatingOrb color="rgba(56,189,248,0.25)" size={420} top="40%" left="75%" />

        {/* Data Nodes */}
        {[...Array(12)].map((_, i) => (
            <DataNode key={i} />
        ))}

        {/* Subtle Grid */}
        <div style={gridOverlay} />
    </div>
);

const FloatingOrb = ({ color, size, top, left }) => (
    <motion.div
        animate={{ y: [0, -50, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{
            position: "absolute",
            top,
            left,
            width: size,
            height: size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            filter: "blur(90px)"
        }}
    />
);

const DataNode = () => {
    const size = Math.random() * 6 + 4;
    return (
        <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 10 + Math.random() * 10, repeat: Infinity }}
            style={{
                position: "absolute",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: size,
                height: size,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)"
            }}
        />
    );
};

/* ======================================================
   REUSABLE UI
====================================================== */

const Section = ({ title, children }) => (
    <section style={section}>
        <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={sectionTitle}
        >
            {title}
        </motion.h2>
        {children}
    </section>
);

const Grid = ({ children }) => (
    <div style={grid}>{children}</div>
);

const TiltCard = ({ icon, title, desc }) => (
    <motion.div
        className="glass-panel"
        style={card}
        whileHover={{ rotateX: 6, rotateY: -6, scale: 1.04 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
        <div style={{ marginBottom: "1.5rem" }}>{icon}</div>
        <h3>{title}</h3>
        <p style={cardText}>{desc}</p>
    </motion.div>
);

const StepCard = ({ step, icon, title, desc }) => (
    <TiltCard icon={icon} title={`${step} — ${title}`} desc={desc} />
);

const Badge = () => (
    <div style={badge}>
        <Star size={14} fill="var(--accent-primary)" />
        <span>AI-Powered Career Intelligence</span>
    </div>
);

/* ======================================================
   STYLES
====================================================== */

const bgWrapper = {
    position: "fixed",
    inset: 0,
    zIndex: -1
};

const bgGradient = {
    position: "absolute",
    inset: 0,
    background:
        "radial-gradient(circle at top, rgba(124,58,237,0.15), transparent 60%)"
};

const gridOverlay = {
    position: "absolute",
    inset: 0,
    backgroundSize: "40px 40px",
    backgroundImage:
        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
};

const heroSection = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 20px"
};

const heroTitle = {
    fontSize: "clamp(3rem, 6vw, 5rem)",
    fontWeight: 900,
    marginBottom: "1.5rem"
};

const heroSubtitle = {
    maxWidth: 760,
    margin: "0 auto 3rem",
    fontSize: "1.25rem",
    color: "var(--text-secondary)"
};

const heroActions = {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap"
};

const primaryBtn = {
    padding: "16px 32px",
    borderRadius: 14,
    background: "var(--primary)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 8
};

const secondaryBtn = {
    ...primaryBtn,
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    border: "1px solid var(--glass-border)"
};

const section = {
    padding: "6rem 20px",
    maxWidth: 1200,
    margin: "0 auto"
};

const sectionTitle = {
    textAlign: "center",
    fontSize: "2.3rem",
    marginBottom: "3.5rem"
};

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
    gap: "2rem"
};

const card = {
    padding: "2.5rem",
    borderRadius: 22,
    transformStyle: "preserve-3d"
};

const cardText = {
    marginTop: "0.75rem",
    color: "var(--text-secondary)",
    lineHeight: 1.6
};

const badge = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: 30,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--glass-border)",
    marginBottom: "2rem"
};

const ctaSection = {
    padding: "7rem 20px",
    textAlign: "center"
};

const ctaText = {
    maxWidth: 640,
    margin: "1.5rem auto 2.5rem",
    color: "var(--text-secondary)"
};

export default Landing;
