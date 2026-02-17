import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, Client, Transaction, Language } from "../types";
import * as db from "../services/db";

interface AppContextType extends AppState {
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  addClient: (client: Client) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [language, setLanguageState] = useState<Language>("en");
  const [loading, setLoading] = useState(true);

  // ===== MAP MONGODB _id -> id (VERY IMPORTANT) =====
  const normalizeClients = (data: any[]): Client[] =>
    data.map((c) => ({
      ...c,
      id: c._id || c.id,
    }));

  const normalizeTransactions = (data: any[]): Transaction[] =>
    data.map((t) => ({
      ...t,
      id: t._id || t.id,
    }));

  const refreshData = async () => {
    const [clientsData, txData] = await Promise.all([
      db.getClients(),
      db.getTransactions(),
    ]);

    setClients(normalizeClients(clientsData));
    setTransactions(normalizeTransactions(txData));
  };

  useEffect(() => {
    const init = async () => {
      await refreshData();

      const savedTheme = db.getTheme();
      setThemeState(savedTheme);
      db.setTheme(savedTheme);

      const savedLang = db.getLanguage();
      setLanguageState(savedLang);

      setLoading(false);
    };

    init();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    db.setTheme(newTheme);
  };

  const updateLanguage = (lang: Language) => {
    setLanguageState(lang);
    db.setLanguage(lang);
  };

  // ===== CRUD =====
  const addClient = async (client: Client) => {
    const { id, ...payload } = client; // remove frontend id
    await db.saveClient(payload as Client);
    await refreshData();
  };

  const removeClient = async (id: string) => {
    await db.deleteClient(id);
    await refreshData();
  };

  const addTransaction = async (tx: Transaction) => {
    const { id, ...payload } = tx;
    await db.saveTransaction(payload as Transaction);
    await refreshData();
  };

  const updateTransaction = async (tx: Transaction) => {
    const { id, ...payload } = tx;
    await db.editTransaction({ ...(payload as Transaction), _id: id } as any);
    await refreshData();
  };

  const removeTransaction = async (id: string) => {
    await db.deleteTransaction(id);
    await refreshData();
  };

  if (loading) return null;

  return (
    <AppContext.Provider
      value={{
        clients,
        transactions,
        theme,
        language,
        setLanguage: updateLanguage,
        toggleTheme,
        addClient,
        removeClient,
        addTransaction,
        updateTransaction,
        removeTransaction,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
