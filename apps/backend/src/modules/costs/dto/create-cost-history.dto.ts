import { IsISO8601, IsInt, IsNumber, Min } from 'class-validator';

export class CreateCostHistoryDto {
  @IsInt()
  @Min(1)
  costId!: number;

  @IsNumber({}, { message: 'costValue harus angka' })
  @Min(0)
  costValue!: number;

  @IsISO8601()
  dateFrom!: string;
}
