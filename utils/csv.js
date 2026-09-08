export function exportToCSV(data, filename = "export.csv", delimiter = ";") {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const headers = Object.keys(data[0]);

  const escapeValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }
    let str = String(value);
    if (str.includes('"') || str.includes(delimiter) || str.includes("\n") || str.includes("\r")) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const csvLines = [];
  csvLines.push(headers.map(escapeValue).join(delimiter));

  for (const row of data) {
    const line = headers.map((header) => escapeValue(row[header])).join(delimiter);
    csvLines.push(line);
  }

  const csvContent = "\ufeff" + csvLines.join("\r\n");

  if (typeof window !== "undefined" && window.document) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return csvContent;
}

export function parseCSV(text, delimiter = ";") {
  if (!text) return [];

  const cleanText = text.startsWith("\ufeff") ? text.slice(1) : text;
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim() !== "");

  if (lines.length === 0) return [];

  const parseLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx] !== undefined ? values[idx].trim() : "";
    });
    data.push(row);
  }

  return data;
}

export default {
  exportToCSV,
  parseCSV,
};
