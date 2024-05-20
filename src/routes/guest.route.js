import { Router } from "express";
import { addGuest } from "../controllers/guest.controller";

const guestRouter = Router();

//adding guest
guestRouter.route("/").post(addGuest);
export default guestRouter;
