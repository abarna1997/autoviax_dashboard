export const fleetTrend = [
  { t: "00:00", utilisation: 62, autonomy: 71, incidents: 2 },
  { t: "03:00", utilisation: 55, autonomy: 74, incidents: 1 },
  { t: "06:00", utilisation: 74, autonomy: 79, incidents: 3 },
  { t: "09:00", utilisation: 88, autonomy: 83, incidents: 2 },
  { t: "12:00", utilisation: 91, autonomy: 86, incidents: 1 },
  { t: "15:00", utilisation: 84, autonomy: 88, incidents: 0 },
  { t: "18:00", utilisation: 93, autonomy: 90, incidents: 1 },
  { t: "21:00", utilisation: 77, autonomy: 92, incidents: 0 },
];

export const sensorHealth = [
  { name: "LiDAR", value: 98 },
  { name: "Radar", value: 95 },
  { name: "Camera", value: 92 },
  { name: "Ultrasonic", value: 88 },
  { name: "IMU / GNSS", value: 99 },
];

export const vehicles = [
  {
    id: "AVX-1042",
    route: "Colombo → Galle",
    mode: "L4 Autonomous",
    battery: 82,
    eta: "18m",
    status: "On route",
  },
  {
    id: "AVX-2318",
    route: "Depot 3 → Hub A",
    mode: "L4 Autonomous",
    battery: 64,
    eta: "42m",
    status: "On route",
  },
  {
    id: "AVX-0871",
    route: "Hub A → Port",
    mode: "Teleop assist",
    battery: 47,
    eta: "07m",
    status: "Assisted",
  },
  {
    id: "AVX-5590",
    route: "Ring corridor",
    mode: "L3 Supervised",
    battery: 91,
    eta: "31m",
    status: "On route",
  },
  { id: "AVX-3127", route: "Depot 1", mode: "Idle", battery: 100, eta: "—", status: "Charging" },
];

export const alerts = [
  {
    title: "Sensor drift detected",
    detail: "AVX-0871 camera calibration variance 2.4%",
    time: "2m ago",
    level: "warn",
  },
  {
    title: "Route re-optimised",
    detail: "Corridor 14 congestion — 11 vehicles rerouted",
    time: "9m ago",
    level: "info",
  },
  {
    title: "Safety envelope held",
    detail: "Pedestrian cut-in handled at 42 km/h",
    time: "26m ago",
    level: "ok",
  },
  {
    title: "Charge window shifted",
    detail: "Depot 3 grid pricing peak avoided",
    time: "1h ago",
    level: "info",
  },
];
