const storageKey = "gereb-project-table-v2";

const initialProjects = [
  {
    id: "GEREB-008-FIO-20",
    title: "Gestão e governança no campo da ciência, tecnologia e inovação em saúde",
    unit: "ASSESSORIAS",
    coordinator: "José Antônio Silvestre Fernandes Neto",
    instrument: "TED 50/2020",
    funder: "Ministério da Saúde",
    start: "2020-08-12",
    end: "2026-08-05",
    total: 31103328,
    realized: 31130699.28,
    balance: -27746.83,
  },
  {
    id: "GEREB-018-FIO-23",
    title: "Aprimoramento das práticas institucionais no âmbito do Ministério da Saúde",
    unit: "ASSESSORIAS",
    coordinator: "José Antônio Silvestre Fernandes Neto",
    instrument: "TED 15/2023",
    funder: "Ministério da Saúde",
    start: "2023-09-27",
    end: "2028-09-27",
    total: 183000000,
    realized: 96154394.37,
    balance: 1533162.48,
  },
  {
    id: "GEREB-036-FIO-23",
    title: "Fortalecimento e apoio das ações voltadas para a população em situação de rua",
    unit: "ASSESSORIAS",
    coordinator: "José Antônio Silvestre Fernandes Neto",
    instrument: "TED 06/2023",
    funder: "Ministério dos Direitos Humanos e da Cidadania",
    start: "2023-12-21",
    end: "2026-06-30",
    total: 4625000,
    realized: 4573802.85,
    balance: 40277.95,
  },
  {
    id: "GEREB-005-FEX-20",
    title: "Saúde digital para o enfrentamento da Covid-19 nos territórios do Distrito Federal",
    unit: "COLABORATÓRIO",
    coordinator: "Wagner de Jesus Martins",
    instrument: "Convênio PD&I 59/2020",
    funder: "FAP/DF",
    start: "2020-06-01",
    end: "2026-06-27",
    total: 10000000,
    realized: 9863851.66,
    balance: 2377797.9,
  },
  {
    id: "GEREB-060-FIO-24",
    title: "Rua Sentinela: monitoramento e fortalecimento das políticas públicas",
    unit: "ASSESSORIAS",
    coordinator: "José Antônio Silvestre Fernandes Neto",
    instrument: "Emenda Parlamentar 43680013",
    funder: "Dep. Erika Hilton",
    start: "2024-12-09",
    end: "2026-12-09",
    total: 1000000,
    realized: 629273.54,
    balance: 528768.54,
  },
];

const state = {
  projects: loadProjects(),
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
  filteredCount: document.querySelector("#filteredCount"),
  form: document.querySelector("#projectForm"),
  funderFilter: document.querySelector("#funderFilter"),
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

function getFilteredProjects() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const unit = elements.unitFilter.value;
  const funder = elements.funderFilter.value;

  return state.projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => {
      const searchableText = [
        project.id,
        project.title,
        project.unit,
        project.coordinator,
        project.instrument,
        project.funder,
      ]
        .join(" ")
        .toLowerCase();

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
  const units = [...new Set(state.projects.map((project) => project.unit).filter(Boolean))].sort();
  const funders = [...new Set(state.projects.map((project) => project.funder).filter(Boolean))].sort();

  updateSelectFilter(elements.unitFilter, units);
  updateSelectFilter(elements.funderFilter, funders);
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

  elements.totalProjects.textContent = filteredProjects.length;
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
    row.innerHTML = '<td colspan="12">Nenhum projeto encontrado.</td>';
    elements.projectRows.append(row);
  }

  filteredProjects.forEach(({ project, index }) => {
    const row = document.createElement("tr");
    const balanceClass = Number(project.balance) < 0 ? "balance-negative" : "balance-positive";

    row.innerHTML = `
      <td><span class="project-code">${escapeHtml(project.id)}</span></td>
      <td class="project-title"><span>${escapeHtml(project.title)}</span></td>
      <td><span class="unit-badge">${escapeHtml(project.unit)}</span></td>
      <td class="coordinator-cell"><span class="cell-clamp">${escapeHtml(project.coordinator)}</span></td>
      <td class="instrument-cell"><span class="cell-clamp">${escapeHtml(project.instrument)}</span></td>
      <td class="funder-cell"><span class="cell-clamp">${escapeHtml(project.funder)}</span></td>
      <td class="date-cell">${formatDate(project.start)}</td>
      <td class="date-cell">${formatDate(project.end)}</td>
      <td class="money-cell">${brl.format(project.total)}</td>
      <td class="money-cell">${brl.format(project.realized)}</td>
      <td class="money-cell ${balanceClass}">${brl.format(project.balance)}</td>
      <td>
        <div class="actions">
          <button class="link-button" data-action="edit" data-index="${index}" type="button">Editar</button>
          <button class="link-button" data-action="delete" data-index="${index}" type="button">Excluir</button>
        </div>
      </td>
    `;

    elements.projectRows.append(row);
  });

  elements.filteredCount.textContent = `${filteredProjects.length} ${filteredProjects.length === 1 ? "projeto encontrado" : "projetos encontrados"}`;
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
    "Título",
    "Coordenação",
    "Coordenador",
    "Instrumento",
    "Financiador",
    "Início",
    "Fim",
    "Total",
    "Realizado",
    "Saldo",
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

render();
