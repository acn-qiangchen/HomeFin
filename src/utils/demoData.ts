import type { Transaction, Category } from '../types';

export function seedDemoData(month: string, categories: Category[]): Transaction[] {
  const [year, mon] = month.split('-').map(Number);

  function dateInMonth(day: number) {
    return `${year}-${String(mon).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function find(id: string): string {
    return categories.find((c) => c.id === id)?.id ?? categories[0].id;
  }

  const items: Omit<Transaction, 'id' | 'createdAt'>[] = [
    { type: 'income',  amount: 4500,  categoryId: find('salary'),       date: dateInMonth(1),  note: 'Monthly salary' },
    { type: 'income',  amount: 800,   categoryId: find('freelance'),     date: dateInMonth(5),  note: 'Client project' },
    { type: 'expense', amount: 1200,  categoryId: find('housing'),       date: dateInMonth(1),  note: 'Rent' },
    { type: 'expense', amount: 350,   categoryId: find('food'),          date: dateInMonth(3),  note: 'Groceries' },
    { type: 'expense', amount: 85,    categoryId: find('food'),          date: dateInMonth(10), note: 'Restaurant' },
    { type: 'expense', amount: 120,   categoryId: find('transport'),     date: dateInMonth(2),  note: 'Monthly pass' },
    { type: 'expense', amount: 95,    categoryId: find('utilities'),     date: dateInMonth(7),  note: 'Electric bill' },
    { type: 'expense', amount: 45,    categoryId: find('utilities'),     date: dateInMonth(8),  note: 'Internet' },
    { type: 'expense', amount: 200,   categoryId: find('healthcare'),    date: dateInMonth(12), note: 'Doctor visit' },
    { type: 'expense', amount: 150,   categoryId: find('entertainment'), date: dateInMonth(15), note: 'Streaming & games' },
    { type: 'expense', amount: 280,   categoryId: find('shopping'),      date: dateInMonth(18), note: 'Clothing' },
    { type: 'expense', amount: 500,   categoryId: find('savings'),       date: dateInMonth(1),  note: 'Emergency fund' },
  ];

  return items.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }));
}
