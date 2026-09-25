import { Response } from "express";
import { Types } from "mongoose";
import RFQ, { IRFQ, RFQStatus } from "../models/RFQ";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorMiddleware";
import Notification from "../models/Notification";

const notify = async (recipient: Types.ObjectId | string | undefined, title: string, message: string, rfq: Types.ObjectId, actor?: Types.ObjectId) => {
  if (recipient && recipient.toString() !== actor?.toString()) await Notification.create({ recipient, title, message, rfq });
};

const statuses: RFQStatus[] = ["Pending", "Waiting Supplier Quotation", "Submitted"];
const required = ["rfqNumber", "rfqDate", "customer", "contactPerson", "email", "subject", "assignedTo"] as const;
const editableFields = new Set(["rfqNumber", "rfqDate", "customer", "contactPerson", "email", "subject", "assignedTo", "status", "submissionDate", "preparedBy"]);
const trimText = (value: unknown, name: string, max: number) => {
  if (typeof value !== "string") throw new Error(`Invalid ${name}`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) throw new Error(`Invalid ${name}`);
  return trimmed;
};
const validateBody = async (body: Record<string, unknown>) => {
  for (const key of Object.keys(body)) if (!editableFields.has(key)) throw new Error("Unexpected RFQ field");
  for (const field of required) if (!body[field]) throw new Error(`${field} is required`);
  const normalized = {
    rfqNumber: trimText(body.rfqNumber, "RFQ number", 100), rfqDate: new Date(String(body.rfqDate)), customer: trimText(body.customer, "customer", 160),
    contactPerson: trimText(body.contactPerson, "contact person", 160), email: trimText(body.email, "email", 254).toLowerCase(), subject: trimText(body.subject, "subject", 500),
    assignedTo: String(body.assignedTo), status: (body.status || "Pending") as RFQStatus, submissionDate: body.submissionDate ? new Date(String(body.submissionDate)) : undefined,
    preparedBy: body.preparedBy ? String(body.preparedBy) : undefined,
  };
  if (Number.isNaN(normalized.rfqDate.getTime()) || (normalized.submissionDate && Number.isNaN(normalized.submissionDate.getTime()))) throw new Error("Invalid date");
  if (!/^\S+@\S+\.\S+$/.test(normalized.email)) throw new Error("A valid email is required");
  if (!statuses.includes(normalized.status)) throw new Error("Invalid status");
  if (!Types.ObjectId.isValid(normalized.assignedTo) || !(await User.exists({ _id: normalized.assignedTo, isActive: true }))) throw new Error("Assigned user not found");
  if (normalized.status === "Submitted" && (!normalized.submissionDate || !normalized.preparedBy)) throw new Error("Submission Date and Prepared By are required when status is Submitted");
  if (normalized.preparedBy && (!Types.ObjectId.isValid(normalized.preparedBy) || !(await User.exists({ _id: normalized.preparedBy, isActive: true })))) throw new Error("Prepared By user not found");
  return normalized;
};

export const createRFQ = asyncHandler(async (req: AuthRequest, res: Response) => {
  let input; try { input = await validateBody(req.body); } catch (error) { res.status(400); throw error; }
  const created = await RFQ.create({ ...input, createdBy: req.user?._id });
  await notify(created.assignedTo, "New RFQ assigned", `${created.rfqNumber} has been assigned to you.`, created._id, req.user?._id);
  const data = await RFQ.findById(created._id).populate("assignedTo", "name email role").populate("preparedBy", "name email role").populate("createdBy", "name email role");
  res.status(201).json({ success: true, data });
});
export const getRFQs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const allowedQuery = new Set(["search", "status", "assignedTo", "page", "limit"]);
  for (const key of Object.keys(req.query)) if (!allowedQuery.has(key)) { res.status(400); throw new Error("Invalid filter"); }
  const parsePositive = (value: unknown, fallback: number, max: number) => { if (value === undefined) return fallback; if (typeof value !== "string" || !/^\d+$/.test(value) || Number(value) < 1) throw new Error("Invalid pagination"); return Math.min(Number(value), max); };
  let page: number, limit: number;
  try { page = parsePositive(req.query.page, 1, 100000); limit = parsePositive(req.query.limit, 10, 100); } catch (error) { res.status(400); throw error; }
  const filter: { $or?: Array<Record<string, { $regex: string; $options: string }>>; status?: RFQStatus; assignedTo?: Types.ObjectId } = {};
  if (req.user?.role === "member") filter.assignedTo = req.user._id;
  if (req.query.status !== undefined && (typeof req.query.status !== "string" || !statuses.includes(req.query.status as RFQStatus))) { res.status(400); throw new Error("Invalid status filter"); }
  if (req.query.assignedTo !== undefined && (typeof req.query.assignedTo !== "string" || !Types.ObjectId.isValid(req.query.assignedTo))) { res.status(400); throw new Error("Invalid assigned user filter"); }
  const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 160) : "";
  if (search) { const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); filter.$or = ["rfqNumber", "customer", "subject"].map((field) => ({ [field]: { $regex: safe, $options: "i" } })); }
  if (req.query.status) filter.status = req.query.status as RFQStatus;
  if (req.user?.role === "admin" && req.query.assignedTo) filter.assignedTo = new Types.ObjectId(req.query.assignedTo as string);
  const [data, total] = await Promise.all([RFQ.find(filter).populate("assignedTo", "name email role").populate("preparedBy", "name email role").populate("createdBy", "name email role").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), RFQ.countDocuments(filter)]);
  res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
