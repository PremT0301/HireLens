import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogData';
import { Calendar, Tag, ArrowRight } from 'lucide-react';

const Blog = () => {
    return (
        <div className="page-transition aurora-bg" style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '100px' }}>
            <div className="container">
                {/* Hero section */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Insights on <span className="gradient-text">AI & Hiring</span>
                        </h1>
                        <p className="text-subtle" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
                            Stay updated with the latest trends in recruitment technology and AI advancements.
                        </p>
                    </motion.div>
                </div>

                {/* Blog Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {blogPosts.map((post, idx) => (
                        <motion.div
                            key={post.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                            <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                                <div className="glass-panel" style={{
                                    height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {/* Placeholder Image/Pattern */}
                                    <div style={{
                                        height: '200px', width: '100%', background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))',
                                        opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                    }}>
                                        <Tag size={40} opacity={0.3} />
                                    </div>

                                    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span className="badge badge-success">{post.tag}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <Calendar size={14} />
                                                {post.date}
                                            </div>
                                        </div>

                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.3 }}>
                                            {post.title}
                                        </h3>
                                        <p className="text-subtle" style={{ fontSize: '1rem', marginBottom: '2rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {post.excerpt}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                                            Read Full Article <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
