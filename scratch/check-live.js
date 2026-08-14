async function check() {
  try {
    const res = await fetch("https://psi-carla-martinez.vercel.app/talleres");
    const html = await res.text();
    if (html.includes("errorText = errData.error ||")) {
      console.log("OLD CODE FOUND (errData.error)");
    } else if (html.includes("!res.ok")) {
      console.log("OLD CODE FOUND (!res.ok)");
    } else {
      console.log("Code might be new, or not matched.");
    }
    
    // Look for a known string from the new code
    if (html.includes("Hubo un error en la inscripción")) {
      console.log("NEW CODE FOUND (Hubo un error en la inscripción)");
    }
  } catch (e) {
    console.error(e);
  }
}
check();
