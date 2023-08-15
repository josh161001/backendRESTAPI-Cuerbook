import { RolesBuilder } from 'nest-access-control';

export enum AppRoles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum AppResource {
  USERS = 'USERS',
  GROUPS = 'GROUPS',
  EVENTS = 'EVENTS',
  CATEGORIES = 'CATEGORIES',
  NOTICE = 'NOTICE', //
}

export const roles: RolesBuilder = new RolesBuilder();

roles
  .grant(AppRoles.USER)
  .updateOwn([AppResource.USERS])
  .deleteOwn([AppResource.USERS])
  .createOwn([AppResource.GROUPS])
  .updateOwn([AppResource.GROUPS])
  .deleteOwn([AppResource.GROUPS])
  .createOwn([AppResource.EVENTS])
  .updateOwn([AppResource.EVENTS])
  .deleteOwn([AppResource.EVENTS])
  .grant(AppRoles.ADMIN)
  .extend(AppRoles.USER)
  .createAny([AppResource.USERS])
  .updateAny([AppResource.USERS])
  .deleteAny([AppResource.USERS])
  .updateAny([AppResource.GROUPS, AppResource.USERS])
  .deleteAny([AppResource.GROUPS, AppResource.USERS])
  .updateAny([AppResource.EVENTS, AppResource.USERS])
  .deleteAny([AppResource.EVENTS, AppResource.USERS])
  .createAny([AppResource.CATEGORIES])
  .updateAny([AppResource.CATEGORIES])
  .deleteAny([AppResource.CATEGORIES])
  .createAny([AppResource.NOTICE])
  .updateAny([AppResource.NOTICE])
  .deleteAny([AppResource.NOTICE]); //
