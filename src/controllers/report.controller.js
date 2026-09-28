import Accident from "../models/Accident.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildAccidentFilter } from "../utils/accidentFilter.js";
import { toCsv } from "../utils/csv.js";
import { formatKabul } from "../utils/date.js";
import { ROLES } from "../utils/constants.js";

const publicColumns = [
  { label: "Date", value: (a) => formatKabul(a.date) },
  { label: "District", value: (a) => a.district },
  { label: "Location", value: (a) => a.location?.name },
  { label: "Road", value: (a) => a.roadName },
  { label: "Latitude", value: (a) => a.coordinates?.lat },
  { label: "Longitude", value: (a) => a.coordinates?.lng },
  { label: "Type", value: (a) => a.type },
  { label: "Cause", value: (a) => a.cause },
  { label: "Severity", value: (a) => a.severity },
  { label: "Injured", value: (a) => a.injured },
  { label: "Deaths", value: (a) => a.deaths },
  { label: "Vehicles", value: (a) => (a.vehicles || []).map((v) => v.type).join(" | ") },
];

// Only admin/officer get the sensitive columns
const staffColumns = [
  { label: "Plates", value: (a) => (a.vehicles || []).map((v) => v.plate || "-").join(" | ") },
  { label: "Notes", value: (a) => a.notes },
  { label: "Entered by", value: (a) => a.createdBy?.name },
];

// GET /api/reports/accidents.csv?from=&to=&district=&type=&cause=&severity=&location=
export const exportAccidentsCsv = asyncHandler(async (req, res) => {
  const isViewer = req.user.role === ROLES.VIEWER;
  const filter = buildAccidentFilter(req.query);

  const query = Accident.find(filter)
    .sort({ date: -1 })
    .limit(10000)
    .populate("location", "name")
    .lean();
  if (!isViewer) query.populate("createdBy", "name");

  const accidents = await query;
  const csv = toCsv(isViewer ? publicColumns : [...publicColumns, ...staffColumns], accidents);

  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="accidents-${stamp}.csv"`);
  res.send(csv);
});

// GET /api/reports/summary?from=&to=&...   -> totals and a per-district table
export const getSummary = asyncHandler(async (req, res) => {
  const filter = buildAccidentFilter(req.query);

  const byDistrict = await Accident.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$district",
        accidents: { $sum: 1 },
        injured: { $sum: "$injured" },
        deaths: { $sum: "$deaths" },
      },
    },
    { $sort: { accidents: -1 } },
    { $project: { _id: 0, district: "$_id", accidents: 1, injured: 1, deaths: 1 } },
  ]);

  const totals = byDistrict.reduce(
    (t, d) => ({
      accidents: t.accidents + d.accidents,
      injured: t.injured + d.injured,
      deaths: t.deaths + d.deaths,
    }),
    { accidents: 0, injured: 0, deaths: 0 }
  );

  res.json({ totals, byDistrict });
});
