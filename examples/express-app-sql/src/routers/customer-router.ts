
import { InductSQL } from "@inductjs/core";
import { openConnection } from "../db";

const db = openConnection();

export class CustomerSchema {
  CustomerID: number;
  NameStyle: number;
  Title: string;
  FirstName: string;
  MiddleName: string | null;
  Suffix: string | null;
  CompanyName: string;
  EmailAddress: string;
  phone: string;
  PasswordHash: string;
  PasswordSalt: string;
  rowguid: string;
  ModifiedDate: Date;

  constructor(val: CustomerSchema) {
    Object.assign(this, val);
  }
}

const induct = new InductSQL({
  db,
  schema: CustomerSchema,
  idField: "CustomerID",
  tableName: "SalesLT.Customer",
});

const router = induct.router();

export default router;
