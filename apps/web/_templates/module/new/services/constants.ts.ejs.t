---
to: "src/modules/<%=h.changeCase.param(name)%>/services/constants.ts"
---
export const FEATURE_NAME = '<%= name %>';
export const MODULE_VERSION = '1.0.0';

export const PREFIX_ROUTE_PATH = '/<%= h.changeCase.param(name) %>';
export const PREFIX_ROUTE_NAME = '<%= h.changeCase.param(name) %>';
