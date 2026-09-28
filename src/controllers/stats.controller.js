import Accident from "../models/Accident.js";
import Location from "../models/Location.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildAccidentFilter } from "../utils/accidentFilter.js";
import { presentAccident } from "../utils/sanitize.js";
import { getKabulYearMonth, percentChange } from "../utils/date.js";
import { TIMEZONE, KABUL_UTC_OFFSET_MS } from "../utils/constants.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Counts grouped by a field, biggest first
const groupBy = (field, limit) => [
  { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  ...(limit ? [{ $limit: limit }] : []),
  { $project: { _id: 0, label: "$_id", count: 1 } },
];

// GET /api/stats/dashboard?year=2026   (all roles)
// Feeds the 4 cards, the "Accidents Per Month" chart and the "Recent Accidents" table.
export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = getKabulYearMonth();
  const year = req.query.year ?? now.year;

  // Year boundaries in Kabul time (UTC+4:30)
  const yearStart = new Date(Date.UTC(year, 0, 1) - KABUL_UTC_OFFSET_MS);
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1) - KABUL_UTC_OFFSET_MS);
  // Slightly wider range for the monthly groups, so "last month" works in January too
  const wideStart = new Date(Date.UTC(year - 1, 10, 30));
  const wideEnd = new Date(Date.UTC(year + 1, 0, 2));

  const inYear = { date: { $gte: yearStart, $lt: yearEnd } };
  const dateParts = { date: "$date", timezone: TIMEZONE };

  const [facets] = await Accident.aggregate([
    { $match: { isDeleted: false, date: { $gte: wideStart, $lt: wideEnd } } },
    {
      $facet: {
        monthly: [
          {
            $group: {
              _id: { y: { $year: dateParts }, m: { $month: dateParts } },
              count: { $sum: 1 },
              injured: { $sum: "$injured" },
              deaths: { $sum: "$deaths" },
            },
          },
        ],
        byDistrict: [{ $match: inYear }, ...groupBy("district", 10)],
        byCause: [{ $match: inYear }, ...groupBy("cause")],
        byType: [{ $match: inYear }, ...groupBy("type")],
        bySeverity: [{ $match: inYear }, ...groupBy("severity")],
        topLocations: [
          { $match: { ...inYear, location: { $ne: null } } },
          {
            $group: {
              _id: "$location",
              count: { $sum: 1 },
              injured: { $sum: "$injured" },
              deaths: { $sum: "$deaths" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $lookup: { from: "locations", localField: "_id", foreignField: "_id", as: "loc" } },
          { $unwind: "$loc" },
          {
            $project: {
              _id: 0,
              locationId: "$_id",
              name: "$loc.name",
              district: "$loc.district",
              lat: "$loc.lat",
              lng: "$loc.lng",
              count: 1,
              injured: 1,
              deaths: 1,
            },
          },
        ],
      },
    },
  ]);

  const monthly = new Map(facets.monthly.map((r) => [`${r._id.y}-${r._id.m}`, r]));
  const at = (y, m) => monthly.get(`${y}-${m}`) || { count: 0, injured: 0, deaths: 0 };

  const perMonth = MONTHS.map((label, i) => {
    const r = at(year, i + 1);
    return { month: label, count: r.count, injured: r.injured, deaths: r.deaths };
  });

  const total = perMonth.reduce(
    (acc, m) => ({
      count: acc.count + m.count,
      injured: acc.injured + m.injured,
      deaths: acc.deaths + m.deaths,
    }),
    { count: 0, injured: 0, deaths: 0 }
  );

  // "% vs last month" only makes sense for the current year
  let change = { count: null, injured: null, deaths: null, locations: null };
  const startOfThisMonth = new Date(Date.UTC(now.year, now.month - 1, 1) - KABUL_UTC_OFFSET_MS);
  const [locationsNow, locationsBefore] = await Promise.all([
    Location.countDocuments({ isActive: true }),
    Location.countDocuments({ isActive: true, createdAt: { $lt: startOfThisMonth } }),
  ]);

  if (year === now.year) {
    const cur = at(now.year, now.month);
    const prev = now.month === 1 ? at(now.year - 1, 12) : at(now.year, now.month - 1);
    change = {
      count: percentChange(cur.count, prev.count),
      injured: percentChange(cur.injured, prev.injured),
      deaths: percentChange(cur.deaths, prev.deaths),
      locations: percentChange(locationsNow, locationsBefore),
    };
  }

  const recentQuery = Accident.find({ isDeleted: false })
    .sort({ date: -1 })
    .limit(5)
    .populate("location", "name district")
    .lean();
  const recent = (await recentQuery).map((a) => presentAccident(a, req.user.role));

  res.json({
    year,
    cards: {
      totalAccidents: { value: total.count, change: change.count },
      injured: { value: total.injured, change: change.injured },
      deaths: { value: total.deaths, change: change.deaths },
      locations: { value: locationsNow, change: change.locations },
    },
    perMonth,
    byDistrict: facets.byDistrict,
    byCause: facets.byCause,
    byType: facets.byType,
    bySeverity: facets.bySeverity,
    topLocations: facets.topLocations,
    recent,
  });
});

// GET /api/stats/map   (all roles) -> light points for the map / hotspots
export const getMapPoints = asyncHandler(async (req, res) => {
  const filter = buildAccidentFilter(req.query);
  filter["coordinates.lat"] = { $ne: null };
  filter["coordinates.lng"] = { $ne: null };

  const points = await Accident.find(filter)
    .select("date district coordinates type cause injured deaths severity roadName")
    .sort({ date: -1 })
    .limit(5000)
    .lean();

  res.json({ data: points });
});
