import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import {
    Brain, Sparkles, Zap, Flame, Target,
    Code, Database, Cpu, Globe, Layout, Settings,
    ArrowRight, Info
} from 'lucide-react';
import { motion } from 'framer-motion';

const SkillMatrix = ({ detectedSkills = [], missingSkills = [], improvementCta = "Improve Profile" }) => {

    // Map skills to categories for Radar Chart
    const categories = [
        { name: 'Programming', value: 0, skills: ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Go', 'Rust'] },
        { name: 'Databases', value: 0, skills: ['SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Oracle', 'Elasticsearch'] },
        { name: 'AI / ML', value: 0, skills: ['AI', 'ML', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'Deep Learning', 'Computer Vision'] },
        { name: 'Web Dev', value: 0, skills: ['React', 'Angular', 'Vue', 'Node.js', 'Express', 'Next.js', 'HTML', 'CSS', 'Tailwind'] },
        { name: 'DevOps', value: 0, skills: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'Terraform'] },
        { name: 'Tools', value: 0, skills: ['GitHub', 'Git', 'Jira', 'Postman', 'Figma', 'Linux', 'VS Code'] }
    ];

    // Calculate mock proficiency for Radar Chart based on detected skills
    const chartData = categories.map(cat => {
        const foundCount = detectedSkills.filter(s =>
            cat.skills.some(cs => s.toLowerCase().includes(cs.toLowerCase()))
        ).length;

        // Base value + contribution per skill found (capped at 100)
        const value = Math.min(20 + (foundCount * 25), 95);

        return {
            subject: cat.name,
            A: value,
            fullMark: 100
        };
    });

    const getSkillIcon = (skill) => {
        const s = skill.toLowerCase();
        if (s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('js')) return '⚛️';
        if (s.includes('sql') || s.includes('db') || s.includes('mongo')) return '🗄️';
        if (s.includes('ai') || s.includes('ml') || s.includes('tensor') || s.includes('torch')) return '🤖';
        if (s.includes('git') || s.includes('hub')) return '🐙';
        if (s.includes('dock') || s.includes('kube') || s.includes('cloud') || s.includes('aws')) return '☁️';
        if (s.includes('python') || s.includes('java') || s.includes('c++')) return '💻';
        return '🔹';
    };

    return (
        <div className="glass-panel skill-matrix-card" style={{
            padding: '2rem',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decor */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.1, pointerEvents: 'none' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Brain size={22} color="var(--primary)" /> Skill Matrix
                </h4>
                <div title="AI generated from your resume" style={{ cursor: 'help' }}>
                    <Sparkles size={18} color="rgba(139, 92, 246, 0.6)" />
                </div>
            </div>

            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', margin: '0 -2rem' }}></div>

            {/* DETECTED SKILLS SECTION */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <div style={{ width: '4px', height: '16px', borderRadius: '2px', background: 'var(--primary)' }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Detected Core Skills</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {detectedSkills.length > 0 ? (
                        detectedSkills.slice(0, 10).map((skill, idx) => (
                            <motion.span
                                key={idx}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                                className="skill-pill"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 14px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '100px',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-primary)',
                                    cursor: 'default',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <span>{getSkillIcon(skill)}</span>
                                {skill}
                            </motion.span>
                        ))
                    ) : (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>Analyzing your skills...</div>
                    )}
                </div>
            </section>

            {/* RADAR CHART SECTION */}
            <section style={{ height: '240px', width: '100%', margin: '1rem 0' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Skill Level"
                            dataKey="A"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            fill="var(--primary)"
                            fillOpacity={0.3}
                            animationDuration={1500}
                        />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 15, 20, 0.95)',
                                border: '1px solid var(--primary)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)',
                                color: 'white'
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </section>

            {/* SKILL GAPS SECTION */}
            <section style={{
                background: 'rgba(245, 158, 11, 0.03)',
                border: '1px solid rgba(245, 158, 11, 0.1)',
                borderRadius: '16px',
                padding: '1.25rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={16} color="#f59e0b" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>Top Skill Gaps</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'rgba(245, 158, 11, 0.6)' }}>
                        <Info size={12} />
                        Market Demand
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {missingSkills.length > 0 ? (
                        missingSkills.map((skill, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)' }}></div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{skill}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.75rem',
                                    color: '#f59e0b',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    padding: '2px 8px',
                                    borderRadius: '100px',
                                    fontWeight: 600
                                }}>
                                    <Flame size={12} />
                                    High Demand
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You've covered all top skills for this role!</div>
                    )}
                </div>
            </section>

            {/* ACTION BUTTON */}
            <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(139, 92, 246, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                    marginTop: '0.5rem',
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                    transition: 'all 0.3s ease'
                }}
            >
                {improvementCta} <ArrowRight size={18} />
            </motion.button>

        </div>
    );
};

export default SkillMatrix;
