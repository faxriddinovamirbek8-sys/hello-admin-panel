let ADMIN_LOGIN = localStorage.getItem("admin_login") || "admin";
let ADMIN_PASSWORD = localStorage.getItem("admin_password") || "12345";

function formatMoney(value){
  let number = Number(value || 0);
  return number.toLocaleString("uz-UZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " so'm";
}

let students = JSON.parse(localStorage.getItem("students_payment")) || [];

const loginPage = document.getElementById("loginPage");
const app = document.getElementById("app");
const form = document.getElementById("studentForm");
const saveBtn = document.getElementById("saveBtn");

function loginAdmin(){
  const login = document.getElementById("login").value.trim();
  const password = document.getElementById("password").value.trim();

  if(login === ADMIN_LOGIN && password === ADMIN_PASSWORD){
    loginPage.classList.add("hidden");
    app.classList.remove("hidden");
    showPage("dashboard");
  }else{
    document.getElementById("loginError").textContent = "Login yoki parol noto'g'ri!";
  }
}

function logoutAdmin(){
  app.classList.add("hidden");
  loginPage.classList.remove("hidden");
}

function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  showStudents();
  showDebtors();
  updateDashboard();
}

function save(){
  localStorage.setItem("students_payment", JSON.stringify(students));
}

function updateDashboard(){
  document.getElementById("totalStudents").textContent = students.length;

  const paid = students.filter(s => s.tolovStatus === "Tolangan");
  const unpaid = students.filter(s => s.tolovStatus === "Tolanmagan");

  const totalPayment = students.reduce((sum, s) => sum + Number(s.oylikTolov || 0), 0);
  const paidMoney = paid.reduce((sum, s) => sum + Number(s.oylikTolov || 0), 0);
  const debtMoney = unpaid.reduce((sum, s) => sum + Number(s.oylikTolov || 0), 0);

  document.getElementById("paidStudents").textContent = paid.length;
  document.getElementById("unpaidStudents").textContent = unpaid.length;

  const active = students.filter(s => s.status === "Aktiv").length;
  const inactive = students.filter(s => s.status === "No Aktiv").length;

  document.getElementById("activeStudents").textContent = active;
  document.getElementById("inactiveStudents").textContent = inactive;
  document.getElementById("totalPayment").textContent = formatMoney(totalPayment);
  document.getElementById("paidMoney").textContent = formatMoney(paidMoney);
  document.getElementById("debtMoney").textContent = formatMoney(debtMoney);

  let lastStudent = document.getElementById("lastStudent");

  if(lastStudent){
    if(students.length > 0){
      let last = students[students.length - 1];
      lastStudent.textContent = last.ism + " " + last.familiya;
    }else{
      lastStudent.textContent = "Yo'q";
    }
  }

  let paidPercentValue = students.length ? Math.round((paid.length * 100) / students.length) : 0;

  let paidProgress = document.getElementById("paidProgress");
  let paidPercent = document.getElementById("paidPercent");

  if(paidProgress){
    paidProgress.style.width = paidPercentValue + "%";
  }

  if(paidPercent){
    paidPercent.textContent = paidPercentValue + "%";
  }

  const now = new Date();
  document.getElementById("dateTime").textContent =
    now.toLocaleDateString("uz-UZ") + " | " + now.toLocaleTimeString("uz-UZ",{hour:"2-digit",minute:"2-digit"});
}

function showStudents(data = students){
  const tbody = document.getElementById("studentList");
  tbody.innerHTML = "";

  if(data.length === 0){
    tbody.innerHTML = `<tr><td colspan="7">Hozircha o'quvchi yo'q</td></tr>`;
    updateDashboard();
    return;
  }

  data.forEach((s, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${s.ism}</td>
        <td>${s.familiya}</td>
        <td>${s.sinf}</td>
        <td>${s.telefon}</td>
        <td>${formatMoney(s.oylikTolov)}</td>
        <td>
          ${
            s.status === "Aktiv"
            ? '<span class="active-badge">Aktiv</span>'
            : '<span class="inactive-badge">No Aktiv</span>'
          }
        </td>
        <td>
          ${
            s.tolovStatus === "Tolangan"
            ? '<span class="paid">To\'langan</span>'
            : '<span class="unpaid">To\'lanmagan</span>'
          }
        </td>
        <td>
          <button class="edit" onclick="editStudent(${index})">Tahrirlash</button>
          <button class="delete" onclick="deleteStudent(${index})">O'chirish</button>
        </td>
      </tr>
    `;
  });

  updateDashboard();
}

function showDebtors(){
  const tbody = document.getElementById("debtorList");
  const debtors = students.filter(s => s.tolovStatus === "Tolanmagan");

  tbody.innerHTML = "";

  if(debtors.length === 0){
    tbody.innerHTML = `<tr><td colspan="5">Qarzdor o'quvchilar yo'q</td></tr>`;
    return;
  }

  debtors.forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td>${s.ism}</td>
        <td>${s.familiya}</td>
        <td>${s.sinf}</td>
        <td>${s.telefon}</td>
        <td>${formatMoney(s.oylikTolov)}</td>
      </tr>
    `;
  });
}

