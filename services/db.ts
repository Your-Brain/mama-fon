import { Client, Transaction } from "../types";

const API = "http://localhost:5000/api";

const STORAGE_KEYS = {
  THEME: "vyapar_theme",
  LANG: "vyapar_lang",
};

// ===== NORMALIZERS (VERY IMPORTANT FIX) =====

const normalizeClient = (c: any): Client => ({
  ...c,
  id: c.id || c._id,
});

const normalizeTransaction = (t: any): Transaction => ({
  ...t,
  id: t.id || t._id,

  amountReceived: parseFloat(t.amountReceived) || 0,
  productCost: parseFloat(t.productCost) || 0,
  shippingCost: parseFloat(t.shippingCost) || 0,

  quantity: parseFloat(t.quantity) || 1,
  unitPrice: parseFloat(t.unitPrice) || 0,

  date: t.date,
});

// ================= CLIENTS =================

export const getClients = async (): Promise<Client[]> => {
  const res = await fetch(`${API}/clients`);
  const data = await res.json();
  return data.map(normalizeClient);
};

export const saveClient = async (client: Client): Promise<void> => {
  await fetch(`${API}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });
};

export const deleteClient = async (id: string): Promise<void> => {
  await fetch(`${API}/clients/${id}`, {
    method: "DELETE",
  });
};

// ================= TRANSACTIONS =================

export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await fetch(`${API}/transactions`);
  const data = await res.json();
  return data.map(normalizeTransaction);
};

export const saveTransaction = async (
  transaction: Transaction,
): Promise<void> => {
  await fetch(`${API}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
};

export const editTransaction = async (
  transaction: Transaction,
): Promise<void> => {
  await fetch(`${API}/transactions/${transaction.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await fetch(`${API}/transactions/${id}`, {
    method: "DELETE",
  });
};

// ================= SETTINGS =================

export const getTheme = (): "light" | "dark" => {
  return (
    (localStorage.getItem(STORAGE_KEYS.THEME) as "light" | "dark") || "light"
  );
};

export const setTheme = (theme: "light" | "dark"): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const getLanguage = (): any => {
  return localStorage.getItem(STORAGE_KEYS.LANG) || "en";
};

export const setLanguage = (lang: string): void => {
  localStorage.setItem(STORAGE_KEYS.LANG, lang);
};
