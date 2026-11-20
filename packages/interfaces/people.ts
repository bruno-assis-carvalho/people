import "reflect-metadata";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from "class-validator";

export class CreatePersonRequest {
  @IsString({ message: "Name must be a string" })
  @Length(1, 100, {
    message: "Name is required and must be 100 characters or fewer",
  })
  name!: string;

  @IsEmail({}, { message: "Please enter a valid email address" })
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsIn(["Ativo", "Inativo"])
  status?: "Ativo" | "Inativo";
}

export class UpdatePersonRequest {
  @IsString({ message: "Name must be a string" })
  @Length(1, 100, {
    message: "Name is required and must be 100 characters or fewer",
  })
  name!: string;

  @IsEmail({}, { message: "Please enter a valid email address" })
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsIn(["Ativo", "Inativo"])
  status?: "Ativo" | "Inativo";
}

export class ValidationIssue {
  @IsString()
  property!: string;

  @IsArray()
  @IsString({ each: true })
  constraints!: string[];
}

export class PersonResponse {
  @IsString({ message: "ID must be a string" })
  id!: string;

  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name is required" })
  @Length(1, 100, { message: "Name must be 100 characters or fewer" })
  name!: string;

  @IsEmail({}, { message: "Please enter a valid email address" })
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  document!: string;

  @IsOptional()
  @IsDateString()
  birthDate!: string;

  @IsString()
  city!: string;

  @IsIn(["Ativo", "Inativo"])
  status!: "Ativo" | "Inativo";
}

export class ErrorResponse {
  @IsString()
  message!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationIssue)
  details?: ValidationIssue[];
}
