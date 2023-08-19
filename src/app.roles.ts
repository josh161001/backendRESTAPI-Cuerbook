import { RolesBuilder } from 'nest-access-control';

export enum AppRoles {
  user = 'user',
  admin = 'admin',
}

export const roles: RolesBuilder = new RolesBuilder();

roles
  .grant(AppRoles.user)
  .updateOwn('users')
  .deleteOwn('users')
  .createOwn('events')
  .updateOwn('events')
  .deleteOwn('events')
  .createOwn('groups')
  .updateOwn('groups')
  .deleteOwn('groups')
  .grant(AppRoles.admin)
  .extend(AppRoles.user)
  .createAny('users')
  .updateAny('users')
  .deleteAny('users')
  .updateAny('events', 'users')
  .deleteAny('events', 'users')
  .updateAny('groups', 'users')
  .deleteAny('groups', 'users')
  .createAny('notice')
  .updateAny('notice')
  .deleteAny('notice')
  .createAny('categories')
  .updateAny('categories')
  .deleteAny('categories');
