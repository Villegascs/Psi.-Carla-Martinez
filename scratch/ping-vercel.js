async function ping() {
  const urls = [
    "https://psi-carla-martinez.vercel.app/api/ping",
    "https://psi-carla-martinez.vercel.app/api/workshops",
    "https://psi-carla-martinez.vercel.app/api/reservations"
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "GET" });
      console.log(`Pinging ${url} -> Status: ${res.status}`);
      const text = await res.text();
      console.log(`Body length: ${text.length}, Body: ${text.substring(0, 100)}`);
    } catch (e) {
      console.error(e.message);
    }
  }
}
ping();
