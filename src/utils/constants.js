export const ROLES = Object.freeze({
  ADMIN: "admin",
  OFFICER: "officer",
  VIEWER: "viewer",
});
export const ROLE_LIST = Object.values(ROLES);

// Kabul has 22 police districts: PD1 ... PD22
export const DISTRICTS = Array.from({ length: 22 }, (_, i) => `PD${i + 1}`);

export const ACCIDENT_TYPES = ["collision", "pedestrian", "rollover", "hit_and_run", "other"];
export const ACCIDENT_CAUSES = ["speeding", "wrong_way", "mechanical", "distracted", "other"];
export const VEHICLE_TYPES = [
  "car",
  "motorcycle",
  "rickshaw",
  "bus",
  "truck",
  "van",
  "bicycle",
  "other",
];
export const SEVERITIES = ["low", "medium", "high"];

// Rough bounding box around Kabul city, used to reject wrong coordinates
export const KABUL_BOUNDS = Object.freeze({
  minLat: 34.35,
  maxLat: 34.7,
  minLng: 68.95,
  maxLng: 69.45,
});

export const TIMEZONE = "Asia/Kabul";
export const KABUL_UTC_OFFSET_MS = 4.5 * 60 * 60 * 1000; // UTC+04:30

export const MAX_PHOTOS_PER_ACCIDENT = 5;
