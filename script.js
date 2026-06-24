const storageKey = "gereb-project-table-v1";
const pageSize = 8;

const initialProjects = [
  {
    id: "GEREB-008-FIO-20",
    title: "Gestao e governanca no campo da ciencia, tecnologia e inovacao em saude",
    unit: "ASSESSORIAS",
    coordinator: "Jose Antonio Silvestre Fernandes Neto",
    instrument: "TED 50/2020",
    funder: "Ministerio da Saude",
    start: "2020-08-12",
    end: "2026-08-05",
    total: 31103328,
    realized: 31130699.28,
    balance: -27746.83,
  },
  {
    id: "GEREB-018-FIO-23",
    title: "Aprimoramento das praticas institucionais no ambito do Ministerio da Saude",
    unit: "ASSESSORIAS",
    coordinator: "Jose Antonio Silvestre Fernandes Neto",
    instrument: "TED 15/2023",
    funder: "Ministerio da Saude",
    start: "2023-09-27",
    end: "2028-09-27",
    total: 183000000,
    realized: 96154394.37,
    balance: -2120035.22,
  },
  {
    id: "GEREB-036-FIO-23",
    title: "Fortalecimento e apoio das acoes voltadas para a populacao em situacao de rua",
    unit: "ASSESSORIAS",
    coordinator: "Jose Antonio Silvestre Fernandes Neto",
    instrument: "TED 06/2023",
    funder: "Ministerio dos Direitos Humanos e da Cidadania",
    start: "2023-12-21",
    end: "2026-06-30",
    total: 4625000,
    realized: 4573802.85,
    balance: 40277.95,
  },
  {
    id: "GEREB-005-FEX-20",
    title: "Saude digital para o enfrentamento da Covid-19 nos territorios do Distrito Federal",
    unit: "COLABORATORIO",
    coordinator: "Wagner de Jesus Martins",
    instrument: "Convenio PD&I 59/2020",
    funder: "FAP/DF",
    start: "2020-06-01",
    end: "2026-06-27",
    total: 10000000,
    realized: 9863851.66,
    balance: 2377797.9,
  },
  {
    id: "GEREB-060-FIO-24",
    title: "Rua Sentinela: monitoramento e fortalecimento das politicas publicas",
    unit: "ASSESSORIAS",
    coordinator: "Jose Antonio Silvestre Fernandes Neto",
    instrument: "Emenda Parlamentar 43680013",
    funder: "Dep. Erika Hilton",
    start: "2024-12-09",
    end: "2026-12-09",
    total: 1000000,
    realized: 629273.54,
    balance: -58104.18,
  },
  {
    id: "GEREB-024-FIO-26",
    title: "Redes agroecologicas de plantas medicinais",
    unit: "COLABORATORIO",
    coordinator: "Wagner de Jesus Martins",
    instrument: "TED 970963/2024",
    funder: "Ministerio do Desenvolvimento Agrario",
    start: "2026-03-27",
    end: "2027-09-27",
    total: 2497000,
    realized: 6093.98,
    balance: 0,
  },
];

const state = {
  projects: loadProjects(),
  page: 1,
  editingIndex: null,
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
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
  firstPage: document.querySelector("#firstPage"),
  form: document.querySelector("#projectForm"),
  lastPage: document.querySelector("#lastPage"),
  newProjectButton: document.querySelector("#newProjectButton"),
  nextPage: document.querySelector("#nextPage"),
  pageInfo: document.querySelector("#pageInfo"),
  previousPage: document.querySelector("#previousPage"),
  projectRows: document.querySelector("#projectRows"),
  realizedValue: document.querySelector("#realizedValue"),
  restoreButton: document.querySelector("#restoreButton"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  totalProjects: document.querySelector("#totalProjects"),
  totalValue: document.querySelector("#totalValue"),
  unitFilter: document.querySelector("#unitFilter"),
};

function loadProjects() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialProjects;
  } catch {
    return initialProjects;
  }
}

function saveProjects() {
  localStorage.setItem(storageKey, JSON.stringify(state.projects));
}

function getStatus(project) {
  const today = new Date();
  const end = new Date(`${project.end}T12:00:00`);
  const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);

  if (days < 0) return { label: "Encerrado", className: "status-ended" };
  if (days <= 180) return { label: "A vencer", className: "status-warning" };
  return { label: "Ativo", className: "status-active" };
}

function getFilteredProjects() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const status = elements.statusFilter.value;
  const unit = elements.unitFilter.value;

  return state.projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => {
      const text = [
        project.id,
        project.title,
        project.unit,
        project.coordinator,
        project.instrument,
        project.funder,
      ]
        .join(" ")
        .toLowerCase();
      const projectStatus = getStatus(project).label;

      return (
        (!query || text.includes(query)) &&
        (status === "Todos" || projectStatus === status) &&
        (unit === "Todos" || project.unit === unit)
      );
    });
}

function updateUnitFilter() {
  const currentValue = elements.unitFilter.value;
  const units = [...new Set(state.projects.map((project) => project.unit).filter(Boolean))].sort();

  elements.unitFilter.innerHTML = '<option value="Todos">Todos</option>';
  units.forEach((unit) => {
    const option = document.createElement("option");
    option.value = unit;
    option.textContent = unit;
    elements.unitFilter.append(option);
  });

  elements.unitFilter.value = units.includes(currentValue) ? currentValue : "Todos";
}

