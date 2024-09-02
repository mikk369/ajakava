document.getElementById('addTrackButton').addEventListener('click', addTrackSection);

let trackCount = 0;

function addTrackSection() {
    trackCount++;
    const tracksContainer = document.getElementById('scheduleForm');

    const trackSection = document.createElement('div');
    trackSection.className = 'track-section';
    trackSection.innerHTML = `
        <h3>Rada ${trackCount}</h3>

        <label for="trackType${trackCount}">Raja tüüp:</label>
        <input type="text" id="trackType${trackCount}" name="trackType${trackCount}" required>
        
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
        const trackType = document.getElementById(`trackType${i}`).value;
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


        // Add header row for this track
        // addHeaderRow(scheduleContainer, "Raja Tüüp:" + " " + trackType);

        // Track construction
        addRow(scheduleContainer, currentTime, formatActivity(competitionClass, trackType, 'Raja ehitus'));
        currentTime.setMinutes(currentTime.getMinutes() + buildTime);

        // Track inspection
        addRow(scheduleContainer, currentTime, formatActivity(competitionClass, trackType, 'Rajaga tutvumine'));
        currentTime.setMinutes(currentTime.getMinutes() + inspectionTime);

        // First dog performance
        addRow(scheduleContainer, currentTime, formatActivity(competitionClass, trackType, 'Esimese koera sooritus algab'));

        // Last dog performance end
        currentTime.setMinutes(currentTime.getMinutes() + (totalCompetitors * runTime));
        addRow(scheduleContainer, currentTime, formatActivity(competitionClass, trackType, 'Viimase koera sooritus lõpeb'));
    }
}

function addRow(tableBody, time, activity, trackType = null) {
    const row = document.createElement('tr');
    const timeCell = document.createElement('td');
    const activityCell = document.createElement('td');
    
    timeCell.textContent = time.toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' });
    activityCell.textContent = trackType ? `${trackType} - ${activity}` : activity;
    
    row.appendChild(timeCell);
    row.appendChild(activityCell);
    
    tableBody.appendChild(row);
}

function formatActivity(competitionClass, trackType, activity) {
    return `${competitionClass} - ${trackType} ${activity}`
}

function exportToPDF() {
    const table = document.getElementById('scheduleTable').outerHTML;
    const style = `<style>
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ccc; }
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

function exportToXML() {
    const rows = document.querySelectorAll('#scheduleTable tr');
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<schedule>\n';

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            xml += '  <event>\n';
            xml += `    <time>${cells[0].textContent}</time>\n`;
            xml += `    <activity>${cells[1].textContent}</activity>\n`;
            xml += '  </event>\n';
        }
    });

    xml += '</schedule>';

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
