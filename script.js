let candidates = JSON.parse(localStorage.getItem("candidates") || "[]");
let contracts = JSON.parse(localStorage.getItem("contracts") || "[]");
const app = document.getElementById("app");
const candidateTable = document.getElementById("candidateTable");
const contractTable = document.getElementById("contractTable");
let atsPage = 1,
  contractPage = 1;
const perPage = 10;
function save() {
  localStorage.setItem("candidates", JSON.stringify(candidates));
  localStorage.setItem("contracts", JSON.stringify(contracts));
  updateDashboard();
}
function now() {
  return new Date().toLocaleString("id-ID");
}
function loading(fn) {
  app.classList.add("loading");
  setTimeout(() => {
    fn();
    app.classList.remove("loading");
  }, 300);
}
function updateDashboard() {
  dTotal.textContent = candidates.length;
  dApply.textContent = candidates.filter((c) => c.status === "Apply").length;
  dInterview.textContent = candidates.filter(
    (c) => c.status === "Interview"
  ).length;
  dLolos.textContent = candidates.filter((c) => c.status === "Lolos").length;
  const today = new Date();
  dKontrak.textContent = contracts.filter(
    (c) => Math.ceil((new Date(c.end) - today) / 86400000) <= 30
  ).length;
}
function addCandidate() {
  loading(() => {
    if (!cNama.value || !cTelp.value || !cPosisi.value)
      return alert("Lengkapi data");
    candidates.unshift({
      nama: cNama.value,
      telp: cTelp.value,
      posisi: cPosisi.value,
      penempatan: cPenempatan.value,
      status: cStatus.value,
      updated: now(),
    });
    cNama.value = cTelp.value = cPosisi.value = cPenempatan.value = "";
    cStatus.value = "Apply";
    save();
    atsPage = 1;
    renderCandidates();
  });
}
function applyFilter() {
  atsPage = 1;
  renderCandidates();
}
function updateStatus(i, v) {
  loading(() => {
    const d = candidates[i];
    d.status = v;
    d.updated = now();
    candidates.splice(i, 1);
    candidates.unshift(d);
    save();
    atsPage = 1;
    renderCandidates();
  });
}
function removeCandidate(i) {
  loading(() => {
    candidates.splice(i, 1);
    save();
    renderCandidates();
  });
}
function renderCandidates() {
  let list = [...candidates];
  const k = searchATS.value.toLowerCase(),
    s = filterStatus.value;
  list = list.filter(
    (c) =>
      (c.nama.toLowerCase().includes(k) ||
        c.posisi.toLowerCase().includes(k) ||
        (c.penempatan || "").toLowerCase().includes(k)) &&
      (s ? c.status === s : 1)
  );
  const start = (atsPage - 1) * perPage;
  const page = list.slice(start, start + perPage);
  candidateTable.innerHTML = "";
  page.forEach((c) => {
    const i = candidates.indexOf(c);
    candidateTable.innerHTML += `<tr><td>${c.nama}</td><td>${c.telp}</td><td>${
      c.posisi
    }</td><td>${
      c.penempatan || "-"
    }</td><td><select onchange="updateStatus(${i},this.value)"><option ${
      c.status === "Apply" ? "selected" : ""
    }>Apply</option><option ${
      c.status === "Interview" ? "selected" : ""
    }>Interview</option><option ${
      c.status === "Lolos" ? "selected" : ""
    }>Lolos</option><option ${
      c.status === "Tidak" ? "selected" : ""
    }>Tidak</option></select></td><td>${
      c.updated
    }</td><td><button onclick="removeCandidate(${i})">Hapus</button></td></tr>`;
  });
  renderPagination(list.length, atsPage, "atsPagination", (p) => {
    atsPage = p;
    renderCandidates();
  });
}
function addContract() {
  loading(() => {
    if (!kNama.value || !kTelp.value || !kEnd.value)
      return alert("Lengkapi data");
    contracts.unshift({
      nama: kNama.value,
      telp: kTelp.value,
      posisi: kPosisi.value,
      penempatan: kPenempatan.value,
      end: kEnd.value,
      updated: now(),
    });
    kNama.value =
      kTelp.value =
      kPosisi.value =
      kPenempatan.value =
      kEnd.value =
        "";
    save();
    contractPage = 1;
    renderContracts();
  });
}
function removeContract(i) {
  loading(() => {
    contracts.splice(i, 1);
    save();
    renderContracts();
  });
}
function editContract(index) {
  loading(() => {
    const old = contracts[index].end;
    const input = prompt("Masukkan tanggal kontrak baru (YYYY-MM-DD)", old);
    if (!input) return;

    contracts[index].end = input;
    contracts[index].updated = now();

    const d = contracts.splice(index, 1)[0];
    contracts.unshift(d);

    save();
    contractPage = 1;
    renderContracts();
  });
}

function renderContracts() {
  const today = new Date();
  const start = (contractPage - 1) * perPage;
  const page = contracts.slice(start, start + perPage);
  contractTable.innerHTML = "";

  page.forEach((c, idx) => {
    const diff = Math.ceil((new Date(c.end) - today) / 86400000);
    let cls = "",
      st = "Aman";
    if (diff <= 30) {
      cls = "red";
      st = "≤30 hari";
    } else if (diff <= 60) {
      cls = "yellow";
      st = "≤60 hari";
    }

    contractTable.innerHTML += `
      <tr class="${cls}">
        <td>${c.nama}</td>
        <td>${c.telp}</td>
        <td>${c.posisi || "-"}</td>
        <td>${c.penempatan || "-"}</td>
        <td>${c.end}</td>
        <td>${st}</td>
        <td>${c.updated}</td>
        <td>
          <div class="action-btn">
            <button onclick="editContract(${start + idx})">Edit</button>
            <button onclick="removeContract(${start + idx})">Hapus</button>
          </div>
        </td>
      </tr>`;
  });

  renderPagination(
    contracts.length,
    contractPage,
    "contractPagination",
    (p) => {
      contractPage = p;
      renderContracts();
    }
  );
}

function renderPagination(total, page, el, cb) {
  const pages = Math.ceil(total / perPage);
  const wrap = document.getElementById(el);
  wrap.innerHTML = "";
  for (let i = 1; i <= pages; i++) {
    const b = document.createElement("button");
    b.textContent = i;
    if (i === page) b.classList.add("active");
    b.onclick = () => cb(i);
    wrap.appendChild(b);
  }
}

let editIndex = null;

function openEditContract(i) {
  editIndex = i;
  editNama.textContent = contracts[i].nama;
  editEnd.value = contracts[i].end;
  editModal.classList.add("show");
}

function closeModal() {
  editModal.classList.remove("show");
  editIndex = null;
}

function saveEditContract() {
  if (!editEnd.value) return alert("Tanggal tidak boleh kosong");

  loading(() => {
    contracts[editIndex].end = editEnd.value;
    contracts[editIndex].updated = now();

    const d = contracts.splice(editIndex, 1)[0];
    contracts.unshift(d);

    save();
    contractPage = 1;
    renderContracts();
    closeModal();
  });
}

renderCandidates();
renderContracts();
updateDashboard();
