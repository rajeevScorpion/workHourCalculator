document.addEventListener('DOMContentLoaded', (event) => {
    const inTimeField = document.getElementById('inTime');
    const outTimeField = document.getElementById('outTime');
    const surplusShortfallField = document.getElementById('surplusShortfall');
    const surplusRadioButton = document.getElementById('surplusRadio');
    const shortfallRadioButton = document.getElementById('shortfallRadio');
    const clearButton = document.getElementById('clear-button');
    const calculatorForm = document.getElementById('calculator-form');
    const resultDiv = document.getElementById('result');

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
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const remainingSeconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${remainingSeconds}`;
    }

    function calculateOutTime(inTime, surplusShortfall, surplusShortfallType) {
        const inTimeInSeconds = convertToSeconds(inTime);
        let outTimeInSeconds;
        if (surplusShortfallType === 'surplus') {
            outTimeInSeconds = inTimeInSeconds + ((8.5 * 3600) - (surplusShortfall * 3600));
        } else {
            outTimeInSeconds = inTimeInSeconds + ((8.5 * 3600) + (surplusShortfall * 3600));
        }
        return convertToHHMMSS(outTimeInSeconds);
    }

    function calculateOutTimeBasedOnInTime(inTime) {
        const inTimeInSeconds = convertToSeconds(inTime);
        const workingHoursInSeconds = 8.5 * 3600;  // 8.5 hours in seconds
        const outTimeInSeconds = inTimeInSeconds + workingHoursInSeconds;
        return convertToHHMMSS(outTimeInSeconds);
    }

    inTimeField.addEventListener('input', checkFields);
    outTimeField.addEventListener('input', checkFields);
    surplusShortfallField.addEventListener('input', checkFields);

    clearButton.addEventListener('click', function() {
        calculatorForm.reset();
        surplusShortfallField.disabled = false;
        surplusRadioButton.disabled = false;
        shortfallRadioButton.disabled = false;
        outTimeField.disabled = false;
        resultDiv.innerHTML = '';
    });

    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        checkFields();

        const surplusShortfall = parseFloat(surplusShortfallField.value) || 0;
        if (surplusShortfall > 1.5) {
            var surplusModal = new bootstrap.Modal(document.getElementById('surplusModal'));
            surplusModal.show();
            surplusShortfallField.value = '';
            return;
        }

        const inTime = inTimeField.value;
        const outTime = outTimeField.value;
        const surplusShortfallType = surplusRadioButton.checked ? 'surplus' : 'shortfall';

        if (outTime) {
            const totalWorkTimeInSeconds = convertToSeconds(outTime) - convertToSeconds(inTime);
            const totalWorkTime = convertToHHMMSS(totalWorkTimeInSeconds);
            const effectiveWorkTimeInSeconds = totalWorkTimeInSeconds + (surplusShortfall * 3600);
            const effectiveWorkTime = convertToHHMMSS(effectiveWorkTimeInSeconds);
            resultDiv.innerHTML = `Total Work Time: ${totalWorkTime}<br> Effective Work Time: ${effectiveWorkTime}`;
        } else if (surplusShortfallField.value) {
            const calculatedOutTime = calculateOutTime(inTime, surplusShortfall, surplusShortfallType);
            resultDiv.innerHTML = `You are good to go at ${calculatedOutTime}`;
        } else if (inTime) {
            const calculatedOutTime = calculateOutTimeBasedOnInTime(inTime);
            resultDiv.innerHTML = `You are good to go at ${calculatedOutTime}`;
        }
    });
});

