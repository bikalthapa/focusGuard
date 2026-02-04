// Configuration
let DAILY_LIMIT = 3600;
let STUDY_GOAL = 3600;
let POMODORO_DURATION = 25 * 60;
const CIRCLE_CIRCUMFERENCE = 377;
const today = new Date().toDateString();

const messages = [
    "🔥 Consistency beats intensity every time",
    "🚀 Small daily focus = massive success",
    "💪 You're building unstoppable discipline",
    "🧠 Progress over perfection, always",
    "⚡ Focus is your superpower",
    "🎯 Every minute of focus counts",
    "🌟 You're stronger than distractions",
    "💎 Quality focus creates quality results"
];

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 60 + 20;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        particlesContainer.appendChild(particle);
    }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
        
        if (targetTab === 'analytics') updateAnalytics();
    });
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
}

function formatMinutes(seconds) {
    return Math.floor(seconds / 60) + 'm';
}

function updateHomeUI(data) {
    const studyPercent = Math.min((data.studyTime / STUDY_GOAL) * 100, 100);
    document.getElementById('studyProgressBar').style.width = studyPercent + '%';
    document.getElementById('studyTimeDisplay').innerText = formatMinutes(data.studyTime);
    document.getElementById('studyGoalDisplay').innerText = formatMinutes(STUDY_GOAL);

    let streak = data.streakDays || 0;
    if (data.lastCheckedDate !== today) {
        if (data.studyTime >= STUDY_GOAL) {
            streak += 1;
        } else if (streak > 0 && data.studyTime < STUDY_GOAL / 2) {
            streak = 0;
        }
        chrome.storage.local.set({ streakDays: streak, lastCheckedDate: today });
    }
    document.getElementById('streak').innerText = streak;

    const emojiEl = document.getElementById('emoji');
    const goalTextEl = document.getElementById('goalText');
    
    if (studyPercent === 0) {
        emojiEl.innerText = "😢";
        emojiEl.className = "emoji sad";
        goalTextEl.innerText = "Time to start focusing! You've got this! 💪";
    } else if (studyPercent >= 100) {
        emojiEl.innerText = "😃";
        emojiEl.className = "emoji happy";
        goalTextEl.innerText = "Amazing! You crushed your goal today! 🎉";
    } else if (studyPercent >= 75) {
        emojiEl.innerText = "😊";
        emojiEl.className = "emoji happy";
        goalTextEl.innerText = "Almost there! Keep pushing forward! 🚀";
    } else if (studyPercent >= 50) {
        emojiEl.innerText = "🙂";
        emojiEl.className = "emoji neutral";
        goalTextEl.innerText = "Halfway done! You're doing great! ⭐";
    } else if (studyPercent >= 25) {
        emojiEl.innerText = "😐";
        emojiEl.className = "emoji neutral";
        goalTextEl.innerText = "Good start! Let's keep the momentum! 📚";
    } else {
        emojiEl.innerText = "😕";
        emojiEl.className = "emoji sad";
        goalTextEl.innerText = "Just getting started! Focus time! 🎯";
    }

    document.getElementById('motivation').innerText = messages[Math.floor(Math.random() * messages.length)];
}

function updateAnalytics() {
    chrome.storage.local.get({
        socialTime: 0,
        siteUsage: {},
        weeklyStudy: [0,0,0,0,0,0,0]
    }, data => {
        const socialPercent = Math.min((data.socialTime / DAILY_LIMIT) * 100, 100);
        const offset = CIRCLE_CIRCUMFERENCE - (socialPercent / 100) * CIRCLE_CIRCUMFERENCE;
        
        document.getElementById('circleProgress').style.strokeDashoffset = offset;
        document.getElementById('percent').innerText = Math.floor(socialPercent) + "%";
        document.getElementById('socialTime').innerText = formatMinutes(data.socialTime);
        document.getElementById('remainingTime').innerText = formatMinutes(Math.max(0, DAILY_LIMIT - data.socialTime));

        const siteList = document.getElementById('siteList');
        const sites = Object.entries(data.siteUsage || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
        
        if (sites.length > 0) {
            siteList.innerHTML = sites.map(([site, time]) => {
                const icon = getIconForSite(site);
                return `
                    <div class="site-item">
                        <div class="site-info">
                            <div class="site-icon">${icon}</div>
                            <div class="site-name">${site}</div>
                        </div>
                        <div class="site-time">${formatTime(time)}</div>
                    </div>
                `;
            }).join('');
        }
    });
}

function getIconForSite(site) {
    const icons = {
        'facebook': '📘', 'twitter': '🐦', 'instagram': '📷',
        'youtube': '📺', 'tiktok': '🎵', 'reddit': '🤖', 'linkedin': '💼'
    };
    for (let key in icons) {
        if (site.toLowerCase().includes(key)) return icons[key];
    }
    return '🌐';
}

let currentPriority = 'medium';
let tasks = [];
let editingTaskId = null;

document.getElementById('addTaskBtn').addEventListener('click', () => {
    editingTaskId = null;
    const inputArea = document.getElementById('taskInputArea');
    const input = document.getElementById('taskInput');
    const saveBtn = document.getElementById('saveTask');
    
    inputArea.classList.add('active');
    input.value = '';
    input.focus();
    saveBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
    
    // Reset priority to medium
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector('[data-priority="medium"]').classList.add('selected');
    currentPriority = 'medium';
});

document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentPriority = btn.dataset.priority;
    });
});

