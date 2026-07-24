const CANONICAL_FIELDS = [
  ["fromStationNumber", "From station number"],
  ["fromStationName", "From station"],
  ["toStationNumber", "To station number"],
  ["toStationName", "To station"],
  ["travelTime", "Reise Tid"],
  ["ticketPriceBusiness", "Billetpris Forerningsreisende"],
  ["ticketPriceLeisure", "Bilettpris fritidsreiser"],
  ["departuresPerDirection", "Antall avganger per rerning"],
  ["interchanges", "Antall togbytter"],
  ["distance", "Avstand"],
  ["comment", "Comment"]
];

const IGNORED_FIELDS = new Set([
  "fromStationNumber",
  "fromStationName",
  "toStationNumber",
  "toStationName"
]);

const DEFAULT_CSV_PATH = "./data/HsrTimeDist.csv";

const els = {
  from: document.getElementById("fromStation"),
  to: document.getElementById("toStation"),
  reverse: document.getElementById("showReverse"),
  status: document.getElementById("status"),
  table: document.getElementById("resultTable"),
  tbody: document.querySelector("#resultTable tbody")
};

let rows = [];

init();

async function init() {
  els.from.addEventListener("change", onSelectionChanged);
  els.to.addEventListener("change", onSelectionChanged);
  els.reverse.addEventListener("change", onSelectionChanged);
  resetSelectors();

  setStatus("Loading bundled CSV...");

  try {
    const text = await fetchDefaultCsv();
    hydrateFromCsvText(text, "bundled HsrTimeDist.csv");
  } catch (error) {
    setStatus(`Could not auto-load ${DEFAULT_CSV_PATH}. (${error.message})`);
  }
}

async function fetchDefaultCsv() {
  const response = await fetch(DEFAULT_CSV_PATH);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

function hydrateFromCsvText(text, sourceName) {
  rows = parseDataRows(text);
  resetSelectors();

  if (!rows.length) {
    setStatus(`No usable rows found in ${sourceName}.`);
    return;
  }

  const stations = getUniqueStations(rows);
  fillSelect(els.from, stations, "Select from station");
  fillSelect(els.to, stations, "Select to station");

  els.from.disabled = false;
  els.to.disabled = false;
  setStatus(`Loaded ${rows.length} routes from ${sourceName}.`);
}

function parseDataRows(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  return lines
    .slice(1)
    .map(parseCsvLine)
    .map(mapToRow)
    .filter((row) => row.fromStationName && row.toStationName);
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ";" && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function mapToRow(values) {
  const row = {};
  for (let i = 0; i < CANONICAL_FIELDS.length; i += 1) {
    const key = CANONICAL_FIELDS[i][0];
    row[key] = values[i] || "";
  }
  return row;
}

function getUniqueStations(dataRows) {
  const stations = new Set();

  dataRows.forEach((row) => {
    if (row.fromStationName) {
      stations.add(row.fromStationName);
    }
    if (row.toStationName) {
      stations.add(row.toStationName);
    }
  });

  return Array.from(stations).sort((a, b) => a.localeCompare(b));
}

function fillSelect(selectEl, options, placeholder) {
  selectEl.innerHTML = "";

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = placeholder;
  selectEl.appendChild(empty);

  options.forEach((station) => {
    const option = document.createElement("option");
    option.value = station;
    option.textContent = station;
    selectEl.appendChild(option);
  });
}

function onSelectionChanged() {
  const from = els.from.value;
  const to = els.to.value;

  if (!from || !to) {
    setStatus("Choose both stations to see route details.");
    clearTable();
    return;
  }

  if (from === to) {
    setStatus("Please choose two different stations.");
    clearTable();
    return;
  }

  const exact = rows.find((row) => row.fromStationName === from && row.toStationName === to);

  if (exact) {
    setStatus(`Showing route ${from} -> ${to}`);
    showRow(exact, false);
    return;
  }

  if (els.reverse.checked) {
    const reverse = rows.find((row) => row.fromStationName === to && row.toStationName === from);
    if (reverse) {
      setStatus(`No exact route found. Showing reverse route ${to} -> ${from}.`);
      showRow(reverse, true);
      return;
    }
  }

  setStatus(`No route found for ${from} -> ${to}.`);
  clearTable();
}

function showRow(row, isReverse) {
  els.tbody.innerHTML = "";

  if (isReverse) {
    addResultRow("Note", "Reverse route displayed");
  }

  CANONICAL_FIELDS.forEach(([key, label]) => {
    if (IGNORED_FIELDS.has(key)) {
      return;
    }
    addResultRow(label, formatDisplayValue(key, row[key]));
  });

  els.table.classList.remove("hidden");
}

function formatDisplayValue(key, value) {
  if (key === "travelTime") {
    return formatMinutesAsHoursMinutes(value);
  }
  return value || "-";
}

function formatMinutesAsHoursMinutes(rawValue) {
  if (!rawValue) {
    return "-";
  }

  const normalized = String(rawValue).replace(",", ".");
  const totalMinutes = Math.round(Number(normalized));

  if (!Number.isFinite(totalMinutes)) {
    return rawValue;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

function addResultRow(label, value) {
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  const td = document.createElement("td");

  th.textContent = label;
  td.textContent = value;

  tr.appendChild(th);
  tr.appendChild(td);
  els.tbody.appendChild(tr);
}

function clearTable() {
  els.table.classList.add("hidden");
  els.tbody.innerHTML = "";
}

function resetSelectors() {
  fillSelect(els.from, [], "Select from station");
  fillSelect(els.to, [], "Select to station");
  els.from.disabled = true;
  els.to.disabled = true;
  clearTable();
}

function setStatus(message) {
  els.status.textContent = message;
}
