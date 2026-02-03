chrome.storage.local.get("rewardUntil", data => {
  if (Date.now() > data.rewardUntil) {
    document.body.innerHTML = `
      <h2 style="text-align:center;margin-top:50px;">
        🚫 Social Media Locked
      </h2>
      <p style="text-align:center;">
        Watch a PEAdigitals educational video to unlock access.
      </p>
    `;
  }
});
