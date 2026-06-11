import { Router } from "express";
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoice,
  sendInvoice,
} from "../controllers/invoice.controller.js";

const router = Router();

function wrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.get("/", wrap(listInvoices));
router.post("/", wrap(createInvoice));
router.get("/:id", wrap(getInvoice));
router.put("/:id", wrap(updateInvoice));
router.delete("/:id", wrap(deleteInvoice));
router.get("/:id/download", wrap(downloadInvoice));
router.post("/:id/send", wrap(sendInvoice));

export default router;
