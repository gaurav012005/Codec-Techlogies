import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Search, Users, Target, Layers, Building2, CheckSquare,
    ArrowRight, Clock, X, Command, Plus, BarChart3, Mail, Zap
} from 'lucide-react';

const ENTITY_ICONS = {
    lead: Users,
    contact: Users,
    company: Building2,
    deal: Target,
    task: CheckSquare,
    action: Zap,
};

const ENTITY_COLORS = {
    lead: 'var(--accent-cyan)',
    contact: 'var(--accent-violet)',
    company: 'var(--accent-amber)',
    deal: 'var(--accent-emerald)',
    task: 'var(--primary-400)',
    action: 'var(--accent-rose)',
};

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [quickActions, setQuickActions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const debounceRef = useRef(null);

    // Load recent searches
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('crm_recent_searches') || '[]');
            setRecentSearches(saved);
        } catch (e) { }
    }, []);

    // Keyboard shortcut
    useEffect(() => {
        const handleKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
            setQuickActions([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Search with debounce
    const performSearch = useCallback(async (searchQuery) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setQuickActions([]);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.get('/search', { params: { q: searchQuery } });
            setResults(data.data?.results || []);
            setQuickActions(data.data?.quickActions || []);
            setSelectedIndex(0);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(query), 300);
        return () => clearTimeout(debounceRef.current);
    }, [query, performSearch]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        const allItems = [...results, ...quickActions];
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && allItems[selectedIndex]) {
            handleSelect(allItems[selectedIndex]);
        }
    };

    const handleSelect = (item) => {
        setIsOpen(false);
        // Save to recent
        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('crm_recent_searches', JSON.stringify(updated));
        // Navigate
        navigate(item.url || '/');
    };

    if (!isOpen) return null;

    const allItems = [...results, ...quickActions];

    return (
        <div className="cmd-overlay" onClick={() => setIsOpen(false)}>
            <div className="cmd-modal" onClick={e => e.stopPropagation()}>
                {/* Search Input */}
                <div className="cmd-search-bar">
                    <Search size={18} className="cmd-search-icon" />
                    <input
                        ref={inputRef}
                        className="cmd-input"
                        placeholder="Search leads, deals, contacts, or type a command..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="cmd-shortcut">ESC</div>
                </div>

                {/* Results */}
                <div className="cmd-results">
                    {loading && (
                        <div className="cmd-loading">Searching...</div>
                    )}

                    {!loading && query.length < 2 && recentSearches.length > 0 && (
                        <div>
                            <div className="cmd-section-label">Recent Searches</div>
                            {recentSearches.map((s, i) => (
                                <div key={s} className="cmd-item" onClick={() => { setQuery(s); }}>
                                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                                    <span>{s}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && query.length < 2 && (
                        <div>
                            <div className="cmd-section-label">Quick Actions</div>
                            {[
                                { label: 'Go to Dashboard', url: '/dashboard', icon: BarChart3 },
                                { label: 'View Pipeline', url: '/pipeline', icon: Layers },
                                { label: 'Open Reports', url: '/reports', icon: BarChart3 },
                                { label: 'View Tasks', url: '/tasks', icon: CheckSquare },
                                { label: 'Email Center', url: '/email', icon: Mail },
                            ].map((action, i) => (
                                <div key={action.label} className={`cmd-item ${selectedIndex === i ? 'selected' : ''}`}
                                    onClick={() => { setIsOpen(false); navigate(action.url); }}>
                                    <action.icon size={16} style={{ color: 'var(--primary-400)' }} />
                                    <span>{action.label}</span>
                                    <ArrowRight size={12} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Search Results */}
                    {results.length > 0 && (
                        <div>
                            <div className="cmd-section-label">Results</div>
                            {results.map((item, i) => {
                                const Icon = ENTITY_ICONS[item.type] || Search;
                                return (
                                    <div key={`${item.type}-${item.id}`}
                                        className={`cmd-item ${selectedIndex === i ? 'selected' : ''}`}
                                        onClick={() => handleSelect(item)}>
                                        <div className="cmd-item-icon" style={{ color: ENTITY_COLORS[item.type] }}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="cmd-item-content">
                                            <div className="cmd-item-title">{item.title}</div>
                                            <div className="cmd-item-subtitle">{item.subtitle}</div>
                                        </div>
                                        <span className="cmd-item-badge">{item.type}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Quick Actions from API */}
                    {quickActions.length > 0 && (
                        <div>
                            <div className="cmd-section-label">Actions</div>
                            {quickActions.map((action, i) => (
                                <div key={action.id}
                                    className={`cmd-item ${selectedIndex === results.length + i ? 'selected' : ''}`}
                                    onClick={() => handleSelect(action)}>
                                    <Zap size={14} style={{ color: 'var(--accent-amber)' }} />
                                    <span>{action.title}</span>
                                    <ArrowRight size={12} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && query.length >= 2 && results.length === 0 && quickActions.length === 0 && (
                        <div className="cmd-empty">
                            <Search size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                            <p>No results for "{query}"</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="cmd-footer">
                    <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                    <span><kbd>Enter</kbd> select</span>
                    <span><kbd>Esc</kbd> close</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