form.addEventListener("submit", function(e){
  e.preventDefault();

  const editIndex = document.getElementById("editIndex").value;

  const student = {
    ism: document.getElementById("ism").value.trim(),
    familiya: document.getElementById("familiya").value.trim(),
    sinf: document.getElementById("sinf").value.trim(),
    telefon: document.getElementById("telefon").value.trim(),
    oylikTolov: document.getElementById("oylikTolov").value.trim(),
    status: document.getElementById("status").value,
    tolovStatus: document.getElementById("tolovStatus").value
  };

  if(editIndex === ""){
    students.push(student);
  }else{
    students[editIndex] = student;
    document.getElementById("editIndex").value = "";
    saveBtn.textContent = "O'quvchi qo'shish";
  }

  save();
  form.reset();
  showStudents();
  showDebtors();
  updateDashboard();
});

function editStudent(index){
  const s = students[index];

  document.getElementById("ism").value = s.ism;
  document.getElementById("familiya").value = s.familiya;
  document.getElementById("sinf").value = s.sinf;
  document.getElementById("telefon").value = s.telefon;
  document.getElementById("oylikTolov").value = s.oylikTolov;
  document.getElementById("status").value = s.status || "Aktiv";
  document.getElementById("tolovStatus").value = s.tolovStatus;
  document.getElementById("editIndex").value = index;

  saveBtn.textContent = "Saqlash";
  showPage("students");
}

function deleteStudent(index){
  if(confirm("O'chirmoqchimisiz?")){
    students.splice(index, 1);
    save();
    showStudents();
    showDebtors();
    updateDashboard();
  }
}

function clearAll(){
  if(confirm("Barcha ma'lumotlar o'chirilsinmi?")){
    students = [];
    save();
    showStudents();
    showDebtors();
    updateDashboard();
  }
}

function searchStudent(){
  const value = document.getElementById("search").value.toLowerCase();

  const result = students.filter(s =>
    s.ism.toLowerCase().includes(value) ||
    s.familiya.toLowerCase().includes(value) ||
    s.sinf.toLowerCase().includes(value) ||
    s.telefon.toLowerCase().includes(value) ||
    s.tolovStatus.toLowerCase().includes(value)
  );

  showStudents(result);
}

document.getElementById("search").addEventListener("input", searchStudent);

updateDashboard();
setInterval(updateDashboard,1000);





function changeAdminCredentials(){
  const newLogin = document.getElementById("newAdminLogin").value.trim();
  const newPassword = document.getElementById("newAdminPassword").value.trim();
  const repeatPassword = document.getElementById("repeatAdminPassword").value.trim();
  const message = document.getElementById("settingsMessage");

  if(newLogin.length < 3){
    message.textContent = "Login kamida 3 ta belgidan iborat bo'lishi kerak.";
    message.className = "error-msg";
    return;
  }

  if(newPassword.length < 4){
    message.textContent = "Parol kamida 4 ta belgidan iborat bo'lishi kerak.";
    message.className = "error-msg";
    return;
  }

  if(newPassword !== repeatPassword){
    message.textContent = "Parollar mos emas.";
    message.className = "error-msg";
    return;
  }

  localStorage.setItem("admin_login", newLogin);
  localStorage.setItem("admin_password", newPassword);

  ADMIN_LOGIN = newLogin;
  ADMIN_PASSWORD = newPassword;

  document.getElementById("newAdminLogin").value = "";
  document.getElementById("newAdminPassword").value = "";
  document.getElementById("repeatAdminPassword").value = "";

  message.textContent = "Login va parol muvaffaqiyatli o'zgartirildi.";
  message.className = "success-msg";
}
