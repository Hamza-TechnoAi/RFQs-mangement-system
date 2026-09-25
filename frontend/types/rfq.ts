export type RFQStatus =
  | "Pending"
  | "Waiting Supplier Quotation"
  | "Submitted";

import type { User } from "./auth";

export interface RFQ {
  _id: string;
  rfqNumber: string;
  rfqDate: string;
  customer: string;
  contactPerson: string;
  email: string;
  subject: string;

  assignedTo: User;

  status: RFQStatus;

  submissionDate?: string;

  preparedBy?: User;
  createdBy?: User;

  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination { page: number; limit: number; total: number; pages: number; }
export interface RFQListResponse { success: true; data: RFQ[]; pagination: Pagination; }
export interface RFQPayload {
  rfqNumber: string; rfqDate: string; customer: string; contactPerson: string;
  email: string; subject: string; assignedTo: string; status: RFQStatus;
  submissionDate?: string; preparedBy?: string;
}
