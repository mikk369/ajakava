document.getElementById('addTrackButton').addEventListener('click', addTrackSection);

let trackCount = 0;

function addTrackSection() {
    trackCount++;
    const tracksContainer = document.getElementById('scheduleForm');

    const trackSection = document.createElement('div');
    trackSection.className = 'track-section';
    trackSection.innerHTML = `
        <h3>Rada ${trackCount}</h3>
        
        <label for="competitionClass${trackCount}">Võistlusklass:</label>
        <input type="text" id="competitionClass${trackCount}" name="competitionClass${trackCount}" required>
        
        <label for="buildTime${trackCount}">Raja ehitusaeg (minutites):</label>
        <input type="number" id="buildTime${trackCount}" name="buildTime${trackCount}" required>

        <label for="inspectionTime${trackCount}">Rajaga tutvumise aeg (minutites):</label>
        <input type="number" id="inspectionTime${trackCount}" name="inspectionTime${trackCount}" required>

        <label for="runTime${trackCount}">Ühe koera soorituse aeg (minutites):</label>
        <input type="number" id="runTime${trackCount}" name="runTime${trackCount}" required>

        <label for="group1_${trackCount}">XS võistlejate arv:</label>
        <input type="number" id="group1_${trackCount}" name="group1_${trackCount}" required>
        
        <label for="group2_${trackCount}">S võistlejate arv:</label>
        <input type="number" id="group2_${trackCount}" name="group2_${trackCount}" required>
        
        <label for="group3_${trackCount}">M võistlejate arv:</label>
        <input type="number" id="group3_${trackCount}" name="group3_${trackCount}" required>
        
        <label for="group4_${trackCount}">SL võistlejate arv:</label>
        <input type="number" id="group4_${trackCount}" name="group4_${trackCount}" required>
        
        <label for="group5_${trackCount}">L võistlejate arv:</label>
        <input type="number" id="group5_${trackCount}" name="group5_${trackCount}" required>
    `;

    tracksContainer.appendChild(trackSection);
}

function generateSchedule() {
    const scheduleContainer = document.getElementById('scheduleBody');
    scheduleContainer.innerHTML = ''; // Clear previous schedule

    let totalCompetitorsSum = 0;
    
    // Get the start time from the single input field
    const startTimeInput = document.getElementById("startTime").value;
    const startTime = new Date();

    
    const [startHours, startMinutes] = startTimeInput.split(':').map(Number);
    startTime.setHours(startHours);
    startTime.setMinutes(startMinutes);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    
    let currentTime = new Date(startTime.getTime());

    for (let i = 1; i <= trackCount; i++) {
        const competitionClass = document.getElementById(`competitionClass${i}`).value;
        const buildTime = parseInt(document.getElementById(`buildTime${i}`).value);
        const inspectionTime = parseInt(document.getElementById(`inspectionTime${i}`).value);
        const runTime = parseInt(document.getElementById(`runTime${i}`).value);

        const group1 = parseInt(document.getElementById(`group1_${i}`).value);
        const group2 = parseInt(document.getElementById(`group2_${i}`).value);
        const group3 = parseInt(document.getElementById(`group3_${i}`).value);
        const group4 = parseInt(document.getElementById(`group4_${i}`).value);
        const group5 = parseInt(document.getElementById(`group5_${i}`).value);

        const totalCompetitors = group1 + group2 + group3 + group4 + group5;

        totalCompetitorsSum += totalCompetitors 

        // Track construction
        addRow(scheduleContainer, currentTime, formatActivity(competitionClass, 'Raja ehitus'));
        currentTime.setMinutes(currentTime.getMinutes() + buildTime);

        // Track inspection
        addRow(scheduleContainer, currentTime, formatActivity(competitionClass, 'Rajaga tutvumine'));
        currentTime.setMinutes(currentTime.getMinutes() + inspectionTime);

        // First dog performance
        addRow(scheduleContainer, currentTime, formatActivity(competitionClass, 'Esimese koera sooritus algab'));

        // Last dog performance end
        currentTime.setMinutes(currentTime.getMinutes() + (totalCompetitors * runTime));
        addRow(scheduleContainer, currentTime, formatActivity(competitionClass, 'Viimase koera sooritus lõpeb'));
        addCompetitorsRow(scheduleContainer, howManyCompetitors(totalCompetitors, 'Võistlejaid kokku'));
    }
    addFooterRow(scheduleContainer, `Kokku ${totalCompetitorsSum} võistlejat`)
}

function addRow(tableBody, time, activity, trackType = null) {
    const row = document.createElement('tr');
    const timeCell = document.createElement('td');
    const activityCell = document.createElement('td');
    
    timeCell.textContent = time.toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' });
    activityCell.textContent = activity;
    
    row.appendChild(timeCell);
    row.appendChild(activityCell);
    
    tableBody.appendChild(row);
}

function formatActivity(competitionClass, activity) {
    return `${competitionClass} - ${activity}`
}

function howManyCompetitors(competitorCount, activity) {
    return `${activity}: ${competitorCount}`
}

function addCompetitorsRow(tableBody, activity) {
    const row = document.createElement('tr');
    const activityCell = document.createElement('td');
    
    activityCell.textContent = activity;
    activityCell.colSpan = 2;

    row.appendChild(activityCell);
    tableBody.appendChild(row);
}

function addFooterRow(tableBody, totalText) {
    const footerRow = document.createElement('tr');
    const footerCell = document.createElement('td');

    footerCell.textContent = totalText;
    footerCell.colSpan = 2;
    footerCell.style.fontWeight = 'bold';

    footerRow.appendChild(footerCell);
    tableBody.appendChild(footerRow);
}

function exportToPDF() {
    const table = document.getElementById('scheduleTable').outerHTML;
    const style = `<style>
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ccc; }
        tr:nth-child(even) { background-color: #d1d1d1; }
    </style>`;
    const win = window.open('', '', 'height=1000,width=1500');
    win.document.write('<html><head>');
    win.document.write('<title>Ajakava PDF</title>');
    win.document.write(style);
    win.document.write('</head><body>');
    win.document.write(table);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
}

function exportToExcel() {
    // Get the table data
    const table = document.getElementById('scheduleTable');
    const rows = table.querySelectorAll('tr');

    // Prepare the data for Excel
    const data = [];

    // Add the header row
    const headerRow = [];
    const headers = table.querySelectorAll('thead th');
    headers.forEach(header => {
        headerRow.push(header.textContent);
    });
    data.push(headerRow);

    // Add the table rows
    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            rowData.push(cell.textContent);
        });
        if (rowData.length > 0) {
            data.push(rowData);
        }
    });

    // Create a new workbook and add the data to a sheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Ajakava');

    // Export the workbook as an Excel file
    XLSX.writeFile(wb, 'Ajakava.xlsx');
}