document.getElementById('saveTask').addEventListener('click', () => {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    
    if (title) {
        if (editingTaskId) {
            // Update existing task
            const task = tasks.find(t => t.id === editingTaskId);
            if (task) {
                task.title = title;
                task.priority = currentPriority;
            }
        } else {
            // Create new task
            const task = {
                id: Date.now(),
                title: title,
                priority: currentPriority,
                completed: false,
                createdAt: new Date().toLocaleString()
            };
            tasks.push(task);
        }
        
        saveTasks();
        renderTasks();
        
        input.value = '';
        document.getElementById('taskInputArea').classList.remove('active');
        editingTaskId = null;
    }
});

document.getElementById('cancelTask').addEventListener('click', () => {
    document.getElementById('taskInput').value = '';
    document.getElementById('taskInputArea').classList.remove('active');
    editingTaskId = null;
});

function saveTasks() {
    chrome.storage.local.set({ tasks: tasks });
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No tasks yet. Add one to get started!</p>
            </div>
        `;
    } else {
        taskList.innerHTML = tasks.map(task => `
            <div class="task-item ${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}" data-action="toggle">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title" data-task-id="${task.id}" data-action="edit" style="cursor: pointer; user-select: none;">${task.title}</div>
                    <div class="task-time">${task.createdAt}</div>
                    <div class="task-priority-selector" style="margin-top: 6px; display: none;" id="priority-${task.id}">
                        <button class="priority-btn-small ${task.priority === 'high' ? 'selected' : ''}" data-task-id="${task.id}" data-priority="high" data-action="priority">🔴 High</button>
                        <button class="priority-btn-small ${task.priority === 'medium' ? 'selected' : ''}" data-task-id="${task.id}" data-priority="medium" data-action="priority">🟡 Med</button>
                        <button class="priority-btn-small ${task.priority === 'low' ? 'selected' : ''}" data-task-id="${task.id}" data-priority="low" data-action="priority">🟢 Low</button>
                    </div>
                </div>
                <button class="task-delete" data-task-id="${task.id}" data-action="delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        // Attach event listeners using event delegation
        attachTaskEventListeners();
    }
    
    updateTaskStats();
}

function attachTaskEventListeners() {
    const taskList = document.getElementById('taskList');
    
    taskList.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        
        const action = target.dataset.action;
        const taskId = parseInt(target.dataset.taskId);
        
        if (action === 'toggle') {
            toggleTask(taskId);
        } else if (action === 'delete') {
            deleteTask(taskId);
        } else if (action === 'edit') {
            startEditTask(taskId);
        } else if (action === 'priority') {
            const priority = target.dataset.priority;
            changePriority(taskId, priority);
        }
    });
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    if (confirm('Delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

function startEditTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        editingTaskId = id;
        const inputArea = document.getElementById('taskInputArea');
        const input = document.getElementById('taskInput');
        const saveBtn = document.getElementById('saveTask');
        
        input.value = task.title;
        currentPriority = task.priority;
        
        // Update priority buttons
        document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector(`[data-priority="${task.priority}"]`).classList.add('selected');
        
        inputArea.classList.add('active');
        input.focus();
        input.select();
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Update Task';
    }
}

function changePriority(id, priority) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.priority = priority;
        saveTasks();
        renderTasks();
    }
}

function updateTaskStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    document.getElementById('totalTasks').innerText = total;
    document.getElementById('completedTasks').innerText = completed;
    document.getElementById('pendingTasks').innerText = pending;
}

document.getElementById('studyGoalInput').addEventListener('change', (e) => {
    STUDY_GOAL = parseInt(e.target.value) * 60;
    chrome.storage.local.set({ studyGoal: STUDY_GOAL });
});

