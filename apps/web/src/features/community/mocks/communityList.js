export const communities = [
  {
    id: 1,
    title: "Desenvolvimento Web",
    description: "Aprenda frontend, backend e boas práticas de programação.",
    imageUrl: "/images/development.jpg",
  },
  {
    id: 2,
    title: "Design e UX",
    description: "Compartilhe referências, projetos e conhecimentos de design.",
    imageUrl: "/images/design.jpg",
  },
];

export const discoverCommunities = communities.map((community) => ({
  ...community,
  id: community.id + communities.length,
}));

export function getCommunityById(communityId) {
  return [...communities, ...discoverCommunities].find(
    (community) => community.id === Number(communityId),
  );
}
