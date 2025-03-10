import { applyDecorators, UseGuards } from "@nestjs/common";
import { Role } from "../enums/role.enum";
import { RolesProtected } from "./roles-protected.decorator";
import { AuthAzureMsalGuards } from "../guards/authAzureMsal.guard";



export function Auth(...roles : Role[]) {
    return applyDecorators(
        RolesProtected( ...roles ),
        UseGuards( AuthAzureMsalGuards )
    );
}