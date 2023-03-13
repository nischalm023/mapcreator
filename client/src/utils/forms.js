import { number, object, string, array } from "yup";
import _ from "lodash";
import * as constants from "../constants";

const directions = [0, 1, 2, 3];
const directionNames = ["Top", "Right", "Bottom", "Left"];
export const directionsAndNames = _.zip(directions, directionNames);

export const directionSchema = {
  type: "number",
  title: "Direction",
  default: 0,
  enum: directions,
  enumNames: directionNames
};

export const listOfBarcodesSchema = {
  type: "string",
  title: "Barcodes",
  pattern: ""
};

export const barcodeStringSchema = {
  type: "string",
  title: "Barcode",
  pattern: ""
};

export const neighboursSchema = {
  type: "object",
  required: ["neighbours", "size_info"],
  properties: {
    neighbours: {
      type: "string",
      title: "Neighbour Structure",
      pattern: "^[01], *[01], *[01]$"
    },
    size_info: {
      type: "number",
      title: "Size Info",
      minimum: 0
    }
  },
  title: "Neighbours"
};

// yup schemas

export const yupPosIntSchema = number()
  .required("Required")
  .integer("Should be integer")
  .min(1, "Should be positive integer");

export const yupMSUMappingSchema = string()
  .required("Please select any one option");

export const yupNonNegIntSchema = number()
  .required("Required")
  .integer("Should be integer")
  .min(0, "Should be non-negative integer");

export const yupNonNegBarcodeDistanceIntSchema = number()
  .required("Required")
  .integer("Should be integer")
  .min(200, "Should be non-negative integer and greater than 200");

export const yupBarcodeStringSchema = string()
  .required("Required")
  .matches(/^\d\d\d\.\d\d\d$/, "Should match barcode pattern (eg. 000.001)");

export const yupEntryExitBarcodesSchema = array().of(
  object().shape({
    // barcode: yupBarcodeStringSchema,
    boom_barrier_id: yupPosIntSchema,
    floor_id: yupPosIntSchema
  })
);

export const yupCoordinateStringSchema = string()
  .required("Required")
  .matches(/^\d+,\d+$/, "Should match coordinate pattern (eg. 5,6)");

export const yupDirectionSchema = number()
  .required("Required")
  .oneOf([0, 1, 2, 3]);

export const yupCoordinateListSchema = array()
  .of(
    object().shape({
      coordinate: yupCoordinateStringSchema,
      direction: yupDirectionSchema
    })
  )
  .min(1, "Atleast one coordinate required");

//default schema to select MSU while creating MAP

export const msuDimensionAndNames = _.zip(constants.MSUDIMENSIONS, constants.MSUDIMENSIONSNAMES);

export const barcodeDistance12xAndNames = _.zip(constants.BARCODEDISTANCE12X, constants.BARCODEDISTANCE12XNAMES);

export const barcodeDistance15xAndNames = _.zip(constants.BARCODEDISTANCE15X, constants.BARCODEDISTANCE15XNAMES);