import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const personSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
  },
  { strict: true, versionKey: false },
);

export type Person = InferSchemaType<typeof personSchema>;
export type PersonDocument = HydratedDocument<Person>;

export const PersonModel = model<Person>("Person", personSchema);
