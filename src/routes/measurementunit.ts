import { Router } from "express";
import {
  getMeasurementUnits,
  getMeasurementUnitById,
  createMeasurementUnit,
  updateMeasurementUnit,
  deleteMeasurementUnit,
  getMeasurementUnitConversions,
  deleteMeasurementConversions,
  createMeasurementUnitConversion,
  updateMeasurementUnitConversion,
} from "../controller/admin/measurementunit";

const router = Router();

router.get("/", getMeasurementUnits);
router.post("/", createMeasurementUnit);

// Static routes must come before /:id
router.get("/conversion", getMeasurementUnitConversions);
router.delete("/conversion/:id", deleteMeasurementConversions);
router.post("/conversion", createMeasurementUnitConversion);
router.put("/conversion/:id", updateMeasurementUnitConversion);

// Dynamic routes
router.get("/:id", getMeasurementUnitById);
router.put("/:id", updateMeasurementUnit);
router.delete("/:id", deleteMeasurementUnit);

export default router;
