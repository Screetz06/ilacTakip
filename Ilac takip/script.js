document.addEventListener('DOMContentLoaded', () => {
    const medicines = {
        'dexAMETHasone 4mg': 12 * 60, // Intake interval in minutes
        'gabapentin 300mg': 8 * 60,
        'methacarbomal 750mg': 6 * 60,
        'morphine CR 30mg': 8 * 60,
        'oxyCODONE 20mg': 6 * 60 // Assuming 'as needed' but with a minimum gap for demonstration
    };

    // Load logs from localStorage
    const logs = JSON.parse(localStorage.getItem('medicineLogs')) || {};

    function addMedicine(name, interval) {
        const row = document.createElement('tr');
        const cellButton = document.createElement('td');
        const button = document.createElement('button');
        button.innerText = `Administer ${name}`;
        button.id = `button-${name.replace(/\s+/g, '')}`;
        button.onclick = () => logMedicineIntake(name, interval);
        cellButton.appendChild(button);
        row.appendChild(cellButton);

        const cellNextIntake = document.createElement('td');
        cellNextIntake.id = `nextIntake-${name.replace(/\s+/g, '')}`;
        cellNextIntake.innerText = calculateNextIntakeText(name);
        row.appendChild(cellNextIntake);

        document.getElementById('medicines').appendChild(row);
        updateButtonState(name);
    }

    function logMedicineIntake(name, interval) {
        const now = new Date();
        if (!logs[name]) logs[name] = [];
        logs[name].push(now.toISOString()); // Store as ISO string for consistency

        // Update localStorage
        localStorage.setItem('medicineLogs', JSON.stringify(logs));

        // Update UI
        updateLogs();
        updateButtonState(name);

        // Calculate next intake time and update display
        const nextIntake = new Date(now.getTime() + interval * 60000);
        document.getElementById(`nextIntake-${name.replace(/\s+/g, '')}`).innerText = `Next intake at ${nextIntake.toLocaleTimeString()}`;
    }

    function updateLogs() {
        const logList = document.getElementById('logList');
        logList.innerHTML = ''; // Clear existing logs

        Object.keys(logs).forEach(name => {
            logs[name].forEach(time => {
                const item = document.createElement('li');
                const logTime = new Date(time);
                item.innerText = `${name} administered at ${logTime.toLocaleTimeString()}`;
                logList.appendChild(item);
            });
        });
    }

    function updateButtonState(name) {
        const button = document.getElementById(`button-${name.replace(/\s+/g, '')}`);
        if (logs[name] && logs[name].length > 0) {
            const lastIntakeTime = new Date(logs[name][logs[name].length - 1]);
            const now = new Date();
            const diff = now - lastIntakeTime;
            if (diff < 3600000) { // Less than an hour
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                }, 3600000 - diff); // Re-enable the button after the remaining time
            } else {
                button.disabled = false;
            }
        }
    }

    function calculateNextIntakeText(name) {
        if (logs[name] && logs[name].length > 0) {
            const lastIntakeTime = new Date(logs[name][logs[name].length - 1]);
            const nextIntake = new Date(lastIntakeTime.getTime() + medicines[name] * 60000);
            return `Next intake at ${nextIntake.toLocaleTimeString()}`;
        }
        return 'Not yet taken';
    }

    // Initialize the table with medicine names and administration buttons
    Object.entries(medicines).forEach(([name, interval]) => addMedicine(name, interval));

    // Refresh logs on load
    updateLogs();
});
