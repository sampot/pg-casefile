export default {
  async fetch(request) {
    return Response.json({
      ok: true,
      name: "pg-casefile",
      path: new URL(request.url).pathname,
    });
  },
};
