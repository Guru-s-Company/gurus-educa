import "./CommunityCard.css";

import Dot from "./Dot";

function CommunityCard({ title, description, imageUrl }) {
    return (
        <div className="community-card">
            <div className="community-card-header">
                <img src={imageUrl} alt={title} className="community-card-image" />
            </div>
            <div className="community-card-divider">
                <img src={imageUrl} alt={title} className="community-card-icon" />
                <div className="community-card-divider-line"></div>
            </div>
            <div className="community-card-content">
                <h3 className="community-card-title">{title}</h3>
                <p className="community-card-description">{description}</p>
            </div>
            <div className="community-card-footer">
                <div className="community-card-meta">
                    <div className="community-card-item">
                        <Dot variant="online" />
                        <span>2k members</span>
                    </div>
                    <div className="community-card-item">
                        <Dot variant="member" />
                        <span>34 posts</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommunityCard