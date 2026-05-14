---
to: "src/modules/<%=h.changeCase.param(name)%>/services/rbac.ts"
---
export const READ = '<%= h.changeCase.param(name) %>.read';
export const CREATE = '<%= h.changeCase.param(name) %>.create';
export const DELETE = '<%= h.changeCase.param(name) %>.delete';
export const UPDATE = '<%= h.changeCase.param(name) %>.update';
export const PERMISSIONS = [
  READ, 
  CREATE, 
  DELETE, 
  UPDATE,
];
