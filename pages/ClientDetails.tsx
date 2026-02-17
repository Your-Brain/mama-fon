import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2, Plus, Edit } from "lucide-react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../constants";
import { Transaction } from "../types";
import { generateClientReport } from "../services/pdfService";

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    clients,
    transactions,
    removeClient,
    addTransaction,
    updateTransaction,
    removeTransaction,
    language,
  } = useApp();

  const t = TRANSLATIONS[language];

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // SAFE NUMBER
  const num = (v: any) => Number(v || 0);

  // IMPORTANT: MongoDB uses _id
  const client = clients.find((c: any) => (c.id || c._id) === id);

  const clientTransactions = transactions
    .filter((tx: any) => tx.clientId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [formData, setFormData] = useState({
    amountReceived: "",
    quantity: "1",
    unitPrice: "",
    shippingCost: "",
    notes: "",
  });

  // ===== CALCULATION FIX =====
  const totals = useMemo(() => {
    const received = clientTransactions.reduce(
      (a, b) => a + num(b.amountReceived),
      0,
    );

    const expenses = clientTransactions.reduce(
      (a, b) => a + num(b.productCost) + num(b.shippingCost),
      0,
    );

    return { received, expenses, profit: received - expenses };
  }, [clientTransactions]);

  if (!client) return <div className="p-10 text-center">Client not found</div>;

  const openAddModal = () => {
    setEditingTx(null);
    setFormData({
      amountReceived: "",
      quantity: "1",
      unitPrice: "",
      shippingCost: "",
      notes: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);

    setFormData({
      amountReceived: String(num(tx.amountReceived)),
      quantity: String(num(tx.quantity) || 1),
      unitPrice: String(num(tx.unitPrice) || num(tx.productCost)),
      shippingCost: String(num(tx.shippingCost)),
      notes: tx.notes || "",
    });

    setModalOpen(true);
  };

  // ===== FIXED SUBMIT =====
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = num(formData.quantity) || 1;
    const unitPrice = num(formData.unitPrice);
    const productCost = quantity * unitPrice;

    const commonData = {
      clientId: id,
      amountReceived: num(formData.amountReceived),
      productCost,
      shippingCost: num(formData.shippingCost),
      notes: formData.notes || "",
      quantity,
      unitPrice,
      type: "SALE" as const,
    };

    if (editingTx) {
      await updateTransaction({
        ...editingTx,
        ...commonData,
      });
    } else {
      // ✅ IMPORTANT FIX — NO id HERE
      await addTransaction({
        date: new Date().toISOString(),
        ...commonData,
      } as Transaction);
    }

    setModalOpen(false);
  };

  const handleDeleteClient = async () => {
    if (window.confirm("Delete this client and all history?")) {
      await removeClient(client.id || client._id);
      navigate("/clients");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(num(val));

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/clients")}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p>{client.phone}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generateClientReport(client, clientTransactions, language)
              }
              className="p-2 border rounded-xl"
            >
              <Download size={18} />
            </button>

            <button
              onClick={handleDeleteClient}
              className="p-2 border rounded-xl text-rose-600"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div>Profit: {formatCurrency(totals.profit)}</div>
        <div>Received: {formatCurrency(totals.received)}</div>
        <div>Expense: {formatCurrency(totals.expenses)}</div>
      </div>

      {/* ADD BUTTON */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold">{t.recentTransactions}</h3>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex gap-2"
        >
          <Plus size={16} /> {t.addTransaction}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {clientTransactions.length === 0 ? (
          <p className="text-center text-gray-400">No transactions yet.</p>
        ) : (
          clientTransactions.map((tx: any) => (
            <div
              key={tx._id || tx.id}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl border flex justify-between"
            >
              <div>
                <div>{new Date(tx.date).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">
                  Cost: {formatCurrency(num(tx.productCost))} | Ship:{" "}
                  {formatCurrency(num(tx.shippingCost))}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <span className="font-bold text-indigo-600">
                  +{formatCurrency(num(tx.amountReceived))}
                </span>

                <button onClick={() => openEditModal(tx)}>
                  <Edit size={16} />
                </button>

                <button onClick={() => removeTransaction(tx._id || tx.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-md space-y-3"
          >
            <input
              type="number"
              placeholder={t.amountReceived}
              value={formData.amountReceived}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amountReceived: e.target.value,
                })
              }
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"
            />

            <input
              type="number"
              placeholder={t.quantity}
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"
            />

            <input
              type="number"
              placeholder={t.unitPrice}
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData({ ...formData, unitPrice: e.target.value })
              }
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"
            />

            <input
              type="number"
              placeholder={t.shippingCost}
              value={formData.shippingCost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shippingCost: e.target.value,
                })
              }
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"
            />

            <input
              placeholder={t.notes}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 border rounded-xl py-2"
              >
                {t.cancel}
              </button>

              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white rounded-xl py-2"
              >
                {editingTx ? t.update : t.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientDetails;
