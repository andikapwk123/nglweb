// NGL SPAMMER TURBO - 10 WORKER PARALEL
let isSpamming = false;
let currentJobId = null;
let progressInterval;

document.getElementById('attackBtn').addEventListener('click', startTurboSpam);
document.getElementById('targetLink').addEventListener('input', updateTargetUsername);
document.getElementById('stopBtn').addEventListener('click', stopSpam);

function updateTargetUsername(e) {
    const link = e.target.value;
    const username = link.split('/').pop().replace('@', '');
    if (username) {
        document.getElementById('targetUsername').innerText = '@' + username;
    }
}

async function startTurboSpam() {
    if (isSpamming) return;
    
    const targetLink = document.getElementById('targetLink').value;
    const message = document.getElementById('message').value;
    const jumlah = parseInt(document.getElementById('jumlah').value);
    
    const username = targetLink.split('/').pop().replace('@', '');
    
    if (!targetLink || !message || !jumlah) {
        alert('ISI SEMUA DULU!');
        return;
    }
    
    if (jumlah > 50) {
        alert('Maksimal 50 aja, ntar kebanned!');
        return;
    }
    
    // Reset UI
    document.getElementById('sentCount').innerText = '0';
    document.getElementById('failedCount').innerText = '0';
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('logContainer').style.display = 'block';
    document.getElementById('logContainer').innerHTML = '';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').innerText = '0%';
    
    // Tampilkan tombol stop, sembunyikan start
    document.getElementById('attackBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'block';
    
    isSpamming = true;
    
    addLog('🚀 MEMULAI TURBO MODE DENGAN 10 WORKER...', 'info');
    addLog('⏳ Mohon tunggu, inisialisasi worker...', 'info');
    
    try {
        const response = await fetch('/api/spam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, message, jumlah })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentJobId = data.jobId;
            addLog('✅ ' + data.message, 'success');
            addLog('🔥 10 WORKER PARALEL AKTIF!', 'success');
            checkTurboProgress(currentJobId);
        } else {
            addLog('❌ GAGAL: ' + data.error, 'error');
            resetUI();
        }
    } catch (error) {
        addLog('❌ ERROR: ' + error.message, 'error');
        resetUI();
    }
}

function checkTurboProgress(jobId) {
    progressInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/progress/' + jobId);
            const data = await response.json();
            
            if (data.error) {
                addLog('⚠️ ' + data.error, 'error');
                return;
            }
            
            // Update stats
            document.getElementById('sentCount').innerText = data.sent;
            document.getElementById('failedCount').innerText = data.failed;
            
            // Update progress
            const progress = (data.completed / data.total) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            
            // Tampilkan kecepatan
            if (data.speed) {
                document.getElementById('progressText').innerHTML = `${Math.round(progress)}% | ⚡ ${data.speed} msg/s`;
            } else {
                document.getElementById('progressText').innerText = Math.round(progress) + '%';
            }
            
            // Check if completed
            if (data.completed >= data.total || data.status === 'completed' || data.status === 'stopped') {
                clearInterval(progressInterval);
                if (data.status === 'stopped') {
                    addLog('🛑 SPAM DIHENTIKAN!', 'error');
                } else {
                    addLog('✅ SPAM SELESAI!', 'success');
                }
                resetUI();
            }
        } catch (error) {
            console.error('Progress check error:', error);
        }
    }, 800);
}

async function stopSpam() {
    if (!currentJobId) return;
    
    try {
        await fetch('/api/stop/' + currentJobId, { method: 'POST' });
        addLog('🛑 Menghentikan spam...', 'error');
    } catch (error) {
        console.error('Stop error:', error);
    }
}

function addLog(message, type) {
    const logContainer = document.getElementById('logContainer');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    if (type === 'success') logEntry.style.color = '#00ff00';
    else if (type === 'error') logEntry.style.color = '#ff4444';
    else if (type === 'info') logEntry.style.color = '#ffff00';
    
    const timestamp = new Date().toLocaleTimeString();
    logEntry.innerHTML = `[${timestamp}] ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function resetUI() {
    isSpamming = false;
    currentJobId = null;
    document.getElementById('attackBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'none';
}
