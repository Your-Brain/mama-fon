import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, ChevronRight, Phone } from "lucide-react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../constants";
import { Client } from "../types";

const Clients: React.FC = () => {
  const { clients, language, addClient } = useApp();
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const t = TRANSLATIONS[language];

  // ===== MAP _id → id FIX =====
  const safeClients = clients.map((c: any) => ({
    ...c,
    id: c.id || c._id,
  }));

  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    phone: "",
    address: "",
  });

  const filteredClients = safeClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newClient.name && newClient.phone) {
      await addClient({
        name: newClient.name,
        phone: newClient.phone,
        address: newClient.address || "",
        createdAt: new Date().toISOString(),
      } as Client);

      setModalOpen(false);
      setNewClient({ name: "", phone: "", address: "" });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t.clients}</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex gap-2"
        >
          <UserPlus size={18} />
          {t.addNewClient}
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder={t.searchClients}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border"
        />
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
      </div>

      {filteredClients.length === 0 ? (
        <p className="text-center text-gray-400">{t.noClients}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Link to={`/clients/${client.id}`} key={client.id}>
              <div className="p-5 border rounded-2xl">
                <h3 className="font-semibold">{client.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={14} />
                  {client.phone}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-2xl w-full max-w-md space-y-3"
          >
            <input
              required
              placeholder={t.clientName}
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
              className="w-full p-3 border rounded-xl"
            />

            <input
              required
              placeholder={t.phone}
              value={newClient.phone}
              onChange={(e) =>
                setNewClient({ ...newClient, phone: e.target.value })
              }
              className="w-full p-3 border rounded-xl"
            />

            <textarea
              placeholder={t.address}
              value={newClient.address}
              onChange={(e) =>
                setNewClient({ ...newClient, address: e.target.value })
              }
              className="w-full p-3 border rounded-xl"
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
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Clients;
