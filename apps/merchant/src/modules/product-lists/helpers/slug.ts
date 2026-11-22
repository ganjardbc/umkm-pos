// "Kopi Susu #1!" -> "kopi-susu-1". Matches the API rule ^[a-z0-9-]+$ (underscores are not allowed there).
export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
