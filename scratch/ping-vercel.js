async function ping() {
  const urls = [
    "https://psi-carla-martinez.vercel.app/api/workshops",
    "https://villegascs-psi-carla-martinez.vercel.app/api/workshops",
    "https://psi-carla-martinez-git-main-villegascs.vercel.app/api/workshops"
  ];
  
  for (const url of urls) {
    console.log(`Pinging ${url}...`);
    try {
      const formData = new FormData();
      formData.append("workshopName", "Test");
      formData.append("quantity", "1");
      formData.append("participants", JSON.stringify([{firstName:"A", lastName:"B", idNumber:"123"}]));
      formData.append("paymentMethod", "efectivo");
      
      const res = await fetch(url, { method: "POST", body: formData });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Body: ${text.substring(0, 100)}`);
    } catch (e) {
      console.error(e.message);
    }
  }
}
ping();
