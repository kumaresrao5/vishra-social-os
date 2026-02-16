export type DocType = "invoice" | "quote";

export type Money = {
  currency: "MYR";
  value: number; // e.g. 4235 or 4235.5
};

export type Party = {
  name: string;
  subName?: string; // e.g. "(RA0077860-U)"
  addressLines: string[];
};

export type LineItem = {
  description: string;
  quantity: number;
  rate: number; // per unit, in MYR
};

export type InvoiceDoc = {
  type: "invoice";
  invoiceNo: string;
  invoiceDate: string; // display string, e.g. "Sep 30, 2024"
  billedBy: Party;
  billedTo: Party;
  items: LineItem[];
  reductions: number;
  termsAndConditions: string[];
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bank: string;
  };
  enquiryEmail: string;
};

export type QuoteDoc = {
  type: "quote";
  quotationNo: string;
  quotationDate: string; // display string, e.g. "Sep 30, 2024"
  quotationFrom: Party;
  quotationFor: Party;
  items: LineItem[];
  reductions: number;
  termsAndConditions: string[];
  enquiryEmail: string;
};

export type DocPayload = InvoiceDoc | QuoteDoc;

