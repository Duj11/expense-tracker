const table = document.querySelector(".table");
const total = document.querySelector(".total")
const pageWrapper = document.querySelector(".page-wrapper")
const reportWindow = document.querySelector(".report-window")
const dialogPageWrapper = document.querySelector(".false-page-wrapper");
const buttons = document.querySelectorAll("button")
const addRecordBtn = document.querySelector(".btn");
const reportBtn = document.querySelector(".report")
const themeBtn = document.querySelector(".toggle-theme");
let expenseData = JSON.parse(localStorage.getItem("expenseData")) || [];
let tableRows = [];
let toggle = false;
let id = 0;
let totalAmount = 0;
let previousAmounts = []

// manage pesistent theme -----------------------------------------------
function applyTheme(isDark) {
  pageWrapper.style.backgroundColor = isDark ? "#8B9A9F" : "whitesmoke";
  dialogPageWrapper.style.backgroundColor = isDark ? "#8B949E" : "white";
  
  buttons.forEach((btn) => {
    if(btn.classList.contains("icon-btn")) {
      btn.style.color = isDark ? "whitesmoke" : "darkgrey";
    } else {
        btn.style.backgroundColor = isDark ? "whitesmoke" : "#C9D1D9"; 
    }
  });
}

// manage localStorage before anything else ------------------------------ 
toggle = localStorage.getItem("theme") === "dark";
applyTheme(toggle);
 
themeBtn.addEventListener("click", () => {
  toggle = !toggle;
  applyTheme(toggle);
  localStorage.setItem("theme", toggle ? "dark" : "light");
});

function restoreFromStorage(){
    if (!expenseData.length){
        return;
    }
    expenseData.forEach((entry) => {
        const newDataRow = document.createElement("tr");
        newDataRow.setAttribute("id", String(entry.id));
        newDataRow.innerHTML = `
        <td><button class="btn">+</button></td>
        <td><textarea class="reason" name="reason">${entry.reason || ""}</textarea></td>
        <td><textarea class="amount" name="amount">${entry.amount || ""}</textarea></td>
        <td><input type="date" class="date" name="date" value="${entry.date || ""}"></td>
        <td><textarea class="season" name="season">${entry.season || ""}</textarea></td>`;
        table.appendChild(newDataRow);
        tableRows.push(newDataRow);
        //recalculate total amount and id counter
        if (entry.amount) {
        previousAmounts[entry.id] = entry.amount;
        totalAmount += entry.amount;
        }
        if (entry.id >= id){
            id=entry.id + 1
        }
    })
    total.textContent = `${totalAmount} birr`;
    const newBtn = document.querySelectorAll(".btn");
    newBtn.forEach((btn) => {
      if (btn !== newBtn[newBtn.length - 1]) {
        btn.style.display = "none";
      }
    });
}

restoreFromStorage();

// handle row creation ------------------------------------------------
function addNewRow(event){
    if(event.classList.contains("btn")){
        const newDataRow = document.createElement("tr");
        newDataRow.setAttribute("id", `${id}`)
        newDataRow.innerHTML = `<td><button class="btn icon-btn">
                                  <svg viewBox="0 0 24 24" width="24" height="24">
                                    <line x1="12" y1="5" x2="12" y2="19" stroke-width="2" stroke-linecap="round"/>
                                    <line x1="5" y1="12" x2="19" y2="12" stroke-width="2" stroke-linecap="round"/>
                                  </svg>
                                </button></td>
                                <td><textarea class="reason" name="reason"></textarea></td>
                                <td><textarea class="amount" name="amount" pattern="[0-9]+"></textarea></td>
                                <td><input type="date" class="date" name="date"></textarea></td>
                                <td><textarea class="season" name="season"></textarea></td>`
        table.appendChild(newDataRow);
        id++;
        tableRows.push(newDataRow);
        const newBtn = document.querySelectorAll(".btn");
        newBtn.forEach((btn) => {
            if(btn != newBtn[newBtn.length-1]){
                btn.style.display = "none"
            }
        })
    }

}

table.addEventListener("click", (event) => {
    const button = event.target.closest(".icon-btn");
    addNewRow(button)
})

