export default function LiveFeed({ feedItems = [] }) {
    const defaultFeed = [
        {
            id: 1,
            type: 'emerald',
            title: 'Package Delivered',
            time: '2m ago',
            description: 'Unit <strong>FT-9023</strong> reached Warehouse Alpha (NJ-44).',
            actions: [
                { type: 'tag', text: 'ID: #DX-990' },
                { type: 'link', text: 'Details' },
            ],
        },
        {
            id: 2,
            type: 'red',
            title: 'Route Deviation Detected',
            titleClass: 'alert',
            time: '8m ago',
            description: 'Unit <strong>FT-1104</strong> diverted from scheduled path (I-95 South).',
            actions: [
                { type: 'btn-danger', text: 'Contact Driver' },
                { type: 'btn-outline', text: 'Dismiss' },
            ],
        },
        {
            id: 3,
            type: 'blue',
            title: 'Maintenance Logged',
            time: '15m ago',
            description: 'Unit <strong>FT-4482</strong> fuel sensor requires inspection in 48 hours.',
            actions: [
                { type: 'tag', text: 'Priority: Low' },
            ],
        },
        {
            id: 4,
            type: 'emerald',
            title: 'Dispatch Confirmed',
            time: '24m ago',
            description: 'New route assigned to <strong>FT-3011</strong> by Dispatcher B.',
            actions: [],
            isLast: true,
        },
    ];

    const items = feedItems.length > 0 ? feedItems : defaultFeed;

    return (
        <div className="feed-panel">
            <div className="feed-header">
                <h4 className="feed-header-title">
                    <span className="material-symbols-outlined">sensors</span>
                    Live Feed
                </h4>
                <span className="feed-badge">{items.length} new updates</span>
            </div>

            <div className="feed-list no-scrollbar">
                {items.map((item, idx) => (
                    <div className="feed-item" key={item.id || idx}>
                        <div className="feed-timeline">
                            <div className={`feed-dot ${item.type}`}></div>
                            {!item.isLast && <div className="feed-line"></div>}
                        </div>
                        <div className="feed-content">
                            <div className="feed-content-header">
                                <p className={`feed-content-title ${item.titleClass || ''}`}>{item.title}</p>
                                <span className="feed-content-time">{item.time}</span>
                            </div>
                            <p
                                className="feed-content-desc"
                                dangerouslySetInnerHTML={{ __html: item.description }}
                            />
                            {item.actions && item.actions.length > 0 && (
                                <div className="feed-actions">
                                    {item.actions.map((action, i) => {
                                        if (action.type === 'tag') {
                                            return <span key={i} className="feed-action-tag">{action.text}</span>;
                                        }
                                        if (action.type === 'link') {
                                            return <button key={i} className="feed-action-link">{action.text}</button>;
                                        }
                                        if (action.type === 'btn-danger') {
                                            return <button key={i} className="feed-action-btn danger">{action.text}</button>;
                                        }
                                        if (action.type === 'btn-outline') {
                                            return <button key={i} className="feed-action-btn outline">{action.text}</button>;
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="feed-footer">
                <button>View All Activities</button>
            </div>
        </div>
    );
}
