// Viewers get a reduced version of each record (whitelist approach):
// no plates, no photos, no notes, no officer info.
export const toViewerAccident = (accident) => {
  const a = typeof accident.toObject === "function" ? accident.toObject() : accident;
  return {
    _id: a._id,
    date: a.date,
    district: a.district,
    location: a.location,
    roadName: a.roadName,
    coordinates: a.coordinates,
    type: a.type,
    cause: a.cause,
    injured: a.injured,
    deaths: a.deaths,
    severity: a.severity,
    vehicleCount: a.vehicles ? a.vehicles.length : 0,
  };
};

export const presentAccident = (accident, role) =>
  role === "viewer" ? toViewerAccident(accident) : accident;
