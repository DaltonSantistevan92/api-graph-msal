import { Body, Controller, Delete, Get, HttpStatus, InternalServerErrorException, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Role } from './enums/role.enum';
import { AuthAzureMsalGuards } from './guards/authAzureMsal.guard';
import { Request, Response } from 'express';
import { Auth, Token } from './decorators';



@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) { }

  @Get('login')
  async login(
    @Res() res: Response
  ) {
    const loginUrl = await this.authService.signIn();
    return res.redirect(loginUrl);
  }

  @Get('callback')
  async callback(
    @Req() req: Request,
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    // console.log('code',code);

    const tokenResponse = await this.authService.handleRedirect(req, code);
    const accessToken = tokenResponse.accessToken;

    console.log('accessToken', accessToken);

    // Establece la cookie
    res.cookie('token', accessToken, { httpOnly: false, maxAge: 3600000 }); //si es HTTP
    // res.cookie('token', accessToken, {
    //   httpOnly: true,
    //   secure: true,
    //   maxAge: 3600000 // 1 hora
    // });

    // Obtenga la URL de destino original de la sesión o regrese '/'.
    const redirectUrl = await this.authService.getAfterLoginRedirect(req);

    // Redireccionar al usuario a su destino original con el token.
    res.redirect(redirectUrl);
  }

  @Get('logout')
  // @UseGuards(AuthGuard('azure-msal'))
  // @UseGuards(AuthAzureMsalGuards)
  async logout(
    @Req() req,
    @Res() res
  ) {
    const logoutUrl = await this.authService.getLogoutUrl(req);
    // req.session.destroy();
    res.clearCookie('token');
    return res.redirect(logoutUrl);
  }


  @Get('profile')
  @UseGuards(AuthAzureMsalGuards)
  async getUserProfile(
    @Token() token: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const response = await this.authService.getUserProfile(token);
      res.status(HttpStatus.OK).send(response.data);
    } catch (error) {
      const errMessage = 'Error getting user profile: ' + error.message;
      throw new InternalServerErrorException(errMessage);
    }
  }

  @Get('myFilesAll')
  @UseGuards(AuthAzureMsalGuards)
  async getAllFiles(
    @Token() token: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const response = await this.authService.getAllFiles(token);
      res.status(HttpStatus.OK).send(response.data);
    } catch (error) {
      const errMessage = 'Error getting user profile: ' + error.message;
      throw new InternalServerErrorException(errMessage);
    }
  }


  @Get('filesInFolder')
  @UseGuards(AuthAzureMsalGuards)
  async getFilesInFolder(
    @Token() token: string,
    @Query('folderId') folderId: string,
    @Res() res: Response,
  ): Promise<any> {
    console.log(folderId);
    try {

      const response = await this.authService.getFilesInFolder(folderId, token);
      res.status(HttpStatus.OK).send(response.data);
    } catch (error) {
      const errMessage = 'Error getting files in folder: ' + error.message;
      throw new InternalServerErrorException(errMessage);
    }
  }

  @Get('calendar')
  @UseGuards(AuthAzureMsalGuards)
  async getCalendar(
    @Token() token: string,
    @Res() res: Response,
  ) {
    try {
      const calendar = await this.authService.getCalendarEvents(token);
      return res.status(HttpStatus.OK).json(calendar);
    } catch {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error en calendario' });
    }
  }

  @Get('calendars')
  @UseGuards(AuthAzureMsalGuards)
  async getCalendars(
    @Token() token: string,
    @Res() res: Response,
  ) {
    try {
      const calendars = await this.authService.getUserCalendars(token);
      return res.status(HttpStatus.OK).json(calendars);
    } catch {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error obteniendo calendarios' });
    }
  }

  @Post('calendar/event')
  @UseGuards(AuthAzureMsalGuards)
  async createEvent(
    @Token() token: string,
    @Body() eventData: any,
    @Res() res: Response,
  ) {
    try {
      const newEvent = await this.authService.createCalendarEvent(token, eventData);
      return res.status(HttpStatus.CREATED).json(newEvent);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error creando evento' });
    }
  }

  @Delete('calendar/event/:id')
  @UseGuards(AuthAzureMsalGuards)
  async deleteEvent(
    @Token() token: string,
    @Param('id') eventId: string,
    @Res() res: Response,
  ) {
    try {
      await this.authService.deleteCalendarEvent(token, eventId);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error eliminando evento' });
    }
  }

  @Patch('calendar/event/:id')
  @UseGuards(AuthAzureMsalGuards)
  async updateEvent(
    @Token() token: string,
    @Param('id') eventId: string,
    @Body() updateData: any,
    @Res() res: Response,
  ) {
    try {
      const updatedEvent = await this.authService.updateCalendarEvent(token, eventId, updateData);
      return res.status(HttpStatus.OK).json(updatedEvent);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error actualizando evento' });
    }
  }





}
