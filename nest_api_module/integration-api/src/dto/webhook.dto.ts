import { IsString, IsEmail, IsOptional, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookLeadDto {
  @ApiProperty({ description: 'Lead source name' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Lead name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Lead email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Lead phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Lead company name', required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ description: 'Lead message or inquiry', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Lead interest/product category', required: false })
  @IsOptional()
  @IsString()
  interest?: string;

  @ApiProperty({ description: 'Lead priority level', enum: ['Low', 'Medium', 'High'], default: 'Medium' })
  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High'])
  priority?: string;
}

export class WebhookResponseDto {
  @ApiProperty({ description: 'Processing status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Created lead/query ID', required: false })
  leadId?: string;

  @ApiProperty({ description: 'Processing timestamp' })
  timestamp: Date;
}