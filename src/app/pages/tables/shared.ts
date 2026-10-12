export type Status = 'Active' | 'Pending' | 'Inactive';
export interface Customer { id: number; name: string; email: string; plan: 'Free' | 'Pro' | 'Enterprise'; status: Status; balance: number; }

export const STATUSES: Status[] = ['Active', 'Pending', 'Inactive'];
export const PLANS: Customer['plan'][] = ['Free', 'Pro', 'Enterprise'];

const first = ['Amina', 'Brian', 'Chloe', 'David', 'Esther', 'Farid', 'Grace', 'Hassan', 'Irene', 'James', 'Kofi', 'Lina', 'Moses', 'Nadia', 'Omar'];
const last = ['Otieno', 'Kamau', 'Mwangi', 'Njeri', 'Wanjiru', 'Abdi', 'Ochieng', 'Mutua', 'Kariuki', 'Ahmed'];

export function makeCustomers(n: number, offset = 0): Customer[] {
  return Array.from({ length: n }, (_, i) => {
    const k = i + offset; const f = first[k % first.length]; const l = last[(k * 7) % last.length];
    return {
      id: k + 1, name: `${f} ${l}`, email: `${f}.${l}@example.com`.toLowerCase(),
      plan: PLANS[k % 3], status: STATUSES[(k * 5) % 3], balance: Math.round(((k * 7919) % 9000) + 120) ,
    };
  });
}
