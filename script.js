const storageKey = "gereb-project-table-v3";
const initialProjects = Array.isArray(window.gerebProjectsData) ? window.gerebProjectsData : [];

const tableColumns = [
  { key: "item", label: "Item", type: "number", className: "item-cell" },
  { key: "id", label: "Projeto", type: "project", className: "project-id-cell" },
  { key: "title", label: "Título", type: "text", className: "project-title", clamp: 2 },
  { key: "objective", label: "Objetivo geral", type: "text", className: "objective-cell", clamp: 3 },
  { key: "coordinator", label: "Coordenador", type: "text", className: "coordinator-cell", clamp: 2 },
  { key: "unit", label: "Coordenação", type: "badge", className: "unit-cell" },
  { key: "process", label: "Nº processo", type: "text", className: "process-cell" },
  { key: "contractType", label: "Tipo instrumento", type: "text", className: "instrument-cell", clamp: 2 },
  { key: "funder", label: "Parceiro", type: "text", className: "funder-cell", clamp: 2 },
  { key: "tedCategory", label: "Categoria TEDs", type: "text", className: "category-cell", clamp: 2 },
  { key: "instrument", label: "Nº instrumento", type: "text", className: "instrument-number-cell" },
  { key: "nature", label: "Natureza", type: "text", className: "nature-cell", clamp: 2 },
  { key: "start", label: "Início", type: "date", className: "date-cell" },
  { key: "end", label: "Fim", type: "date", className: "date-cell" },
  { key: "axis", label: "Eixo mapa estratégico", type: "text", className: "axis-cell", clamp: 2 },
  { key: "total", label: "Valor total", type: "money", className: "money-cell" },
  { key: "released", label: "Recurso liberado", type: "money", className: "money-cell" },
  { key: "receivable", label: "Recurso a receber", type: "money", className: "money-cell" },
  { key: "realized", label: "Total realizado", type: "money", className: "money-cell" },
  { key: "committed", label: "Total comprometido", type: "money", className: "money-cell" },
  { key: "balance", label: "Saldo atual", type: "money", className: "money-cell", signed: true },
  { key: "calculatedBalance", label: "Saldo calculado", type: "money", className: "money-cell", signed: true },
  { key: "balanceDifference", label: "Dif. saldo", type: "money", className: "money-cell", signed: true },
  { key: "realizedReleasedPct", label: "% realizado/liberado", type: "percent", className: "percent-cell" },
  { key: "receivableTotalPct", label: "% receber/total", type: "percent", className: "percent-cell" },
];

const state = {
  projects: loadProjects(),
  editingIndex: null,
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormat = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const percentFormat = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const elements = {
  balanceValue: document.querySelector("#balanceValue"),
  cancelDialog: document.querySelector("#cancelDialog"),
  closeDialog: document.querySelector("#closeDialog"),
  dialog: document.querySelector("#projectDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  exportButton: document.querySelector("#exportButton"),
  filteredCount: document.querySelector("#filteredCount"),
  form: document.querySelector("#projectForm"),
  funderFilter: document.querySelector("#funderFilter"),
  headerRow: document.querySelector("#projectHeaderRow"),
  newProjectButton: document.querySelector("#newProjectButton"),
  projectRows: document.querySelector("#projectRows"),
  realizedValue: document.querySelector("#realizedValue"),
  restoreButton: document.querySelector("#restoreButton"),
  searchInput: document.querySelector("#searchInput"),
  totalProjects: document.querySelector("#totalProjects"),
  totalValue: document.querySelector("#totalValue"),
  unitFilter: document.querySelector("#unitFilter"),
};

function loadProjects() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : cloneInitialProjects();
  } catch {
    return cloneInitialProjects();
  }
}

function cloneInitialProjects() {
  return initialProjects.map((project) => ({ ...project }));
}

function saveProjects() {
  localStorage.setItem(storageKey, JSON.stringify(state.projects));
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getFilteredProjects() {
  const query = normalizeText(elements.searchInput.value.trim());
  const unit = elements.unitFilter.value;
  const funder = elements.funderFilter.value;

  return state.projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => {
      const searchableText = normalizeText(Object.values(project).join(" "));

      return (
        (!query || searchableText.includes(query)) &&
        (unit === "Todos" || project.unit === unit) &&
        (funder === "Todos" || project.funder === funder)
      );
    });
}

