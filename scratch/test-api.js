async function test() {
  const formData = new FormData();
  formData.append("workshopName", "Test");
  formData.append("quantity", "1");
  formData.append("participants", JSON.stringify([{firstName:"A", lastName:"B", idNumber:"123"}]));
  formData.append("paymentMethod", "efectivo");
  
  try {
    const res = await fetch("http://localhost:3000/api/workshops", {
      method: "POST",
      body: formData
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error(err);
  }
}
test();
