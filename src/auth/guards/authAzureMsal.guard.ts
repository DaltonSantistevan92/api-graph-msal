
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class AuthAzureMsalGuards extends AuthGuard('azure-msal') implements CanActivate {

  async canActivate(context: ExecutionContext) : Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }

    // console.log('token AuthAzureMsalGuards', token );
    
    try {
      request['token'] = token;
    } catch (error)  {

      if(error.status === 401) throw new UnauthorizedException(error.message);
      
      throw new UnauthorizedException('Error desconocido durante la autenticación');
    }

    return true;

  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

