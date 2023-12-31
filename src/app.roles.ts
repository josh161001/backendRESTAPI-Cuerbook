import { RolesBuilder } from 'nest-access-control';

export enum AppRoles {
  user = 'user',
  admin = 'admin',
}

export enum AppResource {
  users = 'users',
  events = 'events',
  groups = 'groups',
  notice = 'notice',
  categories = 'categories',
  pdf = 'pdf',
}

export const roles: RolesBuilder = new RolesBuilder();

roles
  .grant(AppRoles.user)
  .updateOwn([AppResource.users])
  .readOwn([AppResource.users])
  .createOwn([AppResource.events])
  .readOwn([AppResource.events])
  .updateOwn([AppResource.events])
  .deleteOwn([AppResource.events])
  .createOwn([AppResource.groups])
  .readOwn([AppResource.groups])
  .updateOwn([AppResource.groups])
  .deleteOwn([AppResource.groups])
  .grant(AppRoles.admin)
  .extend(AppRoles.user)
  .readAny([AppResource.users])
  .createAny([AppResource.users])
  .updateAny([AppResource.events, AppResource.users])
  .deleteAny([AppResource.events, AppResource.users])
  .readAny([AppResource.events])
  .readAny([AppResource.groups])
  .updateAny([AppResource.groups])
  .deleteAny([AppResource.groups])
  .readAny([AppResource.groups])
  .readAny([AppResource.notice])
  .createAny([AppResource.notice])
  .updateAny([AppResource.notice])
  .deleteAny([AppResource.notice])
  .createAny([AppResource.categories])
  .updateAny([AppResource.categories])
  .deleteAny([AppResource.categories]);
