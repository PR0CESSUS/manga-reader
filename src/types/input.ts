export type AppInputType = {
  type: "string" | "integer" | "float" | "boolean";
  min?: number;
  max?: number;
  size?: number;
  placeholder?: any;
  precision?: number;
};
//export type AppInputType = (AppInputIntegerType | AppInputFloatType | AppInputBooleanType | AppInputStringType) & {
//  placeholder?: any;
//  size?: number;
//};
export type AppInputIntegerType = {
  type: "integer";
};

export type AppInputFloatType = {
  type: "float";
  min?: number;
  max?: number;
  size?: number;
};
export type AppInputBooleanType = {
  type: "boolean";
  size?: number;
};

export type AppInputStringType = {
  type: "string";
  size?: number;
};
