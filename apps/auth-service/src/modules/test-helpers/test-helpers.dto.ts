import { IsDefined, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestUserDto {
  @ApiProperty()
  @IsDefined()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  password: string;
}

export class LoginTestUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class TestUserDto {
  @ApiProperty()
  kind: string;

  @ApiProperty()
  localId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  idToken: string;

  @ApiProperty()
  registered: boolean;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: string;
}
