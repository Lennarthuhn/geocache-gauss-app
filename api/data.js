module.exports = async (req, res) => {
  const cookies = req.headers.cookie || '';
  if (!cookies.includes('auth_token=verified')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { solve } = req.query;

  if (solve !== 'true') {
    return res.json({
      caches: [
        { id: "GCA0F3Q", name: "Greifautomat", x: 32.206, y: 7.887, lat: 47.13145, lon: 7.53677 },
        { id: "GC9Q512", name: "Bahnhof Bätterkinden", x: 32.097, y: 7.803, lat: 47.13005, lon: 7.53495 },
        { id: "GC9WQJY", name: "Stern Reloaded", x: 32.289, y: 7.996, lat: 47.133267, lon: 7.53815 },
        { id: "GC9PZ3Z", name: "Moos 14", x: 31.673, y: 7.862, lat: 47.131033, lon: 7.527883 },
        { id: "GC9KQWF", name: "Moos 1 Stockacherweg", x: 32.224, y: 8.252, lat: 47.137533, lon: 7.537067 },
        { id: "GC9KQXH", name: "Moos 2 Biotop", x: 32.012, y: 8.399, lat: 47.139983, lon: 7.533533 },
        { id: "GC9PYD9", name: "Moos 13 Baum", x: 31.279, y: 7.571, lat: 47.126183, lon: 7.521317 },
        { id: "GC9KQY1", name: "Moos 3 Fischzucht", x: 31.928, y: 8.548, lat: 47.142467, lon: 7.532133 },
        { id: "GC9PYCV", name: "Moos 12 Modelflugplatz", x: 31.082, y: 7.419, lat: 47.12365, lon: 7.518033 },
        { id: "GC9KQY7", name: "Moos 4 Röhre", x: 31.856, y: 8.687, lat: 47.144783, lon: 7.530933 },
        { id: "GC9N4V5", name: "Moos 6 Baumstrunk", x: 31.237, y: 8.468, lat: 47.141133, lon: 7.520617 },
        { id: "GC9N4VC", name: "Moos 7 Kugel", x: 31.104, y: 8.368, lat: 47.139467, lon: 7.5184 },
        { id: "GC9EZJG", name: "Dino 6 Pteranodon", x: 31.995, y: 9.216, lat: 47.1536, lon: 7.53325 },
        { id: "GC9GN2G", name: "Stein Nr. 101", x: 32.125, y: 9.241, lat: 47.154017, lon: 7.535417 },
        { id: "GC9GMWG", name: "Angel-Cache 8", x: 32.270, y: 9.295, lat: 47.154917, lon: 7.537833 },
        { id: "GC9GV8W", name: "(K)ein Angelcache", x: 32.051, y: 9.331, lat: 47.155517, lon: 7.534183 },
        { id: "GCBNR60", name: "Vermessener Bach", x: 32.515, y: 9.353, lat: 47.155883, lon: 7.541917 },
        { id: "GC9GK70", name: "Angel-Cache 7", x: 32.337, y: 9.374, lat: 47.156233, lon: 7.53895 },
        { id: "GC9EY01", name: "Dino 1 Pachy...", x: 31.906, y: 9.373, lat: 47.156217, lon: 7.531767 },
        { id: "GC9GWJA", name: "Tuff", x: 32.208, y: 9.404, lat: 47.156733, lon: 7.5368 },
        { id: "GC9EZGM", name: "Dino 2 Velociraptor", x: 32.073, y: 9.417, lat: 47.15695, lon: 7.53455 },
        { id: "GC9EZJ5", name: "Dino 5 Brachio...", x: 32.407, y: 9.447, lat: 47.15745, lon: 7.540117 },
        { id: "GCBQ0KX", name: "Fliegender Container", x: 31.850, y: 9.452, lat: 47.157533, lon: 7.530833 },
        { id: "GCBNR2V", name: "Wanderweg Limpach...", x: 32.548, y: 9.463, lat: 47.157715, lon: 7.542467 },
        { id: "GC9F0B3", name: "Dino 3 T-Rex", x: 32.209, y: 9.497, lat: 47.158283, lon: 7.536817 },
        { id: "GC9GKXV", name: "Angel-Cache 1", x: 31.940, y: 9.524, lat: 47.158733, lon: 7.532333 },
        { id: "GC9GK5Z", name: "Angel-Cache 2", x: 32.085, y: 9.550, lat: 47.159167, lon: 7.53475 },
        { id: "GCBNERB", name: "Vor dem Limpach...", x: 32.633, y: 9.548, lat: 47.159133, lon: 7.543883 },
        { id: "GC9EZHN", name: "Dino 4 Stegosaurus", x: 32.277, y: 9.574, lat: 47.159567, lon: 7.53795 },
        { id: "GC9GK6K", name: "Angel-Cache 6", x: 32.483, y: 9.570, lat: 47.1595, lon: 7.541383 },
        { id: "GCBN29P", name: "Limpachspitz", x: 32.743, y: 9.599, lat: 47.159983, lon: 7.545717 },
        { id: "GCBN4E7", name: "Eule", x: 32.629, y: 9.640, lat: 47.160667, lon: 7.543817 },
        { id: "GC9G4ZQ", name: "Angel-Cache 3", x: 32.268, y: 9.674, lat: 47.161233, lon: 7.5378 },
        { id: "GC9GK5F", name: "Angel-Cache 5", x: 32.522, y: 9.688, lat: 47.161467, lon: 7.542033 },
        { id: "GC9GK49", name: "Angel-Cache 4", x: 32.393, y: 9.708, lat: 47.1618, lon: 7.539883 },
        { id: "GC9HV7P", name: "Altisberg", x: 32.910, y: 9.715, lat: 47.161917, lon: 7.5485 }
      ],
      sheetLink: process.env.SHEET_LINK
    });
  }

  res.json({
    successEquation: process.env.SUCCESS_EQUATION,
    finalLon: process.env.FINAL_LON
  });
};