function renderSummary() {
  const total = state.projects.reduce((sum, project) => sum + Number(project.total || 0), 0);
  const realized = state.projects.reduce((sum, project) => sum + Number(project.realized || 0), 0);
  const balance = state.projects.reduce((sum, project) => sum + Number(project.balance || 0), 0);

  elements.totalProjects.textContent = state.projects.length;
  elements.totalValue.textContent = brl.format(total);
  elements.realizedValue.textContent = brl.format(realized);
  elements.balanceValue.textContent = brl.format(balance);
}

function renderTable() {
  const filtered = getFilteredProjects();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  elements.projectRows.innerHTML = "";

  if (!visible.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="13">Nenhum projeto encontrado.</td>';
    elements.projectRows.append(row);
  }

  visible.forEach(({ project, index }) => {
    const status = getStatus(project);
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><strong>${escapeHtml(project.id)}</strong></td>
      <td class="project-title">${escapeHtml(project.title)}</td>
      <td>${escapeHtml(project.unit)}</td>
      <td>${escapeHtml(project.coordinator)}</td>
      <td>${escapeHtml(project.instrument)}</td>
      <td>${escapeHtml(project.funder)}</td>
      <td>${formatDate(project.start)}</td>
      <td>${formatDate(project.end)}</td>
      <td>${brl.format(project.total)}</td>
      <td>${brl.format(project.realized)}</td>
      <td>${brl.format(project.balance)}</td>
      <td><span class="status ${status.className}">${status.label}</span></td>
      <td>
        <div class="actions">
          <button class="link-button" data-action="edit" data-index="${index}" type="button">Editar</button>
          <button class="link-button" data-action="delete" data-index="${index}" type="button">Excluir</button>
        </div>
      </td>
    `;

    elements.projectRows.append(row);
  });

  elements.pageInfo.textContent = `${filtered.length ? start + 1 : 0}-${Math.min(
    start + pageSize,
    filtered.length,
  )} de ${filtered.length}`;
  elements.firstPage.disabled = state.page === 1;
  elements.previousPage.disabled = state.page === 1;
  elements.nextPage.disabled = state.page === totalPages;
  elements.lastPage.disabled = state.page === totalPages;
}

function render() {
  updateUnitFilter();
  renderSummary();
  renderTable();
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

function openDialog(index = null) {
  state.editingIndex = index;
  const project =
    index === null
      ? {
          id: "",
          title: "",
          unit: "",
          coordinator: "",
          instrument: "",
          funder: "",
          start: new Date().toISOString().slice(0, 10),
          end: new Date().toISOString().slice(0, 10),
          total: 0,
          realized: 0,
          balance: 0,
        }
      : state.projects[index];

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
  const project = {
    id: data.get("id").trim(),
    title: data.get("title").trim(),
    unit: data.get("unit").trim(),
    coordinator: data.get("coordinator").trim(),
    instrument: data.get("instrument").trim(),
    funder: data.get("funder").trim(),
    start: data.get("start"),
    end: data.get("end"),
    total: Number(data.get("total")),
    realized: Number(data.get("realized")),
    balance: Number(data.get("balance")),
  };

  if (state.editingIndex === null) {
    state.projects.push(project);
    state.page = Math.ceil(state.projects.length / pageSize);
  } else {
    state.projects[state.editingIndex] = project;
  }

  saveProjects();
  closeDialog();
  render();
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
  const headers = [
    "Projeto",
    "Titulo",
    "Coordenacao",
    "Coordenador",
    "Instrumento",
    "Financiador",
    "Inicio",
    "Fim",
    "Total",
    "Realizado",
    "Saldo",
    "Status",
  ];
  const rows = getFilteredProjects().map(({ project }) => [
    project.id,
    project.title,
    project.unit,
    project.coordinator,
    project.instrument,
    project.funder,
    project.start,
    project.end,
    project.total,
    project.realized,
    project.balance,
    getStatus(project).label,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
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
elements.searchInput.addEventListener("input", () => {
  state.page = 1;
  renderTable();
});
elements.statusFilter.addEventListener("change", () => {
  state.page = 1;
  renderTable();
});
elements.unitFilter.addEventListener("change", () => {
  state.page = 1;
  renderTable();
});
elements.projectRows.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const index = Number(button.dataset.index);
  if (button.dataset.action === "edit") openDialog(index);
  if (button.dataset.action === "delete") deleteProject(index);
});
elements.firstPage.addEventListener("click", () => {
  state.page = 1;
  renderTable();
});
elements.previousPage.addEventListener("click", () => {
  state.page -= 1;
  renderTable();
});
elements.nextPage.addEventListener("click", () => {
  state.page += 1;
  renderTable();
});
elements.lastPage.addEventListener("click", () => {
  state.page = Math.ceil(getFilteredProjects().length / pageSize);
  renderTable();
});
elements.restoreButton.addEventListener("click", () => {
  const confirmed = window.confirm("Restaurar a base de exemplo e apagar edicoes locais?");
  if (!confirmed) return;

  state.projects = structuredClone(initialProjects);
  state.page = 1;
  localStorage.removeItem(storageKey);
  render();
});
elements.exportButton.addEventListener("click", exportCsv);

render();
