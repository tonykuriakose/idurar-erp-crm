import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Invoice, InvoiceDocument } from '../models/invoice.schema';
import { Query, QueryDocument } from '../models/query.schema';
import { Client, ClientDocument } from '../models/client.schema';
import { WebhookLeadDto, WebhookResponseDto } from '../dto/webhook.dto';

@Injectable()
export class IntegrationService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Query.name) private queryModel: Model<QueryDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  /**
   * Generate comprehensive summary report
   */
  async generateSummaryReport() {
    const [
      totalInvoices,
      totalQueries,
      totalClients,
      paidInvoices,
      pendingInvoices,
      openQueries,
      closedQueries,
      highPriorityQueries,
      revenueStats,
      monthlyInvoices,
      queryStatusDistribution
    ] = await Promise.all([
      this.invoiceModel.countDocuments({ removed: false }),
      this.queryModel.countDocuments({ removed: false }),
      this.clientModel.countDocuments({ removed: false }),
      this.invoiceModel.countDocuments({ removed: false, paymentStatus: 'paid' }),
      this.invoiceModel.countDocuments({ removed: false, paymentStatus: { $in: ['unpaid', 'partially'] } }),
      this.queryModel.countDocuments({ removed: false, status: 'Open' }),
      this.queryModel.countDocuments({ removed: false, status: 'Closed' }),
      this.queryModel.countDocuments({ removed: false, priority: { $in: ['High', 'Critical'] }, status: { $ne: 'Closed' } }),
      this.calculateRevenueStats(),
      this.getMonthlyInvoiceStats(),
      this.getQueryStatusDistribution()
    ]);

    const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
    const resolutionRate = totalQueries > 0 ? Math.round((closedQueries / totalQueries) * 100) : 0;

    return {
      overview: {
        totalInvoices,
        totalQueries,
        totalClients,
        collectionRate: `${collectionRate}%`,
        resolutionRate: `${resolutionRate}%`
      },
      invoices: {
        total: totalInvoices,
        paid: paidInvoices,
        pending: pendingInvoices,
        overdue: await this.invoiceModel.countDocuments({ removed: false, isOverdue: true })
      },
      queries: {
        total: totalQueries,
        open: openQueries,
        closed: closedQueries,
        highPriority: highPriorityQueries,
        statusDistribution: queryStatusDistribution
      },
      revenue: revenueStats,
      trends: {
        monthlyInvoices: monthlyInvoices
      },
      generatedAt: new Date()
    };
  }

  /**
   * Get invoice statistics by status and month
   */
  async getInvoiceAnalytics() {
    const pipeline: any[] = [
      { $match: { removed: false } },
      {
        $group: {
          _id: {
            status: '$status',
            paymentStatus: '$paymentStatus',
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          avgAmount: { $avg: '$total' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ];

    return await this.invoiceModel.aggregate(pipeline).exec();
  }

  /**
   * Get query analytics by priority and resolution time
   */
  async getQueryAnalytics() {
    const pipeline: any[] = [
      { $match: { removed: false } },
      {
        $group: {
          _id: {
            status: '$status',
            priority: '$priority',
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 },
          notesCount: { $sum: { $size: '$notes' } }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ];

    return await this.queryModel.aggregate(pipeline).exec();
  }

  /**
   * Process incoming webhook for lead generation
   */
  async processWebhookLead(leadData: WebhookLeadDto): Promise<WebhookResponseDto> {
    try {
      // Generate query number first
      const queryCount = await this.queryModel.countDocuments({});
      const queryNumber = `QRY-${String(queryCount + 1).padStart(6, '0')}`;

      // Create a new query from lead data
      const queryData = {
        queryNumber,
        customerName: leadData.name,
        subject: `Lead from ${leadData.source}: ${leadData.interest || 'General Inquiry'}`,
        description: leadData.message || `New lead from ${leadData.source}. Contact: ${leadData.email}${leadData.phone ? `, ${leadData.phone}` : ''}`,
        status: 'Open',
        priority: leadData.priority || 'Medium',
        tags: ['lead', leadData.source.toLowerCase()],
        assignedTo: 'Sales Team',
        notes: [{
          content: `Lead captured from ${leadData.source}. Email: ${leadData.email}${leadData.company ? `, Company: ${leadData.company}` : ''}`,
          author: 'System',
          createdAt: new Date(),
          updatedAt: new Date()
        }],
        enabled: true,
        removed: false,
        // Note: createdBy will need to be set to a valid admin ID
        // For now, we'll use a placeholder or make it optional
      };

      const newQuery = new this.queryModel(queryData);
      const savedQuery = await newQuery.save();

      return {
        success: true,
        message: 'Lead processed successfully and converted to query',
        leadId: savedQuery._id.toString(),
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error processing webhook lead:', error);
      return {
        success: false,
        message: 'Failed to process lead',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get top clients by revenue
   */
  async getTopClientsByRevenue(limit: number = 10) {
    const pipeline: any[] = [
      { $match: { removed: false, paymentStatus: 'paid' } },
      {
        $lookup: {
          from: 'clients',
          localField: 'client',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      { $unwind: '$clientInfo' },
      {
        $group: {
          _id: '$client',
          clientName: { $first: '$clientInfo.name' },
          clientEmail: { $first: '$clientInfo.email' },
          totalRevenue: { $sum: '$total' },
          invoiceCount: { $sum: 1 },
          avgInvoiceValue: { $avg: '$total' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit }
    ];

    return await this.invoiceModel.aggregate(pipeline).exec();
  }

  // Private helper methods
  private async calculateRevenueStats() {
    const pipeline: any[] = [
      { $match: { removed: false } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] } },
          pendingRevenue: { $sum: { $cond: [{ $ne: ['$paymentStatus', 'paid'] }, '$total', 0] } },
          avgInvoiceValue: { $avg: '$total' },
          totalInvoiceValue: { $sum: '$total' }
        }
      }
    ];

    const stats = await this.invoiceModel.aggregate(pipeline).exec();
    return stats[0] || {
      totalRevenue: 0,
      pendingRevenue: 0,
      avgInvoiceValue: 0,
      totalInvoiceValue: 0
    };
  }

  private async getMonthlyInvoiceStats() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const pipeline: any[] = [
      { $match: { removed: false, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ];

    return await this.invoiceModel.aggregate(pipeline).exec();
  }

  private async getQueryStatusDistribution() {
    const pipeline: any[] = [
      { $match: { removed: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    return await this.queryModel.aggregate(pipeline).exec();
  }
}