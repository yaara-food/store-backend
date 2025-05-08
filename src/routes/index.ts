import { Request, Response, Router } from "express";
import authRouter from "./auth";
import publicRouter from "./public";
import { authMiddleware } from "../service";

const router = Router();
router.use("/", publicRouter);
router.use("/auth", authMiddleware, authRouter);
router.get("/check", async (req: Request, res: Response) => {
  res.json({ message: "it's working" });
});

export default router;
