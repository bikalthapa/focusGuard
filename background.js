const SOCIAL_SITES = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "youtube.com"
];

const STUDY_SITES = [
  "khanacademy.org",
  "w3schools.com",
  "coursera.org",
  "edx.org"
];

let lastTime = Date.now();

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    socialTime: 0,
    studyTime: 0,
    rewardUntil: 0
  });
});

function trackTime() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0] || !tabs[0].url) return;

    const now = Date.now();
    const diff = Math.floor((now - lastTime) / 1000);
    lastTime = now;

    chrome.storage.local.get(["socialTime", "studyTime"], data => {
      if (SOCIAL_SITES.some(site => tabs[0].url.includes(site))) {
        chrome.storage.local.set({ socialTime: data.socialTime + diff });
      }

      if (STUDY_SITES.some(site => tabs[0].url.includes(site))) {
        chrome.storage.local.set({ studyTime: data.studyTime + diff });
      }
    });
  });
}

chrome.tabs.onActivated.addListener(trackTime);
chrome.tabs.onUpdated.addListener(trackTime);

// Reward expiry check
chrome.alarms.create("rewardCheck", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(() => {
  chrome.storage.local.get("rewardUntil", data => {
    if (Date.now() > data.rewardUntil) {
      chrome.storage.local.set({ rewardUntil: 0 });
    }
  });
});
