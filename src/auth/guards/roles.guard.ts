import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles-protected.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        // const user = request.user;

        return requiredRoles.some(role => user?.roles?.includes(role));
    }
}
// export class RolesGuard implements CanActivate {
//     constructor(private reflector: Reflector) {}

//     canActivate(context: ExecutionContext): boolean {
//         const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
//         if (!requiredRoles) return true;
        
//         const request = context.switchToHttp().getRequest();
//         return requiredRoles.some(role => request.user.roles.includes(role));
//     }
// }
