import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Client, Transaction } from "../types";
import { TRANSLATIONS } from "../constants";

// ===== SAFE NUMBER HELPER (IMPORTANT FIX) =====
const num = (v: any) => Number(v || 0);

// Safe Currency Formatter
const formatCurrency = (amount: number | undefined) => {
  return (
    "Rs. " +
    num(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
};

const addHeader = (doc: jsPDF, title: string, subTitle: string) => {
  const pageWidth = doc.internal.pageSize.width;

  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("VyaparFlow", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text(title.toUpperCase(), pageWidth - 14, 20, { align: "right" });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 25, pageWidth - 14, 25);
};

// =====================================================
// CLIENT REPORT
// =====================================================

export const generateClientReport = (
  client: Client,
  transactions: Transaction[],
  lang: "en" | "hi" | "bn",
) => {
  const doc = new jsPDF();
  const t = TRANSLATIONS[lang];
  const pageWidth = doc.internal.pageSize.width;

  addHeader(doc, t.invoice || "Statement", t.generatedOn);

  const startY = 35;

  doc.setFillColor(248, 250, 252);
  doc.rect(14, startY, pageWidth / 2 - 20, 35, "F");

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("BILL TO / CUSTOMER", 18, startY + 8);

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(client.name, 18, startY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(client.phone, 18, startY + 22);

  if (client.address) {
    const splitAddress = doc.splitTextToSize(
      client.address,
      pageWidth / 2 - 30,
    );
    doc.text(splitAddress, 18, startY + 28);
  }

  // ===== FIXED TOTALS =====
  const totalRec = transactions.reduce(
    (acc, curr) => acc + num(curr.amountReceived),
    0,
  );

  const totalCost = transactions.reduce(
    (acc, curr) => acc + num(curr.productCost) + num(curr.shippingCost),
    0,
  );

  const profit = totalRec - totalCost;

  const drawStat = (
    label: string,
    value: string,
    xOffset: number,
    isHighlight: boolean = false,
  ) => {
    const x = pageWidth - 14 - xOffset;

    doc.setFillColor(
      isHighlight ? 240 : 255,
      isHighlight ? 253 : 255,
      isHighlight ? 244 : 255,
    );
    doc.rect(x, startY, 40, 35, "FD");

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(label.toUpperCase(), x + 20, startY + 10, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.text(value, x + 20, startY + 22, { align: "center" });
  };

  drawStat(t.profit, formatCurrency(profit), 40, true);
  drawStat(t.expense, formatCurrency(totalCost), 85);
  drawStat(t.totalReceived, formatCurrency(totalRec), 130);

  const tableBody = transactions.map((tx) => [
    new Date(tx.date).toLocaleDateString(),
    tx.notes || "-",
    formatCurrency(num(tx.amountReceived)),
    formatCurrency(num(tx.productCost) + num(tx.shippingCost)),
    formatCurrency(
      num(tx.amountReceived) - (num(tx.productCost) + num(tx.shippingCost)),
    ),
  ]);

  const totalReceived = transactions.reduce(
    (s, t) => s + num(t.amountReceived),
    0,
  );

  const totalExp = transactions.reduce(
    (s, t) => s + num(t.productCost) + num(t.shippingCost),
    0,
  );

  const totalNet = totalReceived - totalExp;

  autoTable(doc, {
    startY: 80,
    head: [
      [t.date, t.notes, t.amountReceived, `${t.expense} (Cost+Ship)`, t.profit],
    ],
    body: tableBody,
    foot: [
      [
        t.grandTotal || "Grand Total",
        "",
        formatCurrency(totalReceived),
        formatCurrency(totalExp),
        formatCurrency(totalNet),
      ],
    ],
    theme: "grid",
  });

  doc.save(`${client.name.replace(/\s+/g, "_")}_Statement.pdf`);
};

// =====================================================
// FULL BUSINESS REPORT
// =====================================================

export const generateFullReport = (
  clients: Client[],
  transactions: Transaction[],
  lang: "en" | "hi" | "bn",
) => {
  const doc = new jsPDF();
  const t = TRANSLATIONS[lang];

  addHeader(
    doc,
    t.overview || "Business Report",
    new Date().toLocaleDateString(),
  );

  const tableData = clients.map((client) => {
    const clientTx = transactions.filter((tx) => tx.clientId === client.id);

    const received = clientTx.reduce(
      (acc, curr) => acc + num(curr.amountReceived),
      0,
    );

    const expenses = clientTx.reduce(
      (acc, curr) => acc + num(curr.productCost) + num(curr.shippingCost),
      0,
    );

    const profit = received - expenses;

    return [
      client.name,
      clientTx.length,
      formatCurrency(received),
      formatCurrency(expenses),
      formatCurrency(profit),
    ];
  });

  const grandRec = transactions.reduce(
    (acc, curr) => acc + num(curr.amountReceived),
    0,
  );

  const grandExp = transactions.reduce(
    (acc, curr) => acc + num(curr.productCost) + num(curr.shippingCost),
    0,
  );

  const grandProfit = grandRec - grandExp;

  autoTable(doc, {
    startY: 35,
    head: [
      [t.clientName, "Count", t.amountReceived, t.totalExpenses, t.totalProfit],
    ],
    body: tableData,
    foot: [
      [
        t.grandTotal || "Total",
        transactions.length,
        formatCurrency(grandRec),
        formatCurrency(grandExp),
        formatCurrency(grandProfit),
      ],
    ],
    theme: "striped",
  });

  doc.save(`Business_Report_${new Date().toISOString().split("T")[0]}.pdf`);
};