table.addEventListener("change", (event) => {
    const changedRow = event.target.parentNode.parentNode;
    const rowId = parseInt(changedRow.getAttribute("id")) ;
    let newValue = parseInt(changedRow.children[2].children[0].value);
    let previousValue = previousAmounts[rowId];

    //if there exists no previous record, make one
    let entry = expenseData.find((item) => item.id === rowId);
    if (!entry) {
        entry = { id: rowId, reason: "", amount: 0, date: "", season: "" };
        expenseData.push(entry);
    }
    
    //check if there existed a value for that input field before the change
    if (event.target.classList.contains("amount")) {
        // Preserve the original delta logic exactly
        let newValue = parseInt(event.target.value);
        let previousValue = previousAmounts[rowId];

        if (previousValue) {
        //initially, it checks if the input value is a number or not
        //while its a number, perform comparission to determine the new total value
        //if its not a number, decrease the previous value from the total as its no longer a number
        totalAmount += Number(newValue)
            ? previousValue > newValue
            ? -(previousValue - newValue)
            : previousValue === newValue
            ? 0
            : newValue
            : -previousValue;
        previousAmounts[rowId] = newValue;
        } else {
        totalAmount += Number(newValue) ? newValue : 0;
        previousAmounts[rowId] = newValue;
        }

        entry.amount = Number(newValue) ? newValue : 0;
        total.textContent = `${totalAmount} birr`;

    } else if (event.target.classList.contains("reason")) {
        entry.reason = event.target.value;

    } else if (event.target.classList.contains("date")) {
        entry.date = event.target.value;

    } else if (event.target.classList.contains("season")) {
        entry.season = event.target.value;
    }

    localStorage.setItem("expenseData", JSON.stringify(expenseData));
})

//dynamic input field width based on users input
table.addEventListener("input", (event) => {
    // event.target.style.height = "auto";
    event.target.style.height = event.target.scrollHeight + "px";
})

//for report ----------------------------------------------------
function getDateCutoff(period) {
  const now = new Date();
  if (period === "week")  return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (period === "month") return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  if (period === "year")  return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return null; // all time — no cutoff
}

function filterByPeriod(period) {
  const cutoff = getDateCutoff(period);
  if (!cutoff) return expenseData;
  return expenseData.filter(
    (entry) => entry.date && new Date(entry.date) >= cutoff
  );
}

function updateTotalSection(period) {
  const filtered = filterByPeriod(period);
  const sum = filtered.reduce((acc, entry) => acc + (entry.amount || 0), 0);
  total.textContent = `${sum} birr`;
}

function updateTopItems(period) {
  const filtered = filterByPeriod(period);
  const sorted = [...filtered]
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const itemExpEl = document.querySelector(".item-expenditure");
  const itemBtnsEl = itemExpEl.querySelector(".item-buttons");

  // clear previous list everytime the report is open
  while (itemBtnsEl.nextSibling) {
    itemExpEl.removeChild(itemBtnsEl.nextSibling);
  }

  if (!sorted.length) {
    // itemExpEl.innerHTML += "<p>No data for this period</p>"
    itemExpEl.insertAdjacentHTML("beforeend", "<p>No data for this period</p>");
    return;
  }

  sorted.forEach((entry, i) => {
    // itemExpEl.innerHTML += `<p>${entry.reason || "(-)"}<span style="float: right;">${entry.amount}</span></p>${i < sorted.length - 1 ? "<hr>" : ""}`
    itemExpEl.insertAdjacentHTML(
      "beforeend",
      `<p>${entry.reason || "(-)"}<span style="float: right;">${entry.amount}</span></p>${
        i < sorted.length - 1 ? "<hr>" : ""}`
    );
  });
}

function updateSeasonalSection() {

  const seasons = ["fall", "winter", "spring", "summer"];
  const detailsEls = document.querySelectorAll(".seasonal-expenditure details");

  detailsEls.forEach((detail, i) => {
    const seasonName = seasons[i];
    const entries = expenseData.filter(
      (entry) => entry.season && entry.season.trim().toLowerCase() === seasonName
    );

    // clear previous details 
    const summary = detail.querySelector("summary");
    while (summary.nextSibling) {
      detail.removeChild(summary.nextSibling);
    }

    if (!entries.length) {
      detail.insertAdjacentHTML("beforeend", "<p>No entries</p>");
      return;
    }

    entries.forEach((entry) => {
      detail.insertAdjacentHTML(
        "beforeend",
        `<p>${entry.reason || "(-)"}<span style="float: right;">${entry.amount || 0}</span></p><hr>`
      );
    });
  });
}

reportBtn.addEventListener("click", () => {
    updateTotalSection("all");
    updateTopItems("all");
    updateSeasonalSection();
    reportWindow.showModal();
})

reportWindow.addEventListener("click", (event) => {
    if(event.target.classList.contains("report-window")){
        reportWindow.close();
    }
})

// reporting for total expenditure -------------------------------
document.querySelector(".total-expenditure .week-btn").addEventListener("click", () => updateTotalSection("week"));
document.querySelector(".total-expenditure .month-btn").addEventListener("click", () => updateTotalSection("month"));
document.querySelector(".total-expenditure .year-btn").addEventListener("click", () => updateTotalSection("year"));
document.querySelector(".total-expenditure .all-time-btn").addEventListener("click", () => updateTotalSection("all"));

//reporting top items --------------------------------------------
document.querySelector(".item-expenditure .week-btn").addEventListener("click", () => updateTopItems("week"));
document.querySelector(".item-expenditure .month-btn").addEventListener("click", () => updateTopItems("month"));
document.querySelector(".item-expenditure .year-btn").addEventListener("click", () => updateTopItems("year"));
document.querySelector(".item-expenditure .all-time-btn").addEventListener("click", () => updateTopItems("all"));

