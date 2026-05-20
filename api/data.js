module.exports = async (req, res) => {
  const cookies = req.headers.cookie || '';
  if (!cookies.includes('auth_token=verified')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    targetX: 32.841,
    successEquation: process.env.SUCCESS_EQUATION || "y = 1.0739 · x - 25.4700",
    finalLat: process.env.FINAL_LAT || "N 47° 09.798'",
    finalLon: process.env.FINAL_LON || "E 007° 32.841'",
    sheetLink: process.env.SHEET_LINK || "https://docs.google.com/spreadsheets/d/1N9aZ6a67jj-Cvow98YrPrO0_RQ4aWmlWVWn9K3-eYfU/edit?usp=sharing"
  });
};