document.getElementById('socialLimitInput').addEventListener('change', (e) => {
    DAILY_LIMIT = parseInt(e.target.value) * 60;
    chrome.storage.local.set({ socialLimit: DAILY_LIMIT });
});

document.getElementById('pomodoroDuration').addEventListener('change', (e) => {
    POMODORO_DURATION = parseInt(e.target.value) * 60;
    chrome.storage.local.set({ pomodoroDuration: POMODORO_DURATION });
});

document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
    });
});

let blockedSites = [];

document.getElementById('addBlockSite').addEventListener('click', () => {
    const input = document.getElementById('blockSiteInput');
    const site = input.value.trim();
    
    if (site && !blockedSites.includes(site)) {
        blockedSites.push(site);
        chrome.storage.local.set({ blockedSites: blockedSites });
        renderBlockedSites();
        input.value = '';
    }
});

function renderBlockedSites() {
    const list = document.getElementById('blockedSitesList');
    
    if (blockedSites.length === 0) {
        list.innerHTML = '<div style="text-align: center; opacity: 0.6; padding: 20px; font-size: 12px;">No blocked sites</div>';
    } else {
        list.innerHTML = blockedSites.map((site, index) => `
            <div class="website-item">
                <span>${site}</span>
                <button class="remove-site" onclick="removeBlockedSite(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

function removeBlockedSite(index) {
    blockedSites.splice(index, 1);
    chrome.storage.local.set({ blockedSites: blockedSites });
    renderBlockedSites();
}

document.getElementById('exportData').addEventListener('click', () => {
    chrome.storage.local.get(null, (data) => {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focusguard-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    });
});

document.getElementById('resetData').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
        chrome.storage.local.clear(() => {
            alert('All data has been reset!');
            location.reload();
        });
    }
});

let pomodoroInterval;
let isPomodoroActive = false;

document.getElementById('pomodoro').addEventListener('click', () => {
    const timerDisplay = document.getElementById('pomodoroTimer');
    const button = document.getElementById('pomodoro');
    
    if (isPomodoroActive) {
        clearInterval(pomodoroInterval);
        isPomodoroActive = false;
        timerDisplay.classList.remove('active');
        button.innerHTML = '<i class="fas fa-stopwatch"></i><span>Pomodoro</span>';
        return;
    }

    isPomodoroActive = true;
    let timeLeft = POMODORO_DURATION;
    timerDisplay.classList.add('active');
    button.innerHTML = '<i class="fas fa-stop"></i><span>Stop</span>';
    
    pomodoroInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.innerText = `⏱️ ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(pomodoroInterval);
            isPomodoroActive = false;
            timerDisplay.innerText = "✅ Complete! Take a 5min break! 🎉";
            button.innerHTML = '<i class="fas fa-stopwatch"></i><span>Pomodoro</span>';
            
            chrome.storage.local.get(['studyTime'], (data) => {
                chrome.storage.local.set({ studyTime: (data.studyTime || 0) + POMODORO_DURATION }, loadData);
            });
        }
    }, 1000);
});

document.getElementById('unlock').addEventListener('click', () => {
    chrome.storage.local.get(['studyTime'], (data) => {
        if (data.studyTime >= 1800) {
            window.open("https://peadigitals.com", "_blank");
            chrome.storage.local.set({ rewardUntil: Date.now() + 15 * 60 * 1000 });
        } else {
            alert('⏰ Study for at least 30 minutes to unlock reward time!');
        }
    });
});

function loadData() {
    chrome.storage.local.get({
        socialTime: 0, studyTime: 0, streakDays: 0, lastCheckedDate: "",
        tasks: [], studyGoal: 3600, socialLimit: 3600, 
        pomodoroDuration: 1500, blockedSites: []
    }, data => {
        STUDY_GOAL = data.studyGoal;
        DAILY_LIMIT = data.socialLimit;
        POMODORO_DURATION = data.pomodoroDuration;
        tasks = data.tasks;
        blockedSites = data.blockedSites;
        
        document.getElementById('studyGoalInput').value = STUDY_GOAL / 60;
        document.getElementById('socialLimitInput').value = DAILY_LIMIT / 60;
        document.getElementById('pomodoroDuration').value = POMODORO_DURATION / 60;
        
        updateHomeUI(data);
        renderTasks();
        renderBlockedSites();
    });
}

createParticles();
loadData();

window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.startEditTask = startEditTask;
window.changePriority = changePriority;
window.removeBlockedSite = removeBlockedSite;