function updateSelectFilter(select, values) {
  const currentValue = select.value;

  select.innerHTML = '<option value="Todos">Todos</option>';
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });

  select.value = values.includes(currentValue) ? currentValue : "Todos";
}

function updateFilters() {
  const units = [...new Set(state.projects.map((project) => project.unit).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const funders = [...new Set(state.projects.map((project) => project.funder).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );

  updateSelectFilter(elements.unitFilter, units);
  updateSelectFilter(elements.funderFilter, funders);
}

function renderHeader() {
  elements.headerRow.innerHTML = tableColumns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("");
  elements.headerRow.insertAdjacentHTML("beforeend", "<th>Ações</th>");
}

function renderSummary(filteredProjects) {
  const totals = filteredProjects.reduce(
    (acc, { project }) => {
      acc.total += Number(project.total || 0);
      acc.realized += Number(project.realized || 0);
      acc.balance += Number(project.balance || 0);
      return acc;
    },
    { total: 0, realized: 0, balance: 0 },
  );

  elements.totalProjects.textContent = numberFormat.format(filteredProjects.length);
  elements.totalValue.textContent = brl.format(totals.total);
  elements.realizedValue.textContent = brl.format(totals.realized);
  elements.balanceValue.textContent = brl.format(totals.balance);
  elements.balanceValue.classList.toggle("balance-negative", totals.balance < 0);
  elements.balanceValue.classList.toggle("balance-positive", totals.balance >= 0);
}

function renderTable(filteredProjects) {
  elements.projectRows.innerHTML = "";

  if (!filteredProjects.length) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    row.innerHTML = `<td colspan="${tableColumns.length + 1}">Nenhum projeto encontrado.</td>`;
    elements.projectRows.append(row);
  }

  filteredProjects.forEach(({ project, index }) => {
    const row = document.createElement("tr");
    const cells = tableColumns.map((column) => renderCell(project, column)).join("");

    row.innerHTML = `
      ${cells}
      <td class="actions-cell">
        <div class="actions">
          <button class="link-button" data-action="edit" data-index="${index}" type="button">Editar</button>
          <button class="link-button" data-action="delete" data-index="${index}" type="button">Excluir</button>
        </div>
      </td>
    `;

    elements.projectRows.append(row);
  });

  elements.filteredCount.textContent = `${numberFormat.format(filteredProjects.length)} ${
    filteredProjects.length === 1 ? "projeto encontrado" : "projetos encontrados"
  }`;
}

function renderCell(project, column) {
  const value = project[column.key];
  const classes = [column.className];

  if (column.signed && Number(value) < 0) classes.push("balance-negative");
  if (column.signed && Number(value) >= 0) classes.push("balance-positive");

  if (column.type === "badge") {
    return `<td class="${classes.join(" ")}"><span class="unit-badge">${escapeHtml(value || "-")}</span></td>`;
  }

  if (column.type === "project") {
    return `<td class="${classes.join(" ")}"><span class="project-code">${escapeHtml(value || "-")}</span></td>`;
  }

  const displayValue = formatColumnValue(value, column.type);
  const contentClass = column.clamp ? "cell-clamp" : "";

  return `<td class="${classes.join(" ")}"><span class="${contentClass}">${escapeHtml(displayValue)}</span></td>`;
}

function formatColumnValue(value, type) {
  if (value === null || value === undefined || value === "") return "-";
  if (type === "date") return formatDate(value);
  if (type === "money") return brl.format(Number(value || 0));
  if (type === "percent") return `${percentFormat.format(Number(value || 0))}%`;
  if (type === "number") return numberFormat.format(Number(value || 0));
  return value;
}

function render() {
  updateFilters();
  const filteredProjects = getFilteredProjects();

  renderSummary(filteredProjects);
  renderTable(filteredProjects);
}

function formatDate(value) {
  if (!value) return "-";
  return dateFormat.format(new Date(`${value}T12:00:00`));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getEmptyProject() {
  const today = new Date().toISOString().slice(0, 10);

  return {
    item: state.projects.length + 1,
    id: "",
    title: "",
    objective: "",
    coordinator: "",
    unit: "",
    process: "",
    contractType: "",
    funder: "",
    tedCategory: "",
    instrument: "",
    nature: "",
    start: today,
    end: today,
    axis: "",
    total: 0,
    released: 0,
    receivable: 0,
    realized: 0,
    committed: 0,
    balance: 0,
    calculatedBalance: 0,
    balanceDifference: 0,
    realizedReleasedPct: 0,
    receivableTotalPct: 0,
  };
}

function openDialog(index = null) {
  state.editingIndex = index;
  const project = index === null ? getEmptyProject() : state.projects[index];

  elements.form.reset();
  elements.dialogTitle.textContent = index === null ? "Adicionar projeto" : `Editar ${project.id}`;

  Object.entries(project).forEach(([key, value]) => {
    const input = elements.form.elements[key];
    if (input) input.value = value;
  });

  elements.dialog.showModal();
}

function closeDialog() {
  elements.dialog.close();
  elements.form.reset();
  state.editingIndex = null;
}

function handleSubmit(event) {
  event.preventDefault();

  const data = new FormData(elements.form);
  const previousProject = state.editingIndex === null ? getEmptyProject() : state.projects[state.editingIndex];
  const project = {
    ...previousProject,
    id: getText(data, "id"),
    title: getText(data, "title"),
    objective: getText(data, "objective"),
    unit: getText(data, "unit"),
    coordinator: getText(data, "coordinator"),
    process: getText(data, "process"),
    contractType: getText(data, "contractType"),
    funder: getText(data, "funder"),
    tedCategory: getText(data, "tedCategory"),
    instrument: getText(data, "instrument"),
    nature: getText(data, "nature"),
    start: data.get("start"),
    end: data.get("end"),
    axis: getText(data, "axis"),
    total: getNumber(data, "total"),
    released: getNumber(data, "released"),
    receivable: getNumber(data, "receivable"),
    realized: getNumber(data, "realized"),
    committed: getNumber(data, "committed"),
    balance: getNumber(data, "balance"),
  };

  updateCalculatedFields(project);

  if (state.editingIndex === null) {
    state.projects.push(project);
  } else {
    state.projects[state.editingIndex] = project;
  }

  saveProjects();
  closeDialog();
  render();
}

function getText(data, key) {
  return String(data.get(key) ?? "").trim();
}

function getNumber(data, key) {
  const value = data.get(key);
  return value === "" || value === null ? 0 : Number(value);
}

function updateCalculatedFields(project) {
  project.calculatedBalance = round2(project.released - project.realized - project.committed);
  project.balanceDifference = round2(project.balance - project.calculatedBalance);
  project.realizedReleasedPct = project.released ? round2((project.realized / project.released) * 100) : 0;
  project.receivableTotalPct = project.total ? round2((project.receivable / project.total) * 100) : 0;
}

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function deleteProject(index) {
  const project = state.projects[index];
  const confirmed = window.confirm(`Excluir o projeto ${project.id}?`);

  if (!confirmed) return;

  state.projects.splice(index, 1);
  saveProjects();
  render();
}

function exportCsv() {
  const headers = tableColumns.map((column) => column.label);
  const rows = getFilteredProjects().map(({ project }) => tableColumns.map((column) => project[column.key] ?? ""));
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `projetos-gereb-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

elements.newProjectButton.addEventListener("click", () => openDialog());
elements.cancelDialog.addEventListener("click", closeDialog);
elements.closeDialog.addEventListener("click", closeDialog);
elements.form.addEventListener("submit", handleSubmit);
elements.searchInput.addEventListener("input", render);
elements.unitFilter.addEventListener("change", render);
elements.funderFilter.addEventListener("change", render);
elements.projectRows.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const index = Number(button.dataset.index);
  if (button.dataset.action === "edit") openDialog(index);
  if (button.dataset.action === "delete") deleteProject(index);
});
elements.restoreButton.addEventListener("click", () => {
  const confirmed = window.confirm("Restaurar a base original e apagar edições locais?");
  if (!confirmed) return;

  state.projects = cloneInitialProjects();
  localStorage.removeItem(storageKey);
  render();
});
elements.exportButton.addEventListener("click", exportCsv);

renderHeader();
render();
