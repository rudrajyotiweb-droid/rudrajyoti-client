/** Filter vocabularies for the puja listing (match the admin's deity / purpose pickers). */
const img = (p: string) => `/assets/images/${p}.webp`;

export const deities = ["Shiva", "Durga", "Kali", "Lakshmi", "Ganesh", "Hanuman", "Shani", "Saraswati", "Navagraha", "Pitru"];
export const purposes = ["Health", "Wealth", "Protection", "Career", "Marriage", "Education", "Peace", "Ancestors"];

export const deityImages: Record<string, string> = {
  Shiva: img("deity/shiva"),
  Lakshmi: img("deity/lakshmi"),
  Durga: img("deity/durga"),
  Ganesh: img("deity/ganesh"),
  Hanuman: img("deity/hanuman"),
  Kali: img("deity/kali"),
  Saraswati: img("deity/saraswati"),
  Shani: img("deity/shani"),
};