export const getRFQById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await RFQ.findById(req.params.id).populate("assignedTo", "name email role").populate("preparedBy", "name email role").populate("createdBy", "name email role");
  if (!data) { res.status(404); throw new Error("RFQ not found"); }
  if (req.user?.role === "member" && data.assignedTo._id.toString() !== req.user._id.toString()) { res.status(403); throw new Error("You can only access assigned RFQs"); }
  res.json({ success: true, data });
});
export const updateRFQ = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await RFQ.findById(req.params.id);
  if (!existing) { res.status(404); throw new Error("RFQ not found"); }
  if (req.user?.role === "member") {
    if (existing.assignedTo.toString() !== req.user._id.toString()) { res.status(403); throw new Error("You can only update assigned RFQs"); }
    for (const key of Object.keys(req.body)) if (!editableFields.has(key)) { res.status(400); throw new Error("Unexpected RFQ field"); }
    const suppliedRFQDate = req.body.rfqDate === undefined ? undefined : new Date(String(req.body.rfqDate));
    const unchanged =
      (req.body.rfqNumber === undefined || String(req.body.rfqNumber).trim() === existing.rfqNumber) &&
      (suppliedRFQDate === undefined || (!Number.isNaN(suppliedRFQDate.getTime()) && suppliedRFQDate.toISOString().slice(0, 10) === existing.rfqDate.toISOString().slice(0, 10))) &&
      (req.body.customer === undefined || String(req.body.customer).trim() === existing.customer) &&
      (req.body.contactPerson === undefined || String(req.body.contactPerson).trim() === existing.contactPerson) &&
      (req.body.email === undefined || String(req.body.email).trim().toLowerCase() === existing.email) &&
      (req.body.subject === undefined || String(req.body.subject).trim() === existing.subject) &&
      (req.body.assignedTo === undefined || String(req.body.assignedTo) === existing.assignedTo.toString());
    if (!unchanged) { res.status(403); throw new Error("Members cannot edit RFQ details or assignment"); }
    if (req.body.status !== "Submitted" && (req.body.submissionDate || req.body.preparedBy)) { res.status(400); throw new Error("Submission Date and Prepared By can only be set when status is Submitted"); }
    req.body = { rfqNumber: existing.rfqNumber, rfqDate: existing.rfqDate, customer: existing.customer, contactPerson: existing.contactPerson, email: existing.email, subject: existing.subject, assignedTo: existing.assignedTo.toString(), status: req.body.status, submissionDate: req.body.submissionDate, preparedBy: req.body.preparedBy };
  }
  let update; try { update = await validateBody(req.body); } catch (error) { res.status(400); throw error; }
  if (update.status !== "Submitted") { update.submissionDate = undefined; update.preparedBy = undefined; }
  const data = await RFQ.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate("assignedTo", "name email role").populate("preparedBy", "name email role").populate("createdBy", "name email role");
  if (!data) { res.status(404); throw new Error("RFQ not found"); }
  const updated = data!;
  if (existing.assignedTo.toString() !== updated.assignedTo._id.toString()) await notify(updated.assignedTo._id, "RFQ reassigned", `${updated.rfqNumber} has been assigned to you.`, updated._id, req.user?._id);
  if (existing.status !== updated.status) {
    await notify(updated.assignedTo._id, "RFQ status updated", `${updated.rfqNumber} is now ${updated.status}.`, updated._id, req.user?._id);
    await notify(updated.createdBy as Types.ObjectId, "RFQ status updated", `${updated.rfqNumber} is now ${updated.status}.`, updated._id, req.user?._id);
  }
  res.json({ success: true, data: updated });
});
export const deleteRFQ = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!(await RFQ.findByIdAndDelete(req.params.id))) { res.status(404); throw new Error("RFQ not found"); }
  res.json({ success: true, message: "RFQ deleted" });
});
export const getStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const req = _req;
  const access = req.user?.role === "member" ? { assignedTo: req.user._id } : {};
  const start = new Date();
  start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0); start.setUTCMonth(start.getUTCMonth() - 5);
  const [counts, recent, activity] = await Promise.all([
    RFQ.aggregate<{ _id: RFQStatus; count: number }>([{ $match: access }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    RFQ.find(access).populate("assignedTo", "name email role").populate("preparedBy", "name email role").populate("createdBy", "name email role").sort({ createdAt: -1 }).limit(5),
    RFQ.aggregate<{ _id: string; count: number }>([{ $match: { ...access, createdAt: { $gte: start } } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
  ]);
  const stats = { total: 0, pending: 0, waiting: 0, submitted: 0 };
  for (const row of counts) { stats.total += row.count; if (row._id === "Pending") stats.pending = row.count; if (row._id === "Waiting Supplier Quotation") stats.waiting = row.count; if (row._id === "Submitted") stats.submitted = row.count; }
  const activityMap = new Map(activity.map((row) => [row._id, row.count]));
  const monthly = Array.from({ length: 6 }, (_, index) => { const date = new Date(start); date.setUTCMonth(start.getUTCMonth() + index); const key = date.toISOString().slice(0, 7); return { month: new Intl.DateTimeFormat("en", { month: "short" }).format(date), count: activityMap.get(key) || 0 }; });
  res.json({ success: true, data: { stats, recent, monthly } });
});
