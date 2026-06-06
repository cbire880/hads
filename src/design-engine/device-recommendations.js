const DEVICE_CATALOG = {
  motion_sensor: { label: "Motion sensor", unitCostUsd: 35 },
  smart_switch: { label: "Smart switch", unitCostUsd: 45 },
  contact_sensor: { label: "Door/window contact sensor", unitCostUsd: 25 },
  indoor_camera: { label: "Indoor camera", unitCostUsd: 80 },
  hub: { label: "Automation hub", unitCostUsd: 120 },
};

export function recommendDevicePlacement(floorPlan) {
  const recommendations = [];
  const featureCounts = Object.fromEntries(
    (floorPlan.features?.features ?? []).map((feature) => [feature.type, feature.count]),
  );

  for (const room of floorPlan.rooms) {
    recommendations.push({
      roomId: room.id,
      roomLabel: room.label,
      deviceType: "motion_sensor",
      quantity: 1,
      priority: "standard",
      reason: `Baseline occupancy detection for ${room.label}.`,
    });

    if (/entry|living/i.test(room.label)) {
      recommendations.push({
        roomId: room.id,
        roomLabel: room.label,
        deviceType: "smart_switch",
        quantity: 1,
        priority: "high",
        reason: `High-traffic lighting control for ${room.label}.`,
      });
    }

    if (/entry/i.test(room.label) && featureCounts.door > 0) {
      recommendations.push({
        roomId: room.id,
        roomLabel: room.label,
        deviceType: "contact_sensor",
        quantity: Math.min(featureCounts.door, 2),
        priority: "high",
        reason: "Monitor primary entry door state.",
      });
    }

    if (/living/i.test(room.label) && featureCounts.window > 0) {
      recommendations.push({
        roomId: room.id,
        roomLabel: room.label,
        deviceType: "indoor_camera",
        quantity: 1,
        priority: "optional",
        reason: "Cover large shared area after confirming privacy requirements.",
      });
    }
  }

  recommendations.push({
    roomId: "central",
    roomLabel: "Central",
    deviceType: "hub",
    quantity: 1,
    priority: "required",
    reason: "Coordinate recommended devices and local automations.",
  });

  return recommendations;
}

export function generateBillOfMaterials(recommendations) {
  const lineMap = new Map();

  for (const recommendation of recommendations) {
    const catalogItem = DEVICE_CATALOG[recommendation.deviceType];
    if (!catalogItem) {
      continue;
    }

    const existing = lineMap.get(recommendation.deviceType) ?? {
      deviceType: recommendation.deviceType,
      label: catalogItem.label,
      quantity: 0,
      unitCostUsd: catalogItem.unitCostUsd,
      estimatedCostUsd: 0,
      priorities: new Set(),
    };

    existing.quantity += recommendation.quantity ?? 1;
    existing.estimatedCostUsd = existing.quantity * existing.unitCostUsd;
    existing.priorities.add(recommendation.priority);
    lineMap.set(recommendation.deviceType, existing);
  }

  const items = [...lineMap.values()].map((item) => ({
    ...item,
    priorities: [...item.priorities].sort(),
  }));

  return {
    currency: "USD",
    items,
    estimatedTotalUsd: items.reduce((sum, item) => sum + item.estimatedCostUsd, 0),
  };
}
