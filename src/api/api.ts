import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "https://swapi.dev/api/" }),
  endpoints: (builder) => ({
    getExampleList: builder.query({
      query: () => "/people",
    }),
  }),
});

export const { useGetExampleListQuery } = api;
