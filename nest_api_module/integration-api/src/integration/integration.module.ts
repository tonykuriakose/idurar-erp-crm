import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';
import { Invoice, InvoiceSchema } from '../models/invoice.schema';
import { Query, QuerySchema } from '../models/query.schema';
import { Client, ClientSchema } from '../models/client.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Query.name, schema: QuerySchema },
      { name: Client.name, schema: ClientSchema },
    ]),
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}