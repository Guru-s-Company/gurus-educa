import "./CommunityCard.css";
import Dot from "./Dot";
import { Link } from "react-router-dom";

/**
 * @typedef {Object} CommunityCardProps
 * @property {string} title - Card title
 * @property {string} description - Card description
 * @property {string} imageUrl - Image URL for header and icon
 * @property {string} to - Route opened when the card is selected
 */

/**
 * @param {CommunityCardProps} props
 * @returns {JSX.Element}
 */
export default function CommunityCard({ title, description, imageUrl, to }) {
  return (
    <Link className="community-card" to={to} aria-label={`Abrir comunidade ${title}`}>
      <div className="community-card__header">
        <img
          src={imageUrl}
          alt={title}
          className="community-card__image"
          loading="lazy"
          decoding="async"
          width="320"
          height="180"
        />
      </div>
      <div className="community-card__divider">
        <img
          src={imageUrl}
          alt=""
          className="community-card__icon"
          loading="lazy"
          decoding="async"
          width="64"
          height="64"
        />
        <div className="community-card__divider-line"></div>
      </div>
      <div className="community-card__content">
        <h3 className="community-card__title">{title}</h3>
        <p className="community-card__description">{description}</p>
      </div>
      <div className="community-card__footer">
        <div className="community-card__meta">
          <div className="community-card__item">
            <Dot variant="online" />
            <span>2k members</span>
          </div>
          <div className="community-card__item">
            <Dot variant="member" />
            <span>34 posts</span>
          </div>
        </div>
      </div>
    </Link>
  );
}