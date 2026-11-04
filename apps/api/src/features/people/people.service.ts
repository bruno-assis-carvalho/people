import { Types } from "mongoose";
import type {
  CreatePersonRequest,
  PersonResponse,
  UpdatePersonRequest,
} from "@genesis/interfaces";
import { PersonModel } from "./people.model";
import { TraceMethod } from "../../observability/trace.decorator";

const toResponse = (person: {
  _id: Types.ObjectId;
  name: string;
  email: string;
}): PersonResponse => ({
  id: person._id.toString(),
  name: person.name,
  email: person.email,
});

export class PeopleService {
  @TraceMethod("PeopleService.list")
  async list(): Promise<PersonResponse[]> {
    const people = await PersonModel.find().sort({ name: 1 }).lean();
    return people.map((person) => toResponse(person));
  }

  @TraceMethod("PeopleService.findById")
  async findById(id: string): Promise<PersonResponse | undefined> {
    if (!Types.ObjectId.isValid(id)) {
      return undefined;
    }

    const person = await PersonModel.findById(id).lean();
    return person ? toResponse(person) : undefined;
  }

  @TraceMethod("PeopleService.create")
  async create(input: CreatePersonRequest): Promise<PersonResponse> {
    const person = await PersonModel.create(input);
    return toResponse(person);
  }

  @TraceMethod("PeopleService.update")
  async update(
    id: string,
    input: UpdatePersonRequest,
  ): Promise<PersonResponse | undefined> {
    if (!Types.ObjectId.isValid(id)) {
      return undefined;
    }

    const person = await PersonModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    }).lean();

    return person ? toResponse(person) : undefined;
  }

  @TraceMethod("PeopleService.remove")
  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await PersonModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
