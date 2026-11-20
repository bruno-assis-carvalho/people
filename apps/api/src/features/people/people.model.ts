import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const personSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, default: "" },
    document: { type: String, required: true, default: "" },
    birthDate: { type: String, required: true, default: "" },
    city: { type: String, required: true, default: "" },
    status: {
      type: String,
      enum: ["Ativo", "Inativo"],
      required: true,
      default: "Ativo",
    },
  },
  { strict: true, versionKey: false },
);

export type Person = InferSchemaType<typeof personSchema>;
export type PersonDocument = HydratedDocument<Person>;

export const PersonModel = model<Person>("Person", personSchema);
