import { subDays, subMonths, format } from "date-fns";

export type PayoutAccount = {
  type: "mobile_money" | "bank";
  provider: string; // MTN, Airtel, Bank name
  accountNumber: string;
  accountName: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: Date;
  totalSpent: number;
  pendingShare: number;
  restaurant: string;
  payout?: PayoutAccount;
};

export type Transaction = {
  id: string;
  customerId: string;
  restaurant: string;
  amount: number;
  date: Date;
};

const firstNames = ["Amara", "Kwame", "Zola", "Tunde", "Aisha", "Kofi", "Nia", "Jabari", "Lerato", "Sade", "Chiamaka", "Obi", "Fatima", "Mensah", "Yara", "Tariro", "Bongani", "Imani", "Sefu", "Anika"];
const lastNames = ["Okonkwo", "Mensah", "Diallo", "Nkrumah", "Abara", "Mwangi", "Achebe", "Kone", "Bello", "Owusu", "Adeyemi", "Niang", "Sankara", "Mutombo", "Eze"];
const restaurants = ["Spice Route", "Saffron House", "Mama Africa", "Lagos Grill", "Cairo Bites", "Nairobi Kitchen", "Accra Pot", "Dakar Diner"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rng = seededRandom(42);

export const MOCK_CUSTOMERS: Customer[] = Array.from({ length: 38 }, (_, i) => {
  const joinedAt = subDays(new Date(), Math.floor(rng() * 365));
  const totalSpent = Math.floor(rng() * 4500) + 200;
  return {
    id: `CUS-${1000 + i}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@mail.com`,
    phone: `+233 ${20 + (i % 6)} ${100 + i} ${1000 + i}`,
    joinedAt,
    totalSpent,
    pendingShare: Math.floor(totalSpent * 0.08),
    restaurant: restaurants[i % restaurants.length],
    payout: i % 3 === 0 ? {
      type: i % 2 === 0 ? "mobile_money" : "bank",
      provider: i % 2 === 0 ? "MTN MoMo" : "GTBank",
      accountNumber: `${Math.floor(rng() * 9000000000) + 1000000000}`,
      accountName: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    } : undefined,
  };
});

export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 220 }, (_, i) => {
  const customer = MOCK_CUSTOMERS[i % MOCK_CUSTOMERS.length];
  return {
    id: `TXN-${5000 + i}`,
    customerId: customer.id,
    restaurant: customer.restaurant,
    amount: Math.floor(rng() * 250) + 15,
    date: subDays(new Date(), Math.floor(rng() * 180)),
  };
});

export function getSignupsByMonth(months = 12) {
  const data: { month: string; signups: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const label = format(date, "MMM");
    const count = MOCK_CUSTOMERS.filter(
      (c) =>
        c.joinedAt.getMonth() === date.getMonth() &&
        c.joinedAt.getFullYear() === date.getFullYear()
    ).length;
    data.push({ month: label, signups: count });
  }
  return data;
}
