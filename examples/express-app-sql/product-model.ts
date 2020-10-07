import { InductModelOpts, InductModel } from "@inductjs/core";

export class ProductSchema {
  ProductID: number;
  Name: string;
  ProductNumber: string;
  Color: string | null;
  StandardCost: number;
  ListPrice: number;
  Size: string;
  weight: number | null;
  ProductCategoryID: number | null;
  ProductModelID: number | null;
  SellStartDate: Date;
  SellEndDate: Date | null;
  DiscontinuedDate: Date | null;
  ThumbNailPhoto: Blob | null;
  ThumbNailPhotoName: string | null;
  rowguid: string;
  ModifiedDate: Date;
  CatalogVersion: string;

  constructor(val: ProductSchema) {
    Object.assign(this, val);
  }
}

export class ProductModel extends InductModel<ProductSchema> {
  constructor(val: ProductSchema, opts: InductModelOpts<ProductSchema>) {
    super(val, opts);

    // Binding this context
    this.updateCatalogVersion = this.updateCatalogVersion.bind(this);
  }

  getCatalogVersion() {
    return "1.0";
  };

  updateCatalogVersion() {
    // The values from the request body are stored in this.model
    return `Catalog version updated to: ${this.model.CatalogVersion}`;
  };
}
