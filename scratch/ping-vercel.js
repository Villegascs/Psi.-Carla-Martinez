async function ping() {
  const url = "https://psi-carla-martinez.vercel.app/api/workshops";
  try {
    const res = await fetch(url, { method: "GET" });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Body length: ${text.length}`);
  } catch (e) {
    console.error(e.message);
  }
}
ping();
