import api from "../api/axios";

export const createEnquiry = (payload) =>
  api.post("/enquiries", payload).then((res) => res.data);