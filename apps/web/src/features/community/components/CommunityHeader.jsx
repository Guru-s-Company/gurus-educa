import { communityMembers } from "../mocks/communityMocks";

const AVATAR_CLASS_BY_COLOR = {
  orange: "community-server__avatar--orange",
  green: "community-server__avatar--green",
  pink: "community-server__avatar--pink",
  blue: "community-server__avatar--blue",
  purple: "community-server__avatar--purple",
};

function OnlineMembers() {
  const onlineCount = communityMembers.filter((member) => member.online).length;

  return (
    <div className="community-server__active-members">
      {communityMembers.map((member) => (
        <span
          key={member.id}
          className={`community-server__avatar ${AVATAR_CLASS_BY_COLOR[member.color] ?? ""}`}
          aria-hidden="true"
        >
          {member.name.charAt(0)}
        </span>
      ))}
      <span className="community-server__online">
        <span className="community-server__online-dot" aria-hidden="true" />
        {onlineCount} {onlineCount === 1 ? "pessoa online" : "pessoas online"}
      </span>
    </div>
  );
}

export default function CommunityHeader({ title, isChat = false }) {
  return (
    <header
      className={
        isChat
          ? "community-server__header community-server__chat-header"
          : "community-server__header"
      }
    >
      {isChat ? (
        <button className="community-server__channel" type="button">
          <span># duvidas-js</span>
        </button>
      ) : (
        <div>
          <p>Servidor da comunidade</p>
          <h1>{title}</h1>
        </div>
      )}

      <OnlineMembers />
    </header>
  );
}
