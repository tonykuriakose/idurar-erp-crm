import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [
    // Configuration module with local .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Use local .env file
    }),

    // MongoDB connection with proper error handling
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('DATABASE');
        console.log('🔍 DATABASE URI:', uri ? 'Found' : 'NOT FOUND');
        
        if (!uri) {
          throw new Error('DATABASE environment variable is not set');
        }
        
        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),

    // Feature modules
    IntegrationModule,
  ],
})
export class AppModule {}