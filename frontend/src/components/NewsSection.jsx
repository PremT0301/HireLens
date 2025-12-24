import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const NewsSection = ({ query, title }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);

    // Replace with your actual API key or use a proxy if needed //NEWSAPI.org
    const API_KEY = '3740ee0854b54325bab06c05e762a393';

    useEffect(() => {
        const fetchNews = async () => {
            // In a real scenario, handle API usage limits or caching
            if (API_KEY === 'YOUR_NEWS_API_KEY') {
                setLoading(false);
                setNews(getMockNews(query));
                return;
            }

            try {
                let url, data;

                // Detect API Provider based on Key format
                if (API_KEY.startsWith('pub_')) {
                    // NewsData.io
                    url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${query}&language=en`;
                    const response = await fetch(url);
                    data = await response.json();

                    if (data.status === 'success') {
                        const validNews = data.results.filter(article => article.title && article.image_url).map(article => ({
                            title: article.title,
                            description: article.description,
                            url: article.link,
                            urlToImage: article.image_url,
                            source: { name: article.source_id },
                            publishedAt: article.pubDate
                        }));
                        setNews(validNews.length > 0 ? validNews : getMockNews(query));
                    } else {
                        setNews(getMockNews(query));
                    }
                } else {
                    // Standard NewsAPI.org
                    url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${API_KEY}`;
                    const response = await fetch(url);
                    data = await response.json();

                    if (data.status === 'ok' && data.articles.length > 0) {
                        const validNews = data.articles.filter(article => article.title !== '[Removed]' && article.urlToImage);
                        setNews(validNews.length > 0 ? validNews : getMockNews(query));
                    } else {
                        setNews(getMockNews(query));
                    }
                }
            } catch (err) {
                console.error("News fetch error:", err);
                setNews(getMockNews(query));
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [query]);

    // Remove slideshow logic (currentIndex, auto-play)

    // Bento Grid Helper to determine spans
    const getGridSpan = (index) => {
        // Layout Pattern:
        // 0: Large (2x2)
        // 1: Tall (1x2)
        // 2: Wide (2x1) -- if space allows, or standard
        // 3+: Standard (1x1)

        switch (index) {
            case 0: return { col: 'span 2', row: 'span 2' };
            case 1: return { col: 'span 1', row: 'span 2' };
            case 2: return { col: 'span 1', row: 'span 1' };
            case 3: return { col: 'span 2', row: 'span 1' }; // Wide
            default: return { col: 'span 1', row: 'span 1' };
        }
    };

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Loader2 className="spin" size={50} />
            <p style={{ marginTop: '1rem' }}>Loading.......</p>
        </div>
    );

    if (news.length === 0) return null;

    return (
        <div style={{ marginTop: '4rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>{title}</h2>
                {API_KEY === 'YOUR_NEWS_API_KEY' && (
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: 'var(--warning)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                    }}>
                        Simulation Mode - Missing API Key
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Powered by NewsAPI</span>
                </div>
            </div>

            <div className="bento-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                // We'll use a specific grid setup for larger screens via media query below
                gap: '1.5rem',
                autoRows: '220px'
            }}>
                {news.slice(0, 6).map((item, index) => {
                    const spans = getGridSpan(index);
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={`news-card news-card-${index}`}
                            style={{
                                position: 'relative',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '1px solid var(--glass-border)',
                                cursor: 'pointer',
                                background: 'var(--glass-bg)',
                                // Default spans will be overridden by CSS grid-template-areas or explicit classes if needed
                                // Using inline style for basic span logic, but CSS class is better for responsiveness
                            }}
                            onClick={() => window.open(item.url, '_blank')}
                        >
                            {/* Background Image */}
                            <div style={{ position: 'absolute', inset: 0 }}>
                                <img
                                    src={item.urlToImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={item.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                    className="card-img"
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.1))' }}></div>
                            </div>

                            {/* Content */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                padding: '1.5rem',
                                zIndex: 2
                            }}>
                                <div style={{
                                    display: 'inline-block',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600'
                                }}>
                                    {item.source.name}
                                </div>
                                <h3 style={{
                                    color: 'white',
                                    fontSize: index === 0 ? '1.5rem' : '1.1rem',
                                    fontWeight: 'bold',
                                    lineHeight: 1.3,
                                    margin: '0 0 0.5rem 0',
                                    display: '-webkit-box',
                                    WebkitLineClamp: index === 0 ? 3 : 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {item.title}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                    <Calendar size={12} />
                                    {new Date(item.publishedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                .news-card:hover .card-img {
                    transform: scale(1.05);
                }

                .bento-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }

                @media (min-width: 768px) {
                    .bento-grid {
                        grid-template-columns: repeat(2, 1fr);
                        auto-rows: 250px;
                    }
                    .news-card-0 { grid-column: span 2; grid-row: span 2; }
                }

                @media (min-width: 1024px) {
                    .bento-grid {
                        grid-template-columns: repeat(4, 1fr);
                        grid-template-rows: repeat(2, 250px); /* Fixed 2 rows base */
                        gap: 1.5rem;
                    }
                    /* 
                       Pattern:
                       [ 0 0 1 2 ]
                       [ 0 0 3 4 ]
                    */
                    .news-card-0 { grid-column: span 2; grid-row: span 2; }
                    .news-card-1 { grid-column: span 1; grid-row: span 1; }
                    .news-card-2 { grid-column: span 1; grid-row: span 1; }
                    .news-card-3 { grid-column: span 1; grid-row: span 1; }
                    .news-card-4 { grid-column: span 1; grid-row: span 1; }
                }
            `}</style>
        </div>
    );
};

export default NewsSection;
