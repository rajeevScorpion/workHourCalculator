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

        const inTimeValue = inTimeField.value;
        if (inTimeValue) {
            const inTime = convertToSeconds(inTimeValue);
            const lowerLimit = convertToSeconds('06:00');
            const upperLimit = convertToSeconds('10:30');
            if (inTime < lowerLimit || inTime > upperLimit) {
                var inTimeLimit = new bootstrap.Modal(document.getElementById('inTimeLimit'));
                inTimeLimit.show();
                inTimeField.value = '';
                return;
            }
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

    function determineSurplusOrShortfall(totalWorkTimeInSeconds) {
        if (totalWorkTimeInSeconds > WORK_HOURS_IN_SECONDS) {
            return {
                type: 'Surplus',
                time: convertToHHMMSS(totalWorkTimeInSeconds - WORK_HOURS_IN_SECONDS)
            };
        } else {
            return {
                type: 'Shortfall',
                time: convertToHHMMSS(WORK_HOURS_IN_SECONDS - totalWorkTimeInSeconds)
            };
        }
    }

    function calculateAdjustedTime(surplusShortfallTime, surplusShortfallType) {
        const surplusShortfallInSeconds = convertToSeconds(surplusShortfallTime);
        if (surplusShortfallType === 'surplus' && surplusShortfallInSeconds > (1.5 * 3600)) {
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

        // Scenario 1: User provides in time and out time
        if (inTimeField.value && outTimeField.value) {
            const outTimeInSeconds = convertToSeconds(outTimeField.value);
            const totalWorkTimeInSeconds = outTimeInSeconds - inTimeInSeconds;
            const surplusOrShortfall = determineSurplusOrShortfall(totalWorkTimeInSeconds);

            result = `Total Work Time: ${convertToHHMMSS(totalWorkTimeInSeconds)}`;
            result += `<br>${surplusOrShortfall.type}: <span class="${surplusOrShortfall.type === 'Surplus' ? 'success' : 'error'}">${surplusOrShortfall.time}</span>`;
        }

        // Scenario 2: User provides only in time
        else if (inTimeField.value && !outTimeField.value && !surplusShortfallField.value) {
            const outTimeInSeconds = inTimeInSeconds + WORK_HOURS_IN_SECONDS;
            result = `You can leave at ${convertToHHMMSS(outTimeInSeconds)}`;
        }

        // Scenario 3: User provides in time and surplus/shortfall
        else if (inTimeField.value && surplusShortfallField.value) {
            const surplusShortfallType = surplusRadioButton.checked ? 'surplus' : 'shortfall';
            const adjustedWorkTimeInSeconds = calculateAdjustedTime(surplusShortfallField.value, surplusShortfallType);

            if (adjustedWorkTimeInSeconds !== null) {
                const outTimeInSeconds = inTimeInSeconds + adjustedWorkTimeInSeconds;
                result = `You can leave at ${convertToHHMMSS(outTimeInSeconds)}`;
            }
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
