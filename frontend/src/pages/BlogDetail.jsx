import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import { blogPosts } from '../data/blogData';

const BlogDetail = () => {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return (
            <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                <h2>Post Not Found</h2>
                <Link to="/blog" className="btn-primary" style={{ marginTop: '2rem' }}>Back to Blog</Link>
            </div>
        );
    }

    return (
        <div className="page-transition aurora-bg" style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '100px' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ marginBottom: '2.5rem' }}
                >
                    <Link to="/blog" className="btn-ghost" style={{ padding: '0', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <ArrowLeft size={20} /> Back to Insights
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-success">{post.tag}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <Calendar size={16} /> {post.date}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <User size={16} /> HireLens Team
                        </div>
                    </div>

                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2.5rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                        {post.title}
                    </h1>

                    <div style={{
                        height: '400px', width: '100%', borderRadius: '32px', marginBottom: '3rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        boxShadow: 'var(--shadow-lg)'
                    }}></div>

                    <div className="glass-panel" style={{ padding: '3rem', lineHeight: 1.8, fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                </motion.div>

                {/* Subscription/CTA */}
                <div className="glass-panel" style={{ marginTop: '4rem', padding: '3rem', textAlign: 'center', background: 'var(--primary)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Stay Ahead of the Curve</h3>
                    <p style={{ opacity: 0.9, marginBottom: '2rem' }}>Get the latest AI recruitment insights delivered to your inbox.</p>
                    <div style={{ display: 'flex', gap: '10px', maxWidth: '500px', margin: '0 auto' }}>
                        <input type="email" placeholder="Enter your email" style={{ background: 'white', color: 'black', borderRadius: '12px', border: 'none' }} />
                        <button className="btn-primary" style={{ background: 'var(--text-primary)', color: 'white', whiteSpace: 'nowrap' }}>Subscribe</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
