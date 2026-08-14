const token = process.argv[2];

async function getUpdates() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = await res.json();
    if (data.ok && data.result.length > 0) {
      const chat = data.result[data.result.length - 1].message.chat;
      console.log(`\nChat ID encontrado: ${chat.id}`);
      console.log(`Nombre: ${chat.first_name} ${chat.last_name || ""}\n`);
    } else {
      console.log("\nNo se encontraron mensajes. Por favor envía un mensaje al bot primero.\n");
    }
  } catch (err) {
    console.error("Error fetching updates:", err);
  }
}

getUpdates();
