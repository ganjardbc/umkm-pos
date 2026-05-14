---
to: "src/modules/<%=h.changeCase.param(name)%>/services/api.ts"
---
import api from '@/plugins/axios.ts';

export const getList<%= h.changeCase.param(name) %> = async (data: any, options:any = {}) => {
  return await api.get(
    '/api/<%= h.changeCase.param(name) %>',
    { params: data, ...(options || {}) },
  );
};

export const getDetail<%= h.changeCase.param(name) %> = async (id: string|number, options:any = {}) => {
  return await api.get(
    `/api/<%= h.changeCase.param(name) %>/${id}`,
    { ...(options || {}) },
  );
};

export const post<%= h.changeCase.param(name) %> = async (data: any, options:any = {}) => {
  return await api.post(
    `/api/<%= h.changeCase.param(name) %>`,
    data,
    { ...(options || {}) },
  );
};

export const put<%= h.changeCase.param(name) %> = async (id: string|number, data: any, options:any = {}) => {
  return await api.put(
    `/api/<%= h.changeCase.param(name) %>/${id}`,
    data,
    { ...(options || {}) },
  );
};
