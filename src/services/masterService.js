import api from "../api/axios";

// Different backends wrap lists differently. This accepts
// [..], { data: [..] } or { serviceModels: [..] }.
const toList = (body, key) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.[key])) return body[key];
  if (Array.isArray(body?.data?.[key])) return body.data[key];
  return [];
};

export const getServiceModels = () =>
  api.get("/service-models").then((res) => toList(res.data, "serviceModels"));

export const getCities = () =>
  api.get("/cities").then((res) => toList(res.data, "cities"));