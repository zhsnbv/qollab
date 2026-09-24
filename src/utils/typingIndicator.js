export function typingSubtitle(people, group = false) {
  if (!people?.length) return null;
  if (!group) return 'печатает…';
  if (people.length >= 5) return 'Несколько участников печатают…';
  const first = typeof people[0] === 'string' ? people[0] : people[0].short;
  return people.length === 1
    ? `${first} печатает…`
    : `${first} и ещё ${people.length - 1} печатают…`;
}
