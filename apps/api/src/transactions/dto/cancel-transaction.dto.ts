import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CancelTransactionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  reason: string;

  // Required unless the caller holds transaction.cancel_approve at the outlet.
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'approver_pin must be 6 digits' })
  approver_pin?: string;
}
