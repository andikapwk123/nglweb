// NGL SPAMMER PRO TURBO - 10 WORKER PARALEL
// DIBUAT OLEH DIKA GANTENG

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const os = require('os');
const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Store active jobs
const jobs = new Map();

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Endpoint untuk mulai spam
app.post('/api/spam', async (req, res) => {
    const { username, message, jumlah } = req.body;
    
    if (!username || !message || !jumlah) {
        return res.status(400).json({ 
            success: false, 
            error: 'Data kurang lengkap sayangku!' 
        });
    }
    
    const jobId = Date.now().toString() + '-' + Math.random().toString(36).substring(7);
    
    // Bikin job object
    const job = {
        id: jobId,
        username,
        message,
        total: parseInt(jumlah),
        sent: 0,
        failed: 0,
        completed: 0,
        logs: [],
        status: 'running',
        startTime: Date.now(),
        queue: []
    };
    
    // Buat queue pesan
    for (let i = 1; i <= job.total; i++) {
        job.queue.push({
            index: i,
            question: `${message} [${i}/${job.total}]`,
            deviceId: generateDeviceId(),
            userAgent: generateRandomUA()
        });
    }
    
    jobs.set(jobId, job);
    
    // Mulai proses spam dengan 10 WORKER PARALEL!
    startTurboSpam(jobId);
    
    res.json({ 
        success: true, 
        jobId: jobId,
        message: '🔥 TURBO MODE 10 WORKER AKTIF!'
    });
});

// API untuk cek progress
app.get('/api/progress/:jobId', (req, res) => {
    const job = jobs.get(req.params.jobId);
    if (!job) {
        return res.status(404).json({ error: 'Job tidak ditemukan' });
    }
    
    // Hitung kecepatan
    const elapsedSeconds = (Date.now() - job.startTime) / 1000;
    const speed = elapsedSeconds > 0 ? Math.round(job.completed / elapsedSeconds) : 0;
    
    res.json({
        sent: job.sent,
        failed: job.failed,
        completed: job.completed,
        total: job.total,
        speed: speed,
        elapsed: Math.round(elapsedSeconds),
        logs: job.logs.slice(-15),
        status: job.status
    });
});

// API untuk stop job
app.post('/api/stop/:jobId', (req, res) => {
    const job = jobs.get(req.params.jobId);
    if (job) {
        job.status = 'stopped';
        res.json({ success: true, message: 'Job dihentikan!' });
    } else {
        res.json({ success: false, message: 'Job gak ketemu' });
    }
});

// TURBO SPAM FUNCTION - 10 WORKER SEKALIGUS!
async function startTurboSpam(jobId) {
    const job = jobs.get(jobId);
    const WORKER_COUNT = 10;
    
    // Bagi queue ke worker
    const chunkSize = Math.ceil(job.queue.length / WORKER_COUNT);
    const workerQueues = [];
    
    for (let i = 0; i < WORKER_COUNT; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, job.queue.length);
        workerQueues.push(job.queue.slice(start, end));
    }
    
    // Jalankan workers secara paralel
    const workerPromises = [];
    
    for (let w = 0; w < WORKER_COUNT; w++) {
        if (workerQueues[w].length === 0) continue;
        
        const workerPromise = (async () => {
            const workerId = w + 1;
            const queue = workerQueues[w];
            
            for (const item of queue) {
                if (job.status !== 'running') break;
                
                try {
                    // Kirim dengan random delay biar gak keliatan bot
                    const delay = Math.random() * 300 + 100;
                    await sleep(delay);
                    
                    const response = await axios.post('https://ngl.link/api/submit', {
                        username: job.username,
                        question: item.question,
                        deviceId: item.deviceId
                    }, {
                        headers: {
                            'User-Agent': item.userAgent,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Origin': 'https://ngl.link',
                            'Referer': `https://ngl.link/${job.username}`,
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        timeout: 8000
                    });
                    
                    if (response.status === 200) {
                        job.sent++;
                        // HAPUS SEMUA LOG WORKER - biar sepi
                    } else {
                        job.failed++;
                    }
                } catch (error) {
                    job.failed++;
                    // HAPUS SEMUA LOG ERROR
                }
                
                job.completed++;
                
                // HAPUS SEMUA PROGRESS LOG
            }
            
            // HAPUS LOG WORKER SELESAI
        })();
        
        workerPromises.push(workerPromise);
    }
    
    // Tunggu semua worker selesai
    await Promise.all(workerPromises);
    
    job.status = 'completed';
    const elapsedSeconds = Math.round((Date.now() - job.startTime) / 1000);
    
    // HAPUS SEMUA LOG AKHIR - SEKARANG CUMA 1 LOG SEDERHANA
    job.logs.push({
        message: `✅ Selesai! ${job.sent}/${job.total} terkirim`,
        type: 'success'
    });
}

// Helper functions
function generateDeviceId() {
    const patterns = [
        () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        }),
        () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        () => 'device_' + Date.now() + '_' + Math.random().toString(36).substring(7)
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)]();
}

function generateRandomUA() {
    const uas = [
        'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 Chrome/112.0.0.0 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone14,3; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/602.1.50 Version/10.0 Mobile/19A346 Safari/602.1',
        'Mozilla/5.0 (Linux; Android 11; SM-A525F) AppleWebKit/537.36 Chrome/110.0.5481.154 Mobile Safari/537.36'
    ];
    return uas[Math.floor(Math.random() * uas.length)];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Cleanup old jobs
setInterval(() => {
    const thirtyMinutesAgo = Date.now() - 1800000;
    for (const [id, job] of jobs) {
        if (parseInt(id) < thirtyMinutesAgo && job.status === 'completed') {
            jobs.delete(id);
        }
    }
}, 1800000);

// Start server
app.listen(port, '0.0.0.0', () => {
    const cpus = os.cpus().length;
    console.log(`
╔════════════════════════════════════╗
║   NGL SPAMMER PRO                  ║
║   10 WORKER PARALEL                ║
╠════════════════════════════════════╣
║  Local: http://localhost:${port}    ║
║  Network: http://${getLocalIP()}:${port} ║
║  Created by: DIKA GANTENG          ║
╚════════════════════════════════════╝
    `);
});

function getLocalIP() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}
