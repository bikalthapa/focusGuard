
/**
 * Returns an emoji based on a percentage value
 * @param {number} percent - 0 to 100
 * @returns {string} emoji
*/
function getEmojiByPercent(percent) {
    const EMOJIS = ["😢","😟","😐","🙂","😃","😄","😁","🤩","🎉","🏆"];
    // Clamp percent between 0 and 100
    percent = Math.max(0, Math.min(100, percent));

    // Convert percent to index in emoji array
    const index = Math.floor(percent / 100 * (EMOJIS.length - 1));

    return EMOJIS[index];
}

