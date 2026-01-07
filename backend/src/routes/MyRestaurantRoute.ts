import express from "express";
import multer from "multer";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";

const router = express.Router();

// Configure Multer (Store file in memory before uploading)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);
// POST /api/my/restaurant
router.post(
  "/",
  upload.single("imageFile"), // 1. Handle File Upload
  validateMyRestaurantRequest, // 2. Validate Text Fields
  jwtCheck, // 3. Check Logged In
  jwtParse, // 4. Get User ID
  MyRestaurantController.createMyRestaurant // 5. Run Logic
);

router.put(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestaurantController.updateMyRestaurant
);

router.get(
  "/order",
  jwtCheck,
  jwtParse,
  MyRestaurantController.getMyRestaurantOrders
);

router.patch(
  "/order/:orderId/status",
  jwtCheck,
  jwtParse,
  MyRestaurantController.updateOrderStatus
);

export default router;
