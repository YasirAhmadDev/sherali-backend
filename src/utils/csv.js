const escapeCell = (value) => {
  if (value === null || value === undefined) return "";
  let s = String(value);
  // Stop spreadsheet formula injection (=, +, -, @)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
};

// columns: [{ label: "Date", value: (row) => row.date }]
export const toCsv = (columns, rows) => {
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(","));
  // BOM so Excel opens Dari/Pashto text correctly
  return "\uFEFF" + [header, ...lines].join("\r\n");
};
