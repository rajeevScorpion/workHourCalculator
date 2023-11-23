document.addEventListener('DOMContentLoaded', (event) => {
    const inTimeField = document.getElementById('inTime');
    const outTimeField = document.getElementById('outTime');
    const surplusShortfallField = document.getElementById('surplusShortfall');
    const surplusRadioButton = document.getElementById('surplusRadio');
    const shortfallRadioButton = document.getElementById('shortfallRadio');
    const calculatorForm = document.getElementById('calculator-form');
    const resultDiv = document.getElementById('result');
    const clearButton = document.getElementById('clear-button');

    const WORK_HOURS_IN_SECONDS = 8.5 * 3600;

    function checkFields() {
        if (inTimeField.value && outTimeField.value) {
            surplusShortfallField.disabled = true;
            surplusRadioButton.disabled = true;
            shortfallRadioButton.disabled = true;
        } else if (inTimeField.value && surplusShortfallField.value) {
            outTimeField.disabled = true;
        } else {
            surplusShortfallField.disabled = false;
            surplusRadioButton.disabled = false;
            shortfallRadioButton.disabled = false;
            outTimeField.disabled = false;
        }
    }

    function convertToSeconds(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return (hours * 3600) + (minutes * 60);
    }

    function convertToHHMMSS(totalSeconds) {
        totalSeconds %= 86400; // Prevent rolling over to next day
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function calculateAdjustedTime(surplusShortfallMinutes, surplusShortfallType) {
        const surplusShortfallInSeconds = surplusShortfallMinutes * 60;

        if (surplusShortfallType === 'surplus' && surplusShortfallMinutes > 90) {
            var surplusModal = new bootstrap.Modal(document.getElementById('surplusModal'));
            surplusModal.show();
            return null;
        }

        return surplusShortfallType === 'surplus'
            ? WORK_HOURS_IN_SECONDS - surplusShortfallInSeconds
            : WORK_HOURS_IN_SECONDS + surplusShortfallInSeconds;
    }

    inTimeField.addEventListener('input', checkFields);
    outTimeField.addEventListener('input', checkFields);
    surplusShortfallField.addEventListener('input', checkFields);

    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const inTimeInSeconds = convertToSeconds(inTimeField.value);
        let result = "";

        if (inTimeField.value && outTimeField.value) {
            const outTimeInSeconds = convertToSeconds(outTimeField.value);
            const totalWorkTimeInSeconds = outTimeInSeconds - inTimeInSeconds;
            const workHours = convertToHHMMSS(totalWorkTimeInSeconds);
            const surplusOrShortfall = totalWorkTimeInSeconds > WORK_HOURS_IN_SECONDS
                ? `<span class='success'>Surplus: ${convertToHHMMSS(totalWorkTimeInSeconds - WORK_HOURS_IN_SECONDS)}</span>`
                : `<span class='error'>Shortfall: ${convertToHHMMSS(WORK_HOURS_IN_SECONDS - totalWorkTimeInSeconds)}</span>`;
            
            result = `Total Work Time: ${workHours}<br>${surplusOrShortfall}`;
        } else if (inTimeField.value && surplusShortfallField.value) {
            const surplusShortfallMinutes = parseFloat(surplusShortfallField.value);
            const surplusShortfallType = surplusRadioButton.checked ? 'surplus' : 'shortfall';
            const adjustedWorkTimeInSeconds = calculateAdjustedTime(surplusShortfallMinutes, surplusShortfallType);

            if (adjustedWorkTimeInSeconds !== null) {
                const outTimeInSeconds = inTimeInSeconds + adjustedWorkTimeInSeconds;
                result = `Adjusted Out Time: ${convertToHHMMSS(outTimeInSeconds)}`;
            }
        } else if (inTimeField.value) {
            const outTimeInSeconds = inTimeInSeconds + WORK_HOURS_IN_SECONDS;
            result = `Expected Out Time: ${convertToHHMMSS(outTimeInSeconds)}`;
        }

        resultDiv.innerHTML = result;
    });

    clearButton.addEventListener('click', function() {
        inTimeField.value = '';
        outTimeField.value = '';
        surplusShortfallField.value = '';
        surplusRadioButton.checked = false;
        shortfallRadioButton.checked = false;
        surplusShortfallField.disabled = false;
        surplusRadioButton.disabled = false;
        shortfallRadioButton.disabled = false;
        outTimeField.disabled = false;
        resultDiv.innerHTML = '';
    });
});
