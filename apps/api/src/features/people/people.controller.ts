import {
  Authorized,
  Body,
  Delete,
  Get,
  HttpCode,
  JsonController,
  Param,
  Post,
  Put,
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Types } from "mongoose";
import {
  CreatePersonRequest,
  PeopleErrorResponse as ErrorResponse,
  PersonResponse,
  UpdatePersonRequest,
} from "@genesis/interfaces";
import { PeopleService } from "./people.service";
import { AppError } from "../../shared/errors/app-error";
import { Observe } from "../../observability/observe.decorator";

const createPersonLookupError = (id: string): AppError => {
  if (!Types.ObjectId.isValid(id)) {
    return new AppError("INVALID_PERSON_ID", 400);
  }

  return new AppError("PERSON_NOT_FOUND", 404);
};
@JsonController("/people")
@Authorized()
@OpenAPI({
  tags: ["People"],
  security: [{ bearerAuth: [] }],
})
export class PeopleController {
  private readonly service = new PeopleService();

  @Get("/")
  @ResponseSchema(PersonResponse, {
    isArray: true,
    description: "People list",
  })
  @Observe("PeopleController.list")
  public async list(): Promise<PersonResponse[]> {
    return this.service.list();
  }

  @Get("/:id")
  @ResponseSchema(PersonResponse, { description: "Person found" })
  @ResponseSchema(ErrorResponse, {
    statusCode: 400,
    description: "Invalid person ID",
  })
  @ResponseSchema(ErrorResponse, {
    statusCode: 404,
    description: "Person not found",
  })
  @Observe("PeopleController.get")
  public async get(@Param("id") id: string): Promise<PersonResponse> {
    const person = await this.service.findById(id);
    if (!person) {
      throw createPersonLookupError(id);
    }

    return person;
  }

  @Post("/")
  @HttpCode(201)
  @ResponseSchema(PersonResponse, { description: "Person created" })
  @ResponseSchema(ErrorResponse, {
    statusCode: 400,
    description: "Invalid request",
  })
  @ResponseSchema(ErrorResponse, {
    statusCode: 409,
    description: "Email already exists",
  })
  @Observe("PeopleController.create")
  public async create(
    @Body({ required: true }) input: CreatePersonRequest,
  ): Promise<PersonResponse> {
    return this.service.create(input);
  }

  @Put("/:id")
  @ResponseSchema(PersonResponse, { description: "Person updated" })
  @ResponseSchema(ErrorResponse, {
    statusCode: 400,
    description: "Invalid person ID or request",
  })
  @ResponseSchema(ErrorResponse, {
    statusCode: 404,
    description: "Person not found",
  })
  @ResponseSchema(ErrorResponse, {
    statusCode: 409,
    description: "Email already exists",
  })
  @Observe("PeopleController.update")
  public async update(
    @Param("id") id: string,
    @Body({ required: true }) input: UpdatePersonRequest,
  ): Promise<PersonResponse> {
    const person = await this.service.update(id, input);
    if (!person) {
      throw createPersonLookupError(id);
    }

    return person;
  }

  @Delete("/:id")
  @HttpCode(204)
  @ResponseSchema(ErrorResponse, {
    statusCode: 400,
    description: "Invalid person ID",
  })
  @ResponseSchema(ErrorResponse, {
    statusCode: 404,
    description: "Person not found",
  })
  @Observe("PeopleController.remove")
  public async remove(@Param("id") id: string): Promise<void> {
    const removed = await this.service.remove(id);
    if (!removed) {
      throw createPersonLookupError(id);
    }
  }
}
