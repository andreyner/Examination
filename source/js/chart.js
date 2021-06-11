const rowInput = document.querySelector(`.form__row-count`);
const columnInput = document.querySelector(`.form__column-count`);
const coordinateTable = document.querySelector(`.coordinate-table`);
const cellTemplate = document.querySelector(`#coordinate-table-data`).content.querySelector(`.coordinate-table__cell`);
const cellTitleTemplate = document.querySelector(`#coordinate-table-data`).content.querySelector(`.coordinate-table__title`);
const radioItems = document.querySelectorAll(`.tabs__element-radio`);
const tabsItems = document.querySelectorAll(`.tabs__item`);

let chart = [];
(function initializationRun() {
  columnInput.addEventListener('change', drowTable);
  rowInput.addEventListener('change', drowTable);
  radioItems.forEach(element => {
    element.addEventListener('change', hideTab);
  });
}
)();

function hideTab() {
  for (let i = 0; i < radioItems.length; i++) {
    if (radioItems[i].checked) {
      tabsItems[i].classList.remove('visually-hidden')
    }
    else {
      tabsItems[i].classList.add('visually-hidden')
    }
  }
}

function drowTable() {
  let newRow = rowInput.value - coordinateTable.rows.length + 1;
  let newCell = columnInput.value - coordinateTable.rows[coordinateTable.rows.length - 1].cells.length + 1;
  if (Math.abs(newRow) > 0) {
    for (let i = 0; i < Math.abs(newRow); i++) {
      if (newRow > 0) {
        addRowTable();
      }
      else {
        removeRowTable();
      }
    }
  }
  if (Math.abs(newCell) > 0) {
    for (let i = 0; i < Math.abs(newCell); i++) {
      if (newCell > 0) {
        addColumnTable();
      }
      else {
        removeColumnTable();
      }
    }
  }
  reDrowTable();
}
function reDrowTable() {
  fillChartArray();
  google.charts.setOnLoadCallback(drawChart);
}
const transpose = matrix => matrix[0].map((col, i) => matrix.map(row => row[i]));
function fillChartArray() {
  for (let i = 0; i < coordinateTable.rows.length; i++) {
    chart[i] = [];
    for (let j = 0; j < coordinateTable.rows[i].cells.length; j++) {
      if (j == 0 || i == 0) {
        chart[i].push(coordinateTable.rows[i].cells[j].textContent.trim());
      }
      else {
        chart[i].push(parseInt(coordinateTable.rows[i].cells[j].children[0].value))
      }
    }
  }
}
function addRowTable() {
  let tableRow = document.createElement('tr');
  for (let j = 0; j < coordinateTable.rows[coordinateTable.rows.length - 1].cells.length; j++) {
    if (j === 0) {
      let tableCell = cellTitleTemplate.cloneNode(true);
      tableCell.textContent = `День ${coordinateTable.rows.length}`;
      tableRow.appendChild(tableCell);
    }
    else {
      let tableCell = cellTemplate.cloneNode(true);
      tableCell.children[0].addEventListener('input', reDrowTable);
      tableRow.appendChild(tableCell);
    }
  }
  coordinateTable.appendChild(tableRow);
}
function addColumnTable() {
  for (let j = 0; j < coordinateTable.rows.length; j++) {
    if (j == 0) {
      let tableCell = cellTitleTemplate.cloneNode(true);
      tableCell.textContent = `Час ${coordinateTable.rows[0].cells.length}`;
      coordinateTable.rows[j].appendChild(tableCell);
    }
    else {
      let tableCell = cellTemplate.cloneNode(true);
      tableCell.children[0].addEventListener('input', reDrowTable);
      coordinateTable.rows[j].appendChild(tableCell);
    }
  }
}
function removeRowTable() {
  coordinateTable.rows[coordinateTable.rows.length - 1].remove();
}
function removeColumnTable() {
  for (let j = 0; j < coordinateTable.rows.length; j++) {
    coordinateTable.rows[j].cells[coordinateTable.rows[j].cells.length - 1].remove()
  }
}

google.charts.load('current', { 'packages': ['corechart'] });

function drawChart() {
  var data = google.visualization.arrayToDataTable(transpose(chart));

  var options = {
    title: 'Анализатор погоды',
    hAxis: { title: 'Время', titleTextStyle: { color: '#333' } },
    vAxis: { title: 'Температура', minValue: 0 }
  };

  let chartObject = new google.visualization.AreaChart(document.querySelector('.drow-area__graph'));
  chartObject.draw(data, options);
}
