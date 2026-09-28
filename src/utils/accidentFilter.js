import mongoose from "mongoose";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Builds a MongoDB filter from validated query params
export const buildAccidentFilter = (q = {}) => {
  const filter = { isDeleted: false };

  if (q.from || q.to) {
    filter.date = {};
    if (q.from) filter.date.$gte = q.from;
    if (q.to) {
      const end = new Date(q.to);
      end.setUTCHours(23, 59, 59, 999); // include the whole "to" day
      filter.date.$lte = end;
    }
  }
  if (q.district) filter.district = q.district;
  if (q.type) filter.type = q.type;
  if (q.cause) filter.cause = q.cause;
  if (q.severity) filter.severity = q.severity;
  if (q.location) filter.location = new mongoose.Types.ObjectId(q.location);
  if (q.search) filter.roadName = { $regex: escapeRegex(q.search), $options: "i" };

  return filter;
};
