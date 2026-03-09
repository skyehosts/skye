import { IsNumber, IsString, MaxLength } from 'class-validator';

export class ExampleDto {
  @IsString()
  @MaxLength(25)
  foo: string;

  @IsNumber()
  bar: number;
}
