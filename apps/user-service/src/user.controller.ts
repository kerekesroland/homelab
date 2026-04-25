import { Controller, Get, Headers, Param } from '@nestjs/common';

@Controller()
export class UserController {
  @Get('profile')
  getProfile(@Headers('x-user-id') userId: string) {
    return { userId, name: 'Roland' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { id, name: 'Roland' };
  }
}
