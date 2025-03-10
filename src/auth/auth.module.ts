import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
// import { MsalStrategy } from './strategies/msal.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'azure-msal' })
  ],
  controllers: [AuthController],
  providers: [AuthService ], //MsalStrategy
  exports: [AuthService] //MsalStrategy
})
export class AuthModule {}
