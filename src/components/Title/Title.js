export default function createTitle(text, level = 1) {
  const headingLevel = Math.min(Math.max(level, 1), 6);

  return `<h${headingLevel} class="title">${text}</h${headingLevel}>`;
}
