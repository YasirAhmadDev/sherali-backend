// Severity is calculated automatically, officers do not choose it.
//   high   -> at least 1 death
//   medium -> 3 or more injured (no deaths)
//   low    -> everything else
export const calculateSeverity = (injured = 0, deaths = 0) => {
  if (deaths >= 1) return "high";
  if (injured >= 3) return "medium";
  return "low";
};
