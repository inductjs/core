// import {
//   InductSQL,
// } from "@inductjs/core";
// import { ProductModel, ProductSchema } from "../product-model";
// import { openConnection } from "../db";

// const db = openConnection();

// const induct = new InductSQL({
//   db,
//   schema: ProductSchema,
//   idField: "ProductID",
//   tableName: "SalesLT.Product",
//   fields: ["ProductID", "Name", "ProductNumber"],
//   customModel: ProductModel,
// });

// const router = induct.router();

// router.get("/catalog/version", induct.query<ProductModel>("getCatalogVersion"));
// router.patch("/catalog/version", induct.mutation<ProductModel>("updateCatalogVersion"));

// export { router };
