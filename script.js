const USERS = [
  {login:"admin", password:"12345", name:"Admin", role:"Administrator"},
  {login:"direktor", password:"12345", name:"Direktor", role:"Direktor"}
];

let currentUser = null;
let students = JSON.parse(localStorage.getItem("crm_students")) || [];
let teachers = JSON.parse(localStorage.getItem("crm_teachers")) || [];

function save(){
  localStorage.setItem("crm_students", JSON.stringify(students));
  localStorage.setItem("crm_teachers", JSON.stringify(teachers));
}

function loginUser(){
  const login = document.getElementById("login").value.trim();
  const password = document.getElementById("password").value.trim();
  const user = USERS.find(u => u.login === login && u.password === password);

  if(!user){
    loginError.textContent = "Login yoki parol noto'g'ri!";
    return;
  }

  currentUser = user;
  loginPage.classList.add("hidden");
  app.classList.remove("hidden");

  profileName.textContent = user.name;
  profileRole.textContent = user.role;
  avatarLetter.textContent = user.name[0];
  panelTitle.textContent = user.role + " Panel";

  showPage("dashboard");
}

function logoutUser(){
  app.classList.add("hidden");
  loginPage.classList.remove("hidden");
}

function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  updateDashboard();
  renderStudents();
  renderTeachers();
  renderReports();
}

studentForm.addEventListener("submit", e => {
  e.preventDefault();
  students.push({
    name:sName.value.trim(),
    surname:sSurname.value.trim(),
    cls:sClass.value.trim(),
    phone:sPhone.value.trim(),
    status:sStatus.value,
    date:new Date().toLocaleDateString("uz-UZ")
  });
  save();
  studentForm.reset();
  showPage("students");
});

teacherForm.addEventListener("submit", e => {
  e.preventDefault();
  teachers.push({
    name:tName.value.trim(),
    subject:tSubject.value.trim(),
    phone:tPhone.value.trim()
  });
  save();
  teacherForm.reset();
  showPage("teachers");
});

function renderStudents(){
  if(!studentList) return;

  const q = (studentSearch?.value || "").toLowerCase();
  const f = studentFilter?.value || "all";

  const data = students.filter(s =>
    (f === "all" || s.status === f) &&
    (s.name.toLowerCase().includes(q) ||
     s.surname.toLowerCase().includes(q) ||
     s.cls.toLowerCase().includes(q))
  );

  studentList.innerHTML = data.length ? data.map((s,i)=>`
    <tr>
      <td>${s.name}</td>
      <td>${s.surname}</td>
      <td>${s.cls}</td>
      <td>${s.phone}</td>
      <td><span class="${s.status === "Aktiv" ? "active" : "inactive"}">${s.status}</span></td>
      <td><button class="delete" onclick="deleteStudent(${i})">O'chirish</button></td>
    </tr>
  `).join("") : `<tr><td colspan="6">Ma'lumot yo'q</td></tr>`;
}

function renderTeachers(){
  if(!teacherList) return;

  const q = (teacherSearch?.value || "").toLowerCase();
  const data = teachers.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.subject.toLowerCase().includes(q)
  );

  teacherList.innerHTML = data.length ? data.map((t,i)=>`
    <tr>
      <td>${t.name}</td>
      <td>${t.subject}</td>
      <td>${t.phone}</td>
      <td><button class="delete" onclick="deleteTeacher(${i})">O'chirish</button></td>
    </tr>
  `).join("") : `<tr><td colspan="4">Ma'lumot yo'q</td></tr>`;
}

function deleteStudent(i){
  if(confirm("O'quvchi o'chirilsinmi?")){
    students.splice(i,1);
    save();
    renderStudents();
    updateDashboard();
  }
}

function deleteTeacher(i){
  if(confirm("O'qituvchi o'chirilsinmi?")){
    teachers.splice(i,1);
    save();
    renderTeachers();
    updateDashboard();
  }
}

function updateDashboard(){
  const active = students.filter(s => s.status === "Aktiv").length;
  const inactive = students.filter(s => s.status === "No Aktiv").length;
  const classes = [...new Set(students.map(s => s.cls))];

  totalStudents.textContent = students.length;
  totalTeachers.textContent = teachers.length;
  activeStudents.textContent = active;
  inactiveStudents.textContent = inactive;

  dirStudents.textContent = students.length;
  dirTeachers.textContent = teachers.length;
  dirClasses.textContent = classes.length;
  dirPercent.textContent = students.length ? Math.round(active * 100 / students.length) + "%" : "0%";

  dateTime.textContent = new Date().toLocaleString("uz-UZ");

  drawChart(active, inactive, teachers.length);
}

function drawChart(active, inactive, teacherCount){
  const canvas = document.getElementById("mainChart");
  if(!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,700,260);

  const items = [
    ["Aktiv", active],
    ["No Aktiv", inactive],
    ["O'qituvchi", teacherCount]
  ];

  items.forEach((item, i)=>{
    const x = 80 + i * 190;
    const h = item[1] * 35 + 20;
    ctx.fillRect(x, 220 - h, 90, h);
    ctx.fillText(item[0], x, 245);
    ctx.fillText(item[1], x + 35, 210 - h);
  });
}

function renderReports(){
  if(!reportBox) return;
  reportBox.innerHTML = `
    <h2>Umumiy hisobot</h2>
    <p>Jami o'quvchilar: <b>${students.length}</b></p>
    <p>Jami o'qituvchilar: <b>${teachers.length}</b></p>
    <p>Aktiv o'quvchilar: <b>${students.filter(s=>s.status==="Aktiv").length}</b></p>
    <p>No Aktiv: <b>${students.filter(s=>s.status==="No Aktiv").length}</b></p>
  `;
}

function exportCSV(){
  let csv = "Ism,Familiya,Sinf,Telefon,Status\n";
  students.forEach(s => {
    csv += `${s.name},${s.surname},${s.cls},${s.phone},${s.status}\n`;
  });

  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "oquvchilar.csv";
  a.click();
}

function importCSV(e){
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = function(){
    const lines = reader.result.split("\n").slice(1);
    lines.forEach(line => {
      const [name,surname,cls,phone,status] = line.split(",");
      if(name) students.push({name,surname,cls,phone,status:status || "Aktiv"});
    });
    save();
    showPage("students");
  };
  reader.readAsText(file);
}

function setTheme(theme){
  document.body.className = theme === "dark" ? "dark" : "";
  localStorage.setItem("theme", theme);
}

if(localStorage.getItem("theme") === "dark"){
  document.body.className = "dark";
}

setInterval(updateDashboard,1000);
