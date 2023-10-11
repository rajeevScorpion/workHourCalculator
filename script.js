document.getElementById('calculator-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const inTime = document.getElementById('inTime').value;
    const outTime = document.getElementById('outTime').value;
    const surplusShortfall = parseFloat(document.getElementById('surplusShortfall').value) || 0;
    const surplusShortfallType = document.querySelector('input[name="surplusShortfallRadio"]:checked')?.value;
    
     // Check for surplus limit
     if (surplusShortfallType === 'surplus' && surplusShortfall > 1.5) {
        var surplusModal = new bootstrap.Modal(document.getElementById('surplusModal'));
        surplusModal.show();
        return;
    }

    let result = '';
    
    if (outTime) {
        const totalSeconds = calculateTotalSeconds(inTime, outTime);
        const totalHours = convertToHHMMSS(totalSeconds);
        let effectiveSeconds;
        if (surplusShortfallType === 'surplus') {
            effectiveSeconds = totalSeconds + (surplusShortfall * 3600);
        } else {
            effectiveSeconds = totalSeconds - (surplusShortfall * 3600);
        }
        const effectiveHours = convertToHHMMSS(effectiveSeconds);
        
        result += `Total Hours: <span>${totalHours}</span><br>`;
        result += `Effective Hours: <span class="${effectiveSeconds >= (8.5 * 3600) ? 'success' : 'failure'}">${effectiveHours}</span><br>`;
        
        if (totalSeconds > (8.5 * 3600)) {
            const surplus = convertToHHMMSS(totalSeconds - (8.5 * 3600));
            result += `Surplus: <span class="success">${surplus}</span>`;
        } else {
            const shortfall = convertToHHMMSS((8.5 * 3600) - totalSeconds);
            result += `Shortfall: <span class="failure">${shortfall}</span>`;
        }
    } else if (inTime && (!surplusShortfallType || surplusShortfall === 0)) {
        const outTime = calculateOutTimeForStandardShift(inTime);
        result += `You are good to go at: <span>${outTime}</span>`;
    } else if (surplusShortfallType && surplusShortfall !== null) {
        const outTime = calculateOutTime(inTime, surplusShortfall, surplusShortfallType);
        result += `You can leave at: <span>${outTime}</span>`;
    }
    
    document.getElementById('result').innerHTML = result;
});

function calculateTotalSeconds(inTime, outTime) {
    return convertToSeconds(outTime) - convertToSeconds(inTime);
}

function calculateOutTimeForStandardShift(inTime) {
    const inTimeInSeconds = convertToSeconds(inTime);
    const outTimeInSeconds = inTimeInSeconds + (8.5 * 3600);
    return convertToHHMMSS(outTimeInSeconds);
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

function convertToSeconds(time) {
    const timeParts = time.split(':');
    return parseInt(timeParts[0]) * 3600 + parseInt(timeParts[1]) * 60;
}

function convertToHHMMSS(seconds) {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${remainingSeconds}`;
}

// Event listener for the clear button
document.getElementById('clear-button').addEventListener('click', function() {
    document.getElementById('calculator-form').reset();
    document.getElementById('result').innerHTML = '';
});
