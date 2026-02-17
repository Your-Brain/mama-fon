import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../constants";
import Card from "../components/Card";
import { TrendingUp, DollarSign, Package } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const Dashboard: React.FC = () => {
  const { transactions, language, theme } = useApp();
  const t = TRANSLATIONS[language];

  const num = (v: any) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const stats = useMemo(() => {
    let totalReceived = 0;
    let totalCost = 0;

    transactions.forEach((tx) => {
      totalReceived += num(tx.amountReceived);
      totalCost += num(tx.productCost) + num(tx.shippingCost);
    });

    return {
      totalReceived,
      totalCost,
      profit: totalReceived - totalCost,
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const months: Record<string, any> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("default", { month: "short" });

      months[key] = {
        name: key,
        profit: 0,
        revenue: 0,
        expense: 0,
      };
    }

    transactions.forEach((tx) => {
      if (!tx?.date) return;

      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return;

      const key = d.toLocaleString("default", { month: "short" });
      if (!months[key]) return;

      const received = num(tx.amountReceived);
      const expense = num(tx.productCost) + num(tx.shippingCost);

      months[key].revenue += received;
      months[key].expense += expense;
      months[key].profit += received - expense;
    });

    return Object.values(months);
  }, [transactions]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num(val));

  const StatCard = ({ label, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold">{formatCurrency(value)}</h3>
      </div>
      <div className={`p-3 rounded-full ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.dashboard}</h2>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label={t.totalProfit}
          value={stats.profit}
          icon={TrendingUp}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label={t.totalReceived}
          value={stats.totalReceived}
          icon={DollarSign}
          colorClass="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label={t.totalExpenses}
          value={stats.totalCost}
          icon={Package}
          colorClass="bg-rose-100 text-rose-600"
        />
      </div>

      {/* ===== CHARTS (FIXED HEIGHT WRAPPER) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t.profit}>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === "dark" ? "#334155" : "#e2e8f0"}
                />
                <XAxis dataKey="name" />
                <YAxis hide />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  fill="#10b98122"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={`${t.revenue} vs ${t.expense}`}>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="revenue" fill="#6366f1" />
                <Bar dataKey="expense" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
