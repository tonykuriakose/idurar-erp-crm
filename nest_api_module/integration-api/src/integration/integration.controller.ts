import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IntegrationService } from './integration.service.js';
import { WebhookLeadDto, WebhookResponseDto } from '../dto/webhook.dto.js';

@ApiTags('integration')
@Controller('reports')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get comprehensive business summary report' })
  @ApiResponse({ status: 200, description: 'Summary report generated successfully' })
  async getSummaryReport() {
    try {
      const report = await this.integrationService.generateSummaryReport();
      return {
        success: true,
        data: report,
        message: 'Summary report generated successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to generate summary report',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('invoices/analytics')
  @ApiOperation({ summary: 'Get detailed invoice analytics' })
  @ApiResponse({ status: 200, description: 'Invoice analytics retrieved successfully' })
  async getInvoiceAnalytics() {
    try {
      const analytics = await this.integrationService.getInvoiceAnalytics();
      return {
        success: true,
        data: analytics,
        message: 'Invoice analytics retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve invoice analytics',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('queries/analytics')
  @ApiOperation({ summary: 'Get detailed query/support analytics' })
  @ApiResponse({ status: 200, description: 'Query analytics retrieved successfully' })
  async getQueryAnalytics() {
    try {
      const analytics = await this.integrationService.getQueryAnalytics();
      return {
        success: true,
        data: analytics,
        message: 'Query analytics retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve query analytics',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('clients/top-revenue')
  @ApiOperation({ summary: 'Get top clients by revenue' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of top clients to return', example: 10 })
  @ApiResponse({ status: 200, description: 'Top clients retrieved successfully' })
  async getTopClientsByRevenue(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 10;
      const topClients = await this.integrationService.getTopClientsByRevenue(limitNum);
      return {
        success: true,
        data: topClients,
        message: `Top ${limitNum} clients by revenue retrieved successfully`
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve top clients',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Process incoming lead webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully', type: WebhookResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async processWebhook(@Body() webhookData: WebhookLeadDto): Promise<WebhookResponseDto> {
    try {
      const result = await this.integrationService.processWebhookLead(webhookData);
      
      if (!result.success) {
        throw new HttpException(result, HttpStatus.BAD_REQUEST);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Failed to process webhook',
          timestamp: new Date()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      success: true,
      message: 'Integration API is running',
      timestamp: new Date(),
      version: '1.0.0'
    };
  }
}